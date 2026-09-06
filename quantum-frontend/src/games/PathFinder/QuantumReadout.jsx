import { bits, diffusion } from './quantumOperations';

export function QuantumReadout({ choices, maze, visited, qubits, quantum, before }) {
  return <div className="path-readouts">
    {choices.map((id, index) => {
      const key = bits(index, qubits);
      const probability = quantum?.states[key];
      const previous = before?.states[key];
      const known = visited.includes(id) ? maze.nodes[id].type : null;
      const note = known === 'bomb' ? 'Known hazard'
        : known === 'deadend' ? 'Known dead end'
        : known ? 'Explored'
        : previous !== undefined ? `Previously ${(previous * 100).toFixed(1)}%`
        : 'Unexplored corridor';
      return <div className="path-readout" key={id}>
        <div>
          <strong>{String.fromCharCode(65 + index)}</strong>
          <code>{index < 2 ** qubits ? `|${key}⟩` : 'not encoded'}</code>
          <span>{probability === undefined ? '—' : `${(probability * 100).toFixed(1)}%`}</span>
        </div>
        <div className="probability-track"><i style={{ width: `${(probability || 0) * 100}%` }} /></div>
        <small>{note}</small>
      </div>;
    })}
  </div>;
}

export function QuantumDetails({ mode, allocated, qubits, quantum }) {
  const amplitudes = Object.entries(quantum?.amplitudes || {}).sort(([a], [b]) => parseInt(a, 2) - parseInt(b, 2));
  const reference = amplitudes.find(([, a]) => Math.hypot(a.real, a.imag) > 1e-8)?.[1];
  return <details className="quantum-details">
    <summary>Quantum details & learning notes</summary>
    <p>The oracle is a supplied map-based safety test, not a quantum sensor discovering unknown data. It marks all real, non-bomb corridors, including dead ends. Padded states are never marked. The route to the destination remains unknown.</p>
    <p>H on every qubit includes all 2ⁿ states. Standard diffusion can overshoot; with half the states marked it cannot improve the initial 50% success rate. Phases below are relative to the first nonzero amplitude, so irrelevant global phase is removed.</p>
    {mode === 'advanced' && allocated && <details>
      <summary>Elementary diffusion recipe for {qubits} qubits</summary>
      <p>Apply these gates in order. The recipe depends only on the register size, not on the hidden map. The oracle remains a supplied block.</p>
      <pre className="gate-recipe">{diffusion(qubits).map(op =>
        `${op.gate} ${op.control !== undefined ? `q${op.control} → ` : ''}q${op.target}${op.theta !== undefined ? `  θ=${op.theta.toPrecision(12)}` : ''}`
      ).join('\n')}</pre>
    </details>}
    {quantum && <table className="data-table">
      <thead><tr><th>State</th><th>Amplitude</th><th>Relative phase</th></tr></thead>
      <tbody>{amplitudes.map(([key, a]) => {
        const difference = reference ? Math.atan2(a.imag, a.real) - Math.atan2(reference.imag, reference.real) : 0;
        const angle = Math.atan2(Math.sin(difference), Math.cos(difference));
        const phase = Math.hypot(a.real, a.imag) < 1e-8 ? 'Undefined (zero amplitude)' : `${Math.round(angle * 180 / Math.PI) || 0}°`;
        return <tr key={key}>
          <td>|{key}⟩</td>
          <td>{a.real.toFixed(3)} {a.imag < 0 ? '−' : '+'} {Math.abs(a.imag).toFixed(3)}i</td>
          <td>{phase}</td>
        </tr>;
      })}</tbody>
    </table>}
    <p>Reading phases can identify marked safe corridors. It still does not tell you which safe corridor reaches the exit.</p>
  </details>;
}
