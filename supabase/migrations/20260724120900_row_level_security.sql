-- Jobera: Row Level Security policies
-- Principle: users own their data; catalog data is read-only for authenticated users.

-- ---------------------------------------------------------------------------
-- Enable RLS on all public tables
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.profile_work_models enable row level security;
alter table public.profile_contract_types enable row level security;
alter table public.oauth_connections enable row level security;
alter table public.resume_uploads enable row level security;
alter table public.application_usage enable row level security;
alter table public.profile_experiences enable row level security;
alter table public.profile_projects enable row level security;
alter table public.profile_project_tech enable row level security;
alter table public.profile_certificates enable row level security;
alter table public.profile_languages enable row level security;
alter table public.profile_skills enable row level security;
alter table public.goal_chips enable row level security;
alter table public.profile_ai_suggestions enable row level security;
alter table public.professional_dna enable row level security;
alter table public.dna_strengths enable row level security;
alter table public.dna_compatibility_scores enable row level security;
alter table public.dna_salary_ranges enable row level security;
alter table public.smart_filters enable row level security;
alter table public.companies enable row level security;
alter table public.company_benefits enable row level security;
alter table public.user_company_matches enable row level security;
alter table public.jobs enable row level security;
alter table public.job_stack enable row level security;
alter table public.job_benefits enable row level security;
alter table public.job_section_items enable row level security;
alter table public.job_stats enable row level security;
alter table public.job_hiring_stages enable row level security;
alter table public.job_faqs enable row level security;
alter table public.job_interview_questions enable row level security;
alter table public.job_culture_indicators enable row level security;
alter table public.job_team_info enable row level security;
alter table public.job_team_stack enable row level security;
alter table public.job_related enable row level security;
alter table public.job_similar_companies enable row level security;
alter table public.job_ai_summary_reasons enable row level security;
alter table public.job_matches enable row level security;
alter table public.job_match_reasons enable row level security;
alter table public.job_match_weight_factors enable row level security;
alter table public.job_match_approval_reasons enable row level security;
alter table public.job_match_simulation_stages enable row level security;
alter table public.job_match_tech_comparisons enable row level security;
alter table public.job_match_resume_suggestions enable row level security;
alter table public.job_match_portfolio_projects enable row level security;
alter table public.job_match_github_projects enable row level security;
alter table public.job_match_apply_checklist enable row level security;
alter table public.job_match_study_topics enable row level security;
alter table public.job_match_career_impact_roles enable row level security;
alter table public.job_match_comparison_items enable row level security;
alter table public.user_hidden_jobs enable row level security;
alter table public.discovery_summaries enable row level security;
alter table public.job_applications enable row level security;
alter table public.timeline_events enable row level security;
alter table public.notifications enable row level security;
alter table public.dashboard_recommendations enable row level security;
alter table public.kpi_metrics enable row level security;
alter table public.dashboard_ai_suggestions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.chat_read_state enable row level security;
alter table public.employability_overviews enable row level security;
alter table public.daily_missions enable row level security;
alter table public.employability_skills enable row level security;
alter table public.market_trends enable row level security;
alter table public.salary_market_data enable row level security;
alter table public.market_insights enable row level security;
alter table public.opportunity_regions enable row level security;
alter table public.user_opportunity_regions enable row level security;
alter table public.testimonials enable row level security;

