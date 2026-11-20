FITTRACK — YOUR PERSONAL LIFE SYSTEM
Complete single-package PWA release · 20 November 2026

WHAT'S INCLUDED
- Existing FitTrack PWA and all original local-first fitness, nutrition, sleep, journal, calendar and progress features.
- Five primary destinations: Home, Planner, Study, Wellness and More.
- Local Study subjects, sessions and revision queue.
- Local Finance records and Notes & Knowledge.
- Wellness hub linking the existing nutrition, fitness, sleep and daily-health tools.
- Owner access landing page, secure backend schema and controlled owner-provisioning Edge Function scaffold.
- Existing localStorage key preserved: fittrack_standalone_v1.
- Updated service-worker cache version and original PWA icons/manifest.

IMPORTANT: WHAT WORKS NOW VS WHAT NEEDS CONFIGURATION
Works locally now: existing app tools, study logging, finance notes, knowledge notes, settings, backup/restore, offline PWA shell.
Not live until a backend is configured: Google account authentication, owner-role verification, cloud sync, passkey registration ceremony, multi-user community, trial enforcement, AI/Nexus/Jarvis, owner AI, audit operations, payment processing.
The Owner screen is deliberately locked in this static package. Typing a Gmail address never grants Owner privileges. The included backend scaffold is a starting point and must be deployed and security-reviewed before production use.

OWNER ACCOUNT SETUP (BACKEND REQUIRED)
1. Create a Supabase project and configure Google OAuth in Supabase Auth and the Google Cloud OAuth console.
2. Run supabase/schema.sql in the Supabase SQL editor.
3. Deploy supabase/functions/bootstrap-owner as an Edge Function.
4. Set server-side secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, FITTRACK_OWNER_BOOTSTRAP_SECRET. Never put the service-role key or bootstrap secret in this website or GitHub repository.
5. Create/sign in to the exact Google account that will be the Owner account.
6. Call the Edge Function from a trusted admin environment with POST JSON {"email":"your-owner@gmail.com"} and header x-owner-bootstrap-secret. Do not publish the bootstrap secret.
7. Sign out and sign back in so the new app_metadata role is present in the session. The app must verify app_metadata on the server for every Owner operation.

BIOMETRIC / PASSKEY
Use a passkey registered to your Google account/device. On supported Android devices, the operating system may verify with fingerprint, face unlock or device PIN. FitTrack must never collect biometric templates. Production passkey enrollment and challenge verification require a proper WebAuthn server ceremony over HTTPS; that flow is not activated by this static package.

PLANS
FitTrack Free: 3-month trial, basic features, no AI/Jarvis; after expiry user must select a paid edition.
FitTrack Core: paid essential features, no AI/Jarvis.
FitTrack Nexus: paid advanced AI, no Jarvis.
FitTrack Apex: paid advanced AI and Jarvis.
Prices are placeholders. Payments and QR collection are intentionally disabled. Trial duration and entitlement enforcement must be server-side before public launch.

PRIVACY & DATA
- Local records stay in this browser profile and are not automatically uploaded.
- Owner role must not grant access to other users' private health, nutrition, journal, study or finance records.
- Community sharing must remain opt-in and workout-only; no community backend is active in this package.
- Export a backup before upgrading. The existing localStorage key is retained and new module fields are added without deleting existing records.
- Browser storage is not a cloud backup. Keep private backup copies somewhere safe.

INSTALL / UPDATE ON ANDROID
1. Upload the contents of FitTrack-PWA to the root of your GitHub Pages repository.
2. Open the HTTPS GitHub Pages URL in Chrome on Android.
3. Refresh once while online so the new app shell is cached.
4. If installed PWA still shows the previous version, close it fully and reopen after service-worker activation.
5. Export a backup before replacing files. Do not clear browser storage or site data during the update.

TESTING
- Run node --check on the inline script extracted from index.html.
- Verify the app opens offline after first online visit.
- Export and re-import a backup in a test browser profile before relying on a production migration.
- Test all modules on Android Chrome and desktop browsers.
- Configure and independently security-review authentication, database RLS, WebAuthn, sync and AI before enabling accounts or multi-user data.

DEFERRED
Smartwatch integration is paused. Actual prices, QR payments and live AI provider credentials are not configured.
