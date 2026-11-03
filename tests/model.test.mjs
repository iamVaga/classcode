import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
// Run the actual TypeScript model through Node's built-in type stripping.
import {createProject,previewDocument,characters} from '../lib/model.ts';
test('projects have independent starter files and unique identities',()=>{const a=createProject(' Site ','web'),b=createProject('Other','web');a.files['style.css']='changed';assert.notEqual(a.id,b.id);assert.notEqual(a.files['style.css'],b.files['style.css']);assert.equal(a.name,'Site');assert.equal(a.version,0)});
test('Python starter is executable source',()=>{const p=createProject('','python');assert.equal(p.name,'Untitled project');assert.match(p.files['main.py'],/print/);assert.deepEqual(Object.keys(p.files),['main.py'])});
test('preview blocks network and prevents script/style boundary breakout',()=>{const doc=previewDocument({'script.js':'</script><script src="https://evil.test">','style.css':'</style><script>alert(1)</script>'},'unique');assert.match(doc,/connect-src 'none'/);assert.match(doc,/form-action 'none'/);assert.match(doc,/<\\\/script>/);assert.match(doc,/token="unique"/)});
test('avatar registry offers twelve choices',()=>assert.equal(new Set(characters).size,12));
test('migration enables RLS for each application table and protects ownership',()=>{const sql=readFileSync(new URL('../supabase/migrations/001_foundation.sql',import.meta.url),'utf8');for(const t of ['profiles','teacher_students','projects','invitations','lesson_notes','project_activity'])assert.ok(sql.includes(`alter table public.${t} enable row level security`));assert.match(sql,/new.owner_id<>old.owner_id/);assert.match(sql,/new.version<>old.version\+1/);assert.match(sql,/for update;/)});
