-- Jobera: user-specific job matching and AI insights (JobRecommendation + JobDetail per user)

-- ---------------------------------------------------------------------------
-- Core match record (compatibility, approval, best send time)
-- ---------------------------------------------------------------------------
create table public.job_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  job_id uuid not null references public.jobs (id) on delete cascade,

  compatibility smallint not null,
  approval_level public.approval_level not null default 'media',
  approval_stars smallint not null default 3,

  best_send_day_label text not null default '',
  best_send_time_range text not null default '',
  best_send_insight text not null default '',

  why_match_summary text not null default '',
  approval_suggestion text not null default '',

  -- SalaryComparisonData
  salary_job_min integer,
  salary_job_max integer,
  salary_market_min integer,
  salary_market_max integer,
  salary_user_expectation integer,
  salary_insight text not null default '',

  -- JobComparison summary
  comparison_recommended_job_id uuid references public.jobs (id) on delete set null,
  comparison_ai_conclusion text not null default '',

  -- CareerImpact summary
  career_impact_explanation text not null default '',

  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, job_id),
  constraint job_matches_compatibility_range check (compatibility between 0 and 100),
  constraint job_matches_approval_stars_range check (approval_stars between 0 and 5)
);

create index job_matches_user_compat_idx
  on public.job_matches (user_id, compatibility desc);
create index job_matches_job_id_idx on public.job_matches (job_id);

create trigger job_matches_updated_at
  before update on public.job_matches
  for each row execute function public.handle_updated_at();

-- Match reasons (MatchReason[])
create table public.job_match_reasons (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.job_matches (id) on delete cascade,
  text text not null,
  reason_type public.match_reason_type not null default 'match',
  sort_order smallint not null default 0
);

create index job_match_reasons_match_id_idx on public.job_match_reasons (match_id, sort_order);

-- Weight factors (WeightFactor[])
create table public.job_match_weight_factors (
  match_id uuid not null references public.job_matches (id) on delete cascade,
  label text not null,
  weight smallint not null,
  sort_order smallint not null default 0,
  primary key (match_id, label),
  constraint job_match_weight_factors_range check (weight between 0 and 100)
);

-- Approval reasons (ApprovalProbability.reasons)
create table public.job_match_approval_reasons (
  match_id uuid not null references public.job_matches (id) on delete cascade,
  reason text not null,
  sort_order smallint not null default 0,
  primary key (match_id, reason)
);

-- Simulation stages (SimulationStage[])
create table public.job_match_simulation_stages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.job_matches (id) on delete cascade,
  label text not null,
  status public.simulation_stage_status not null default 'pass',
  sort_order smallint not null default 0
);

create index job_match_simulation_stages_match_id_idx
  on public.job_match_simulation_stages (match_id, sort_order);

-- Tech comparison (TechRequirement[] — user-specific levels)
create table public.job_match_tech_comparisons (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.job_matches (id) on delete cascade,
  tech_name text not null,
  required_level public.tech_level not null,
  user_level public.tech_level not null,
  weight smallint not null default 0,
  sort_order smallint not null default 0,
  constraint job_match_tech_comparisons_weight_range check (weight between 0 and 100)
);

create index job_match_tech_comparisons_match_id_idx
  on public.job_match_tech_comparisons (match_id, sort_order);

-- Resume suggestions (ResumeSuggestion[])
create table public.job_match_resume_suggestions (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.job_matches (id) on delete cascade,
  text text not null,
  suggestion_type public.resume_suggestion_type not null,
  sort_order smallint not null default 0
);

-- Portfolio highlights (PortfolioProject[])
create table public.job_match_portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.job_matches (id) on delete cascade,
  name text not null,
  description text not null default '',
  is_highlight boolean not null default false,
  sort_order smallint not null default 0
);

-- GitHub projects (GithubProject[])
create table public.job_match_github_projects (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.job_matches (id) on delete cascade,
  name text not null,
  description text not null default '',
  relevance text not null default '',
  sort_order smallint not null default 0
);

-- Apply checklist (ApplyChecklistItem[])
create table public.job_match_apply_checklist (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.job_matches (id) on delete cascade,
  label text not null,
  status public.apply_checklist_status not null default 'pending',
  sort_order smallint not null default 0
);

-- Study plan (StudyTopic[])
create table public.job_match_study_topics (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.job_matches (id) on delete cascade,
  title text not null,
  priority smallint not null default 3,
  sort_order smallint not null default 0,
  constraint job_match_study_topics_priority_range check (priority between 1 and 5)
);

-- Career impact roles (CareerImpactRole[])
create table public.job_match_career_impact_roles (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.job_matches (id) on delete cascade,
  role_title text not null,
  uplift_percent smallint not null default 0,
  sort_order smallint not null default 0
);

-- Job comparison items (JobComparisonItem[] — user saved comparison set)
create table public.job_match_comparison_items (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.job_matches (id) on delete cascade,
  compared_job_id uuid not null references public.jobs (id) on delete cascade,
  salary_display text not null default '',
  remote_label text not null default '',
  compatibility smallint not null,
  process_steps smallint not null default 0,
  benefits_rating smallint not null default 0,
  sort_order smallint not null default 0,
  constraint job_match_comparison_items_compat_range check (compatibility between 0 and 100)
);

-- Hidden jobs (HideReason — discovery UX)
create table public.user_hidden_jobs (
  user_id uuid not null references public.profiles (id) on delete cascade,
  job_id uuid not null references public.jobs (id) on delete cascade,
  reason public.hide_reason not null default 'other',
  hidden_at timestamptz not null default now(),
  primary key (user_id, job_id)
);

create index user_hidden_jobs_user_id_idx on public.user_hidden_jobs (user_id, hidden_at desc);

-- Discovery summary cache (DiscoverySummary — per user snapshot)
create table public.discovery_summaries (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  analyzed integer not null default 0,
  compatible integer not null default 0,
  very_compatible integer not null default 0,
  perfect integer not null default 0,
  computed_at timestamptz not null default now()
);
