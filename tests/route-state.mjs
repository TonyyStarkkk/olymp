import assert from 'node:assert/strict';
import {lessons, allExercises} from '../src/course.ts';
import {coreLessons,coreExercises,advancedExerciseIds,coreLessonComplete,routeStats,resumeCoreLesson,nextCoreLesson} from '../src/learning-route.ts';
import {fontStages,parseFontStages,emptyFontStages,acceptFontStage} from '../src/font-stages.ts';
const empty=()=>({version:1,drafts:{},inputs:{},hints:{},solutions:[],solved:{},quizzes:{},lastExercise:'hello-1'});
assert.equal(coreLessons.length,38);assert.equal(coreExercises.length,113);assert.equal(advancedExerciseIds.size,7);
const p=empty();
p.solved=Object.fromEntries(coreExercises.map(t=>[t.id,{helped:false,at:'2026-10-27T00:00:00Z'}]));p.quizzes=Object.fromEntries(coreLessons.map(l=>[l.id,true]));
assert.equal(routeStats(p).percent,100);assert.equal(routeStats(p).complete,true);assert.equal(routeStats(p).advancedSolved,0);
assert.ok(coreLessonComplete(p,lessons.find(l=>l.id==='review-olympiad')));
assert.ok(!coreLessonComplete(p,lessons.find(l=>l.id==='viral')));
assert.equal(nextCoreLesson(lessons.find(l=>l.id==='next-small')).id,'tour-plan');
assert.equal(nextCoreLesson(lessons.find(l=>l.id==='prefixes')).id,'tour-plan');
const missing=structuredClone(p);delete missing.solved['input-2'];assert.ok(!routeStats(missing).complete);assert.equal(resumeCoreLesson(missing).id,'input');
const progressed=empty();for(const l of lessons.filter(l=>l.number<='32')){progressed.quizzes[l.id]=true;for(const e of l.exercises)progressed.solved[e.id]={helped:false,at:'2026-10-27T00:00:00Z'};}
progressed.lastExercise='next-small-3';assert.equal(resumeCoreLesson(progressed).id,'tour-plan');
progressed.lastExercise='viral-1';progressed.drafts['viral-1']='# сохранённый поиск';const before=JSON.stringify(progressed);assert.equal(resumeCoreLesson(progressed).id,'tour-plan');assert.equal(JSON.stringify(progressed),before);
assert.equal(allExercises.length,120);
assert.equal(new Set(fontStages.at(-1).digits).size,10);
for(let i=0;i<fontStages.length;i++){
 assert.equal(fontStages[i].digits.length,2*(i+1));
 if(i)assert.ok(fontStages[i-1].digits.every(d=>fontStages[i].digits.includes(d)));
 const state=acceptFontStage({...emptyFontStages(),selected:i},i,'my code');
 assert.equal(Object.keys(state.passed).length,i+1);
 assert.deepEqual(parseFontStages(JSON.stringify(state)),state);
}
const filtered=parseFontStages(JSON.stringify({selected:99,passed:{0:{code:'x',at:'invalid'},1:{code:23,at:'2026-10-27'},2:{code:'ok',at:'2026-10-27'},unknown:{code:'x',at:'2026-10-27'}}}));
assert.equal(filtered.selected,0);assert.deepEqual(Object.keys(filtered.passed),['2']);
assert.throws(()=>parseFontStages('[]'));assert.throws(()=>parseFontStages('null'));assert.deepEqual(parseFontStages(null),emptyFontStages());
console.log('PASS: core completion without F, advanced work preserved, default route skips F, cumulative D stages and bounded stage saves');
