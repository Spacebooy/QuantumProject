import { normalizeOperations, sameOperations } from './tutorialUtils.js';

// One instruction at a time, derived from the existing circuit rather than clicks.
export function nextGuidance(step, snapshot, {passed=false, ready=false, busy=false}={}) {
  if (busy) return {target:'run',label:'Running…',instruction:'Wait a moment while your circuit runs.'};
  if (passed) return {target:'results',label:'Look here',instruction:'Look at your result, then choose Next.'};
  if (step.type!=='interaction') return {target:step.targetElement,label:'Look here'};
  if (snapshot.numQubits !== (step.qubits ?? snapshot.numQubits)) return {target:'qubit-count',label:'Change this',instruction:`Set Qubits to ${step.qubits}.`};
  const mode=step.expectedMode || 'ideal';
  if(snapshot.mode!==mode) return {target:'mode',label:'Choose '+mode,instruction:`Choose ${mode === 'ideal'?'Ideal':'Noisy'} in the Mode control.`};
  if(ready) return {target:'run',label:'Click Run Circuit',instruction:'Click Run Circuit to see what your gates do.'};
  const actual=normalizeOperations(snapshot.grid);
  if(step.challenge) return {target:'circuit',label:'Build here',instruction:'Build your circuit here. When you are ready, click Run Circuit.'};
  const wrongIndex=actual.findIndex((op,i)=>!step.operations[i] || !sameOperations([op],[step.operations[i]]));
  if(wrongIndex>=0) {
    const placed=[...snapshot.grid].sort((a,b)=>a.step-b.step)[wrongIndex];
    return {target:`cell-q${placed.control ?? placed.target}-step${placed.step}`,label:'Remove this gate',instruction:`Click this ${placed.gate} gate to remove it. Then we’ll try again.`};
  }
  const next=step.operations[actual.length];
  if(!next) return {target:'run',label:'Click Run Circuit',instruction:'Click Run Circuit.'};
  const name=next.gate==='MEASURE'?'Measure':next.gate;
  if((snapshot.selectedGate || 'H').toUpperCase()!==next.gate) return {target:'gate-'+next.gate.toLowerCase(),label:'Choose '+name,instruction:`Click ${name} in the gate library. A gate is an instruction we add to the circuit.`};
  if(next.theta!==undefined && Math.abs(snapshot.thetaValue-next.theta)>.0002) return {target:'angle',label:'Set the angle',instruction:`Set the angle to ${next.theta.toFixed(4)} radians (${Math.abs(next.theta-Math.PI/2)<.001?'a quarter turn':'an eighth turn'}).`};
  if(next.gate==='CNOT' && snapshot.cnotTarget!==next.target) return {target:'cnot-target',label:'Choose the target',instruction:`Choose q${next.target} as the target. This is the qubit CNOT may flip.`};
  // Append after the last occupied time slot, even if the learner left gaps.
  const column=snapshot.grid.length?Math.max(...snapshot.grid.map(op=>op.step))+1:0;
  const wire=next.control ?? next.target;
  return {target:`cell-q${wire}-step${column}`,secondaryTarget:next.gate==='CNOT'?`cell-q${next.target}-step${column}`:undefined,label:'Click this square',instruction:next.gate==='CNOT'?`Click this square on q${wire}, the control wire. The linked square on q${next.target} is the target.`:`Click the glowing square on q${wire} (the ${wire===0?'top':'second'} wire) to place ${name}.`};
}
