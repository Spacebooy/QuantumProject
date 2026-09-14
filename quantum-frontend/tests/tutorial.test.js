import test from 'node:test';
import assert from 'node:assert/strict';
import { lessons } from '../src/tutorial/tutorialLessons.js';
import { circuitKey, normalizeOperations, readyForRun, matchesOutcome, actionFeedback } from '../src/tutorial/tutorialUtils.js';
const grid = ops => ops.map((op,i)=>({...op,step:i,id:String(i)}));

test('curriculum has 18 core lessons, three advanced entries and unique step ids',()=>{
  assert.equal(lessons.filter(l=>l.category!=='Advanced').length,18);
  assert.equal(lessons.filter(l=>l.category==='Advanced').length,3);
  assert.equal(new Set(lessons.map(l=>l.id)).size,lessons.length);
  for(const lesson of lessons) {
    assert.equal(new Set(lesson.steps.map(s=>s.id)).size,lesson.steps.length);
    assert.ok(lesson.qubits<=2,'All core lessons must work for guests');
    for(const step of lesson.steps) {
      assert.ok(step.message && step.targetElement);
      if(step.type==='interaction')assert.ok(step.outcome && step.successMessage);
    }
  }
});
test('matching requires actual circuit, bit ordering, mode and angle',()=>{
  const step=lessons.find(l=>l.id==='rotations').steps[1];
  const state={grid:grid(step.operations),numQubits:1,mode:'ideal'};
  assert.ok(readyForRun(step,state,1));
  assert.ok(!readyForRun(step,{...state,grid:grid([{gate:'RX',target:0,theta:.7854}])},1));
  assert.ok(!readyForRun(step,{...state,mode:'noisy'},1));
  assert.notEqual(circuitKey(state),circuitKey({...state,numQubits:2}));
  const cx=lessons.find(l=>l.id==='cnot').steps.at(-1);
  assert.ok(!readyForRun(cx,{grid:grid([{gate:'X',target:0},{gate:'CNOT',target:0,control:1}]),numQubits:2,mode:'ideal'},2));
});
test('Bell validator rejects same populations with wrong relative phase, accepts global phase',()=>{
  const amplitudes={'00':{real:0,imag:Math.SQRT1_2},'11':{real:0,imag:Math.SQRT1_2}};
  const result={states:{'00':.5,'11':.5,'01':0,'10':0},amplitudes};
  assert.ok(matchesOutcome(result,{bell:true}));
  assert.ok(!matchesOutcome({...result,amplitudes:{...amplitudes,'11':{real:0,imag:-Math.SQRT1_2}}},{bell:true}));
  assert.ok(!matchesOutcome(null,{bell:true}));
});
test('measurement requires an actual classical result and matching collapsed state',()=>{
  const result={states:{0:0,1:1},amplitudes:{1:{real:1,imag:0}},measurements:[{qubit:0,value:1}]};
  assert.ok(matchesOutcome(result,{measurement:true}));
  assert.ok(!matchesOutcome({...result,measurements:[]},{measurement:true}));
  assert.ok(!matchesOutcome({...result,states:{0:.5,1:.5}},{measurement:true}));
});
test('wrong gate feedback explains the concept and normalization follows time order',()=>{
  const step=lessons.find(l=>l.id==='h').steps[1];
  assert.match(actionFeedback(step,grid([{gate:'X',target:0}])),/mix/);
  assert.deepEqual(normalizeOperations([{gate:'Z',target:0,step:2},{gate:'H',target:0,step:0}]).map(o=>o.gate),['H','Z']);
});

test('actual API: every tutorial exercise matches the scientific observation', {skip:!process.env.TEST_SIMULATOR},async()=>{
  for(const lesson of lessons) for(const step of lesson.steps.filter(s=>s.type==='interaction')) {
    const operations=step.challenge?[{gate:'H',target:0},{gate:'CNOT',control:0,target:1}]:step.operations;
    const response=await fetch(`${process.env.TEST_SIMULATOR}/simulate`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({num_qubits:lesson.qubits,mode:step.expectedMode || 'ideal',operations})});
    assert.equal(response.status,200,`${lesson.id}/${step.id}: ${await response.clone().text()}`);
    assert.ok(matchesOutcome(await response.json(),step.outcome),`${lesson.id}/${step.id}`);
  }
});

test('guide points to the actual gate, next slot, and run button in order',async()=>{
  const {nextGuidance}=await import('../src/tutorial/tutorialGuidance.js');
  const step={...lessons.find(l=>l.id==='x').steps[1],qubits:1};
  const state={grid:[],numQubits:1,mode:'ideal',selectedGate:'H'};
  assert.equal(nextGuidance(step,state).target,'gate-x');
  assert.equal(nextGuidance(step,{...state,selectedGate:'X'}).target,'cell-q0-step0');
  assert.equal(nextGuidance(step,{...state,grid:grid([{gate:'X',target:0}])},{ready:true}).target,'run');
  assert.equal(nextGuidance(step,state,{passed:true}).target,'results');
  assert.equal(nextGuidance(step,{...state,grid:grid([{gate:'Z',target:0}])}).label,'Remove this gate');
});
test('guide handles gaps, rotation settings and CNOT control versus target',async()=>{
  const {nextGuidance}=await import('../src/tutorial/tutorialGuidance.js');
  const cnot={...lessons.find(l=>l.id==='cnot').steps.at(-1),qubits:2};
  const state={grid:[{gate:'X',target:0,step:3}],numQubits:2,mode:'ideal',selectedGate:'CNOT',cnotTarget:1};
  const guidance=nextGuidance(cnot,state);
  assert.equal(guidance.target,'cell-q0-step4');
  assert.equal(guidance.secondaryTarget,'cell-q1-step4');
  assert.equal(nextGuidance(cnot,{...state,cnotTarget:0}).target,'cnot-target');
  const rotation={...lessons.find(l=>l.id==='rotations').steps[1],qubits:1};
  assert.equal(nextGuidance(rotation,{grid:[],numQubits:1,mode:'ideal',selectedGate:'Rx',thetaValue:0}).target,'angle');
});
