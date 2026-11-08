-- Harden the current classroom schema without changing student or teacher data.
-- Project rows remain readable only by their owner and that owner's teacher.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

alter function public.can_join_project_topic(text) set schema private;
alter function public.owns_project_topic(text) set schema private;
alter function private.can_join_project_topic(text) set search_path = '';
alter function private.owns_project_topic(text) set search_path = '';
revoke all on function private.can_join_project_topic(text) from public, anon;
revoke all on function private.owns_project_topic(text) from public, anon;
grant execute on function private.can_join_project_topic(text) to authenticated;
grant execute on function private.owns_project_topic(text) to authenticated;

-- Trigger helpers are not client APIs. Triggers continue to call these as their owner.
alter function public.new_profile() set search_path = '';
alter function public.project_version_guard() set search_path = pg_catalog;
revoke all on function public.new_profile() from public, anon, authenticated;
revoke all on function public.project_version_guard() from public, anon, authenticated;

-- Invitation and grading RPCs require a signed-in caller. Explicitly remove anon
-- and PUBLIC grants; preserve the authenticated app paths.
revoke all on function public.create_invitation() from public, anon;
revoke all on function public.redeem_invitation(text) from public, anon;
revoke all on function public.submit_assignment(uuid, uuid) from public, anon;
grant execute on function public.create_invitation() to authenticated;
grant execute on function public.redeem_invitation(text) to authenticated;
grant execute on function public.submit_assignment(uuid, uuid) to authenticated;

-- Evaluate auth.uid() once per statement for the policies used on busy tables.
drop policy if exists own_relationships on public.teacher_students;
create policy own_relationships on public.teacher_students for select to authenticated
using ((select auth.uid()) in (teacher_id, student_id));

drop policy if exists visible_profiles on public.profiles;
create policy visible_profiles on public.profiles for select to authenticated
using (id = (select auth.uid()) or exists(
 select 1 from public.teacher_students ts
 where (ts.teacher_id = (select auth.uid()) and ts.student_id = profiles.id)
    or (ts.student_id = (select auth.uid()) and ts.teacher_id = profiles.id)
));

drop policy if exists update_profile on public.profiles;
create policy update_profile on public.profiles for update to authenticated
using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists read_projects on public.projects;
create policy read_projects on public.projects for select to authenticated
using (owner_id = (select auth.uid()) or exists(
 select 1 from public.teacher_students ts
 where ts.teacher_id = (select auth.uid()) and ts.student_id = projects.owner_id
));

drop policy if exists create_projects on public.projects;
create policy create_projects on public.projects for insert to authenticated
with check (owner_id = (select auth.uid()) and version = 0);

drop policy if exists update_projects on public.projects;
create policy update_projects on public.projects for update to authenticated
using (owner_id = (select auth.uid()) or exists(
 select 1 from public.teacher_students ts
 where ts.teacher_id = (select auth.uid()) and ts.student_id = projects.owner_id
))
with check (owner_id = (select auth.uid()) or exists(
 select 1 from public.teacher_students ts
 where ts.teacher_id = (select auth.uid()) and ts.student_id = projects.owner_id
));

drop policy if exists delete_projects on public.projects;
create policy delete_projects on public.projects for delete to authenticated
using (owner_id = (select auth.uid()));

drop policy if exists read_invites on public.invitations;
create policy read_invites on public.invitations for select to authenticated
using (teacher_id = (select auth.uid()));

drop policy if exists own_notes on public.lesson_notes;
create policy own_notes on public.lesson_notes for all to authenticated
using (teacher_id = (select auth.uid()))
with check (teacher_id = (select auth.uid()) and exists(
 select 1 from public.teacher_students ts
 where ts.teacher_id = (select auth.uid()) and ts.student_id = lesson_notes.student_id
));

drop policy if exists read_activity on public.project_activity;
create policy read_activity on public.project_activity for select to authenticated
using (exists(select 1 from public.projects p where p.id = project_activity.project_id));

drop policy if exists assignment_members_read on public.assignments;
create policy assignment_members_read on public.assignments for select to authenticated
using (teacher_id = (select auth.uid()) or student_id = (select auth.uid()));

drop policy if exists assigned_teacher_create on public.assignments;
create policy assigned_teacher_create on public.assignments for insert to authenticated
with check (teacher_id = (select auth.uid()) and exists(
 select 1 from public.teacher_students ts
 where ts.teacher_id = (select auth.uid()) and ts.student_id = assignments.student_id
));

drop policy if exists student_submit_assignment on public.assignments;
create policy student_submit_assignment on public.assignments for update to authenticated
using (student_id = (select auth.uid()))
with check (student_id = (select auth.uid()) and status = 'submitted' and submitted_at is not null and score between 0 and 100);

drop policy if exists teacher_edit_assigned_work on public.assignments;
create policy teacher_edit_assigned_work on public.assignments for update to authenticated
using (teacher_id = (select auth.uid()) and status = 'assigned')
with check (teacher_id = (select auth.uid()) and status = 'assigned');
