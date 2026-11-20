-- FitTrack secure account foundation. Run in Supabase SQL editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  plan text not null default 'free' check (plan in ('free','core','nexus','apex')),
  trial_started_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.owner_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  action text not null,
  target_type text,
  target_id text,
  reason text,
  approval_required boolean not null default false,
  approved_by uuid references auth.users(id),
  outcome text not null default 'recorded',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.owner_audit_log enable row level security;

-- A user can read their own profile, but cannot promote themselves or change plan/role metadata.
drop policy if exists "profile_select_self" on public.profiles;
create policy "profile_select_self" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "profile_update_self_limited" on public.profiles;
create policy "profile_update_self_limited" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Only server-side service-role functions can write audit events. Owner reads are checked
-- against protected app_metadata set by the bootstrap function, never user-editable metadata.
create or replace function public.is_fittrack_owner()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'fittrack_role') = 'owner', false);
$$;
revoke all on function public.is_fittrack_owner() from public;
grant execute on function public.is_fittrack_owner() to authenticated;

drop policy if exists "owner_read_audit" on public.owner_audit_log;
create policy "owner_read_audit" on public.owner_audit_log for select to authenticated using (public.is_fittrack_owner());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'))
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created_fittrack on auth.users;
create trigger on_auth_user_created_fittrack after insert on auth.users
for each row execute procedure public.handle_new_user();
