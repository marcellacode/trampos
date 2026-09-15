-- Align the jobs catalog schema with the application discovery query.
alter table public.jobs
  add column if not exists application_mode text not null default 'external';
