-- Jobera: claimable companies and recruiter members

-- ---------------------------------------------------------------------------
-- Enum + company columns
-- ---------------------------------------------------------------------------
create type public.company_member_role as enum ('admin', 'recruiter', 'viewer');

alter table public.companies
  add column bio text not null default '',
  add column cover_url text,
  add column is_claimed boolean not null default false,
  add column claimed_at timestamptz;

-- ---------------------------------------------------------------------------
-- company_members
-- ---------------------------------------------------------------------------
create table public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.company_member_role not null default 'recruiter',
  created_at timestamptz not null default now(),
  unique (company_id, user_id)
);

create index company_members_user_id_idx on public.company_members (user_id);
create index company_members_company_id_idx on public.company_members (company_id);

alter table public.company_members enable row level security;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.is_company_member(
  target_company_id uuid,
  allowed_roles public.company_member_role[] default null
)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.company_members cm
    where cm.company_id = target_company_id
      and cm.user_id = (select auth.uid())
      and (
        allowed_roles is null
        or cm.role = any (allowed_roles)
      )
  );
$$;

create or replace function public.can_edit_company(target_company_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select public.is_company_member(
    target_company_id,
    array['admin', 'recruiter']::public.company_member_role[]
  );
$$;

create or replace function public.email_domain_matches_slug(
  user_email text,
  company_slug text
)
returns boolean
language sql
immutable
set search_path = public
as $$
  select coalesce(
    lower(split_part(split_part(user_email, '@', 2), '.', 1)) = lower(company_slug),
    false
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS: members edit company profile + benefits
-- ---------------------------------------------------------------------------
create policy "companies_update_members"
  on public.companies for update
  to authenticated
  using (public.can_edit_company(id))
  with check (public.can_edit_company(id));

create policy "company_benefits_insert_members"
  on public.company_benefits for insert
  to authenticated
  with check (public.can_edit_company(company_id));

create policy "company_benefits_update_members"
  on public.company_benefits for update
  to authenticated
  using (public.can_edit_company(company_id))
  with check (public.can_edit_company(company_id));

create policy "company_benefits_delete_members"
  on public.company_benefits for delete
  to authenticated
  using (public.can_edit_company(company_id));

create policy "company_members_select_members"
  on public.company_members for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or public.is_company_member(company_id)
  );

-- ---------------------------------------------------------------------------
-- Claim flow (auto-claim when email domain matches company slug)
-- ---------------------------------------------------------------------------
create or replace function public.claim_company(p_company_id uuid)
returns public.company_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_slug text;
  v_member public.company_members;
begin
  if v_user_id is null then
    raise exception 'Faça login para reivindicar a empresa.';
  end if;

  select email into v_email from public.profiles where id = v_user_id;
  if v_email is null or trim(v_email) = '' then
    raise exception 'E-mail do perfil não encontrado.';
  end if;

  select slug into v_slug
  from public.companies
  where id = p_company_id
    and is_claimed = false;

  if v_slug is null then
    raise exception 'Empresa não encontrada ou já reivindicada.';
  end if;

  if not public.email_domain_matches_slug(v_email, v_slug) then
    raise exception
      'Seu e-mail não corresponde ao domínio da empresa (%). Use um e-mail corporativo ou entre em contato com o suporte.',
      v_slug;
  end if;

  insert into public.company_members (company_id, user_id, role)
  values (p_company_id, v_user_id, 'admin')
  returning * into v_member;

  update public.companies
  set
    is_claimed = true,
    claimed_at = now(),
    verified = true
  where id = p_company_id;

  return v_member;
end;
$$;

revoke all on function public.claim_company(uuid) from public;
grant execute on function public.claim_company(uuid) to authenticated;

-- Point catalog hrefs to public company pages
update public.companies
set href = '/empresa/' || slug
where href is null or href like '/dashboard/empresas/%';
