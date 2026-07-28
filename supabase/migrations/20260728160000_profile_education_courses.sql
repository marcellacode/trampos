-- Jobera: profile education and courses (academic formation, separate from certificates)

-- ---------------------------------------------------------------------------
-- Education
-- ---------------------------------------------------------------------------
create table if not exists public.profile_education (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  institution text not null,
  degree text not null default '',
  field_of_study text not null default '',
  start_date date,
  end_date date,
  is_current boolean not null default false,
  description text not null default '',
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profile_education_user_id_idx
  on public.profile_education (user_id, sort_order);

drop trigger if exists profile_education_updated_at on public.profile_education;
create trigger profile_education_updated_at
  before update on public.profile_education
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Courses
-- ---------------------------------------------------------------------------
create table if not exists public.profile_courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  provider text not null default '',
  completion_date date,
  credential_url text,
  description text not null default '',
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profile_courses_user_id_idx
  on public.profile_courses (user_id, sort_order);

drop trigger if exists profile_courses_updated_at on public.profile_courses;
create trigger profile_courses_updated_at
  before update on public.profile_courses
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: owner CRUD
-- ---------------------------------------------------------------------------
alter table public.profile_education enable row level security;
alter table public.profile_courses enable row level security;

do $$
declare
  tbl text;
  tables_with_user_id text[] := array['profile_education', 'profile_courses'];
  pol text;
begin
  foreach tbl in array tables_with_user_id loop
    foreach pol in array array['select_own', 'insert_own', 'update_own', 'delete_own'] loop
      execute format('drop policy if exists %I on public.%I', tbl || '_' || pol, tbl);
    end loop;

    execute format(
      'create policy %I on public.%I for select to authenticated using (public.is_owner(user_id))',
      tbl || '_select_own', tbl
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.is_owner(user_id))',
      tbl || '_insert_own', tbl
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using (public.is_owner(user_id)) with check (public.is_owner(user_id))',
      tbl || '_update_own', tbl
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using (public.is_owner(user_id))',
      tbl || '_delete_own', tbl
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS: public read when profile is public
-- ---------------------------------------------------------------------------
do $$
declare
  tbl text;
  tables_with_user_id text[] := array['profile_education', 'profile_courses'];
begin
  foreach tbl in array tables_with_user_id loop
    execute format('drop policy if exists %I on public.%I', tbl || '_select_public', tbl);
    execute format(
      'create policy %I on public.%I for select to anon, authenticated using (public.is_public_profile(user_id))',
      tbl || '_select_public', tbl
    );
  end loop;
end;
$$;
