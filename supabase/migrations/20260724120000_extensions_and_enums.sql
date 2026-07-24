-- Jobera: extensions and domain enums
-- Derived from frontend types in src/types/

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto" with schema extensions;
create extension if not exists "pg_trgm" with schema extensions;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

-- auth.ts / dashboard.ts
create type public.subscription_plan as enum ('free', 'pro', 'elite');
create type public.auth_provider as enum ('google', 'github', 'linkedin');

-- onboarding.ts
create type public.import_method as enum ('linkedin', 'github', 'resume', 'scratch');
create type public.availability_option as enum (
  'immediate', '15days', '30days', '45days', 'other'
);
create type public.work_model as enum ('onsite', 'hybrid', 'remote', 'any');
create type public.contract_type as enum ('clt', 'pj', 'freelancer', 'international');
create type public.onboarding_step as enum (
  'import', 'processing', 'summary', 'goals', 'availability',
  'profile', 'dna', 'success'
);
create type public.goal_chip_category as enum (
  'skill', 'role', 'location', 'salary', 'contract', 'model'
);
create type public.ai_suggestion_type as enum (
  'github', 'linkedin', 'skill', 'project', 'experience'
);

-- dashboard.ts
create type public.copilot_status as enum ('active', 'paused');
create type public.timeline_actor as enum ('ai', 'company');
create type public.timeline_event_kind as enum (
  'job_found', 'compatibility', 'resume_tailored', 'application_sent',
  'company_viewed', 'interview_invite'
);
create type public.notification_group as enum ('today', 'yesterday', 'week');
create type public.chat_role as enum ('assistant', 'user');
create type public.chat_context as enum ('dashboard', 'discovery', 'job_detail', 'assistant');

-- jobs.ts
create type public.match_reason_type as enum ('match', 'warning');
create type public.approval_level as enum ('baixa', 'media', 'alta');
create type public.simulation_stage_status as enum ('pass', 'warning', 'fail');
create type public.company_environment as enum ('startup', 'scale_up', 'corporativa');
create type public.hide_reason as enum ('distance', 'salary', 'tech', 'company', 'other');
create type public.tech_level as enum ('basico', 'intermediario', 'avancado');
create type public.apply_checklist_status as enum ('done', 'pending', 'auto');
create type public.resume_suggestion_type as enum ('add', 'move', 'highlight');
create type public.job_section_type as enum (
  'summary', 'responsibilities', 'requirements', 'differentials', 'benefits'
);
create type public.application_status as enum (
  'interested', 'applied', 'viewed', 'interview', 'rejected', 'offer'
);
create type public.currency_code as enum ('BRL', 'USD');
create type public.salary_range_kind as enum (
  'current_brazil', 'current_international',
  'with_skills_brazil', 'with_skills_international'
);
create type public.resume_upload_status as enum ('pending', 'processing', 'completed', 'failed');

-- ---------------------------------------------------------------------------
-- Shared utility: updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.handle_updated_at() is
  'Sets updated_at to now() on row update. Attach via BEFORE UPDATE trigger.';
