import { useState } from 'react';

const getGateColorClass = (gate) => {
  const g = gate.toUpperCase();
  if (['H'].includes(g)) return 'gate-blue';
  if (['X', 'Y', 'Z'].includes(g)) return 'gate-green';
  if (['S', 'T'].includes(g)) return 'gate-purple';
  if (['RX', 'RY', 'RZ'].includes(g)) return 'gate-pink';
  if (['CNOT'].includes(g)) return 'gate-cyan';
  return 'gate-dark';
};

export default function CircuitBuilder({
  numQubits,
  grid,
  selectedGate,
  onCellClick,
  onRemoveGate,
}) {
  const [numSteps, setNumSteps] = useState(16);

  const steps = Array.from({ length: numSteps }, (_, i) => i);
  const qubits = Array.from({ length: numQubits }, (_, i) => i);

  const handleAddStep = () => setNumSteps((prev) => Math.min(prev + 4, 32));
  const handleRemoveStep = () => setNumSteps((prev) => Math.max(prev - 4, 8));

  return (
    <div className="card circuit-builder" data-tutorial-id="circuit">
      <div className="card-header">
        <h3>Circuit canvas <span className="section-count">{numSteps} steps</span></h3>
        <div className="toolbar-actions">
          <button
            className="step-btn"
            onClick={handleRemoveStep}
            disabled={numSteps <= 8}
          >
            - Step
          </button>
          <button
            className="step-btn"
            onClick={handleAddStep}
            disabled={numSteps >= 32}
          >
            + Step
          </button>
        </div>
      </div>

      <p className="hint canvas-hint">Select a gate to place it. Click a placed gate to remove it. Measurement is optional.</p>
      <div className="circuit-scroll-container">
        <div className="circuit-canvas">
          {qubits.map((q) => (
            <div key={q} className="wire-row">
              <span className="wire-label" data-tutorial-id={`wire-q${q}`}>q{q}</span>

              <div className="wire-track">
                <div className="wire-line"></div>

                <div className="steps-container">
                  {steps.map((step) => {
                    const cellOp = grid.find(
                      (item) =>
                        item.step === step &&
                        (item.target === q || item.control === q)
                    );
                    const isTarget = cellOp && cellOp.target === q;
                    const isControl = cellOp && cellOp.control === q;

                    return (
                      <div
                        key={step}
                        className="grid-cell" data-tutorial-id={`cell-q${q}-step${step}`}
                        role="button"
                        tabIndex={0}
                        aria-label={cellOp ? `Remove ${cellOp.gate} at q${q}, step ${step + 1}` : `Place ${selectedGate || 'H'} at q${q}, step ${step + 1}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (cellOp) onRemoveGate(cellOp.id);
                            else onCellClick(q, step);
                          }
                        }}
                        onClick={() => cellOp ? onRemoveGate(cellOp.id) : onCellClick(q, step)}
                        title={
                          cellOp
                            ? 'Click gate to remove'
                            : `Place ${selectedGate || 'gate'}`
                        }
                      >
                        {cellOp ? (
                          <div className="placed-gate-wrapper">
                            {isControl && cellOp.target < numQubits && <span className="cnot-connector" aria-hidden="true" style={{ height: `${Math.abs(cellOp.target - q) * 88}px`, top: cellOp.target > q ? '50%' : 'auto', bottom: cellOp.target < q ? '50%' : 'auto' }} />}
                            {isControl && (
                              <div
                                className="cnot-control-dot"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRemoveGate(cellOp.id);
                                }}
                              >
                                ●
                              </div>
                            )}
                            {isTarget &&
                              cellOp.gate.toUpperCase() === 'CNOT' && (
                                <div
                                  className="placed-gate gate-cyan"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveGate(cellOp.id);
                                  }}
                                >
                                  ⊕
                                </div>
                              )}
                            {isTarget &&
                              cellOp.gate.toUpperCase() !== 'CNOT' && (
                                <div
                                  className={`placed-gate ${getGateColorClass(
                                    cellOp.gate
                                  )}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveGate(cellOp.id);
                                  }}
                                >
                                  {['MEASURE', 'Measure'].includes(cellOp.gate)
                                    ? 'M'
                                    : cellOp.gate}
                                </div>
                              )}
                          </div>
                        ) : (
                          <div className="empty-slot-marker"><span className="slot-plus">+</span><span className="slot-preview">{selectedGate === 'Measure' ? 'M' : selectedGate || 'H'}</span></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}