import { useEffect, useRef, useState } from 'react';
import ShorResults from './ShorResults';
import './shor-playback.css';

export default function ShorPlayback({ result }) {
  const trace = result.trace || [];
  const [cursor, setCursor] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const selectedEntry = useRef(null);
  const last = trace.length - 1;
  const event = trace[cursor];

  useEffect(() => {
    if (!playing || cursor >= last) return;
    const timer = window.setTimeout(() => {
      setCursor(cursor + 1);
      setRevealed(previous => Math.max(previous, cursor + 1));
      if (cursor + 1 === last) setPlaying(false);
    }, 2400);
    return () => window.clearTimeout(timer);
  }, [playing, cursor, last]);

  useEffect(() => {
    const entry = selectedEntry.current;
    const list = entry?.parentElement;
    if (list) list.scrollTop += entry.getBoundingClientRect().top - list.getBoundingClientRect().top;
  }, [cursor]);

  if (!trace.length) return <ShorResults result={result} />;

  const visit = (index) => {
    setPlaying(false);
    setCursor(index);
    setRevealed(previous => Math.max(previous, index));
  };
  const replay = () => {
    setCursor(0);
    setRevealed(0);
    setPlaying(false);
  };
  const preparation = trace.slice(0, cursor + 1).findLast(item => item.stage === 'prepare' && item.attempt === event.attempt);
  const operations = trace.slice(0, cursor + 1)
    .map((item, index) => ({ ...item, index }))
    .filter(item => item.kind === 'quantum' && item.attempt === event.attempt && item.stage !== 'prepare');

  return (
    <section className="card shor-playback" aria-label="Shor execution walkthrough">
      <div className="shor-playback-heading">
        <div>
          <span className="shor-eyebrow">FOLLOW THE COMPUTATION</span>
          <h3>Your run, one operation at a time</h3>
          <p>The simulation has finished. Explore its recorded operations below; playback does not run new measurements.</p>
        </div>
        <span className="shor-step-count">Step {cursor + 1} / {trace.length}</span>
      </div>
      <div className="shor-playback-controls" aria-label="Playback controls">
        <button className="btn" disabled={cursor === 0} onClick={() => visit(cursor - 1)}>← Back</button>
        <button className="btn btn-primary" disabled={cursor === last} onClick={() => setPlaying(!playing)}>{playing ? 'Pause' : 'Play'}</button>
        <button className="btn" disabled={cursor === last} onClick={() => visit(cursor + 1)}>Next step →</button>
        <button className="btn" onClick={replay}>Replay</button>
        <button className="btn shor-reveal" onClick={() => visit(last)}>Show full run</button>
      </div>
      <progress aria-label="Walkthrough progress" max={trace.length} value={cursor + 1} />
      <div className="shor-learning-grid">
        <div className="shor-operation-view">
          <div className="shor-operation-label">
            <span className={`shor-kind shor-kind-${event.kind}`}>{event.kind === 'quantum' ? 'Quantum operation' : 'Classical operation'}</span>
            {event.attempt && <span>Attempt {event.attempt}</span>}
          </div>
          <div aria-live="polite" aria-atomic="true">
            <h4>{event.title}</h4>
            <p className="shor-current-explanation">{event.explanation}</p>
          </div>
          {preparation ? (
            <div className="shor-registers" aria-label="Register activity">
              {[['Counting register', preparation.counting], ['Work register', preparation.work]].map(([label, qubits]) => (
                <div className="shor-register" key={label}>
                  <span>{label}</span>
                  <div>{qubits.map(qubit => <span key={qubit} className={`shor-qubit ${event.qubits?.includes(qubit) ? 'is-active' : ''}`}>q{qubit}</span>)}</div>
                </div>
              ))}
              <p>Highlighted qubits participate in the selected operation. These labels show register activity, not quantum state values.</p>
            </div>
          ) : <div className="shor-classical-note">Classical checks can find factors before a quantum circuit is needed.</div>}
          {operations.length > 0 && <div className="shor-circuit-sequence" aria-label="Executed circuit blocks">
            <span className="shor-eyebrow">CIRCUIT OPERATION ORDER</span>
            <div>{operations.map(operation => <button key={operation.index} className={operation.index === cursor ? 'is-active' : ''} onClick={() => visit(operation.index)} aria-label={`Revisit ${operation.title}`}>
              {({ superposition: 'H', initialize: 'X', modular: operation.gates?.[0], qft: 'QFT†', measure: 'Measure' })[operation.stage] || operation.title}
            </button>)}</div>
          </div>}
          {event.gates?.length > 0 && <details key={cursor} className="shor-operation-details">
            <summary>Inspect {event.kind === 'quantum' ? 'gates / operations' : 'calculations'} ({event.gates.length})</summary>
            <ol>{event.gates.map((gate, index) => <li key={index}><code>{gate}</code></li>)}</ol>
          </details>}
        </div>
        <div className="shor-log">
          <h4>Execution log</h4>
          <ol aria-label="Recorded actions">
            {trace.slice(0, revealed + 1).map((item, index) => <li key={index} ref={index === cursor ? selectedEntry : null}>
              <button className={index === cursor ? 'is-active' : ''} aria-current={index === cursor ? 'step' : undefined} onClick={() => visit(index)}>
                <span className="shor-log-number">{index + 1}</span>
                <span><small>{item.kind === 'quantum' ? 'QUANTUM' : 'CLASSICAL'}{item.attempt ? ` · ATTEMPT ${item.attempt}` : ''}</small><strong>{item.title}</strong></span>
              </button>
            </li>)}
          </ol>
          {revealed < last && <p className="shor-log-hint">Advance to reveal the next action.</p>}
        </div>
      </div>
      {cursor === last && <ShorResults result={result} />}
    </section>
  );
}
