alter table public.assignments
  add column if not exists checks jsonb not null default '[]'::jsonb,
  add column if not exists project_id uuid references public.projects on delete set null,
  add column if not exists feedback jsonb not null default '[]'::jsonb;

alter table public.assignments drop constraint if exists assignments_checks_shape;
alter table public.assignments add constraint assignments_checks_shape
  check (jsonb_typeof(checks) = 'array' and jsonb_array_length(checks) <= 20);

revoke update on public.assignments from authenticated;
grant update(title, instructions, checks) on public.assignments to authenticated;
create policy teacher_edit_assigned_work on public.assignments for update to authenticated
  using (teacher_id = auth.uid() and status = 'assigned')
  with check (teacher_id = auth.uid() and status = 'assigned');

create or replace function public.submit_assignment(p_assignment_id uuid, p_project_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  task public.assignments;
  source_text text;
  check_item text;
  results jsonb := '[]'::jsonb;
  passed integer := 0;
  total integer := 0;
  earned_score integer := 0;
begin
  if auth.uid() is null then raise exception 'Sign in to submit your work'; end if;
  select * into task from public.assignments a
    where a.id = p_assignment_id and a.student_id = auth.uid() and a.status = 'assigned'
    for update;
  if task.id is null then raise exception 'This assignment is no longer available'; end if;
  if not exists(select 1 from public.projects p where p.id = p_project_id and p.owner_id = auth.uid()) then
    raise exception 'Choose one of your saved projects';
  end if;

  select lower(coalesce(string_agg(value, E'\n'), '')) into source_text
    from public.projects p, lateral jsonb_each_text(p.files)
    where p.id = p_project_id and p.owner_id = auth.uid();

  for check_item in select jsonb_array_elements_text(task.checks) loop
    total := total + 1;
    if position(lower(check_item) in source_text) > 0 then
      passed := passed + 1;
      results := results || jsonb_build_array(jsonb_build_object('check', check_item, 'passed', true, 'message', 'Found in your project'));
    else
      results := results || jsonb_build_array(jsonb_build_object('check', check_item, 'passed', false, 'message', 'Try adding this to your project'));
    end if;
  end loop;

  if total > 0 then earned_score := round((passed::numeric / total) * 100)::integer; end if;
  update public.assignments set status = 'submitted', score = earned_score,
    submitted_at = now(), project_id = p_project_id, feedback = results
    where id = task.id;
  return jsonb_build_object('score', earned_score, 'passed', passed, 'total', total, 'feedback', results);
end;
$$;

revoke all on function public.submit_assignment(uuid, uuid) from public;
grant execute on function public.submit_assignment(uuid, uuid) to authenticated;
