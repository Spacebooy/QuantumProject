import test from 'node:test';
import assert from 'node:assert/strict';
import { minimumQubits, phaseFlip, allGates, diffusion, oracle, bits, measuredIndex, validateResult } from '../src/games/PathFinder/quantumOperations.js';
import { createMaze, missions, safeChoices } from '../src/games/PathFinder/maze.js';

test('qubit capacity includes non-power-of-two corridor counts', () => {
  assert.deepEqual([2,3,4,5,8,9,16].map(minimumQubits), [1,2,2,3,3,4,4]);
});
test('measurement decoding uses q0 as the leftmost bit, independent of response order', () => {
  assert.equal(measuredIndex({ measurements: [{qubit:2,value:1},{qubit:0,value:1},{qubit:1,value:0}] }, 3), 5);
  assert.throws(()=>measuredIndex({ measurements: [{qubit:0,value:1}] }, 2));
});
test('generated mazes always have a route out, hazards, and varied junction sizes', () => {
  let seed = 911;
  const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 2**32; };
  const sizes = new Set();
  for (const mission of missions) for (let run=0; run<30; run++) {
    const maze = createMaze(mission, random);
    assert.equal(new Set(Object.values(maze.nodes).map(n => n.position.join(','))).size, Object.keys(maze.nodes).length);
    let id = maze.start, steps=0;
    while (id !== 'exit') {
      const node = maze.nodes[id]; sizes.add(node.exits.length);
      assert.ok(node.exits.length >= 2 && node.exits.length <= mission.maxChoices);
      assert.equal(new Set(node.exits).size, node.exits.length);
      assert.ok(node.exits.some(next=>maze.nodes[next].type === 'bomb'));
      const safe = safeChoices(maze,id);
      assert.ok(safe.length > 0 && safe.every(i=>maze.nodes[node.exits[i]].type !== 'bomb'));
      id = node.exits.find(next=>['junction','exit'].includes(maze.nodes[next].type));
      assert.ok(id); assert.ok(++steps <= mission.junctions);
    }
    assert.equal(steps, mission.junctions);
  }
  assert.deepEqual([...sizes].sort(), [2,3,4,5,6,7,8]);
});

const enabled = Boolean(process.env.TEST_SIMULATOR);
async function simulate(n, operations) {
  const response = await fetch(`${process.env.TEST_SIMULATOR}/simulate`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({num_qubits:n,mode:'ideal',operations}) });
  assert.ok(response.ok, await response.clone().text());
  return validateResult(await response.json(),n);
}
const close = (a,b) => assert.ok(Math.abs(a-b)<1e-7, `${a} != ${b}`);

test('actual API: every 1–4 qubit basis oracle flips only the marked relative phase', {skip:!enabled}, async () => {
  for (let n=1;n<=4;n++) for (let marked=0;marked<2**n;marked++) {
    const result = await simulate(n,[...allGates(n,'H'),...phaseFlip(n,marked)]);
    const ref = result.amplitudes[bits((marked+1)%(2**n),n)];
    for(let i=0;i<2**n;i++) {
      close(result.states[bits(i,n)],1/2**n);
      const a=result.amplitudes[bits(i,n)], sign=i===marked ? -1:1;
      close(a.real,sign*ref.real); close(a.imag,sign*ref.imag);
    }
  }
});
test('actual API: Grover, multiple safe states, padding, repeated rounds and real measurement', {skip:!enabled}, async () => {
  for (let marked=0;marked<4;marked++) {
    const ops=[...allGates(2,'H'),...oracle(2,[marked]),...diffusion(2)];
    const state=await simulate(2,ops); close(state.states[bits(marked,2)],1);
    const measured=await simulate(2,[...ops,...allGates(2,'MEASURE')]);
    assert.equal(measuredIndex(measured,2),marked);
  }
  let state=await simulate(2,[...allGates(2,'H'),...oracle(2,[0,2]),...diffusion(2)]);
  for(const p of Object.values(state.states)) close(p,.25);
  // Five real corridors in eight states, only corridor 4 safe: padding stays unmarked.
  const round=[...oracle(3,[4]),...diffusion(3)];
  state=await simulate(3,[...allGates(3,'H'),...round]);close(state.states['100'],25/32);
  state=await simulate(3,[...allGates(3,'H'),...round,...round]);close(state.states['100'],121/128);
  const overshoot=await simulate(3,[...allGates(3,'H'),...round,...round,...round]);assert.ok(overshoot.states['100']<state.states['100']);
  const noOracle=await simulate(2,[...allGates(2,'H'),...diffusion(2)]);for(const p of Object.values(noOracle.states)) close(p,.25);
  const initial=await simulate(3,allGates(3,'MEASURE'));assert.equal(measuredIndex(initial,3),0);
});
