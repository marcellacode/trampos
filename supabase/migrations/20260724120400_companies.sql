-- Jobera: companies catalog (CompanyMatch, CompanyProfile, SimilarCompany)

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  logo text not null default '',
  brand_color text not null default '#6366F1',
  segment text not null default '',
  employees_label text not null default '',
  market_years smallint,
  rating numeric(3, 2),
  verified boolean not null default false,
  environment public.company_environment,
  remote_friendly boolean not null default false,
  href text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint companies_slug_not_empty check (length(trim(slug)) > 0),
  constraint companies_name_not_empty check (length(trim(name)) > 0),
  constraint companies_rating_range check (rating is null or rating between 0 and 5),
  unique (slug)
);

create index companies_name_trgm_idx
  on public.companies using gin (name extensions.gin_trgm_ops);
create index companies_environment_idx on public.companies (environment);
create index companies_verified_idx on public.companies (verified) where verified = true;

create trigger companies_updated_at
  before update on public.companies
  for each row execute function public.handle_updated_at();

create table public.company_benefits (
  company_id uuid not null references public.companies (id) on delete cascade,
  benefit text not null,
  sort_order smallint not null default 0,
  primary key (company_id, benefit)
);

-- User-specific company compatibility (CompanyMatch in discovery)
create table public.user_company_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  compatibility smallint not null,
  generated_at timestamptz not null default now(),
  unique (user_id, company_id),
  constraint user_company_matches_range check (compatibility between 0 and 100)
);

create index user_company_matches_user_id_idx
  on public.user_company_matches (user_id, compatibility desc);
