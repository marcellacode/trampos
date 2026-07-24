-- Jobera: user profiles and account settings

-- ---------------------------------------------------------------------------
-- profiles (extends auth.users — DashboardUser + ExtractedProfile core fields)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  first_name text not null default '',
  avatar_url text,
  initials text not null default 'U',
  plan public.subscription_plan not null default 'free',

  -- onboarding state
  onboarding_completed boolean not null default false,
  onboarding_step public.onboarding_step,
  import_method public.import_method,
  uploaded_resume_filename text,

  -- copilot (DashboardUser + useCopilotStatus)
  copilot_status public.copilot_status not null default 'active',

  -- ExtractedProfile core
  "current_role" text not null default '',
  summary text not null default '',
  avatar_initials text not null default '',
  seniority text not null default '',

  -- goals (OnboardingData.goalText + CareerGoal display fields)
  goal_text text not null default '',
  goal_role text not null default '',
  goal_location text not null default '',
  goal_salary text not null default '',
  goal_availability_label text not null default '',

  -- availability preferences
  availability public.availability_option,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_email_not_empty check (length(trim(email)) > 0),
  constraint profiles_initials_length check (char_length(initials) between 1 and 4)
);

create index profiles_email_idx on public.profiles (email);
create index profiles_plan_idx on public.profiles (plan);
create index profiles_onboarding_completed_idx on public.profiles (onboarding_completed);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- profile work model & contract type preferences (many-to-many via junction)
-- ---------------------------------------------------------------------------
create table public.profile_work_models (
  user_id uuid not null references public.profiles (id) on delete cascade,
  work_model public.work_model not null,
  created_at timestamptz not null default now(),
  primary key (user_id, work_model)
);

create table public.profile_contract_types (
  user_id uuid not null references public.profiles (id) on delete cascade,
  contract_type public.contract_type not null,
  created_at timestamptz not null default now(),
  primary key (user_id, contract_type)
);

-- ---------------------------------------------------------------------------
-- OAuth / import connections
-- ---------------------------------------------------------------------------
create table public.oauth_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  provider public.auth_provider not null,
  provider_user_id text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  profile_url text,
  connected_at timestamptz not null default now(),
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

create index oauth_connections_user_id_idx on public.oauth_connections (user_id);

create trigger oauth_connections_updated_at
  before update on public.oauth_connections
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Resume uploads (Cloudinary integration stub)
-- ---------------------------------------------------------------------------
create table public.resume_uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  original_filename text not null,
  storage_url text,
  mime_type text,
  file_size_bytes integer,
  status public.resume_upload_status not null default 'pending',
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index resume_uploads_user_id_idx on public.resume_uploads (user_id);
create index resume_uploads_status_idx on public.resume_uploads (status);

create trigger resume_uploads_updated_at
  before update on public.resume_uploads
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Subscription usage tracking (Free tier: 5 applications/month per FAQ)
-- ---------------------------------------------------------------------------
create table public.application_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  period_start date not null,
  period_end date not null,
  applications_count integer not null default 0,
  applications_limit integer not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, period_start)
);

create index application_usage_user_period_idx
  on public.application_usage (user_id, period_start desc);

create trigger application_usage_updated_at
  before update on public.application_usage
  for each row execute function public.handle_updated_at();

-- Auto-create profile when auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, first_name, initials)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(
      nullif(
        split_part(
          coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
          ' ',
          1
        ),
        ''
      ),
      'Usuário'
    ),
    upper(
      left(
        coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', 'U'),
        1
      )
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
