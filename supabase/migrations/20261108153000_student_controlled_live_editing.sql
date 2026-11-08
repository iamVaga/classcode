-- Persist explicit per-project student consent so Realtime authorization can
-- distinguish watching/suggesting from editing. Consent is revocable by the student.
create table if not exists public.project_edit_consents (
  project_id uuid not null references public.projects(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  granted_at timestamptz not null default now(),
  primary key (project_id, teacher_id)
);
alter table public.project_edit_consents enable row level security;
revoke all on public.project_edit_consents from public, anon;
grant select, insert, delete on public.project_edit_consents to authenticated;
drop policy if exists live_consent_visible_to_pair on public.project_edit_consents;
create policy live_consent_visible_to_pair on public.project_edit_consents for select to authenticated
using(student_id=(select auth.uid()) or teacher_id=(select auth.uid()));
drop policy if exists student_grants_live_edit on public.project_edit_consents;
create policy student_grants_live_edit on public.project_edit_consents for insert to authenticated
with check(student_id=(select auth.uid()) and exists(
 select 1 from public.projects p join public.teacher_students ts on ts.student_id=p.owner_id
 where p.id=project_edit_consents.project_id and p.owner_id=(select auth.uid()) and ts.teacher_id=project_edit_consents.teacher_id
));
drop policy if exists student_revokes_live_edit on public.project_edit_consents;
create policy student_revokes_live_edit on public.project_edit_consents for delete to authenticated
using(student_id=(select auth.uid()));

-- Teachers can always watch and send suggestions. CRDT updates are accepted
-- from teachers only while this exact student/teacher/project consent exists.
drop policy if exists classroom_code_edits on realtime.messages;
create policy classroom_code_edits on realtime.messages for insert to authenticated
with check(
 extension='broadcast'
 and private.can_join_project_topic(realtime.topic())
 and (
   private.owns_project_topic(realtime.topic())
   or event in ('suggestion','sync-request')
   or (event='crdt-update' and exists(
     select 1 from public.project_edit_consents c join public.projects p on p.id=c.project_id
     where realtime.topic()='project:'||c.project_id::text and c.student_id=p.owner_id
       and c.teacher_id=(select auth.uid())
       and c.granted_at>now()-interval '4 hours'
   ))
 )
);
create index if not exists project_edit_consents_teacher_recent
  on public.project_edit_consents(teacher_id, granted_at desc);
