-- Jobera: recruiters publish internal jobs

-- ---------------------------------------------------------------------------
-- Enum + job columns
-- ---------------------------------------------------------------------------
create type public.job_application_mode as enum ('internal', 'external_redirect');

alter table public.jobs
  add column created_by_user_id uuid references public.profiles (id) on delete set null,
  add column application_mode public.job_application_mode not null default 'internal',
  add column external_apply_url text;

alter table public.jobs
  add constraint jobs_external_url_required_for_redirect check (
    application_mode = 'internal'
    or (external_apply_url is not null and length(trim(external_apply_url)) > 0)
  );

create index jobs_created_by_user_id_idx on public.jobs (created_by_user_id);

-- ---------------------------------------------------------------------------
-- RLS: company members manage their jobs
-- ---------------------------------------------------------------------------
create policy "jobs_select_company_members"
  on public.jobs for select
  to authenticated
  using (public.can_edit_company(company_id));

create policy "jobs_insert_members"
  on public.jobs for insert
  to authenticated
  with check (
    public.can_edit_company(company_id)
    and created_by_user_id = (select auth.uid())
  );

create policy "jobs_update_members"
  on public.jobs for update
  to authenticated
  using (public.can_edit_company(company_id))
  with check (public.can_edit_company(company_id));

-- Child tables: stack, benefits, sections, stats
create policy "job_stack_insert_members"
  on public.job_stack for insert
  to authenticated
  with check (
    exists (
      select 1 from public.jobs j
      where j.id = job_id and public.can_edit_company(j.company_id)
    )
  );

create policy "job_stack_update_members"
  on public.job_stack for update
  to authenticated
  using (
    exists (
      select 1 from public.jobs j
      where j.id = job_id and public.can_edit_company(j.company_id)
    )
  )
  with check (
    exists (
      select 1 from public.jobs j
      where j.id = job_id and public.can_edit_company(j.company_id)
    )
  );

create policy "job_stack_delete_members"
  on public.job_stack for delete
  to authenticated
  using (
    exists (
      select 1 from public.jobs j
      where j.id = job_id and public.can_edit_company(j.company_id)
    )
  );

create policy "job_benefits_insert_members"
  on public.job_benefits for insert
  to authenticated
  with check (
    exists (
      select 1 from public.jobs j
      where j.id = job_id and public.can_edit_company(j.company_id)
    )
  );

create policy "job_benefits_update_members"
  on public.job_benefits for update
  to authenticated
  using (
    exists (
      select 1 from public.jobs j
      where j.id = job_id and public.can_edit_company(j.company_id)
    )
  )
  with check (
    exists (
      select 1 from public.jobs j
      where j.id = job_id and public.can_edit_company(j.company_id)
    )
  );

create policy "job_benefits_delete_members"
  on public.job_benefits for delete
  to authenticated
  using (
    exists (
      select 1 from public.jobs j
      where j.id = job_id and public.can_edit_company(j.company_id)
    )
  );

create policy "job_section_items_insert_members"
  on public.job_section_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.jobs j
      where j.id = job_id and public.can_edit_company(j.company_id)
    )
  );

create policy "job_section_items_update_members"
  on public.job_section_items for update
  to authenticated
  using (
    exists (
      select 1 from public.jobs j
      where j.id = job_id and public.can_edit_company(j.company_id)
    )
  )
  with check (
    exists (
      select 1 from public.jobs j
      where j.id = job_id and public.can_edit_company(j.company_id)
    )
  );

create policy "job_section_items_delete_members"
  on public.job_section_items for delete
  to authenticated
  using (
    exists (
      select 1 from public.jobs j
      where j.id = job_id and public.can_edit_company(j.company_id)
    )
  );

create policy "job_stats_insert_members"
  on public.job_stats for insert
  to authenticated
  with check (
    exists (
      select 1 from public.jobs j
      where j.id = job_id and public.can_edit_company(j.company_id)
    )
  );

create policy "job_stats_update_members"
  on public.job_stats for update
  to authenticated
  using (
    exists (
      select 1 from public.jobs j
      where j.id = job_id and public.can_edit_company(j.company_id)
    )
  )
  with check (
    exists (
      select 1 from public.jobs j
      where j.id = job_id and public.can_edit_company(j.company_id)
    )
  );
