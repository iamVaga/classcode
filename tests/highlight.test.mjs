import {test} from 'node:test';
import assert from 'node:assert/strict';
import {highlight} from '../lib/highlight.ts';
test('highlighting preserves code exactly including whitespace and unsafe markup',()=>{for(const code of ['','print("Hello <script>!")\n\n','# note\nfor i in range(3):\n    print(i)','<h1 onclick="alert(1)">Hello</h1>'])assert.equal(highlight(code).map(t=>t.text).join(''),code)});
test('strings, comments, keywords, calls and numbers receive different colors',()=>{const tokens=highlight('# hello\nfor i in range(3):\n    print("world")');for(const kind of ['comment','keyword','function','number','string'])assert.ok(tokens.some(t=>t.kind===kind))});
