create table public.assignments (
 id uuid primary key default gen_random_uuid(),
 teacher_id uuid not null references public.profiles on delete cascade,
 student_id uuid not null references public.profiles on delete cascade,
 title text not null check(length(title) between 1 and 120),
 instructions text not null default '' check(length(instructions)<=2000),
 status text not null default 'assigned' check(status in ('assigned','submitted')),
 score integer check(score between 0 and 100),
 created_at timestamptz not null default now(),
 submitted_at timestamptz,
 check (status <> 'submitted' or submitted_at is not null)
);
alter table public.assignments enable row level security;
grant select,insert on public.assignments to authenticated;
grant update(status,score,submitted_at) on public.assignments to authenticated;
create policy assignment_members_read on public.assignments for select to authenticated
using(teacher_id=auth.uid() or student_id=auth.uid());
create policy assigned_teacher_create on public.assignments for insert to authenticated
with check(teacher_id=auth.uid() and exists(select 1 from public.teacher_students ts where ts.teacher_id=auth.uid() and ts.student_id=assignments.student_id));
create policy student_submit_assignment on public.assignments for update to authenticated
using(student_id=auth.uid()) with check(student_id=auth.uid() and status='submitted' and submitted_at is not null and score between 0 and 100);
