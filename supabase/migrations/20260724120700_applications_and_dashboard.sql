-- Jobera: applications pipeline and dashboard activity

-- ---------------------------------------------------------------------------
-- Job applications / interested companies (InterestedCompany)
-- ---------------------------------------------------------------------------
create table public.job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  job_id uuid references public.jobs (id) on delete set null,
  company_id uuid not null references public.companies (id) on delete restrict,
  role_title text not null,
  status public.application_status not null default 'interested',
  status_label text not null default '',
  applied_at timestamptz,
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index job_applications_user_id_idx
  on public.job_applications (user_id, last_activity_at desc);
create index job_applications_status_idx
  on public.job_applications (user_id, status);

create trigger job_applications_updated_at
  before update on public.job_applications
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Timeline events (TimelineActivity)
-- ---------------------------------------------------------------------------
create table public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  job_id uuid references public.jobs (id) on delete set null,
  company_id uuid references public.companies (id) on delete set null,
  title text not null,
  description text,
  href text not null default '/dashboard',
  actor public.timeline_actor not null default 'ai',
  event_kind public.timeline_event_kind not null,
  icon_name text not null default 'sparkles',
  color_token text not null default 'blue',
  glow_token text not null default 'blue',
  is_live boolean not null default false,
  created_at timestamptz not null default now()
);

create index timeline_events_user_created_idx
  on public.timeline_events (user_id, created_at desc);
create index timeline_events_kind_idx
  on public.timeline_events (user_id, event_kind);

-- ---------------------------------------------------------------------------
-- Notifications (NotificationItem)
-- ---------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null default '',
  notification_group public.notification_group not null default 'today',
  is_unread boolean not null default true,
  action_label text not null default '',
  href text not null default '/dashboard',
  icon_name text not null default 'bell',
  color_token text not null default 'blue',
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index notifications_user_unread_idx
  on public.notifications (user_id, is_unread, created_at desc);

-- ---------------------------------------------------------------------------
-- Dashboard recommendation (Recommendation — one active per user)
-- ---------------------------------------------------------------------------
create table public.dashboard_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  job_id uuid references public.jobs (id) on delete set null,
  title text not null,
  description text not null default '',
  duration_label text not null default '',
  company_name text not null default '',
  cta_primary text not null default '',
  cta_secondary text not null default '',
  href text not null default '/dashboard/vagas',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index dashboard_recommendations_user_active_idx
  on public.dashboard_recommendations (user_id, is_active);

create trigger dashboard_recommendations_updated_at
  before update on public.dashboard_recommendations
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- KPI metrics (KpiMetric — time-series snapshots)
-- ---------------------------------------------------------------------------
create table public.kpi_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  metric_key text not null,
  label text not null,
  value numeric(12, 2) not null default 0,
  suffix text,
  prefix text,
  delta_label text,
  delta_positive boolean,
  sparkline numeric(12, 2)[] not null default '{}',
  color_token text not null default 'blue',
  recorded_at timestamptz not null default now(),
  unique (user_id, metric_key, recorded_at)
);

create index kpi_metrics_user_key_idx
  on public.kpi_metrics (user_id, metric_key, recorded_at desc);

-- ---------------------------------------------------------------------------
-- Dashboard AI suggestions (AISuggestion)
-- ---------------------------------------------------------------------------
create table public.dashboard_ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null default '',
  impact_label text not null default '',
  href text not null default '/dashboard',
  icon_name text not null default 'sparkles',
  color_token text not null default 'blue',
  is_dismissed boolean not null default false,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create index dashboard_ai_suggestions_user_idx
  on public.dashboard_ai_suggestions (user_id, is_dismissed, sort_order);

-- ---------------------------------------------------------------------------
-- Chat messages (ChatMessage — dashboard, discovery, job detail contexts)
-- ---------------------------------------------------------------------------
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  context public.chat_context not null default 'dashboard',
  job_id uuid references public.jobs (id) on delete cascade,
  role public.chat_role not null,
  content text not null,
  created_at timestamptz not null default now(),
  constraint chat_messages_content_not_empty check (length(trim(content)) > 0)
);

create index chat_messages_user_context_idx
  on public.chat_messages (user_id, context, created_at desc);
create index chat_messages_job_context_idx
  on public.chat_messages (user_id, job_id, created_at desc)
  where job_id is not null;

-- Unread message counter helper view data stored via partial index on latest assistant messages
create table public.chat_read_state (
  user_id uuid not null references public.profiles (id) on delete cascade,
  context public.chat_context not null,
  last_read_at timestamptz not null default now(),
  primary key (user_id, context)
);
