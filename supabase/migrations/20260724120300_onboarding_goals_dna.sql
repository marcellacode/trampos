-- Jobera: onboarding goals, chips, AI suggestions, professional DNA

-- ---------------------------------------------------------------------------
-- Goal chips (GoalChip[])
-- ---------------------------------------------------------------------------
create table public.goal_chips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text not null,
  category public.goal_chip_category not null,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  constraint goal_chips_label_not_empty check (length(trim(label)) > 0)
);

create index goal_chips_user_id_idx on public.goal_chips (user_id, sort_order);
create index goal_chips_category_idx on public.goal_chips (user_id, category);

-- ---------------------------------------------------------------------------
-- AI profile enrichment suggestions (AiSuggestion — onboarding)
-- ---------------------------------------------------------------------------
create table public.profile_ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null default '',
  action_label text not null default '',
  suggestion_type public.ai_suggestion_type not null,
  is_applied boolean not null default false,
  applied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profile_ai_suggestions_user_id_idx
  on public.profile_ai_suggestions (user_id, is_applied);

create trigger profile_ai_suggestions_updated_at
  before update on public.profile_ai_suggestions
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Professional DNA (ProfessionalDna — one active record per user)
-- ---------------------------------------------------------------------------
create table public.professional_dna (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  predominant_profile text not null,
  with_skills_label text not null default '',
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create trigger professional_dna_updated_at
  before update on public.professional_dna
  for each row execute function public.handle_updated_at();

create table public.dna_strengths (
  dna_id uuid not null references public.professional_dna (id) on delete cascade,
  strength text not null,
  sort_order smallint not null default 0,
  primary key (dna_id, strength)
);

create table public.dna_compatibility_scores (
  id uuid primary key default gen_random_uuid(),
  dna_id uuid not null references public.professional_dna (id) on delete cascade,
  label text not null,
  score smallint not null,
  sort_order smallint not null default 0,
  constraint dna_compatibility_scores_range check (score between 0 and 100)
);

create index dna_compatibility_scores_dna_id_idx
  on public.dna_compatibility_scores (dna_id, sort_order);

create table public.dna_salary_ranges (
  id uuid primary key default gen_random_uuid(),
  dna_id uuid not null references public.professional_dna (id) on delete cascade,
  range_kind public.salary_range_kind not null,
  currency public.currency_code not null,
  min_amount numeric(12, 2) not null,
  max_amount numeric(12, 2),
  display_label text not null default '',
  unique (dna_id, range_kind, currency),
  constraint dna_salary_ranges_min_positive check (min_amount >= 0),
  constraint dna_salary_ranges_max_gte_min check (max_amount is null or max_amount >= min_amount)
);

-- ---------------------------------------------------------------------------
-- Smart filters (Discovery — user saved / dynamic filters)
-- ---------------------------------------------------------------------------
create table public.smart_filters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text not null,
  is_active boolean not null default true,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  constraint smart_filters_label_not_empty check (length(trim(label)) > 0)
);

create index smart_filters_user_id_idx on public.smart_filters (user_id, is_active, sort_order);
