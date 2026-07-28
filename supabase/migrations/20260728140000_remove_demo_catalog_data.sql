-- Remove fictitious catalog/demo data (Nubank, Google, etc.) from user-facing surfaces.
-- Internal catalog jobs are deactivated; per-user demo dashboard rows are deleted.

-- Seed job and company IDs (from 20260724121000_seed_catalog_and_demo.sql)
-- ---------------------------------------------------------------------------

update public.jobs
set is_active = false
where id in (
  '22222222-2222-2222-2222-222222222201',
  '22222222-2222-2222-2222-222222222202',
  '22222222-2222-2222-2222-222222222203',
  '22222222-2222-2222-2222-222222222204',
  '22222222-2222-2222-2222-222222222205'
);

-- Per-user artifacts tied to demo catalog
delete from public.timeline_events
where job_id in (
  '22222222-2222-2222-2222-222222222201',
  '22222222-2222-2222-2222-222222222202',
  '22222222-2222-2222-2222-222222222203',
  '22222222-2222-2222-2222-222222222204',
  '22222222-2222-2222-2222-222222222205'
)
or company_id in (
  '11111111-1111-1111-1111-111111111101',
  '11111111-1111-1111-1111-111111111102',
  '11111111-1111-1111-1111-111111111103',
  '11111111-1111-1111-1111-111111111104',
  '11111111-1111-1111-1111-111111111105',
  '11111111-1111-1111-1111-111111111106',
  '11111111-1111-1111-1111-111111111107',
  '11111111-1111-1111-1111-111111111108',
  '11111111-1111-1111-1111-111111111109'
);

delete from public.job_applications
where job_id in (
  '22222222-2222-2222-2222-222222222201',
  '22222222-2222-2222-2222-222222222202',
  '22222222-2222-2222-2222-222222222203',
  '22222222-2222-2222-2222-222222222204',
  '22222222-2222-2222-2222-222222222205'
);

delete from public.job_matches
where job_id in (
  '22222222-2222-2222-2222-222222222201',
  '22222222-2222-2222-2222-222222222202',
  '22222222-2222-2222-2222-222222222203',
  '22222222-2222-2222-2222-222222222204',
  '22222222-2222-2222-2222-222222222205'
);

delete from public.user_company_matches
where company_id in (
  '11111111-1111-1111-1111-111111111101',
  '11111111-1111-1111-1111-111111111102',
  '11111111-1111-1111-1111-111111111103',
  '11111111-1111-1111-1111-111111111104',
  '11111111-1111-1111-1111-111111111105',
  '11111111-1111-1111-1111-111111111106',
  '11111111-1111-1111-1111-111111111107',
  '11111111-1111-1111-1111-111111111108',
  '11111111-1111-1111-1111-111111111109'
);

delete from public.dashboard_recommendations
where job_id in (
  '22222222-2222-2222-2222-222222222201',
  '22222222-2222-2222-2222-222222222202',
  '22222222-2222-2222-2222-222222222203',
  '22222222-2222-2222-2222-222222222204',
  '22222222-2222-2222-2222-222222222205'
);

delete from public.notifications
where href like '%nubank%' or href like '%ml-frontend%' or href like '%picpay%';

-- Fake KPIs / summaries seeded for demo user (and any user with identical demo keys)
delete from public.kpi_metrics
where metric_key in ('jobs_found', 'compatibility', 'applications', 'interviews')
  and label in (
    'Vagas encontradas',
    'Compatibilidade média',
    'Candidaturas',
    'Entrevistas'
  );

update public.discovery_summaries
set analyzed = 0, compatible = 0, very_compatible = 0, perfect = 0;

delete from public.smart_filters;

-- Reference / marketing data that is not real
delete from public.opportunity_regions;
delete from public.testimonials;

-- Demo chat messages with fake counts
delete from public.chat_messages
where content ilike '%98%%'
   or content ilike '%95%% compat%'
   or content ilike '%3 vagas com compatibilidade%';
