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
});

test('the landing page has one teacher overview with setup, assignment, and progress steps',()=>{
 const home=source('../components/workspace-home.tsx');
 assert.match(home,/FOR TEACHERS/);
 assert.match(home,/Create a class/);
 assert.match(home,/Give a challenge/);
 assert.match(home,/See progress/);
 assert.doesNotMatch(home,/game-inspiration|fan-made|Build a world from your favorite kinds of games/i);
 assert.match(home,/classcode-avatar-pointer/);
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

test('trust pages disclose review items rather than promising legal compliance',()=>{
 for(const route of ['privacy','terms','safety','about'])assert.ok(source(`../app/${route}/page.tsx`).includes('TODO'));
 assert.match(source('../components/trust-page.tsx'),/Owner review required/);
});
