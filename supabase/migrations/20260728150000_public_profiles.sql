-- Jobera: public candidate profiles (slug, visibility, RLS)

-- ---------------------------------------------------------------------------
-- New profile columns
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column slug text unique,
  add column headline text not null default '',
  add column location text not null default '',
  add column is_public boolean not null default false,
  add column website_url text;

create index profiles_slug_idx on public.profiles (slug) where slug is not null;
create index profiles_is_public_idx on public.profiles (is_public) where is_public = true;

-- ---------------------------------------------------------------------------
-- Slug helpers
-- ---------------------------------------------------------------------------
create or replace function public.slugify(value text)
returns text
language sql
immutable
set search_path = public
as $$
  select trim(both '-' from regexp_replace(
    regexp_replace(
      lower(
        translate(
          coalesce(value, ''),
          'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
          'aaaaaeeeeiiiiooooouuuucnaaaaaeeeeiiiiooooouuuucn'
        )
      ),
      '[^a-z0-9]+', '-', 'g'
    ),
    '-+', '-', 'g'
  ));
$$;

create or replace function public.generate_profile_slug(
  full_name text,
  profile_id uuid default null
)
returns text
language plpgsql
volatile
set search_path = public
as $$
declare
  base_slug text;
  candidate text;
  counter integer := 1;
begin
  base_slug := public.slugify(full_name);
  if base_slug = '' then
    base_slug := 'usuario';
  end if;

  candidate := base_slug;

  while exists (
    select 1
    from public.profiles p
    where p.slug = candidate
      and (profile_id is null or p.id <> profile_id)
  ) loop
    counter := counter + 1;
    candidate := base_slug || '-' || counter::text;
  end loop;

  return candidate;
end;
$$;

create or replace function public.handle_profile_slug()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.slug is null or trim(new.slug) = '' then
      new.slug := public.generate_profile_slug(new.full_name, new.id);
    else
      new.slug := public.slugify(new.slug);
    end if;
  elsif tg_op = 'UPDATE' then
    if new.full_name is distinct from old.full_name
      and (new.slug is not distinct from old.slug or new.slug is null or trim(new.slug) = '')
    then
      new.slug := public.generate_profile_slug(new.full_name, new.id);
    elsif new.slug is distinct from old.slug and new.slug is not null then
      new.slug := public.slugify(new.slug);
    end if;
  end if;

  return new;
end;
$$;

create trigger profiles_slug
  before insert or update of full_name, slug on public.profiles
  for each row execute function public.handle_profile_slug();

-- Backfill slugs for existing profiles
update public.profiles
set slug = public.generate_profile_slug(full_name, id)
where slug is null;

-- ---------------------------------------------------------------------------
-- RLS: public read for profiles and profile_* entities
-- ---------------------------------------------------------------------------
create policy "profiles_select_public"
  on public.profiles for select
  to anon, authenticated
  using (is_public = true);

create or replace function public.is_public_profile(target_user_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = target_user_id
      and p.is_public = true
  );
$$;

do $$
declare
  tbl text;
  tables_with_user_id text[] := array[
    'profile_experiences', 'profile_projects', 'profile_certificates',
    'profile_languages', 'profile_skills'
  ];
begin
  foreach tbl in array tables_with_user_id loop
    execute format(
      'create policy %I on public.%I for select to anon, authenticated using (public.is_public_profile(user_id))',
      tbl || '_select_public', tbl
    );
  end loop;
end;
$$;

create policy "profile_project_tech_select_public"
  on public.profile_project_tech for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.profile_projects pp
      where pp.id = project_id
        and public.is_public_profile(pp.user_id)
    )
  );
