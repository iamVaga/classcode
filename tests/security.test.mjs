import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildContentSecurityPolicy} from '../lib/security-headers.ts';

const source=(path)=>readFileSync(new URL(path,import.meta.url),'utf8');

test('the app response policy uses a request nonce and restrictive resource directives',()=>{
 const policy=buildContentSecurityPolicy('nonce-test',false,'https://classcode.supabase.co');
 for(const directive of ["default-src 'self'","script-src 'self' 'nonce-nonce-test'","object-src 'none'","base-uri 'self'","frame-ancestors 'none'","upgrade-insecure-requests","worker-src 'self' blob:","connect-src 'self' https://classcode.supabase.co wss://classcode.supabase.co https://cdn.jsdelivr.net"]){assert.ok(policy.includes(directive),directive)}
 assert.ok(!policy.includes("'unsafe-eval'"));
});

test('nonce CSP pages render dynamically so Next can attach the nonce to inline bootstrap scripts',()=>{const layout=readFileSync(new URL('../app/layout.tsx',import.meta.url),'utf8');assert.match(layout,/await connection\(\)/);const proxy=readFileSync(new URL('../proxy.ts',import.meta.url),'utf8');assert.match(proxy,/requestHeaders\.set\('Content-Security-Policy',policy\)/);assert.match(proxy,/response\.headers\.set\('Content-Security-Policy',policy\)/)});

test('the sandbox preview runs scripts without inheriting the app origin',()=>{
 const editor=source('../components/ide.tsx');
 assert.match(editor,/<iframe[^>]*sandbox="allow-scripts"/);
 assert.doesNotMatch(editor,/sandbox="[^"]*allow-same-origin/);
 const model=source('../lib/model.ts');
 assert.match(model,/connect-src 'none'/);
 assert.match(model,/form-action 'none'/);
});

test('database row policies restrict project reads and edits to owners or the linked teacher',()=>{
 const base=source('../supabase/migrations/001_foundation.sql');
 for(const table of ['profiles','teacher_students','projects','invitations','lesson_notes','project_activity'])assert.match(base,new RegExp(`alter table public\\.${table} enable row level security`));
 assert.match(base,/create policy read_projects[\s\S]+owner_id=auth\.uid\(\)[\s\S]+teacher_id=auth\.uid\(\) and ts\.student_id=owner_id/);
 assert.match(base,/create policy update_projects[\s\S]+using\(owner_id=auth\.uid\(\)\) with check\(owner_id=auth\.uid\(\)\)/);
 const later=source('../supabase/migrations/20261104130000_editor_languages_and_teacher_edits.sql');
 assert.match(later,/teacher_id = \(select auth\.uid\(\)\)/);
 assert.match(later,/student_id = projects\.owner_id/);
 const security=source('../supabase/migrations/20261108140429_classcode_security_hardening.sql');
 assert.match(security,/create policy read_projects[\s\S]+owner_id = \(select auth\.uid\(\)\)[\s\S]+ts\.student_id = projects\.owner_id/);
 assert.match(security,/create policy update_projects[\s\S]+owner_id = \(select auth\.uid\(\)\)[\s\S]+ts\.teacher_id = \(select auth\.uid\(\)\)/);
});

test('security definer RPCs reject the anonymous role and realtime helpers are not exposed in public',()=>{
 const security=source('../supabase/migrations/20261108140429_classcode_security_hardening.sql');
 for(const name of ['create_invitation','redeem_invitation','submit_assignment'])assert.match(security,new RegExp(`revoke all on function public\\.${name}\\([\\s\\S]*? from public, anon`));
 assert.match(security,/alter function public\.can_join_project_topic\(text\) set schema private/);
 assert.match(security,/alter function public\.owns_project_topic\(text\) set schema private/);
 assert.match(security,/alter function public\.project_version_guard\(\) set search_path = pg_catalog/);
});
