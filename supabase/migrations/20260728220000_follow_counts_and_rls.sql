-- Jobera: follow counts on profiles, extended RLS, public count helpers

-- ---------------------------------------------------------------------------
-- Denormalized counts on profiles
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists follower_count integer not null default 0,
  add column if not exists following_count integer not null default 0;

-- ---------------------------------------------------------------------------
-- Keep profile follow counts in sync
-- ---------------------------------------------------------------------------
create or replace function public.sync_profile_follow_counts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.profiles
    set following_count = following_count + 1
    where id = new.follower_user_id;

    if new.followed_user_id is not null then
      update public.profiles
      set follower_count = follower_count + 1
      where id = new.followed_user_id;
    end if;

    return new;
  elsif tg_op = 'DELETE' then
    update public.profiles
    set following_count = greatest(0, following_count - 1)
    where id = old.follower_user_id;

    if old.followed_user_id is not null then
      update public.profiles
      set follower_count = greatest(0, follower_count - 1)
      where id = old.followed_user_id;
    end if;

    return old;
  end if;

  return null;
end;
$$;

create trigger follows_sync_profile_counts
  after insert or delete on public.follows
  for each row execute function public.sync_profile_follow_counts();

-- Backfill counts from existing follows
update public.profiles p
set
  follower_count = coalesce((
    select count(*)::integer
    from public.follows f
    where f.followed_user_id = p.id
  ), 0),
  following_count = coalesce((
    select count(*)::integer
    from public.follows f
    where f.follower_user_id = p.id
  ), 0);

-- ---------------------------------------------------------------------------
-- Public follower count for companies
-- ---------------------------------------------------------------------------
create or replace function public.get_company_follower_count(target_company_id uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::bigint
  from public.follows f
  where f.followed_company_id = target_company_id;
$$;

grant execute on function public.get_company_follower_count(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- RLS: extended follows policies
-- ---------------------------------------------------------------------------
-- Follower lists: profile owners see who follows them.
create policy "follows_select_incoming"
  on public.follows for select
  to authenticated
  using (followed_user_id = (select auth.uid()));
