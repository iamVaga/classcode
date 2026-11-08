-- Bind each consent row to the exact project owner and teacher assignment.
drop policy if exists student_grants_live_edit on public.project_edit_consents;
create policy student_grants_live_edit on public.project_edit_consents for insert to authenticated
with check(student_id=(select auth.uid()) and exists(
 select 1 from public.projects p join public.teacher_students ts on ts.student_id=p.owner_id
 where p.id=project_edit_consents.project_id and p.owner_id=(select auth.uid())
   and ts.teacher_id=project_edit_consents.teacher_id
));
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
     where realtime.topic()='project:'||c.project_id::text
       and c.student_id=p.owner_id and c.teacher_id=(select auth.uid())
       and c.granted_at>now()-interval '4 hours'
   ))
 )
);
