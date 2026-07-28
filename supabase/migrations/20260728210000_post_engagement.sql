-- Jobera: post engagement (likes, comments, shares)

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.post_reaction_type as enum ('like');

-- ---------------------------------------------------------------------------
-- posts: support share reposts in feed
-- ---------------------------------------------------------------------------
alter table public.posts
  add column shared_post_id uuid references public.posts (id) on delete set null;

create index posts_shared_post_id_idx on public.posts (shared_post_id)
  where shared_post_id is not null;

alter table public.posts drop constraint posts_content_or_job;

alter table public.posts add constraint posts_content_or_job check (
  length(trim(content)) > 0
  or job_id is not null
  or shared_post_id is not null
);

-- ---------------------------------------------------------------------------
-- post_reactions
-- ---------------------------------------------------------------------------
create table public.post_reactions (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  reaction_type public.post_reaction_type not null default 'like',
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index post_reactions_user_idx on public.post_reactions (user_id, created_at desc);

alter table public.post_reactions enable row level security;

-- ---------------------------------------------------------------------------
-- post_comments
-- ---------------------------------------------------------------------------
create table public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  parent_comment_id uuid references public.post_comments (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint post_comments_content_not_empty check (length(trim(content)) > 0)
);

create index post_comments_post_idx on public.post_comments (post_id, created_at asc);
create index post_comments_parent_idx on public.post_comments (parent_comment_id)
  where parent_comment_id is not null;

create trigger post_comments_updated_at
  before update on public.post_comments
  for each row execute function public.handle_updated_at();

alter table public.post_comments enable row level security;

-- ---------------------------------------------------------------------------
-- post_shares
-- ---------------------------------------------------------------------------
create table public.post_shares (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  comment text,
  feed_post_id uuid references public.posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint post_shares_one_per_user unique (post_id, user_id)
);

create index post_shares_user_idx on public.post_shares (user_id, created_at desc);
create index post_shares_feed_post_idx on public.post_shares (feed_post_id)
  where feed_post_id is not null;

alter table public.post_shares enable row level security;

-- ---------------------------------------------------------------------------
-- post_counts view (live aggregates)
-- ---------------------------------------------------------------------------
drop view if exists public.post_counts;

create view public.post_counts with (security_invoker = true) as
select
  p.id as post_id,
  coalesce(r.like_count, 0)::bigint as like_count,
  coalesce(c.comment_count, 0)::bigint as comment_count,
  coalesce(s.share_count, 0)::bigint as share_count
from public.posts p
left join (
  select post_id, count(*)::bigint as like_count
  from public.post_reactions
  group by post_id
) r on r.post_id = p.id
left join (
  select post_id, count(*)::bigint as comment_count
  from public.post_comments
  group by post_id
) c on c.post_id = p.id
left join (
  select post_id, count(*)::bigint as share_count
  from public.post_shares
  group by post_id
) s on s.post_id = p.id;

-- ---------------------------------------------------------------------------
-- RLS: post_reactions
-- ---------------------------------------------------------------------------
create policy "post_reactions_select_readable"
  on public.post_reactions for select
  to authenticated
  using (public.can_read_post(post_id));

create policy "post_reactions_insert_own"
  on public.post_reactions for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and public.can_read_post(post_id)
  );

create policy "post_reactions_delete_own"
  on public.post_reactions for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- RLS: post_comments
-- ---------------------------------------------------------------------------
create policy "post_comments_select_readable"
  on public.post_comments for select
  to authenticated
  using (public.can_read_post(post_id));

create policy "post_comments_insert_own"
  on public.post_comments for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and public.can_read_post(post_id)
  );

create policy "post_comments_update_own"
  on public.post_comments for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "post_comments_delete_own"
  on public.post_comments for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- RLS: post_shares
-- ---------------------------------------------------------------------------
create policy "post_shares_select_readable"
  on public.post_shares for select
  to authenticated
  using (
    public.can_read_post(post_id)
    or user_id = (select auth.uid())
  );

create policy "post_shares_insert_own"
  on public.post_shares for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and public.can_read_post(post_id)
  );

create policy "post_shares_delete_own"
  on public.post_shares for delete
  to authenticated
  using (user_id = (select auth.uid()));
