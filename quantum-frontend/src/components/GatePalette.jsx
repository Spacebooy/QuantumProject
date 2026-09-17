import { useState } from 'react';
import { gateInfo } from '../tutorial/tutorialLessons';


const GATES = [
  { name: 'H', color: 'blue' },
  { name: 'X', color: 'green' },
  { name: 'Y', color: 'green' },
  { name: 'Z', color: 'green' },
  { name: 'S', color: 'purple' },
  { name: 'T', color: 'purple' },
  { name: 'Rx', color: 'pink', isRotation: true },
  { name: 'Ry', color: 'pink', isRotation: true },
  { name: 'Rz', color: 'pink', isRotation: true },
  { name: 'CNOT', color: 'cyan' },
  { name: 'Measure', color: 'dark' },
];

export default function GatePalette({
  tutorialActive = false,
  selectedGate,
  setSelectedGate,
  thetaValue,
  setThetaValue,
  cnotTarget,
  setCnotTarget,
  numQubits,
}) {
  const [infoGate, setInfoGate] = useState(null);
  const isRotationSelected = ['Rx', 'Ry', 'Rz'].includes(selectedGate);
  const isCnotSelected = selectedGate === 'CNOT';

  return (
    <div className="card gate-palette">
      <div className="card-header">
        <h3>Gate library</h3>
        <span className="section-count">11 gates</span>
      </div>
      <p className="hint">Select a gate, then click a wire slot.</p>

      <div className="gate-grid">
        {GATES.map((g) => (
          <div className="gate-with-info" key={g.name}>
          <button
            data-tutorial-id={`gate-${g.name.toLowerCase()}`}
            aria-pressed={selectedGate === g.name}
            title={gateInfo[g.name.toUpperCase()]}
            className={`gate-btn gate-${g.color} ${selectedGate === g.name ? 'active' : ''}`}
            onClick={() => setSelectedGate(selectedGate === g.name ? null : g.name)}
          >
            <span className="gate-symbol">{g.name === 'Measure' ? 'M' : g.name}</span>
            <span className="gate-name">{({ H: 'Hadamard', X: 'Pauli X', Y: 'Pauli Y', Z: 'Pauli Z', S: 'Phase', T: 'T gate', Rx: 'Rotate X', Ry: 'Rotate Y', Rz: 'Rotate Z', CNOT: 'Controlled X', Measure: 'Measure' })[g.name]}</span>
          </button>
          {!tutorialActive && <button className="gate-info-button" aria-label={`About ${g.name}`} aria-expanded={infoGate===g.name} onClick={()=>setInfoGate(infoGate===g.name?null:g.name)}>i</button>}
          </div>
        ))}
        {!tutorialActive && infoGate && <p className="gate-help" role="status"><strong>{infoGate}: </strong>{gateInfo[infoGate.toUpperCase()]}</p>}
      </div>

      {isRotationSelected && (
        <div data-tutorial-id="angle" className="form-group rotation-input" style={{ marginTop: '12px' }}>
          <label>Rotation Angle θ (rad):</label>
          <input
            type="number"
            step="0.1"
            value={thetaValue}
            onChange={(e) => setThetaValue(parseFloat(e.target.value) || 0)}
          />
        </div>
      )}

      {isCnotSelected && (
        <div data-tutorial-id="cnot-target" className="form-group cnot-target-input" style={{ marginTop: '12px' }}>
          <label>CNOT Target Qubit:</label>
          <select
            value={cnotTarget}
            onChange={(e) => setCnotTarget(parseInt(e.target.value, 10))}
          >
            {Array.from({ length: numQubits }, (_, i) => i).map((q) => (
              <option key={q} value={q}>
                q{q}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}