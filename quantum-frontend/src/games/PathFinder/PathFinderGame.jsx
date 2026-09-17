import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/auth-context';
import { runSimulation } from '../../api';
import { allGates, bits, diffusion, measuredIndex, minimumQubits, oracle, validateResult } from './quantumOperations';
import { createMaze, missions, safeChoices } from './maze';
import { createTrainingMaze, trainingStep, trainingSteps } from './training';
import MazeMap from './MazeMap';
import { QuantumReadout, QuantumDetails } from './QuantumReadout';
import './pathfinder.css';

const modes = {
  beginner: ['Guided scanner', 'Use operation blocks and watch probabilities change.'],
  intermediate: ['Gate apprentice', 'Prepare qubits with H gates; use Oracle and Diffusion blocks.'],
  advanced: ['Circuit architect', 'Build preparation and diffusion from elementary gates. The oracle stays supplied.'],
};
const emptyStats = () => ({ actions: 0, gates: 0, oracles: 0, measurements: 0, moves: 0, energy: 0 });

function Mission({ missionIndex, mode, onExit, onComplete, training = false, onReplay, onFirstMission }) {
  const { token, openAuthModal } = useAuth();
  const [maze] = useState(() => training ? createTrainingMaze() : createMaze(missions[missionIndex]));
  const [current, setCurrent] = useState(maze.start);
  const [visited, setVisited] = useState([maze.start]);
  const [lives, setLives] = useState(3);
  const [qubits, setQubits] = useState(1);
  const [allocated, setAllocated] = useState(false);
  const [batches, setBatches] = useState([]);
  const [quantum, setQuantum] = useState(null);
  const [before, setBefore] = useState(null);
  const [stats, setStats] = useState(emptyStats);
  const [feedback, setFeedback] = useState('A junction ahead. Count the corridors, then allocate your qubits.');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [won, setWon] = useState(false);
  const [gate, setGate] = useState('H');
  const [target, setTarget] = useState(0);
  const [control, setControl] = useState(1);
  const [theta, setTheta] = useState(Math.PI / 2);
  const lock = useRef(false);
  const node = maze.nodes[current];
  const choices = node.exits || [];
  const required = minimumQubits(choices.length);
  const stopped = won || lives === 0;
  const operations = batches.flatMap(batch => batch.operations);
  const canOperate = allocated && !busy && !stopped && choices.length > 0;
  const step = trainingStep({ allocated, batches, nodeType: node.type, won });
  const guide = trainingSteps[step];
  const guidePanel = useRef(null);
  useEffect(() => {
    if (training) guidePanel.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [training, step]);
  const allowed = action => !training || guide.action === action;
  const highlight = action => training && guide.action === action ? 'training-target' : '';
  const unused = allocated ? 2 ** qubits - choices.length : 0;

  async function request(ops) {
    return validateResult(await runSimulation(qubits, 'ideal', ops, token), qubits);
  }
  async function transact(action) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try { await action(); }
    catch (e) { if (e.status === 401 || e.status === 403) { openAuthModal(e.message); setError(e.message); return; } setError(`Scanner unavailable: ${e.message}. Check that the FastAPI simulator is running on port 8000, then retry. Your position and circuit have been kept.`); }
    finally { lock.current = false; setBusy(false); }
  }
  const clearScanner = () => { setAllocated(false); setBatches([]); setQuantum(null); setBefore(null); };
  function allocate() {
    if (training && qubits !== 2) { setError('For this practice room, choose 2 qubits to encode all four corridors.'); return; }
    if (qubits < required) { setError(`${qubits} qubit${qubits === 1 ? '' : 's'} encode ${2 ** qubits} states, but this junction has ${choices.length} corridors. You need at least ${required}.`); return; }
    transact(async () => {
      const data = await request([]);
      setAllocated(true); setQuantum(data); setBefore(null); setBatches([]);
      setFeedback(`${qubits} qubits allocated: ${2 ** qubits} basis states for ${choices.length} corridors. ${2 ** qubits > choices.length ? 'Unused states are unmarked; measuring one leaves you here.' : 'Every state maps to a corridor.'}`);
    });
  }
  function apply(label, gates, kind = 'gate') {
    if (!canOperate || !allowed(kind === 'gate' ? 'superposition' : kind)) return;
    if (operations.length + gates.length > 2500) { setError('Circuit capacity reached (2,500 elementary gates). Undo or reset the scanner.'); return; }
    transact(async () => {
      const data = await request([...operations, ...gates]);
      setBefore(quantum); setQuantum(data); setBatches([...batches, { label, operations: gates, kind }]);
      setStats(s => ({ ...s, actions: s.actions + 1, gates: s.gates + gates.length, oracles: s.oracles + (kind === 'oracle' ? 1 : 0), energy: s.energy + qubits }));
      setFeedback(kind === 'oracle' ? 'The oracle changed relative phases, not probabilities. It tests bomb safety; it does not know which route reaches the destination.' : kind === 'diffusion' ? 'Interference changed the state. Compare the bars: amplification can help, do nothing, or reduce success depending on the state and marked fraction.' : 'Circuit updated by the simulator. Compare the new probabilities with the previous state.');
    });
  }
  function measure() {
    if (!canOperate || !allowed('measure')) return;
    transact(async () => {
      const result = await request([...operations, ...allGates(qubits, 'MEASURE')]);
      const index = measuredIndex(result, qubits);
      setStats(s => ({ ...s, measurements: s.measurements + 1, energy: s.energy + qubits }));
      if (index >= choices.length) {
        clearScanner(); setFeedback(`Measured |${bits(index, qubits)}⟩: an unused state. No corridor exists, so you stay here. Reallocate and try again; no life lost.`); return;
      }
      const next = choices[index], destination = maze.nodes[next];
      setVisited(v => [...new Set([...v, next])]);
      setStats(s => ({ ...s, moves: s.moves + 1 }));
      clearScanner();
      const prefix = `Measured ${String.fromCharCode(65+index)} |${bits(index, qubits)}⟩. `;
      if (destination.type === 'bomb') {
        setLives(l => l - 1);
        setFeedback(prefix + (lives === 1 ? 'A bomb used your last life. Mission ended.' : 'Bomb detected on arrival. You lose a life and retreat to the junction. The hazard is now marked.'));
      } else {
        setCurrent(next);
        if (destination.type === 'exit') { setWon(true); onComplete(missionIndex); setFeedback(prefix + 'Escape successful. You found the destination!'); }
        else if (destination.type === 'deadend') setFeedback(prefix + 'Safe, but a dead end. Backtrack and use what you learned.');
        else setFeedback(prefix + 'A safe passage leads to another junction. Count its corridors and allocate a new scanner.');
      }
    });
  }
  function backtrack() {
    if (busy || stopped || !node.parent || !allowed('backtrack')) return;
    if (training) { setWon(true); onComplete('training'); }
    setCurrent(node.parent); clearScanner(); setError('');
    setStats(s => ({ ...s, moves: s.moves + 1 }));
    setFeedback('Back at an explored junction. Known dead ends and hazards remain on the map. The hidden routes have not changed.');
  }
  function reset() {
    if (!canOperate) return;
    transact(async () => { const data = await request([]); setQuantum(data); setBefore(null); setBatches([]); setFeedback('Scanner reset to |0…0⟩. The map, lives, and cumulative action costs are unchanged.'); });
  }
  function undo() {
    if (!canOperate || !batches.length) return;
    transact(async () => {
      const next = batches.slice(0,-1), data = await request(next.flatMap(b => b.operations));
      setBefore(quantum); setQuantum(data); setBatches(next); setFeedback('Last circuit action removed. Cumulative oracle and energy costs are not refunded.');
    });
  }
  function hint() {
    if (training) { setFeedback(guide.text); return; }
    if (!allocated) setFeedback(`Each qubit doubles your capacity. Find the smallest n for which 2ⁿ ≥ ${choices.length}; ${required} qubits are enough here.`);
    else if (!batches.length) setFeedback(mode === 'beginner' ? 'Prepare a superposition to give every encoded state a chance. Unused states will also be included.' : 'Try an H gate on each allocated qubit to prepare equal amplitudes.');
    else if (!batches.some(b => b.kind === 'oracle')) setFeedback('The safety oracle marks non-bomb corridors through relative phase, without revealing the destination.');
    else setFeedback('Oracle marking alone leaves probabilities unchanged. Diffusion creates interference. With half the basis states marked, standard Grover rounds cannot improve the initial 50% marked probability. More rounds are not always better.');
  }
  function addGate() {
    if (gate === 'CNOT' && control === target) { setError('CNOT control and target must be different.'); return; }
    const op = { gate, target, ...(gate === 'CNOT' ? { control } : {}), ...(['RX','RY','RZ'].includes(gate) ? { theta } : {}) };
    apply(`${gate}${gate === 'CNOT' ? ` q${control}→` : ' '}q${target}`, [op]);
  }
  const rating = stats.measurements <= stats.moves && stats.oracles <= stats.moves && lives === 3 ? 3 : lives >= 2 ? 2 : 1;
  return <main className="pathfinder">
    <header className="mission-hud">
      <div><button className="text-button" onClick={onExit} disabled={busy}>← All missions</button><h1>Quantum Path Finder</h1><p>{training ? 'Training mission' : missions[missionIndex].name} <span> / {modes[mode][0]}</span></p></div>
      <div className="mission-status"><span aria-label={`${lives} lives remaining`} className="lives">{'♥'.repeat(lives)}{'♡'.repeat(3-lives)}</span><span>Moves <b>{stats.moves}</b></span><button className="btn btn-secondary" onClick={onExit} disabled={busy}>New mission</button></div>
    </header>
    <MazeMap maze={maze} current={current} visited={visited} scanned={visited.length} onBacktrack={backtrack} disabled={busy || stopped} />
    <div className={`mission-feedback ${won ? 'success' : ''}`} role="status"><span className="feedback-icon">{won ? '✓' : 'i'}</span>{busy ? 'The quantum processor is calculating…' : feedback}</div>
    {error && <div className="error-banner" role="alert">{error}</div>}
    {training && <section className="training-guide" ref={guidePanel} aria-label="Training guide">
      <div className="training-guide-top"><span>LEARN BY PLAYING</span><span>{Math.min(step + 1, 6)} / 6</span><button className="text-button" onClick={onExit} disabled={busy}>Skip tutorial</button></div>
      <div role="status" aria-live="polite"><h2>{guide.title}</h2><p id="training-instruction">{guide.text}</p></div>
      <progress max={6} value={step} aria-label="Training progress" />
      {won && <div className="training-finish"><button className="btn btn-primary" onClick={onFirstMission}>Play first mission</button><button className="btn btn-secondary" onClick={onReplay}>Replay tutorial</button></div>}
    </section>}
    {training && won ? null : stopped ? <section className="mission-end"><p className="eyebrow">{won ? 'ACCESS TO THE OUTSIDE' : 'SIGNAL LOST'}</p><h2>{won ? 'Escape successful.' : 'Out of lives.'}</h2>{won && <p className="rating" aria-label={`${rating} out of 3 stars`}>{'★'.repeat(rating)}{'☆'.repeat(3-rating)}</p>}<p>{stats.moves} moves · {stats.oracles} oracle calls · {stats.measurements} measurements · {stats.energy} energy</p><button className="btn btn-primary" onClick={onExit}>Choose another mission</button></section> : choices.length === 0 ? <section className="mission-end"><h2>A quiet dead end.</h2><p>No bomb here, but no way forward. Your explored route stays on the map.</p><button className={`btn btn-primary ${highlight('backtrack')}`} aria-describedby={training ? "training-instruction" : undefined} onClick={backtrack}>← Backtrack</button></section> : <section className="quantum-console" aria-label="Quantum scanner">
      <div className="console-top"><div><p className="eyebrow">QUANTUM SCANNER</p><h2>{choices.length} corridors ahead</h2><p>Choose how many qubits you need.</p></div><div className="allocate-controls"><label htmlFor="mission-qubits">Qubits</label><select className={highlight('allocate')} id="mission-qubits" value={qubits} disabled={busy || allocated} onChange={e => { setQubits(+e.target.value); setTarget(0); setControl(+e.target.value > 1 ? 1 : 0); }}>{[1,2,3,4].map(n => <option key={n} value={n}>{n} → {2 ** n} states</option>)}</select>{!allocated ? <button className={`btn btn-primary ${highlight('allocate')}`} aria-describedby={training ? "training-instruction" : undefined} onClick={allocate} disabled={busy}>Allocate scanner</button> : <button className="btn btn-secondary" onClick={clearScanner} disabled={busy}>Change allocation</button>}</div><div className="console-utilities"><button className="text-button" onClick={hint} disabled={busy}>Hint</button><button className="text-button" onClick={undo} disabled={!canOperate || !batches.length}>Undo</button><button className="text-button" onClick={reset} disabled={!canOperate}>Reset scanner</button></div></div>
      <QuantumReadout choices={choices} maze={maze} visited={visited} qubits={qubits} quantum={quantum} before={before} />
      {allocated && unused > 0 && <p className="unused-note">{unused} unused basis state{unused === 1 ? '' : 's'} · probability {quantum ? (Object.entries(quantum.states).filter(([b]) => parseInt(b,2) >= choices.length).reduce((sum,[,p]) => sum+p,0)*100).toFixed(1) : '—'}%. Measuring one keeps you here. Extra qubits increase energy cost.</p>}
      <div className="quantum-actions">
        {mode === 'beginner' && <button className={highlight('superposition')} aria-describedby={training ? "training-instruction" : undefined} disabled={!canOperate || !allowed('superposition')} onClick={() => apply('Superposition', allGates(qubits,'H'))}><span className="action-glyph">H</span><span><b>Superposition</b><small>Apply H to every qubit</small></span></button>}
        <button className={highlight('oracle')} aria-describedby={training ? "training-instruction" : undefined} disabled={!canOperate || !allowed('oracle')} onClick={() => apply('Safety oracle', oracle(qubits, safeChoices(maze,current)), 'oracle')}><span className="action-glyph">◎</span><span><b>Mark safe paths</b><small>Flip the marked phases</small></span></button>
        {mode !== 'advanced' && <button className={highlight('diffusion')} aria-describedby={training ? "training-instruction" : undefined} disabled={!canOperate || !allowed('diffusion')} onClick={() => apply('Diffusion', diffusion(qubits), 'diffusion')}><span className="action-glyph">∿</span><span><b>Amplify</b><small>Interfere the amplitudes</small></span></button>}
        <button className={`measure-action ${highlight('measure')}`} aria-describedby={training ? "training-instruction" : undefined} disabled={!canOperate || !allowed('measure')} onClick={measure}><span className="action-glyph">↗</span><span><b>Measure & move</b><small>Commit to one corridor</small></span></button>
      </div>
      {mode !== 'beginner' && <div className="manual-gates"><strong>Gate workbench</strong><label>Gate<select value={gate} disabled={busy} onChange={e=>setGate(e.target.value)}>{(mode === 'intermediate' ? ['H','X','Z'] : ['H','X','Y','Z','S','T','RX','RY','RZ','CNOT']).map(g=><option key={g}>{g}</option>)}</select></label><label>Target<select value={target} disabled={busy} onChange={e=>setTarget(+e.target.value)}>{Array.from({length:qubits},(_,q)=><option key={q} value={q}>q{q}</option>)}</select></label>{gate === 'CNOT' && <label>Control<select value={control} onChange={e=>setControl(+e.target.value)}>{Array.from({length:qubits},(_,q)=><option key={q} value={q}>q{q}</option>)}</select></label>}{['RX','RY','RZ'].includes(gate) && <label>Angle (rad)<input type="number" value={theta} step="0.01" onChange={e=>setTheta(Number(e.target.value))}/></label>}<button className="btn btn-secondary" onClick={addGate} disabled={!canOperate}>Apply gate</button></div>}
      <div className="operation-history"><span>OPERATION HISTORY</span><div>{batches.length ? batches.map((b,i)=><span className="operation-chip" key={i}>{b.label}</span>) : <small>No operations yet</small>}</div><small>{operations.length} gates in circuit</small></div>
      <QuantumDetails mode={mode} allocated={allocated} qubits={qubits} quantum={quantum} />
    </section>}
    <footer className="mission-costs"><span>Actual simulator · Ideal mode · q0 is the leftmost bit</span><span>{stats.actions} actions · {stats.oracles} oracle calls · {stats.measurements} measurements · {stats.energy} energy</span></footer>
  </main>;
}

