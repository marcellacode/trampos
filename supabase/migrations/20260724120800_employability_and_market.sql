-- Jobera: employability gamification and market reference data

-- ---------------------------------------------------------------------------
-- Employability overview (EmployabilityOverview)
-- ---------------------------------------------------------------------------
create table public.employability_overviews (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  score smallint not null default 0,
  goal_score smallint not null default 100,
  updated_at timestamptz not null default now(),
  constraint employability_overviews_score_range check (score between 0 and 100),
  constraint employability_overviews_goal_range check (goal_score between 0 and 100)
);

create trigger employability_overviews_updated_at
  before update on public.employability_overviews
  for each row execute function public.handle_updated_at();

-- Daily missions (DailyMission[])
create table public.daily_missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text not null,
  uplift_percent smallint not null default 0,
  is_completed boolean not null default false,
  href text not null default '/dashboard/empregabilidade',
  icon_name text not null default 'target',
  mission_date date not null default current_date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, label, mission_date)
);

create index daily_missions_user_date_idx
  on public.daily_missions (user_id, mission_date desc, is_completed);

-- Employability skills (EmployabilitySkill[])
create table public.employability_skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text not null,
  score smallint not null default 0,
  uplift_percent smallint not null default 0,
  explanation text not null default '',
  market_context text,
  sort_order smallint not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, label),
  constraint employability_skills_score_range check (score between 0 and 100)
);

create index employability_skills_user_idx
  on public.employability_skills (user_id, sort_order);

create trigger employability_skills_updated_at
  before update on public.employability_skills
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Market trends (MarketTrend — global reference, readable by all authenticated)
-- ---------------------------------------------------------------------------
create table public.market_trends (
  id uuid primary key default gen_random_uuid(),
  tech_name text not null,
  change_percent numeric(6, 2) not null default 0,
  demand_score smallint not null default 0,
  region_code text not null default 'BR',
  recorded_at date not null default current_date,
  unique (tech_name, region_code, recorded_at),
  constraint market_trends_demand_range check (demand_score between 0 and 100)
);

create index market_trends_recorded_idx on public.market_trends (recorded_at desc, tech_name);

-- Salary radar data (SalaryDataPoint[])
create table public.salary_market_data (
  id uuid primary key default gen_random_uuid(),
  tech_name text not null,
  min_salary integer not null,
  avg_salary integer not null,
  max_salary integer not null,
  currency public.currency_code not null default 'BRL',
  region_code text not null default 'BR',
  recorded_at date not null default current_date,
  unique (tech_name, region_code, recorded_at),
  constraint salary_market_data_range check (
    min_salary >= 0 and avg_salary >= min_salary and max_salary >= avg_salary
  )
);

create index salary_market_data_tech_idx on public.salary_market_data (tech_name, recorded_at desc);

-- Market insights (MarketInsight[])
create table public.market_insights (
  id uuid primary key default gen_random_uuid(),
  tech_name text not null,
  change_percent numeric(6, 2) not null default 0,
  region_code text not null default 'BR',
  recorded_at date not null default current_date,
  unique (tech_name, region_code, recorded_at)
);

create index market_insights_recorded_idx on public.market_insights (recorded_at desc);

-- Opportunity regions (OpportunityRegion[] — map reference data)
create table public.opportunity_regions (
  id uuid primary key default gen_random_uuid(),
  country_code text not null,
  country_name text not null,
  flag_emoji text not null default '',
  opportunity_count integer not null default 0,
  map_x numeric(5, 2) not null default 50,
  map_y numeric(5, 2) not null default 50,
  region_code text not null default 'global',
  recorded_at date not null default current_date,
  unique (country_code, region_code, recorded_at)
);

create index opportunity_regions_recorded_idx
  on public.opportunity_regions (recorded_at desc, opportunity_count desc);

-- User-specific opportunity region counts (when personalized)
create table public.user_opportunity_regions (
  user_id uuid not null references public.profiles (id) on delete cascade,
  region_id uuid not null references public.opportunity_regions (id) on delete cascade,
  personalized_count integer not null default 0,
  computed_at timestamptz not null default now(),
  primary key (user_id, region_id)
);

-- Testimonials (Testimonial — marketing/auth, CMS-like reference)
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role_title text not null default '',
  company_name text not null default '',
  avatar_url text not null default '',
  quote text not null,
  is_published boolean not null default true,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create index testimonials_published_idx
  on public.testimonials (is_published, sort_order)
  where is_published = true;
