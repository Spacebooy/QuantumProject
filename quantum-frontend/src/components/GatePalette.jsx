import React from 'react';

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
  selectedGate,
  setSelectedGate,
  thetaValue,
  setThetaValue,
  cnotTarget,
  setCnotTarget,
  numQubits,
}) {
  const isRotationSelected = ['Rx', 'Ry', 'Rz'].includes(selectedGate);
  const isCnotSelected = selectedGate === 'CNOT';

  return (
    <div className="card gate-palette">
      <div className="card-header">
        <h3>Gate Palette</h3>
        <span className="icon">🎛</span>
      </div>
      <p className="hint">Select a gate, then click on a wire step to place it.</p>

      <div className="gate-grid">
        {GATES.map((g) => (
          <button
            key={g.name}
            className={`gate-btn gate-${g.color} ${selectedGate === g.name ? 'active' : ''}`}
            onClick={() => setSelectedGate(selectedGate === g.name ? null : g.name)}
          >
            {g.name}
          </button>
        ))}
      </div>

      {isRotationSelected && (
        <div className="form-group rotation-input" style={{ marginTop: '12px' }}>
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
        <div className="form-group cnot-target-input" style={{ marginTop: '12px' }}>
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