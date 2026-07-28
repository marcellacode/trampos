-- Jobera: professional feed (posts, follows, counts)

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.post_visibility as enum ('public', 'followers');

-- ---------------------------------------------------------------------------
-- follows (enables followers-only visibility)
-- ---------------------------------------------------------------------------
create table public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_user_id uuid not null references public.profiles (id) on delete cascade,
  followed_user_id uuid references public.profiles (id) on delete cascade,
  followed_company_id uuid references public.companies (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint follows_exactly_one_target check (
    (followed_user_id is not null and followed_company_id is null)
    or (followed_user_id is null and followed_company_id is not null)
  ),
  constraint follows_not_self check (
    followed_user_id is null or followed_user_id <> follower_user_id
  )
);

create unique index follows_user_unique_idx
  on public.follows (follower_user_id, followed_user_id)
  where followed_user_id is not null;

create unique index follows_company_unique_idx
  on public.follows (follower_user_id, followed_company_id)
  where followed_company_id is not null;

create index follows_follower_idx on public.follows (follower_user_id);
create index follows_followed_user_idx on public.follows (followed_user_id)
  where followed_user_id is not null;
create index follows_followed_company_idx on public.follows (followed_company_id)
  where followed_company_id is not null;

alter table public.follows enable row level security;

-- ---------------------------------------------------------------------------
-- posts
-- ---------------------------------------------------------------------------
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_user_id uuid references public.profiles (id) on delete cascade,
  author_company_id uuid references public.companies (id) on delete cascade,
  content text not null default '',
  media_urls jsonb not null default '[]'::jsonb,
  job_id uuid references public.jobs (id) on delete set null,
  visibility public.post_visibility not null default 'public',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_exactly_one_author check (
    (author_user_id is not null and author_company_id is null)
    or (author_user_id is null and author_company_id is not null)
  ),
  constraint posts_content_or_job check (
    length(trim(content)) > 0 or job_id is not null
  )
);

create index posts_created_id_idx on public.posts (created_at desc, id desc);
create index posts_author_user_idx on public.posts (author_user_id, created_at desc)
  where author_user_id is not null;
create index posts_author_company_idx on public.posts (author_company_id, created_at desc)
  where author_company_id is not null;
create index posts_visibility_idx on public.posts (visibility, created_at desc);
create index posts_job_id_idx on public.posts (job_id) where job_id is not null;

create trigger posts_updated_at
  before update on public.posts
  for each row execute function public.handle_updated_at();

alter table public.posts enable row level security;

-- ---------------------------------------------------------------------------
-- post_counts view (placeholder until likes/comments tables exist)
-- ---------------------------------------------------------------------------
create view public.post_counts with (security_invoker = true) as
select
  p.id as post_id,
  0::bigint as like_count,
  0::bigint as comment_count
from public.posts p;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.is_following_user(
  follower_id uuid,
  target_user_id uuid
)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.follows f
    where f.follower_user_id = follower_id
      and f.followed_user_id = target_user_id
  );
$$;

create or replace function public.is_following_company(
  follower_id uuid,
  target_company_id uuid
)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.follows f
    where f.follower_user_id = follower_id
      and f.followed_company_id = target_company_id
  );
$$;

create or replace function public.can_read_post(target_post_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.posts p
    where p.id = target_post_id
      and (
        p.visibility = 'public'
        or p.author_user_id = (select auth.uid())
        or (
          p.author_company_id is not null
          and public.can_edit_company(p.author_company_id)
        )
        or (
          p.visibility = 'followers'
          and p.author_user_id is not null
          and public.is_following_user((select auth.uid()), p.author_user_id)
        )
        or (
          p.visibility = 'followers'
          and p.author_company_id is not null
          and public.is_following_company((select auth.uid()), p.author_company_id)
        )
      )
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS: follows
-- ---------------------------------------------------------------------------
create policy "follows_select_own"
  on public.follows for select
  to authenticated
  using (follower_user_id = (select auth.uid()));

create policy "follows_insert_own"
  on public.follows for insert
  to authenticated
  with check (follower_user_id = (select auth.uid()));

create policy "follows_delete_own"
  on public.follows for delete
  to authenticated
  using (follower_user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- RLS: posts
-- ---------------------------------------------------------------------------
create policy "posts_select_readable"
  on public.posts for select
  to authenticated
  using (public.can_read_post(id));

create policy "posts_insert_user"
  on public.posts for insert
  to authenticated
  with check (
    author_user_id = (select auth.uid())
    and author_company_id is null
  );

create policy "posts_insert_company"
  on public.posts for insert
  to authenticated
  with check (
    author_user_id is null
    and author_company_id is not null
    and public.can_edit_company(author_company_id)
  );

create policy "posts_update_user_author"
  on public.posts for update
  to authenticated
  using (author_user_id = (select auth.uid()))
  with check (author_user_id = (select auth.uid()) and author_company_id is null);

create policy "posts_update_company_author"
  on public.posts for update
  to authenticated
  using (
    author_company_id is not null
    and public.can_edit_company(author_company_id)
  )
  with check (
    author_user_id is null
    and author_company_id is not null
    and public.can_edit_company(author_company_id)
  );

create policy "posts_delete_user_author"
  on public.posts for delete
  to authenticated
  using (author_user_id = (select auth.uid()));

create policy "posts_delete_company_author"
  on public.posts for delete
  to authenticated
  using (
    author_company_id is not null
    and public.can_edit_company(author_company_id)
  );
