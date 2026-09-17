// Curriculum describes actions and expected observations, never fabricated results.
export const gateInfo = {
  X: 'Flips |0⟩ and |1⟩. Equivalent, up to global phase, to a π rotation around x.',
  H: 'Creates and recombines superpositions. H applied twice is the identity.',
  Y: 'A π rotation around y, up to global phase. Y|0⟩ = i|1⟩.',
  Z: 'Flips the phase of the |1⟩ component. Relative phase can change interference.',
  S: 'Adds π/2 of phase to the |1⟩ component.',
  T: 'Adds π/4 of phase to the |1⟩ component: half the phase shift of S.',
  RX: 'Rotates the Bloch vector around x by the chosen angle in radians.',
  RY: 'Rotates the Bloch vector around y by the chosen angle in radians.',
  RZ: 'Rotates the Bloch vector around z, changing relative phase.',
  CNOT: 'Flips the target when the control is |1⟩. Click the control wire; choose the target in the dropdown.',
  MEASURE: 'Samples a classical bit from the state probabilities and collapses the measured qubit. One shot does not reveal the full state.',
};
const op = (gate, target = 0, extra = {}) => ({gate, target, ...extra});
const H = op('H'), X = op('X'), CX = op('CNOT', 1, {control:0});
const explain = (id, title, message, targetElement = 'results') => ({id,type:'explanation',title,message,targetElement,botMood:'thinking'});
const task = (id, title, message, setup, operations, outcome, successMessage, extra = {}) => ({
  id,type:'interaction',title,message,setup,operations,outcome,successMessage,
  targetElement: 'gate-'+(operations.at(-1)?.gate || 'run').toLowerCase(), botMood:'hint',
  hints:['Select the requested gate in the library, then place it in the next empty slot on q0.', 'Gates run left to right. Remove extra gates by clicking them, then press Run Circuit.'],
  ...extra,
});
const read = (id,title,message,targetElement) => explain(id,title,message,targetElement);
const lesson = (id,title,category,steps,qubits=1) => ({id,title,category,qubits,steps});
const phaseNote = 'The Bloch sphere is a mathematical picture of a single-qubit state, not a physical sphere. Opposite equatorial vectors represent |+⟩ and |−⟩. Global phase does not change this vector; relative phase can.';
const noiseLimit = 'This app currently uses fixed backend noise parameters. The sliders update the interface only; they are not sent to the API. A noisy run is one stochastic trajectory, not an ensemble average or a controlled T1/T2 experiment.';
export const lessons = [
 lesson('qubit','What is a Qubit?','Foundations',[
  explain('welcome','A state and its amplitudes','A qubit has computational basis states |0⟩ and |1⟩. A general pure state is |ψ⟩ = α|0⟩ + β|1⟩. The coefficients are amplitudes; they may be negative or complex.'),
  task('zero','Inspect |0⟩','This example is an empty, one-qubit circuit. Press Run Circuit to inspect the real initial state.',[],[],{probabilities:{0:1,1:0}},'The simulator reports |0⟩ with probability 1.',{targetElement:'run',hints:['No gate is required. Run the empty circuit.']}),
  read('prob','Amplitudes become probabilities','P(0) = |α|² and P(1) = |β|². Squaring the magnitude gives probability; an amplitude itself is not a probability.','probabilities'),
  read('normal','Normalization','The total probability is 1: |α|² + |β|² = 1. Look at the amplitude table and probability bars for this run.','amplitudes'),
 ]),
 lesson('x','X Gate','Foundations',[
  explain('intro','Flip a basis state','X|0⟩ = |1⟩ and X|1⟩ = |0⟩. On the Bloch sphere this is a π rotation about x, up to unobservable global phase.','gate-x'),
  task('first','Apply X','Select X, place it on q0 in step 1, then Run Circuit.',[],[X],{probabilities:{0:0,1:1}},'The real result is |1⟩: X flipped the initial |0⟩.'),
  read('sphere','A rotation','Compare the Bloch vector with the |1⟩ pole. '+phaseNote,'bloch'),
  task('twice','Apply X again','The first X is prepared. Add a second X in step 2, then run.',[X],[X,X],{probabilities:{0:1,1:0}},'Two X gates returned the qubit to |0⟩.'),
 ]),
 lesson('h','Hadamard','Foundations',[
  explain('intro','Create a superposition','H|0⟩ = (|0⟩ + |1⟩)/√2. This is one coherent quantum state with two possible measurement outcomes—not two classical bits.','gate-h'),
  task('first','Apply H','Place H on q0 in step 1, then run.',[],[H],{probabilities:{0:.5,1:.5}},'Both outcomes have 50% probability. You prepared |+⟩.',{wrongFeedback:{X:'X flips a basis state. Try H to mix |0⟩ and |1⟩ coherently.'}}),
  task('twice','Recombine','Add another H after the prepared H, then run.',[H],[H,H],{probabilities:{0:1,1:0}},'The amplitudes interfered to return |0⟩. H is its own inverse.'),
 ]),
 lesson('phase','Phase','Foundations',[
  task('plus','Prepare |+⟩','Apply H and run. Inspect the amplitudes and vector.',[],[H],{probabilities:{0:.5,1:.5}},'Both amplitudes have the same phase.'),
  task('minus','Prepare |−⟩','H is prepared. Add Z after it and run.',[H],[H,op('Z')],{bloch:[-1,0,0]},'The probabilities stayed 50/50, but the relative sign changed.'),
  read('relative','Same probabilities, different states','|+⟩ = (|0⟩ + |1⟩)/√2 and |−⟩ = (|0⟩ − |1⟩)/√2 have identical computational-basis probabilities. Their relative phases lead to different interference.','amplitudes'),
  read('sphere','Opposite equatorial vectors',phaseNote,'bloch'),
 ]),
 lesson('z','Z Gate','Foundations',[
  explain('intro','Change relative phase','Z leaves |0⟩ unchanged and negates the |1⟩ amplitude. Start with H so both components are present.','gate-z'),
  task('h','Prepare the input','Apply H and run to prepare |+⟩.',[],[H],{bloch:[1,0,0]},'Now both components are present; their relative phase can change.'),
  task('z','Apply Z','Add Z after H, then run.',[H],[H,op('Z')],{bloch:[-1,0,0]},'Z|+⟩ = |−⟩. Notice: the probabilities did not change.'),
  read('observe','Watch the vector',phaseNote,'bloch'),
 ]),
 lesson('y','Y Gate','Foundations',[
  explain('intro','Rotation about y','Y is a π rotation about y, up to global phase. Y|0⟩ = i|1⟩; that overall i does not change the physical state.','gate-y'),
  task('try','Try Y','Apply Y to q0 and run. This exercise is optional.',[],[op('Y')],{probabilities:{0:0,1:1}},'The vector points toward |1⟩. Its global phase is not observable.'),
  read('view','Inspect the rotation',phaseNote,'bloch'),
 ]),
 ...[['s','S Gate','S',Math.PI/2,[0,1,0]],['t','T Gate','T',Math.PI/4,[Math.SQRT1_2,Math.SQRT1_2,0]]].map(([id,title,gate,angle,vector])=>lesson(id,title,'Foundations',[
  explain('intro','A phase turn',gateInfo[gate]+' Begin with |+⟩ so the relative phase is visible.','gate-'+id),
  task('prepare','Start with H','Apply H and run.',[],[H],{bloch:[1,0,0]},'The vector is on the +x axis.'),
  task('phase','Add '+gate,'Add '+gate+' after H, then run.',[H],[H,op(gate)],{bloch:vector},`The relative phase changed by ${angle===Math.PI/2?'π/2':'π/4'}. The probabilities remain 50/50.`),
  read('compare','Compare phase turns','S turns the equatorial vector by 90°; T turns it by 45°. '+phaseNote,'bloch'),
 ])),
 lesson('rotations','Rotation Gates','Foundations',[
  explain('intro','Choose an axis and angle','Rx(θ), Ry(θ), and Rz(θ) rotate about x, y, and z. Angles are in radians: π/2 is a quarter turn, π/4 an eighth turn.','gate-rx'),
  ...[['RX',[],[0,-1,0]],['RY',[],[1,0,0]],['RZ',[H],[0,1,0]]].map(([gate,setup,vector])=>task(gate,'Try '+gate,`Select ${gate}, use the existing angle control to set π/2 (1.5708), place it after any prepared gate, then run.`,setup,[...setup,op(gate,0,{theta:Math.PI/2})],{bloch:vector},'The API result shows the predicted quarter turn.',{theta:Math.PI/4,hints:['Select the rotation gate. Set the angle to 1.5708 radians (π/2), then place it on q0.', 'The angle is copied into a gate when placed. Remove and replace a gate to change its angle.']})),
  task('eighth','Try π/4','Select Ry, set 0.7854 (π/4), place it in the empty circuit, and run.',[],[op('RY',0,{theta:Math.PI/4})],{bloch:[Math.SQRT1_2,0,Math.SQRT1_2]},'This is an eighth turn, halfway to the equator.',{theta:Math.PI/2}),
  read('visual','Read the vector','Watch the direction change in the mathematical state picture. Rotations around different axes generally do not commute.','bloch'),
 ]),
 lesson('measurement','Measurement','Foundations',[
  explain('intro','A classical outcome','Measurement samples a classical outcome using the current probabilities, then collapses the state. One result cannot reveal all amplitudes.','gate-measure'),
  task('prepare','Prepare |+⟩','Apply H and run.',[],[H],{probabilities:{0:.5,1:.5}},'Either bit can be measured with 50% probability.'),
  task('measure','Measure q0','Add Measure after H and run. Either outcome is valid.',[H],[H,op('MEASURE')],{measurement:true},'A real measurement was returned. The state now matches the measured bit.',{targetElement:'gate-measure'}),
  read('shots','Before and after','These bars show the state AFTER measurement, so one outcome now has probability 1. Re-running rebuilds the circuit from |0⟩ and samples again; it does not undo a measurement on the same physical qubit.','measurement'),
 ]),
 lesson('multiple','Multiple Qubits','Multi Qubit',[
  explain('intro','Four basis states','Two qubits use |00⟩, |01⟩, |10⟩, |11⟩ and four amplitudes. In this simulator q0 is the LEFTMOST bit.','qubit-count'),
  task('inspect','Inspect two qubits','Run this empty two-qubit circuit.',[],[],{probabilities:{'00':1,'01':0,'10':0,'11':0}},'The API returned all four basis states.',{targetElement:'run'}),
  read('growth','A growing state space','n qubits require 2ⁿ amplitudes for a general pure state. Measurement still gives only n classical bits per shot.','amplitudes'),
 ],2),
 lesson('cnot','CNOT','Multi Qubit',[
  explain('intro','Control and target','The filled dot marks the control; ⊕ marks the target. With q0 controlling q1, |00⟩ stays |00⟩ and |10⟩ becomes |11⟩.','gate-cnot'),
  task('input','Prepare |10⟩','Apply X to q0 and run.',[],[X],{probabilities:{'10':1,'00':0,'01':0,'11':0}},'q0 is 1; q1 is 0.'),
  task('cx','Apply CNOT','Select CNOT, choose target q1, click q0 in step 2, and run.',[X],[X,CX],{probabilities:{'11':1,'00':0,'01':0,'10':0}},'The control was 1, so the target flipped to give |11⟩.',{hints:['Choose target q1 in the dropdown. The wire you click is the control.', 'Click q0 in step 2 after X, then Run Circuit.']}),
 ],2),
 lesson('entanglement','Entanglement','Multi Qubit',[
  task('h','Prepare a superposition','Apply H to q0 and run.',[],[H],{probabilities:{'00':.5,'10':.5,'01':0,'11':0}},'q0 is in superposition and q1 is still |0⟩.'),
  task('bell','Entangle the pair','Add CNOT with control q0 and target q1 after H, then run.',[H],[H,CX],{bell:true},'You created (|00⟩ + |11⟩)/√2, a Bell state.'),
  read('meaning','A joint state','This pair cannot be described as two independent pure qubit states. Each qubit alone is mixed, so a single pure-state Bloch vector is not shown here.','amplitudes'),
  read('correlation','Correlated outcomes','Measuring both qubits in this basis gives 00 or 11. The outcomes are correlated; entanglement does not send information faster than light.','probabilities'),
 ],2),
 lesson('bell-challenge','Bell State Challenge','Multi Qubit',[
  task('challenge','Create a Bell state','Starting from |00⟩, use H, X, and CNOT to create (|00⟩ + |11⟩)/√2. Press Run Circuit when ready. Other gates remain available, but this challenge uses these three.',[],[],{bell:true},'Your actual amplitudes match the target Bell state, up to unobservable global phase.',{challenge:true,targetElement:'circuit',allowedGates:['H','X','CNOT'],hints:['Create a superposition before trying to entangle the pair.', 'Try H on q0, then CNOT with q0 as control and q1 as target.']}),
 ],2),
 lesson('noise','Noise Overview','Noise',[
  explain('intro','Ideal and noisy runs','Ideal gates follow the intended operations. Gate errors, energy relaxation (T1), loss of coherence (T2), and readout errors can change what we observe.','mode'),
  task('compare','Try noisy mode','Switch the existing Mode control to Noisy and run the prepared H circuit. No particular random outcome is required.',[H],[H],{noisy:true},'A real noisy trajectory completed. Repeated runs may differ.',{mode:'ideal',expectedMode:'noisy',targetElement:'mode'}),
  read('limits','What these controls currently do',noiseLimit,'noise'),
 ]),
 lesson('t1','T1 Relaxation','Noise',[
  explain('intro','Energy relaxation','T1 describes a timescale for |1⟩ population to relax toward |0⟩. It is not an instruction to flip every qubit after a fixed delay.','noise-t1'),
  task('try','A noisy excited state','Switch to Noisy and run this prepared X circuit. One short run may still yield a state close to |1⟩.',[X],[X],{noisy:true},'The real noisy run completed. A single trajectory cannot measure a T1 decay curve.',{expectedMode:'noisy',targetElement:'mode'}),
  read('limits','A conceptual control',noiseLimit+' There is no waiting-time sweep in this interface.','noise-t1'),
 ]),
 lesson('t2','T2 Coherence','Noise',[
  explain('intro','Loss of phase coherence','T2 describes decay of coherence between |0⟩ and |1⟩. Pure dephasing can change coherence without changing basis-state populations; energy relaxation also contributes to T2.','noise-t2'),
  task('try','A noisy superposition','Switch to Noisy and run H. Inspect the real result; one trajectory is not the mixed state averaged over many runs.',[H],[H],{noisy:true},'This run is one noisy sample. Population bars alone do not characterize coherence.',{expectedMode:'noisy',targetElement:'mode'}),
  read('limits','Interpreting this model',noiseLimit,'noise-t2'),
 ]),
 lesson('readout','Readout Error','Noise',[
  explain('intro','State versus reported bit','A readout error can report the wrong classical bit even when the state preparation was correct. This is distinct from a gate error.','noise-readoutError'),
  task('try','Measure in noisy mode','Switch to Noisy, add Measure after the prepared X, and run. The backend may report a flipped readout.',[X],[X,op('MEASURE')],{noisyMeasurement:true},'A real reported bit was received. Readout errors need repeated trials to estimate.',{expectedMode:'noisy'}),
  read('limits','Readout control',noiseLimit+' The displayed slider is not a calibrated error experiment.','noise-readoutError'),
 ]),
 ...[['qft','Quantum Fourier Transform','QFT transforms amplitudes between computational and Fourier bases. Relative phase carries structure; it is used inside quantum period finding.'],['grover','Grover Search','Grover search alternates phase marking and interference to amplify marked outcomes. Explore the oracle and diffusion activities in Quantum Missions.'],['shor','Shor’s Algorithm','Shor combines quantum period finding with classical processing to factor integers. Open the existing Algorithms section for the full interface.']].map(([id,title,message])=>lesson(id,title,'Advanced',[
  {...explain('intro',title,message),destination:id==='grover'?'missions':'algorithms'},
 ])),
];
