-- Jobera: jobs catalog (JobRecommendation / JobDetail shared data)

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  company_id uuid not null references public.companies (id) on delete restrict,
  title text not null,
  location text not null default '',
  salary_display text not null default '',
  salary_min integer,
  salary_max integer,
  salary_currency public.currency_code not null default 'BRL',
  remote boolean not null default false,
  published_at date,
  verified boolean not null default false,
  ai_summary text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint jobs_slug_not_empty check (length(trim(slug)) > 0),
  constraint jobs_title_not_empty check (length(trim(title)) > 0),
  constraint jobs_salary_range_valid check (
    salary_min is null or salary_max is null or salary_max >= salary_min
  ),
  unique (slug)
);

create index jobs_company_id_idx on public.jobs (company_id);
create index jobs_active_published_idx on public.jobs (is_active, published_at desc);
create index jobs_title_trgm_idx on public.jobs using gin (title extensions.gin_trgm_ops);
create index jobs_remote_idx on public.jobs (remote) where remote = true;

create trigger jobs_updated_at
  before update on public.jobs
  for each row execute function public.handle_updated_at();

-- Job stack (JobRecommendation.stack)
create table public.job_stack (
  job_id uuid not null references public.jobs (id) on delete cascade,
  tech_name text not null,
  sort_order smallint not null default 0,
  primary key (job_id, tech_name)
);

create index job_stack_tech_name_idx on public.job_stack (tech_name);

-- Job benefits (listing level)
create table public.job_benefits (
  job_id uuid not null references public.jobs (id) on delete cascade,
  benefit text not null,
  sort_order smallint not null default 0,
  primary key (job_id, benefit)
);

-- Job sections (JobSections — normalized by section type)
create table public.job_section_items (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  section_type public.job_section_type not null,
  content text not null,
  sort_order smallint not null default 0
);

create index job_section_items_job_id_idx
  on public.job_section_items (job_id, section_type, sort_order);

-- Job stats (JobStats — one row per job)
create table public.job_stats (
  job_id uuid primary key references public.jobs (id) on delete cascade,
  response_days smallint not null default 0,
  process_days smallint not null default 0,
  steps smallint not null default 0,
  candidates integer not null default 0,
  constraint job_stats_non_negative check (
    response_days >= 0 and process_days >= 0 and steps >= 0 and candidates >= 0
  )
);

-- Hiring timeline (HiringStage[])
create table public.job_hiring_stages (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  label text not null,
  avg_days smallint not null default 0,
  sort_order smallint not null default 0
);

create index job_hiring_stages_job_id_idx on public.job_hiring_stages (job_id, sort_order);

-- FAQs (JobFAQ[])
create table public.job_faqs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  question text not null,
  answer text not null default '',
  sort_order smallint not null default 0
);

create index job_faqs_job_id_idx on public.job_faqs (job_id, sort_order);

-- Interview questions (InterviewQuestion[])
create table public.job_interview_questions (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  tech text not null default '',
  question text not null,
  sort_order smallint not null default 0
);

create index job_interview_questions_job_id_idx
  on public.job_interview_questions (job_id, sort_order);

-- Culture indicators (CultureIndicator[] — job-level baseline)
create table public.job_culture_indicators (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  label text not null,
  score smallint not null,
  description text not null default '',
  sort_order smallint not null default 0,
  constraint job_culture_indicators_range check (score between 0 and 100)
);

create index job_culture_indicators_job_id_idx
  on public.job_culture_indicators (job_id, sort_order);

-- Team info (TeamInfo — job-level baseline)
create table public.job_team_info (
  job_id uuid primary key references public.jobs (id) on delete cascade,
  team_name text not null default '',
  team_size smallint not null default 0,
  average_tenure_years numeric(4, 1) not null default 0,
  is_available boolean not null default true
);

create table public.job_team_stack (
  job_id uuid not null references public.job_team_info (job_id) on delete cascade,
  tech_name text not null,
  sort_order smallint not null default 0,
  primary key (job_id, tech_name)
);

-- Related jobs (RelatedJob[] — catalog-level links)
create table public.job_related (
  job_id uuid not null references public.jobs (id) on delete cascade,
  related_job_id uuid not null references public.jobs (id) on delete cascade,
  sort_order smallint not null default 0,
  primary key (job_id, related_job_id),
  constraint job_related_not_self check (job_id <> related_job_id)
);

-- Similar companies (SimilarCompany[] — catalog-level links)
create table public.job_similar_companies (
  job_id uuid not null references public.jobs (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  sort_order smallint not null default 0,
  primary key (job_id, company_id)
);

-- AI summary reasons (JobDetail.aiSummaryReasons)
create table public.job_ai_summary_reasons (
  job_id uuid not null references public.jobs (id) on delete cascade,
  reason text not null,
  sort_order smallint not null default 0,
  primary key (job_id, reason)
);
