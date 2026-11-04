-- Add the requested compiled-language project types and allow an assigned teacher
-- to save the student's project while both are in an authenticated live session.
alter table public.projects drop constraint if exists projects_type_check;
alter table public.projects add constraint projects_type_check
  check (type in ('web','python','java','cpp','c'));

drop policy if exists update_projects on public.projects;
create policy update_projects on public.projects for update to authenticated
using (
  owner_id = (select auth.uid())
  or exists (
    select 1 from public.teacher_students ts
    where ts.teacher_id = (select auth.uid()) and ts.student_id = projects.owner_id
  )
)
with check (
  owner_id = (select auth.uid())
  or exists (
    select 1 from public.teacher_students ts
    where ts.teacher_id = (select auth.uid()) and ts.student_id = projects.owner_id
  )
);

-- Realtime policies run as the signed-in classroom member. Anonymous clients
-- must not be able to probe relationship membership through these functions.
revoke execute on function public.can_join_project_topic(text) from anon;
revoke execute on function public.owns_project_topic(text) from anon;
