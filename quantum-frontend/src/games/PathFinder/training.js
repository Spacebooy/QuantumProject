// A fixed practice room makes the first interference experiment repeatable.
// The simulator still computes amplitudes and samples every measurement.
export function createTrainingMaze() {
  return { start: 'j0', nodes: {
    j0: { id: 'j0', type: 'junction', depth: 0, parent: null, position: [0, 0], exits: ['bomb-a', 'practice', 'bomb-c', 'bomb-d'] },
    'bomb-a': { id: 'bomb-a', type: 'bomb', parent: 'j0', depth: 1, position: [-1, -1] },
    practice: { id: 'practice', type: 'deadend', parent: 'j0', depth: 1, position: [1, -1] },
    'bomb-c': { id: 'bomb-c', type: 'bomb', parent: 'j0', depth: 1, position: [-1, 1] },
    'bomb-d': { id: 'bomb-d', type: 'bomb', parent: 'j0', depth: 1, position: [1, 1] },
  } };
}

export const trainingSteps = [
  { action: 'allocate', title: 'Encode the four corridors', text: 'Choose 2 qubits, then Allocate scanner. Two qubits encode four paths: A = |00⟩, B = |01⟩, C = |10⟩, D = |11⟩. q0 is the leftmost bit.' },
  { action: 'superposition', title: 'Give each path a chance', text: 'Click Superposition. Applying H to both qubits gives each corridor a 25% measurement probability. Watch the bars change.' },
  { action: 'oracle', title: 'Mark safety with phase', text: 'The bars now show equal chances. Click Mark safe paths: the oracle changes the phase of the safe path. Its probability will stay the same until we use interference.' },
  { action: 'diffusion', title: 'Turn the phase mark into probability', text: 'The oracle did not change the bars. Click Amplify once. In this practice room, exactly one of four paths is safe, so one round raises its probability to 100% in the ideal simulator. Other rooms can behave differently.' },
  { action: 'measure', title: 'Read the bars, then move', text: 'Compare the highlighted probability with its corridor letter and bit string. Click Measure & move to sample the circuit and enter that corridor. Extra amplification rounds can undo the improvement.' },
  { action: 'backtrack', title: 'Safe is not the same as the exit', text: 'You found a safe dead end. Click Backtrack to return to the junction. The map remembers explored rooms; the oracle marks bomb safety, not the route to the destination.' },
  { action: 'complete', title: 'Ready for your first mission', text: 'You allocated qubits, prepared superposition, marked safety, amplified, measured and backtracked. In regular missions, repeat at each junction until you reach the exit. Bombs cost a life; unused states leave you in place.' },
];

// Derive guidance from committed game state: failed requests never advance it,
// and Undo / Reset naturally return to the appropriate earlier instruction.
export function trainingStep({ allocated, batches, nodeType, won }) {
  if (won) return 6;
  if (nodeType === 'deadend') return 5;
  if (!allocated) return 0;
  return Math.min(4, batches.length + 1);
}
