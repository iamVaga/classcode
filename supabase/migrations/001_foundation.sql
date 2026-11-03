-- Apply once in a fresh Supabase SQL editor.
create extension if not exists pgcrypto;
create table public.profiles (
 id uuid primary key references auth.users on delete cascade,
 display_name text not null default 'Coder' check (length(display_name) <= 100),
 role text not null default 'teacher' check (role in ('teacher','student')),
 avatar jsonb not null default '{"kind":0,"color":"#dce9d5"}',
 created_at timestamptz not null default now()
);
create table public.teacher_students (
 teacher_id uuid references public.profiles on delete cascade,
 student_id uuid references public.profiles on delete cascade,
 created_at timestamptz not null default now(),
 primary key (teacher_id,student_id), check (teacher_id <> student_id)
);
create index on public.teacher_students(student_id);
create table public.projects (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references public.profiles on delete cascade,
 name text not null check (length(name) between 1 and 120),
 type text not null check (type in ('web','python')),
 files jsonb not null default '{}' check (jsonb_typeof(files)='object' and octet_length(files::text)<1000000),
 version integer not null default 0,
 updated timestamptz not null default now(),
 created_at timestamptz not null default now()
);
create index on public.projects(owner_id,updated desc);
create table public.invitations (
 id uuid primary key default gen_random_uuid(), teacher_id uuid not null references public.profiles on delete cascade,
 token_hash text unique not null, expires_at timestamptz not null default now()+interval '48 hours',
 used_by uuid references public.profiles, created_at timestamptz not null default now()
);
create table public.lesson_notes (
 id uuid primary key default gen_random_uuid(), teacher_id uuid not null references public.profiles on delete cascade,
 student_id uuid not null references public.profiles on delete cascade,
 body text not null check(length(body)<=10000), created_at timestamptz not null default now()
);
create table public.project_activity (
 id uuid primary key default gen_random_uuid(), project_id uuid references public.projects on delete cascade,
 actor_id uuid references public.profiles on delete cascade, action text not null,
 created_at timestamptz not null default now()
);
create function public.new_profile() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id,display_name) values(new.id,split_part(new.email,'@',1));return new;end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.new_profile();
alter table public.profiles enable row level security;
alter table public.teacher_students enable row level security;
alter table public.projects enable row level security;
alter table public.invitations enable row level security;
alter table public.lesson_notes enable row level security;
alter table public.project_activity enable row level security;
create policy own_relationships on public.teacher_students for select to authenticated using (auth.uid() in (teacher_id,student_id));
create policy visible_profiles on public.profiles for select to authenticated using(id=auth.uid() or exists(select 1 from public.teacher_students ts where (ts.teacher_id=auth.uid() and ts.student_id=id) or (ts.student_id=auth.uid() and ts.teacher_id=id)));
create policy update_profile on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
revoke update on public.profiles from authenticated;
grant update(display_name,avatar) on public.profiles to authenticated;
create policy read_projects on public.projects for select to authenticated using(owner_id=auth.uid() or exists(select 1 from public.teacher_students ts where ts.teacher_id=auth.uid() and ts.student_id=owner_id));
create policy create_projects on public.projects for insert to authenticated with check(owner_id=auth.uid() and version=0);
create policy update_projects on public.projects for update to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy delete_projects on public.projects for delete to authenticated using(owner_id=auth.uid());
create function public.project_version_guard() returns trigger language plpgsql as $$ begin
 if new.owner_id<>old.owner_id or new.version<>old.version+1 then raise exception 'Invalid project version or owner';end if;
 new.updated=now();return new;end $$;
create trigger guard_project_version before update on public.projects for each row execute function public.project_version_guard();
create policy read_invites on public.invitations for select to authenticated using(teacher_id=auth.uid());
create policy own_notes on public.lesson_notes for all to authenticated using(teacher_id=auth.uid()) with check(teacher_id=auth.uid() and exists(select 1 from public.teacher_students ts where ts.teacher_id=auth.uid() and ts.student_id=lesson_notes.student_id));
create policy read_activity on public.project_activity for select to authenticated using(exists(select 1 from public.projects p where p.id=project_id));
create function public.create_invitation() returns text language plpgsql security definer set search_path=public,extensions as $$
declare raw_token text;begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role='teacher') then raise exception 'Teacher account required';end if;
 if (select count(*) from public.invitations where teacher_id=auth.uid() and created_at>now()-interval '1 hour')>=20 then raise exception 'Invitation limit reached';end if;
 raw_token=encode(gen_random_bytes(32),'hex');
 insert into public.invitations(teacher_id,token_hash) values(auth.uid(),encode(digest(raw_token,'sha256'),'hex'));
 return raw_token;end $$;
create function public.redeem_invitation(raw_token text) returns void language plpgsql security definer set search_path=public,extensions as $$
declare invitation public.invitations;begin
 if auth.uid() is null then raise exception 'Sign in first';end if;
 select * into invitation from public.invitations where token_hash=encode(digest(raw_token,'sha256'),'hex') and used_by is null and expires_at>now() for update;
 if invitation.id is null or invitation.teacher_id=auth.uid() then raise exception 'Invalid or expired invitation';end if;
 if exists(select 1 from public.teacher_students where teacher_id=auth.uid()) then raise exception 'Existing teachers cannot become students';end if;
 update public.profiles set role='student' where id=auth.uid();
 insert into public.teacher_students(teacher_id,student_id) values(invitation.teacher_id,auth.uid()) on conflict do nothing;
 update public.invitations set used_by=auth.uid() where id=invitation.id;
end $$;
revoke all on function public.create_invitation() from public;
revoke all on function public.redeem_invitation(text) from public;
grant execute on function public.create_invitation() to authenticated;
grant execute on function public.redeem_invitation(text) to authenticated;
