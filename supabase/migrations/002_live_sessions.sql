-- Apply after 001_foundation.sql. Realtime private channel authorization.
create or replace function public.can_join_project_topic(topic text) returns boolean
language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.projects p where 'project:'||p.id::text=topic
 and (p.owner_id=auth.uid() or exists(select 1 from public.teacher_students ts where ts.teacher_id=auth.uid() and ts.student_id=p.owner_id)));
$$;
create or replace function public.owns_project_topic(topic text) returns boolean
language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.projects p where 'project:'||p.id::text=topic and p.owner_id=auth.uid());
$$;
revoke all on function public.can_join_project_topic(text) from public;
revoke all on function public.owns_project_topic(text) from public;
grant execute on function public.can_join_project_topic(text),public.owns_project_topic(text) to authenticated;
create policy classroom_receive on realtime.messages for select to authenticated
using(extension in ('broadcast','presence') and public.can_join_project_topic(realtime.topic()));
create policy classroom_presence on realtime.messages for insert to authenticated
with check(extension='presence' and public.can_join_project_topic(realtime.topic()));
create policy student_broadcast on realtime.messages for insert to authenticated
with check(extension='broadcast' and public.owns_project_topic(realtime.topic()));
