import assert from 'node:assert/strict';
import { assessments, assessmentKey, assessmentTasks } from '../src/assessments.ts';
import { lessons } from '../src/course.ts';
import { newAttempt, readAttempt, getContestKey } from '../src/contest.ts';
import { microExercises, MICRO_KEY, microComplete, initialAnswers, parseMicroProgress } from '../src/micro-exercises.ts';
const start = 1800000000000;
assert.equal(assessments.length, 9);
assert.equal(new Set([...assessments.map(a=>assessmentKey(a.id)),getContestKey('practice'),getContestKey('final'),MICRO_KEY]).size,12);
const ids=new Set(lessons.flatMap(l=>l.exercises.map(e=>e.id)));
for (const a of assessments) {
 const tasks=assessmentTasks(a), duration=a.minutes*60000;
 assert.equal(tasks.length,a.id==='new-final'?6:2);
 for (const t of a.tasks) {
  assert.equal(t.exercise.starter,'');
  assert.ok(!ids.has(t.exercise.id)); ids.add(t.exercise.id);
  assert.ok(lessons.some(l=>l.id===t.lessonId && l.week<=a.week));
  assert.ok(t.exercise.tests.some(tst=>JSON.stringify(tst)===JSON.stringify(t.exercise.sample)));
 }
 const id=tasks[0].exercise.id;
 const state={...newAttempt(start),drafts:{[id]:'print(1)','hello-1':'ignored'},accepted:{[id]:{code:'print(1)',at:start+1}},selected:tasks.length-1};
 const restored=readAttempt(JSON.stringify(state),start+100,tasks,duration);
 assert.deepEqual(restored.drafts,{[id]:'print(1)'});
 assert.equal(restored.selected,tasks.length-1);
 assert.equal(restored.accepted[id].at,start+1);
 assert.equal(readAttempt(JSON.stringify(state),start+duration,tasks,duration).finishedAt,start+duration);
 assert.deepEqual(readAttempt(JSON.stringify({...state,accepted:{[id]:{code:'late',at:start+duration}}}),start+duration,tasks,duration).accepted,{});
 assert.equal(readAttempt(JSON.stringify({...state,reviewed:true}),start+10,tasks,duration).reviewed,true);
 assert.deepEqual(readAttempt(JSON.stringify(state),start+10,assessmentTasks(assessments.find(x=>x.id!==a.id)),duration).drafts,{});
}
assert.equal(new Set(microExercises.map(m=>m.id)).size,microExercises.length);
for (const task of microExercises) {
 if(task.kind === "fill") assert.equal(new Set(task.fields.map(f=>f.label)).size, task.fields.length);
 const lesson=lessons.find(l=>l.id===task.lessonId);
 assert.ok(lesson?.sections[task.afterSection]);
 const correct=task.kind==='fill'?task.fields.map(f=>f.answers[0]):task.steps.map((_,i)=>String(i));
 const state={answers:correct,checked:true,revealed:false};
 assert.ok(microComplete(task,state));
 assert.ok(!microComplete(task,{...state,checked:false}));
 assert.ok(!microComplete(task,{...state,answers:initialAnswers(task)}));
 assert.ok(microComplete(task,parseMicroProgress(JSON.stringify({[task.id]:state}))[task.id]));
 assert.deepEqual(parseMicroProgress(JSON.stringify({[task.id]:{...state,answers:[]},unknown:state})),{});
}
assert.throws(()=>parseMicroProgress('[]'));
assert.throws(()=>parseMicroProgress('null'));
assert.deepEqual(parseMicroProgress(null),{});
console.log('PASS: nine isolated assessment saves, deadlines and legacy isolation; micro exercise answers, ordering, validation, and section placement');

const expression = microExercises.find(x=>x.id==='sum-line');
assert.ok(microComplete(expression,{answers:[' total  + value '],checked:true,revealed:false}));
assert.ok(!microComplete(expression,{answers:['to tal + value'],checked:true,revealed:false}));
const trace = microExercises.find(x=>x.id==='value-change');
assert.ok(!microComplete(trace,{answers:['4','7','1 4'],checked:true,revealed:false}));
console.log('PASS: expression spacing allowed, broken identifiers and split numbers rejected');
