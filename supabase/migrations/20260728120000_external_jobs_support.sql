-- Jobera: external jobs, saved jobs, runtime matches, interview sessions, application pipeline

-- ---------------------------------------------------------------------------
-- External job cache (Adzuna, Greenhouse, etc.)
-- ---------------------------------------------------------------------------
create table public.external_jobs (
  id uuid primary key default gen_random_uuid(),
  external_key text not null unique,
  provider text not null default 'unknown',
  title text not null,
  company_name text not null default '',
  location text not null default '',
  description text not null default '',
  apply_url text,
  salary_min integer,
  salary_max integer,
  remote boolean not null default false,
  stack jsonb not null default '[]'::jsonb,
  raw_payload jsonb,
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index external_jobs_provider_idx on public.external_jobs (provider);
create index external_jobs_fetched_at_idx on public.external_jobs (fetched_at desc);

create trigger external_jobs_updated_at
  before update on public.external_jobs
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Runtime AI matches (internal + external jobs)
-- ---------------------------------------------------------------------------
create table public.user_job_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  job_id uuid references public.jobs (id) on delete cascade,
  external_job_id uuid references public.external_jobs (id) on delete cascade,
  compatibility smallint not null default 0,
  approval_level public.approval_level not null default 'media',
  approval_stars smallint not null default 3,
  match_reasons jsonb not null default '[]'::jsonb,
  ai_summary text not null default '',
  best_send_day_label text not null default '',
  best_send_time_range text not null default '',
  computed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_job_matches_compat_range check (compatibility between 0 and 100),
  constraint user_job_matches_job_ref check (
    (job_id is not null and external_job_id is null)
    or (job_id is null and external_job_id is not null)
  )
);

create unique index user_job_matches_user_job_idx
  on public.user_job_matches (user_id, job_id)
  where job_id is not null;

create unique index user_job_matches_user_external_idx
  on public.user_job_matches (user_id, external_job_id)
  where external_job_id is not null;

create index user_job_matches_user_compat_idx
  on public.user_job_matches (user_id, compatibility desc);

create trigger user_job_matches_updated_at
  before update on public.user_job_matches
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Saved jobs
-- ---------------------------------------------------------------------------
create table public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  job_id uuid references public.jobs (id) on delete cascade,
  external_job_id uuid references public.external_jobs (id) on delete cascade,
  saved_at timestamptz not null default now(),
  constraint saved_jobs_job_ref check (
    (job_id is not null and external_job_id is null)
    or (job_id is null and external_job_id is not null)
  )
);

create unique index saved_jobs_user_job_idx
  on public.saved_jobs (user_id, job_id)
  where job_id is not null;

create unique index saved_jobs_user_external_idx
  on public.saved_jobs (user_id, external_job_id)
  where external_job_id is not null;

create index saved_jobs_user_saved_idx
  on public.saved_jobs (user_id, saved_at desc);

-- ---------------------------------------------------------------------------
-- Extend job_applications for assisted apply pipeline
-- ---------------------------------------------------------------------------
alter table public.job_applications
  add column if not exists external_job_id uuid references public.external_jobs (id) on delete set null,
  add column if not exists source text not null default 'internal',
  add column if not exists ats_provider text,
  add column if not exists external_apply_url text,
  add column if not exists submission_status text not null default 'draft',
  add column if not exists tailored_resume_text text,
  add column if not exists cover_letter_text text,
  add column if not exists user_confirmed_at timestamptz,
  add column if not exists user_consent_at timestamptz,
  add column if not exists submission_error text;

delete from public.job_applications
where job_id is null and external_job_id is null;

alter table public.job_applications
  add constraint job_applications_job_ref check (
    (job_id is not null and external_job_id is null)
    or (job_id is null and external_job_id is not null)
  );

create index job_applications_external_job_id_idx
  on public.job_applications (external_job_id)
  where external_job_id is not null;

create unique index job_applications_user_external_idx
  on public.job_applications (user_id, external_job_id)
  where external_job_id is not null;

