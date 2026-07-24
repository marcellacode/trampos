-- Jobera: normalized profile sub-entities (ExtractedProfile children)

-- ---------------------------------------------------------------------------
-- Experiences
-- ---------------------------------------------------------------------------
create table public.profile_experiences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  company text not null,
  role text not null,
  period_label text not null default '',
  description text not null default '',
  sort_order smallint not null default 0,
  started_at date,
  ended_at date,
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profile_experiences_user_id_idx on public.profile_experiences (user_id, sort_order);

create trigger profile_experiences_updated_at
  before update on public.profile_experiences
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Projects + tech stack
-- ---------------------------------------------------------------------------
create table public.profile_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  description text not null default '',
  stars integer,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profile_projects_user_id_idx on public.profile_projects (user_id, sort_order);

create trigger profile_projects_updated_at
  before update on public.profile_projects
  for each row execute function public.handle_updated_at();

create table public.profile_project_tech (
  project_id uuid not null references public.profile_projects (id) on delete cascade,
  tech_name text not null,
  sort_order smallint not null default 0,
  primary key (project_id, tech_name)
);

-- ---------------------------------------------------------------------------
-- Certificates
-- ---------------------------------------------------------------------------
create table public.profile_certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  issuer text not null default '',
  year_label text not null default '',
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profile_certificates_user_id_idx on public.profile_certificates (user_id, sort_order);

create trigger profile_certificates_updated_at
  before update on public.profile_certificates
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Languages
-- ---------------------------------------------------------------------------
create table public.profile_languages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  level_label text not null default '',
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profile_languages_user_id_idx on public.profile_languages (user_id, sort_order);

create trigger profile_languages_updated_at
  before update on public.profile_languages
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Skills (normalized from ExtractedProfile.skills string[])
-- ---------------------------------------------------------------------------
create table public.profile_skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  skill_name text not null,
  level_label text,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, skill_name)
);

create index profile_skills_user_id_idx on public.profile_skills (user_id, sort_order);
create index profile_skills_name_trgm_idx
  on public.profile_skills using gin (skill_name extensions.gin_trgm_ops);
