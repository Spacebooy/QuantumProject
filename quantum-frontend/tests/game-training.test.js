import test from 'node:test';
import assert from 'node:assert/strict';
import { createTrainingMaze, trainingStep, trainingSteps } from '../src/games/PathFinder/training.js';
import { safeChoices } from '../src/games/PathFinder/maze.js';
import { translate } from '../src/i18n/translate.js';

test('practice maze has one marked state out of four and a backtrackable dead end', () => {
  const maze = createTrainingMaze();
  const junction = maze.nodes[maze.start];
  assert.equal(junction.exits.length, 4);
  assert.deepEqual(safeChoices(maze, maze.start), [1]);
  const safe = maze.nodes[junction.exits[1]];
  assert.equal(safe.type, 'deadend');
  assert.equal(safe.parent, maze.start);
  assert.equal(new Set(Object.values(maze.nodes).map(n => n.position.join(','))).size, 5);
  assert.notEqual(createTrainingMaze().nodes, maze.nodes);
});

test('guidance follows committed actions and recovers from reset, undo, and retry', () => {
  const state = { allocated: false, batches: [], nodeType: 'junction', won: false };
  assert.equal(trainingStep(state), 0);
  state.allocated = true;
  for (let count = 0; count <= 3; count++) {
    state.batches = Array(count).fill({});
    assert.equal(trainingStep(state), count + 1);
  }
  state.batches.pop(); // Undo diffusion: ask for it again.
  assert.equal(trainingSteps[trainingStep(state)].action, 'diffusion');
  state.batches = []; // Scanner reset preserves allocation.
  assert.equal(trainingStep(state), 1);
  state.allocated = false; // A failed movement/unused sample clears the scanner.
  assert.equal(trainingStep(state), 0);
  state.nodeType = 'deadend';
  assert.equal(trainingStep(state), 5);
  state.won = true;
  assert.equal(trainingStep(state), 6);
});

test('training instructions and titles are translated', () => {
  for (const step of trainingSteps) for (const value of [step.title, step.text]) {
    assert.notEqual(translate(value, 'vi'), value);
  }
});
