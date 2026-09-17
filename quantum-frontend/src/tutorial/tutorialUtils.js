export const normalizeOperations = grid => [...grid].sort((a,b)=>a.step-b.step).map(op => ({
  gate:op.gate.toUpperCase(), target:op.target,
  ...(op.control !== undefined && {control:op.control}),
  ...(op.theta !== undefined && {theta:op.theta}),
}));
export const circuitKey = ({grid,numQubits,mode}) => JSON.stringify([numQubits,mode,normalizeOperations(grid)]);
export function sameOperations(actual,expected) {
  return actual.length===expected.length && actual.every((op,i)=> {
    const want=expected[i];
    return op.gate===want.gate && op.target===want.target && op.control===want.control &&
      (want.theta===undefined || Math.abs(op.theta-want.theta)<.0002);
  });
}
export function readyForRun(step, snapshot, qubits) {
  const operations=normalizeOperations(snapshot.grid);
  return snapshot.numQubits===qubits && snapshot.mode===(step.expectedMode || 'ideal') &&
    (step.challenge ? operations.length>0 && operations.every(op=>step.allowedGates.includes(op.gate)) : sameOperations(operations,step.operations || []));
}
export function blochVector(amplitudes) {
  const a=amplitudes?.['0'], b=amplitudes?.['1'];
  if (!a || !b) return null;
  return [2*(a.real*b.real+a.imag*b.imag),2*(a.real*b.imag-a.imag*b.real),a.real*a.real+a.imag*a.imag-b.real*b.real-b.imag*b.imag];
}
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<.002;
export function matchesOutcome(result,outcome) {
  if (!result?.states || !result?.amplitudes) return false;
  if (outcome.noisy) return result.mode==='noisy';
  if (outcome.noisyMeasurement) return result.mode==='noisy' && result.measurements?.some(m=>m.qubit===0 && [0,1].includes(m.value));
  if (outcome.measurement) {
    const m=result.measurements?.find(m=>m.qubit===0);
    return m && [0,1].includes(m.value) && near(result.states[String(m.value)],1);
  }
  if (outcome.bell) {
    const a=result.amplitudes['00'],b=result.amplitudes['11'];
    return a && b && near(result.states['00'],.5)&&near(result.states['11'],.5)&&near(result.states['01'],0)&&near(result.states['10'],0)&&near(a.real,b.real)&&near(a.imag,b.imag);
  }
  if (outcome.bloch) return blochVector(result.amplitudes)?.every((v,i)=>near(v,outcome.bloch[i])) || false;
  return Object.entries(outcome.probabilities || {}).every(([key,value])=>near(result.states[key],value));
}
export function actionFeedback(step,grid) {
  const ops=normalizeOperations(grid), expected=step.operations || [];
  const wrong=ops.find((op,i)=>!expected[i] || !sameOperations([op],[expected[i]]));
  if (step.challenge) return ops.some(op=>!step.allowedGates.includes(op.gate)) ? 'This challenge uses H, X, and CNOT. Remove other gates, or skip the challenge.' : '';
  if (!wrong) return '';
  return step.wrongFeedback?.[wrong.gate] || 'That circuit differs from this example. Check the gate, wire, angle, and left-to-right order. Click a placed gate to remove it, or Restart Lesson for a fresh start.';
}
