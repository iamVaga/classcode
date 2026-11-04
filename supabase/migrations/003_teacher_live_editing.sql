-- Permit assigned teachers and project owners to send live code drafts.
-- Keep room membership and project ownership checks in the authorization functions.
drop policy if exists student_broadcast on realtime.messages;
create policy classroom_code_edits on realtime.messages for insert to authenticated
with check(extension='broadcast' and public.can_join_project_topic(realtime.topic()));