-- ---------------------------------------------------------------------------
-- Extend user_hidden_jobs for external jobs
-- ---------------------------------------------------------------------------
alter table public.user_hidden_jobs
  add column if not exists external_job_id uuid references public.external_jobs (id) on delete cascade;

alter table public.user_hidden_jobs
  drop constraint if exists user_hidden_jobs_pkey;

alter table public.user_hidden_jobs
  alter column job_id drop not null;

alter table public.user_hidden_jobs
  add column if not exists id uuid default gen_random_uuid();

update public.user_hidden_jobs set id = gen_random_uuid() where id is null;

alter table public.user_hidden_jobs
  alter column id set not null;

alter table public.user_hidden_jobs
  add primary key (id);

create unique index user_hidden_jobs_user_job_idx
  on public.user_hidden_jobs (user_id, job_id)
  where job_id is not null;

create unique index user_hidden_jobs_user_external_idx
  on public.user_hidden_jobs (user_id, external_job_id)
  where external_job_id is not null;

alter table public.user_hidden_jobs
  add constraint user_hidden_jobs_job_ref check (
    (job_id is not null and external_job_id is null)
    or (job_id is null and external_job_id is not null)
  );

-- ---------------------------------------------------------------------------
-- Interview simulator sessions
-- ---------------------------------------------------------------------------
create table public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  job_id uuid references public.jobs (id) on delete set null,
  external_job_id uuid references public.external_jobs (id) on delete set null,
  role_title text not null default '',
  company_name text not null default '',
  status text not null default 'active',
  questions jsonb not null default '[]'::jsonb,
  messages jsonb not null default '[]'::jsonb,
  score smallint,
  feedback_summary text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index interview_sessions_user_idx
  on public.interview_sessions (user_id, created_at desc);

create trigger interview_sessions_updated_at
  before update on public.interview_sessions
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.external_jobs enable row level security;
alter table public.user_job_matches enable row level security;
alter table public.saved_jobs enable row level security;
alter table public.interview_sessions enable row level security;

create policy "external_jobs_select_authenticated"
  on public.external_jobs for select to authenticated using (true);

create policy "external_jobs_select_anon"
  on public.external_jobs for select to anon using (true);

create policy "external_jobs_insert_authenticated"
  on public.external_jobs for insert to authenticated with check (true);

create policy "external_jobs_update_authenticated"
  on public.external_jobs for update to authenticated using (true) with check (true);

create policy "user_job_matches_select_own"
  on public.user_job_matches for select to authenticated
  using (public.is_owner(user_id));

create policy "user_job_matches_insert_own"
  on public.user_job_matches for insert to authenticated
  with check (public.is_owner(user_id));

create policy "user_job_matches_update_own"
  on public.user_job_matches for update to authenticated
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

create policy "user_job_matches_delete_own"
  on public.user_job_matches for delete to authenticated
  using (public.is_owner(user_id));

create policy "saved_jobs_select_own"
  on public.saved_jobs for select to authenticated
  using (public.is_owner(user_id));

create policy "saved_jobs_insert_own"
  on public.saved_jobs for insert to authenticated
  with check (public.is_owner(user_id));

create policy "saved_jobs_delete_own"
  on public.saved_jobs for delete to authenticated
  using (public.is_owner(user_id));

create policy "interview_sessions_select_own"
  on public.interview_sessions for select to authenticated
  using (public.is_owner(user_id));

create policy "interview_sessions_insert_own"
  on public.interview_sessions for insert to authenticated
  with check (public.is_owner(user_id));

create policy "interview_sessions_update_own"
  on public.interview_sessions for update to authenticated
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

create policy "interview_sessions_delete_own"
  on public.interview_sessions for delete to authenticated
  using (public.is_owner(user_id));

-- Storage bucket for resumes (run via Supabase dashboard or storage API)
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

create policy "resumes_upload_own"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "resumes_select_own"
  on storage.objects for select to authenticated
  using (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "resumes_update_own"
  on storage.objects for update to authenticated
  using (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "resumes_delete_own"
  on storage.objects for delete to authenticated
  using (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);
