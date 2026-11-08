import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
test('warm Python runs reuse runtime but receive fresh scopes and project files',async()=>{
 let loads=0,destroyedScopes=0;const messages=[],scopes=[],removed=[],written=[];
 const runtime={FS:{writeFile:(...args)=>written.push(args),unlink:name=>removed.push(name)},globals:{set(){},delete(){}},setStdout(){},setStderr(){},toPy:value=>({value,destroy(){if(!Array.isArray(value))destroyedScopes++}}),runPython(code){if(!code.includes('symtable.symtable'))return;assert.match(code,/ast\.parse/);return{toJs:()=>[["NameError: name 'total' is not defined",2]],destroy(){}}},async runPythonAsync(code,{globals}){if(!code.startsWith('import sys'))scopes.push(globals)}};
 const context=vm.createContext({postMessage:m=>messages.push(m),importScripts(){},loadPyodide:async()=>{loads++;return runtime},fetch:async()=>({ok:true,text:async()=>'# browser turtle'})});
 vm.runInContext(readFileSync(new URL('../public/python-worker.js',import.meta.url),'utf8'),context);
 await context.onmessage({data:{files:{'old.py':'print(1)'},code:'print(1)'}});
 await context.onmessage({data:{files:{'new.py':'print(2)'},code:'print(2)'}});
 assert.equal(loads,1);assert.equal(scopes.length,2);assert.notEqual(scopes[0],scopes[1]);assert.equal(destroyedScopes,2);
 assert.ok(removed.includes('/home/pyodide/old.py'));assert.equal(messages.filter(m=>m.ready).length,2);assert.equal(messages.filter(m=>m.done).length,2);assert.equal(messages.filter(m=>m.analysis?.length).length,2);assert.ok(written.some(([path])=>path==='/home/pyodide/turtle.py'));
});
test('runtime download failures return an actionable error and allow retry',async()=>{let attempts=0;const messages=[];const context=vm.createContext({postMessage:m=>messages.push(m),importScripts(){},loadPyodide:async()=>{attempts++;throw Error('Network unavailable')}});vm.runInContext(readFileSync(new URL('../public/python-worker.js',import.meta.url),'utf8'),context);for(let i=0;i<2;i++)await context.onmessage({data:{files:{},code:''}});assert.equal(attempts,2);assert.equal(messages.filter(m=>m.done&&m.error).length,2)});
