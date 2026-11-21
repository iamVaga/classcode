import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=(path)=>readFileSync(new URL(path,import.meta.url),'utf8');

test('starter list has a real entry and a unique outcome tagline for each card',()=>{
 const starters=source('../lib/starters.ts');
 const ids=[...starters.matchAll(/\{id:'([^']+)'/g)].map(([,id])=>id);
 const taglines=[...starters.matchAll(/tagline:'([^']+)'/g)].map(([,tagline])=>tagline);
 assert.equal(ids.length,8);
 assert.equal(new Set(ids).size,ids.length);
 assert.equal(taglines.length,ids.length);
 assert.equal(new Set(taglines).size,taglines.length);
 for(const language of ['Java','C++','C'])assert.ok(starters.includes(`category:'${language}'`));
 for(const stale of ['fan-made','blocky world','obby course','brick-bot'])assert.ok(!starters.toLowerCase().includes(stale));



 const ide=source('../components/ide.tsx');
 assert.match(ide,/runCompiledCode\(project.type/);
 assert.match(ide,/Run on Wandbox/);
});

test('the landing page includes teacher workflows and leaves the native cursor alone',()=>{
 const home=source('../components/landing.tsx');
 const workspace=source('../components/workspace-home.tsx');
 assert.match(home,/Make real/);
 assert.match(home,/teacher can watch it change live and suggest a fix/i);
 assert.match(home,/id="hint-ladder"/);
 assert.match(workspace,/<ClassroomPanel\s/);
 assert.match(source('../components/classroom-panel.tsx'),/Create invitation/);
 assert.match(source('../components/live-session.tsx'),/Share with my teacher/);
 assert.doesNotMatch(home,/what still needs an owner decision/i);
 assert.match(workspace,/Lesson notes/);
 assert.doesNotMatch(home,/game-inspiration|fan-made|Build a world from your favorite kinds of games/i);
 assert.doesNotMatch(source('../app/layout.tsx'),/<AvatarPointer/);
});

test('the experiment tabs support accessible selection and the avatar cursor is opt-in',()=>{
 const experiment=source('../components/snippet-playground.tsx');
 const avatar=source('../components/avatar-pointer.tsx');
 assert.match(experiment,/role="tablist"/);
 assert.match(experiment,/ArrowLeft/);
 assert.match(experiment,/aria-live="polite"/);
 assert.match(avatar,/useState\(false\)/);
 assert.match(avatar,/prefers-reduced-motion: reduce/);
});

test('trust pages disclose draft status without public TODOs or compliance claims',()=>{
 for(const route of ['privacy','terms','safety','about'])assert.doesNotMatch(source(`../app/${route}/page.tsx`),/TODO/);
 assert.match(source('../components/trust-page.tsx'),/Working draft/);
 assert.match(source('../components/trust-page.tsx'),/qualified lawyer/);
 assert.match(source('../app/school-it/page.tsx'),/cdn\.jsdelivr\.net/);
});
