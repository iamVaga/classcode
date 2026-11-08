import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {inputPrompts} from '../lib/python-input.ts';

test('simple Python input calls ask for ordered values before execution',()=>{assert.deepEqual(inputPrompts('name = input("What is your name? ")\nage = int(input(\'How old are you? \'))'),['What is your name? ','How old are you? ']);assert.deepEqual(inputPrompts('print(input())'),['Type your answer'])});
test('input discovery is bounded and the worker returns queued answers before EOF',()=>{assert.equal(inputPrompts(Array.from({length:12},()=> 'input("value")').join('\n')).length,8);const worker=readFileSync(new URL('../public/python-worker.js',import.meta.url),'utf8');assert.match(worker,/runtime\.setStdin/);assert.match(worker,/inputQueue\.shift\(\)/);assert.match(worker,/inputQueue\.length\?inputQueue\.shift\(\):undefined/);const ide=readFileSync(new URL('../components/ide.tsx',import.meta.url),'utf8');assert.match(ide,/inputPrompts\(project\.files\[file\]/);assert.match(ide,/What should your program ask\?/);assert.doesNotMatch(worker,/prompt\(/)});
