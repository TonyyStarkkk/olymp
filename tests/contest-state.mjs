import assert from 'node:assert/strict';
import { CONTEST_DURATION, newAttempt, readAttempt } from '../src/contest.ts';
const start = 1800000000000;
const state = newAttempt(start);
assert.equal(readAttempt(null, start), null);
assert.deepEqual(readAttempt(JSON.stringify(state), start), state);
assert.equal(readAttempt(JSON.stringify(state), start + CONTEST_DURATION).finishedAt, start + CONTEST_DURATION);
for (const patch of [{version:2}, {startedAt: start+1}, {startedAt:-1}, {finishedAt:start-1}, {finishedAt:start+CONTEST_DURATION+1}]) {
  assert.throws(() => readAttempt(JSON.stringify({...state,...patch}), start));
}
const restored = readAttempt(JSON.stringify({...state, selected:100, drafts:{'viral-3':'x'.repeat(100001),unknown:'secret'}, accepted:{'viral-3':{code:'print(0)',at:start+1},'cubes-3':{code:'x',at:start+CONTEST_DURATION},unknown:{code:'x',at:start}}}),start+CONTEST_DURATION);
assert.equal(restored.selected,0);
assert.equal(restored.drafts['viral-3'].length,100000);
assert.equal(Object.keys(restored.drafts).length,1);
assert.deepEqual(Object.keys(restored.accepted),['viral-3']);
console.log('PASS: attempt validation, expiry, accepted timestamps, limits and unknown fields');
