-- Security hardening: restrict function execution and anon job visibility

revoke execute on function public.handle_new_user() from anon, authenticated, public;

drop policy if exists jobs_select_anon on public.jobs;
create policy "jobs_select_anon"
  on public.jobs for select to anon
  using (is_active = true);
