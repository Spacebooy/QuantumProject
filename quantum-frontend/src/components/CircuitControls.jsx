import { useAuth } from '../context/auth-context';
import { useState } from 'react';

export default function CircuitControls({
  numQubits,
  setNumQubits,
  mode,
  setMode,
  onRun,
  onClear,
  isLoading
}) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [inputValue, setInputValue] = useState(numQubits.toString());


  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);

    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 15) {
      if (!isAuthenticated && parsed > 2) {
        openAuthModal('Sign in to unlock circuits with up to 15 qubits.');
        setInputValue(numQubits.toString());
        return;
      }
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
    <div className="card circuit-controls" aria-label="Simulation controls">
      <div className="form-group">
        <label htmlFor="qubit-count">Qubits <span className="control-limit">{isAuthenticated ? '1–15' : '1–2 · Sign in for more'}</span></label>
        <input
          id="qubit-count"
          type="number"
          min="1"
          max="15"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
        />
      </div>

      <div className="form-group">
        <label>Mode</label>
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
          {isLoading ? <><span className="spinner" aria-hidden="true" /> Simulating…</> : <><span aria-hidden="true">▶</span> Run Circuit</>}
        </button>
        <button className="btn btn-secondary" onClick={onClear}>
          Clear Circuit
        </button>
      </div>
    </div>
  );
}