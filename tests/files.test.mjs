import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fileNameError} from '../lib/files.ts';
import {readFileSync} from 'node:fs';
test('accepts supported filenames and surrounding whitespace',()=>{for(const name of ['helper.py',' my-page.html ','theme.css','script.js','notes.txt'])assert.equal(fileNameError(name,{},'python'),null)});
test('rejects duplicate, blank, unsupported and path filenames',()=>{for(const name of ['','  ','main.py','../main.py','folder/main.py','app.exe','two words.py'])assert.ok(fileNameError(name,{'main.py':'print(1)'},'python'))});
test('protects the Python Turtle module and limits filename length',()=>{assert.ok(fileNameError('turtle.py',{},'python'));assert.equal(fileNameError('turtle.py',{},'web'),null);assert.ok(fileNameError('a'.repeat(100)+'.py',{},'python'))});
test('editor actions do not call unsupported native browser dialogs',()=>{const source=readFileSync(new URL('../components/ide.tsx',import.meta.url),'utf8');assert.doesNotMatch(source,/\b(prompt|confirm|alert)\s*\(/);assert.match(source,/<FileActionDialog/)});
