-- Direct messaging for real Jobera users/recruiters.
-- No seed/demo data is inserted by this migration.

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  job_application_id uuid unique references public.job_applications(id) on delete set null,
  company_id uuid not null references public.companies(id) on delete cascade,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('candidate', 'recruiter')),
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (length(btrim(content)) > 0),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists conversations_company_id_idx
  on public.conversations(company_id);
create index if not exists conversations_last_message_at_idx
  on public.conversations(last_message_at desc);
create index if not exists conversation_participants_user_id_idx
  on public.conversation_participants(user_id);
create index if not exists direct_messages_conversation_created_idx
  on public.direct_messages(conversation_id, created_at);
create index if not exists direct_messages_unread_idx
  on public.direct_messages(conversation_id, read_at)
  where read_at is null;

alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.direct_messages enable row level security;

-- SECURITY DEFINER avoids recursive RLS when policies need to test membership.
create or replace function public.is_conversation_participant(target_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = target_conversation_id
      and cp.user_id = auth.uid()
  );
$$;

revoke all on function public.is_conversation_participant(uuid) from public;
grant execute on function public.is_conversation_participant(uuid) to authenticated;

create or replace function public.count_unread_direct_messages(target_user_id uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::bigint
  from public.direct_messages dm
  join public.conversation_participants cp
    on cp.conversation_id = dm.conversation_id
   and cp.user_id = target_user_id
  where target_user_id = auth.uid()
    and dm.sender_user_id <> target_user_id
    and dm.read_at is null;
$$;

revoke all on function public.count_unread_direct_messages(uuid) from public;
grant execute on function public.count_unread_direct_messages(uuid) to authenticated;

drop policy if exists "conversation participants can read conversations" on public.conversations;
create policy "conversation participants can read conversations"
on public.conversations for select
to authenticated
using (public.is_conversation_participant(id));

-- Conversation creation is allowed only for authenticated users. Application code
-- additionally verifies recruiter ownership of the company before inserting.
drop policy if exists "authenticated users can create conversations" on public.conversations;
create policy "authenticated users can create conversations"
on public.conversations for insert
to authenticated
with check (auth.uid() is not null);

drop policy if exists "conversation participants can update conversations" on public.conversations;
create policy "conversation participants can update conversations"
on public.conversations for update
to authenticated
using (public.is_conversation_participant(id))
with check (public.is_conversation_participant(id));

drop policy if exists "participants can read memberships" on public.conversation_participants;
create policy "participants can read memberships"
on public.conversation_participants for select
to authenticated
using (public.is_conversation_participant(conversation_id));

-- During conversation creation the recruiter inserts both participant rows. The
-- application has already checked that the recruiter controls the target company.
drop policy if exists "authenticated users can add conversation participants" on public.conversation_participants;
create policy "authenticated users can add conversation participants"
on public.conversation_participants for insert
to authenticated
with check (auth.uid() is not null);

drop policy if exists "participants can read direct messages" on public.direct_messages;
create policy "participants can read direct messages"
on public.direct_messages for select
to authenticated
using (public.is_conversation_participant(conversation_id));

drop policy if exists "participants can send direct messages" on public.direct_messages;
create policy "participants can send direct messages"
on public.direct_messages for insert
to authenticated
with check (
  sender_user_id = auth.uid()
  and public.is_conversation_participant(conversation_id)
);

drop policy if exists "participants can mark direct messages read" on public.direct_messages;
create policy "participants can mark direct messages read"
on public.direct_messages for update
to authenticated
using (
  public.is_conversation_participant(conversation_id)
  and sender_user_id <> auth.uid()
)
with check (public.is_conversation_participant(conversation_id));