-- ---------------------------------------------------------------------------
-- Helper: standard user ownership check
-- ---------------------------------------------------------------------------
create or replace function public.is_owner(target_user_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select target_user_id = (select auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (public.is_owner(id));

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (public.is_owner(id))
  with check (public.is_owner(id));

-- INSERT handled by handle_new_user trigger (security definer)

-- ---------------------------------------------------------------------------
-- User-owned tables (direct user_id column)
-- ---------------------------------------------------------------------------
do $$
declare
  tbl text;
  tables_with_user_id text[] := array[
    'profile_work_models', 'profile_contract_types', 'oauth_connections',
    'resume_uploads', 'application_usage', 'profile_experiences',
    'profile_projects', 'profile_certificates', 'profile_languages',
    'profile_skills', 'goal_chips', 'profile_ai_suggestions',
    'smart_filters', 'user_company_matches', 'job_matches',
    'user_hidden_jobs', 'discovery_summaries', 'job_applications',
    'timeline_events', 'notifications', 'dashboard_recommendations',
    'kpi_metrics', 'dashboard_ai_suggestions', 'chat_messages',
    'chat_read_state', 'employability_overviews', 'daily_missions',
    'employability_skills', 'user_opportunity_regions'
  ];
begin
  foreach tbl in array tables_with_user_id loop
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
-- profile_project_tech (ownership via profile_projects)
-- ---------------------------------------------------------------------------
create policy "profile_project_tech_select_own"
  on public.profile_project_tech for select to authenticated
  using (
    exists (
      select 1 from public.profile_projects pp
      where pp.id = project_id and public.is_owner(pp.user_id)
    )
  );

create policy "profile_project_tech_insert_own"
  on public.profile_project_tech for insert to authenticated
  with check (
    exists (
      select 1 from public.profile_projects pp
      where pp.id = project_id and public.is_owner(pp.user_id)
    )
  );

create policy "profile_project_tech_update_own"
  on public.profile_project_tech for update to authenticated
  using (
    exists (
      select 1 from public.profile_projects pp
      where pp.id = project_id and public.is_owner(pp.user_id)
    )
  )
  with check (
    exists (
      select 1 from public.profile_projects pp
      where pp.id = project_id and public.is_owner(pp.user_id)
    )
  );

create policy "profile_project_tech_delete_own"
  on public.profile_project_tech for delete to authenticated
  using (
    exists (
      select 1 from public.profile_projects pp
      where pp.id = project_id and public.is_owner(pp.user_id)
    )
  );

-- ---------------------------------------------------------------------------
-- professional_dna and children
-- ---------------------------------------------------------------------------
create policy "professional_dna_select_own"
  on public.professional_dna for select to authenticated
  using (public.is_owner(user_id));

create policy "professional_dna_insert_own"
  on public.professional_dna for insert to authenticated
  with check (public.is_owner(user_id));

create policy "professional_dna_update_own"
  on public.professional_dna for update to authenticated
  using (public.is_owner(user_id))
  with check (public.is_owner(user_id));

create policy "professional_dna_delete_own"
  on public.professional_dna for delete to authenticated
  using (public.is_owner(user_id));

-- DNA child tables via dna_id join
do $$
declare
  tbl text;
  dna_child_tables text[] := array[
    'dna_strengths', 'dna_compatibility_scores', 'dna_salary_ranges'
  ];
begin
  foreach tbl in array dna_child_tables loop
    execute format(
      'create policy %I on public.%I for select to authenticated
       using (exists (select 1 from public.professional_dna d where d.id = dna_id and public.is_owner(d.user_id)))',
      tbl || '_select_own', tbl
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated
       with check (exists (select 1 from public.professional_dna d where d.id = dna_id and public.is_owner(d.user_id)))',
      tbl || '_insert_own', tbl
    );
    execute format(
      'create policy %I on public.%I for update to authenticated
       using (exists (select 1 from public.professional_dna d where d.id = dna_id and public.is_owner(d.user_id)))
       with check (exists (select 1 from public.professional_dna d where d.id = dna_id and public.is_owner(d.user_id)))',
      tbl || '_update_own', tbl
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated
       using (exists (select 1 from public.professional_dna d where d.id = dna_id and public.is_owner(d.user_id)))',
      tbl || '_delete_own', tbl
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Job match child tables (via match_id -> job_matches.user_id)
-- ---------------------------------------------------------------------------
do $$
declare
  tbl text;
  match_child_tables text[] := array[
    'job_match_reasons', 'job_match_weight_factors', 'job_match_approval_reasons',
    'job_match_simulation_stages', 'job_match_tech_comparisons',
    'job_match_resume_suggestions', 'job_match_portfolio_projects',
    'job_match_github_projects', 'job_match_apply_checklist',
    'job_match_study_topics', 'job_match_career_impact_roles',
    'job_match_comparison_items'
  ];
begin
  foreach tbl in array match_child_tables loop
    execute format(
      'create policy %I on public.%I for select to authenticated
       using (exists (select 1 from public.job_matches m where m.id = match_id and public.is_owner(m.user_id)))',
      tbl || '_select_own', tbl
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated
       with check (exists (select 1 from public.job_matches m where m.id = match_id and public.is_owner(m.user_id)))',
      tbl || '_insert_own', tbl
    );
    execute format(
      'create policy %I on public.%I for update to authenticated
       using (exists (select 1 from public.job_matches m where m.id = match_id and public.is_owner(m.user_id)))
       with check (exists (select 1 from public.job_matches m where m.id = match_id and public.is_owner(m.user_id)))',
      tbl || '_update_own', tbl
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated
       using (exists (select 1 from public.job_matches m where m.id = match_id and public.is_owner(m.user_id)))',
      tbl || '_delete_own', tbl
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Catalog tables: read-only for authenticated users
-- Writes restricted to service_role (job ingestion, market data pipelines)
-- ---------------------------------------------------------------------------
do $$
declare
  tbl text;
  catalog_tables text[] := array[
    'companies', 'company_benefits', 'jobs', 'job_stack', 'job_benefits',
    'job_section_items', 'job_stats', 'job_hiring_stages', 'job_faqs',
    'job_interview_questions', 'job_culture_indicators', 'job_team_info',
    'job_team_stack', 'job_related', 'job_similar_companies',
    'job_ai_summary_reasons', 'market_trends', 'salary_market_data',
    'market_insights', 'opportunity_regions', 'testimonials'
  ];
begin
  foreach tbl in array catalog_tables loop
    execute format(
      'create policy %I on public.%I for select to authenticated using (true)',
      tbl || '_select_authenticated', tbl
    );
    execute format(
      'create policy %I on public.%I for select to anon using (true)',
      tbl || '_select_anon', tbl
    );
  end loop;
end;
$$;

-- Published testimonials only for anon (extra filter)
drop policy if exists testimonials_select_anon on public.testimonials;
create policy "testimonials_select_anon"
  on public.testimonials for select to anon
  using (is_published = true);

drop policy if exists testimonials_select_authenticated on public.testimonials;
create policy "testimonials_select_authenticated"
  on public.testimonials for select to authenticated
  using (is_published = true);

-- Active jobs only visible to authenticated users browsing discovery
drop policy if exists jobs_select_authenticated on public.jobs;
create policy "jobs_select_authenticated"
  on public.jobs for select to authenticated
  using (is_active = true);

-- ---------------------------------------------------------------------------
-- Grant usage on enums and functions to authenticated/anon roles
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;

-- Revoke anon write access (catalog writes via service_role only)
revoke insert, update, delete on all tables in schema public from anon;

-- Future tables inherit grants
alter default privileges in schema public
  grant select on tables to anon, authenticated;
alter default privileges in schema public
  grant insert, update, delete on tables to authenticated;