export default function PathFinderGame() {
  const [active, setActive] = useState(null);
  const [mode, setMode] = useState('beginner');
  const [completed, setCompleted] = useState([]);
  const [trainingRun, setTrainingRun] = useState(0);
  const startTraining = () => { setTrainingRun(n => n + 1); setActive('training'); };
  const startFirst = () => { setMode('beginner'); setActive(0); };
  if (active === 'training') return <Mission key={`training-${trainingRun}`} missionIndex={0} mode="beginner" training onExit={()=>setActive(null)} onComplete={i=>setCompleted(v=>[...new Set([...v,i])])} onReplay={startTraining} onFirstMission={startFirst}/>;
  if (active !== null) return <Mission key={`${active}-${mode}`} missionIndex={active} mode={mode} onExit={()=>setActive(null)} onComplete={i=>setCompleted(v=>[...new Set([...v,i])])}/>;
  return <main className="mission-lobby"><p className="eyebrow">QUANTUM MISSIONS</p><h1>A little uncertainty.<br/>A way out.</h1><p className="lobby-intro">Explore a branching research lab. Allocate qubits, search for safe corridors, and find the destination. Safe passages can still lead nowhere.</p><section className="training-lobby"><div><p className="eyebrow">START HERE</p><h2>Training mission — learn to play</h2><p>Practice the scanner in six actions, then learn why a safe path can still be a dead end.</p>{completed.includes('training') && <small>Tutorial completed</small>}</div><button className="btn btn-primary" onClick={startTraining}>{completed.includes('training') ? 'Replay tutorial' : 'Start tutorial'}</button></section><section className="mode-picker" aria-label="Choose a learning mode">{Object.entries(modes).map(([id,[title,description]])=><button key={id} aria-pressed={mode===id} onClick={()=>setMode(id)}><span>{id}</span><h3>{title}</h3><p>{description}</p></button>)}</section><div className="mission-list">{missions.map((m,i)=><article key={m.name}><span className="mission-number">0{i+1}</span><div><h2>{m.name} {completed.includes(i) && <small>✓ Escaped</small>}</h2><p>{m.description}</p><small>{m.junctions} junctions · 2–{m.maxChoices} choices · 3 lives</small></div><button className="btn btn-primary" onClick={()=>setActive(i)}>Play mission ↗</button></article>)}</div><p className="lobby-footnote">New maps are generated for each mission. Progress stays in this session. Quantum outcomes always come from your simulator.</p><section className="future-missions"><span>COMING SOON</span><p>Bomb Detector · Shor Challenge · Escape the Quantum Lab</p></section></main>;
}
