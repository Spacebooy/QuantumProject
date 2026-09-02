import React, { useState, useEffect } from 'react';

export default function CircuitControls({
  numQubits,
  setNumQubits,
  mode,
  setMode,
  onRun,
  onClear,
  isLoading
}) {
  const [inputValue, setInputValue] = useState(numQubits.toString());

  useEffect(() => {
    setInputValue(numQubits.toString());
  }, [numQubits]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);

    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 15) {
      setNumQubits(parsed);
    }
  };

  const handleBlur = () => {
    const parsed = parseInt(inputValue, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 15) {
      setInputValue(numQubits.toString());
    }
  };

  return (
    <div className="card circuit-controls">
      <div className="card-header">
        <h3>Simulation Controls</h3>
        <span className="icon">⚙️</span>
      </div>

      <div className="form-group">
        <label>Number of Qubits (1 - 15):</label>
        <input
          type="number"
          min="1"
          max="15"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
        />
      </div>

      <div className="form-group">
        <label>Simulation Mode:</label>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="mode"
              value="ideal"
              checked={mode === 'ideal'}
              onChange={(e) => setMode(e.target.value)}
            />
            Ideal
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="mode"
              value="noisy"
              checked={mode === 'noisy'}
              onChange={(e) => setMode(e.target.value)}
            />
            Noisy
          </label>
        </div>
      </div>

      <div className="button-stack">
        <button className="btn btn-primary" onClick={onRun} disabled={isLoading}>
          {isLoading ? 'Simulating...' : '▶ Run Circuit'}
        </button>
        <button className="btn btn-secondary" onClick={onClear}>
          🗑 Clear Circuit
        </button>
      </div>
    </div>
  );
}