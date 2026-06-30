-- Run in Supabase SQL Editor (Dashboard → SQL).
-- Profiles linked to auth.users, RLS, and signup trigger.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'job_seeker'
    check (role in ('job_seeker', 'employer', 'admin')),
  full_name text,
  bio text,
  location text,
  country text,
  skills text[] not null default '{}',
  experience text,
  education text,
  linkedin_url text,
  company_name text,
  company_website text,
  industry text,
  company_size text,
  preferences jsonb not null default '{}'::jsonb,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);

alter table public.profiles enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create or replace function public.set_profiles_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_profiles_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'role'), ''), 'job_seeker'),
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
      nullif(trim(new.raw_user_meta_data->>'name'), ''),
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Contact form (home page). Anonymous visitors can INSERT only (no public SELECT).
-- View rows in Supabase → Table Editor, or build an admin dashboard later.
-- ---------------------------------------------------------------------------

create table if not exists public.contact_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text not null,
  phone text,
  enquiry_type text,
  message text,
  created_at timestamptz not null default now()
);

create index if not exists contact_leads_created_at_idx on public.contact_leads (created_at desc);

alter table public.contact_leads enable row level security;

drop policy if exists "Allow contact form inserts" on public.contact_leads;
create policy "Allow contact form inserts"
  on public.contact_leads for insert
  to anon, authenticated
  with check (true);

-- No SELECT/UPDATE/DELETE for anon — keeps submissions private. Admins use the dashboard Table editor (service role bypasses RLS) or add a secure admin policy later.
