// One-time / controlled owner provisioning endpoint.
// Configure SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and FITTRACK_OWNER_BOOTSTRAP_SECRET
// as Edge Function secrets. Never expose these values in index.html or GitHub Pages.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "null",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });

  const expected = Deno.env.get("FITTRACK_OWNER_BOOTSTRAP_SECRET");
  const supplied = req.headers.get("x-owner-bootstrap-secret");
  if (!expected || !supplied || supplied.length !== expected.length || supplied !== expected) {
    return new Response("Unauthorized", { status: 401, headers: cors });
  }

  const { email } = await req.json().catch(() => ({}));
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return new Response("A valid owner email is required", { status: 400, headers: cors });
  }

  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return new Response("Server is not configured", { status: 503, headers: cors });
  const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  // Find the exact existing account; never create an account or grant ownership to an arbitrary signup.
  let page = 1;
  let match = null;
  while (page <= 20) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) return new Response("Could not verify account", { status: 502, headers: cors });
    match = data.users.find((u) => (u.email || "").toLowerCase() === email.toLowerCase()) || null;
    if (match || data.users.length < 1000) break;
    page++;
  }
  if (!match) return new Response("Create/sign in to the intended account first, then retry", { status: 404, headers: cors });

  const { error } = await admin.auth.admin.updateUserById(match.id, {
    app_metadata: { ...(match.app_metadata || {}), fittrack_role: "owner" },
  });
  if (error) return new Response("Owner provisioning failed", { status: 502, headers: cors });
  await admin.from("owner_audit_log").insert({ actor_id: match.id, action: "owner_role_provisioned", target_type: "account", target_id: match.id, reason: "Controlled initial owner setup", outcome: "succeeded" });
  return new Response(JSON.stringify({ ok: true, message: "Owner role assigned. Sign out and sign in again to refresh the secure session." }), {
    status: 200, headers: { ...cors, "Content-Type": "application/json" },
  });
});
