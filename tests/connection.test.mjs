import {test} from 'node:test';
import assert from 'node:assert/strict';
import {shouldConserve} from '../lib/connection.ts';
test('auto mode respects Save-Data and slow network hints',()=>{for(const hint of [{saveData:true},{effectiveType:'2g'},{effectiveType:'slow-2g'},{downlink:.8},{rtt:700}])assert.equal(shouldConserve('auto',hint),true)});
test('standard overrides estimates; saver and offline always conserve',()=>{assert.equal(shouldConserve('standard',{saveData:true}),false);assert.equal(shouldConserve('saver',{downlink:100}),true);assert.equal(shouldConserve('standard',{},false),true)});
test('missing hints do not invent a slow connection',()=>{assert.equal(shouldConserve('auto'),false);assert.equal(shouldConserve('auto',{downlink:15,rtt:40,effectiveType:'4g'}),false)});
