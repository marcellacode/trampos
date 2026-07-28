-- Jobera: internal job applications — application_source enum, uniqueness, recruiter RLS

-- ---------------------------------------------------------------------------
-- application_source enum (replaces text `source` column)
-- ---------------------------------------------------------------------------
create type public.application_source as enum ('internal', 'external');

alter table public.job_applications
  add column application_source public.application_source;

update public.job_applications
set application_source = case
  when source = 'external' then 'external'::public.application_source
  else 'internal'::public.application_source
end;

alter table public.job_applications
  alter column application_source set not null,
  alter column application_source set default 'internal';

alter table public.job_applications drop column source;

-- One application per user per internal job
create unique index if not exists job_applications_user_job_idx
  on public.job_applications (user_id, job_id)
  where job_id is not null;

-- ---------------------------------------------------------------------------
-- Recruiter access: applications for company jobs
-- ---------------------------------------------------------------------------
create policy "job_applications_select_company_members"
  on public.job_applications for select
  to authenticated
  using (
    public.is_company_member(
      company_id,
      array['admin', 'recruiter', 'viewer']::public.company_member_role[]
    )
  );

create policy "job_applications_update_company_recruiters"
  on public.job_applications for update
  to authenticated
  using (
    public.is_company_member(
      company_id,
      array['admin', 'recruiter']::public.company_member_role[]
    )
  )
  with check (
    public.is_company_member(
      company_id,
      array['admin', 'recruiter']::public.company_member_role[]
    )
  );

-- Recruiters may view profiles of candidates who applied to their company
create policy "profiles_select_company_applicants"
  on public.profiles for select
  to authenticated
  using (
    exists (
      select 1
      from public.job_applications ja
      join public.company_members cm on cm.company_id = ja.company_id
      where ja.user_id = profiles.id
        and cm.user_id = (select auth.uid())
        and cm.role = any (
          array['admin', 'recruiter', 'viewer']::public.company_member_role[]
        )
    )
  );
