-- Scores and submission state are written only by the secured submit RPC.
revoke update(status, score, submitted_at, project_id, feedback) on public.assignments from authenticated;
grant update(title, instructions, checks) on public.assignments to authenticated;
