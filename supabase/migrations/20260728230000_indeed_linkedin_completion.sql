-- Jobera: Indeed+LinkedIn completion (system posts, DMs, privacy, moderation, external confirm)

-- ---------------------------------------------------------------------------
-- Profile: auto-post + section visibility
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists auto_post_enabled boolean not null default false,
  add column if not exists show_experiences_public boolean not null default true,
  add column if not exists show_education_public boolean not null default true,
  add column if not exists show_certificates_public boolean not null default true,
  add column if not exists show_projects_public boolean not null default true;

-- ---------------------------------------------------------------------------
-- Posts: system source
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'post_source') then
    create type public.post_source as enum ('manual', 'system');
  end if;
end $$;

alter table public.posts
  add column if not exists post_source public.post_source not null default 'manual',
  add column if not exists source_event_kind text;

create index if not exists posts_post_source_idx
  on public.posts (post_source, created_at desc);

-- ---------------------------------------------------------------------------
-- External application confirmation timestamp
-- ---------------------------------------------------------------------------
alter table public.job_applications
  add column if not exists confirmed_externally_at timestamptz;

-- ---------------------------------------------------------------------------
-- Moderation
-- ---------------------------------------------------------------------------
create table if not exists public.post_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  reporter_user_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null default '',
  created_at timestamptz not null default now(),
  unique (post_id, reporter_user_id)
);

create index if not exists post_reports_post_id_idx on public.post_reports (post_id);

create table if not exists public.blocked_users (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint blocked_users_not_self check (blocker_id <> blocked_id)
);

create index if not exists blocked_users_blocker_idx on public.blocked_users (blocker_id);

alter table public.post_reports enable row level security;
alter table public.blocked_users enable row level security;

-- ---------------------------------------------------------------------------
-- Direct messages (candidate ↔ recruiter)
-- ---------------------------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  job_application_id uuid unique references public.job_applications (id) on delete set null,
  company_id uuid not null references public.companies (id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create index if not exists conversations_company_id_idx on public.conversations (company_id);
create index if not exists conversations_last_message_idx on public.conversations (last_message_at desc);

create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('candidate', 'recruiter')),
  created_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create index if not exists conversation_participants_user_idx
  on public.conversation_participants (user_id);

create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_user_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (length(trim(content)) > 0),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists direct_messages_conversation_idx
  on public.direct_messages (conversation_id, created_at asc);

alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.direct_messages enable row level security;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.is_conversation_participant(target_conversation_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = target_conversation_id
      and cp.user_id = (select auth.uid())
  );
$$;

create or replace function public.count_unread_direct_messages(target_user_id uuid)
returns bigint
language sql
stable
security invoker
set search_path = public
as $$
  select count(*)::bigint
  from public.direct_messages dm
  join public.conversation_participants cp on cp.conversation_id = dm.conversation_id
  where cp.user_id = target_user_id
    and dm.sender_user_id <> target_user_id
    and dm.read_at is null;
$$;

grant execute on function public.count_unread_direct_messages(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS: post_reports
-- ---------------------------------------------------------------------------
create policy post_reports_insert_own on public.post_reports
  for insert to authenticated
  with check (reporter_user_id = (select auth.uid()));

create policy post_reports_select_own on public.post_reports
  for select to authenticated
  using (reporter_user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- RLS: blocked_users
-- ---------------------------------------------------------------------------
create policy blocked_users_select_own on public.blocked_users
  for select to authenticated
  using (blocker_id = (select auth.uid()));

create policy blocked_users_insert_own on public.blocked_users
  for insert to authenticated
  with check (blocker_id = (select auth.uid()));

create policy blocked_users_delete_own on public.blocked_users
  for delete to authenticated
  using (blocker_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- RLS: conversations
-- ---------------------------------------------------------------------------
create policy conversations_select_participant on public.conversations
  for select to authenticated
  using (public.is_conversation_participant(id));

create policy conversations_insert_recruiter on public.conversations
  for insert to authenticated
  with check (
    exists (
      select 1
      from public.company_members cm
      where cm.company_id = company_id
        and cm.user_id = (select auth.uid())
        and cm.role in ('admin', 'recruiter')
    )
  );

create policy conversations_update_participant on public.conversations
  for update to authenticated
  using (public.is_conversation_participant(id))
  with check (public.is_conversation_participant(id));

-- ---------------------------------------------------------------------------
-- RLS: conversation_participants
-- ---------------------------------------------------------------------------
create policy conversation_participants_select_own on public.conversation_participants
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or public.is_conversation_participant(conversation_id)
  );

create policy conversation_participants_insert_recruiter on public.conversation_participants
  for insert to authenticated
  with check (
    exists (
      select 1
      from public.conversations c
      join public.company_members cm on cm.company_id = c.company_id
      where c.id = conversation_id
        and cm.user_id = (select auth.uid())
        and cm.role in ('admin', 'recruiter')
    )
    or user_id = (select auth.uid())
  );

-- ---------------------------------------------------------------------------
-- RLS: direct_messages
-- ---------------------------------------------------------------------------
create policy direct_messages_select_participant on public.direct_messages
  for select to authenticated
  using (public.is_conversation_participant(conversation_id));

create policy direct_messages_insert_participant on public.direct_messages
  for insert to authenticated
  with check (
    sender_user_id = (select auth.uid())
    and public.is_conversation_participant(conversation_id)
  );

create policy direct_messages_update_read on public.direct_messages
  for update to authenticated
  using (public.is_conversation_participant(conversation_id))
  with check (public.is_conversation_participant(conversation_id));
