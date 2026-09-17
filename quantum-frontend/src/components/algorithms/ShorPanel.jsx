import { useState } from 'react';
import { useAuth } from '../../context/auth-context';
import { runShor } from '../../api';
import ShorPlayback from './ShorPlayback';

export default function ShorPanel() {
  const { token, openAuthModal } = useAuth();
  const [inputValue, setInputValue] = useState('15');
  const [isAuto, setIsAuto] = useState(true);
  const [countingQubits, setCountingQubits] = useState('4');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [result, setResult] = useState(null);

  // Calculate work register and total qubits
  const nNum = parseInt(inputValue, 10);
  const workQubits = !isNaN(nNum) && nNum > 1 ? Math.ceil(Math.log2(nNum)) : 0;
  const manualCountingQubits = parseInt(countingQubits, 10) || 0;
  const totalQubits = !isAuto ? manualCountingQubits + workQubits : null;
  const isExceedingLimit = !isAuto && totalQubits > 20;

  const handleRun = async () => {
    setValidationError(null);
    setApiError(null);

    if (isNaN(nNum) || nNum <= 1) {
      setValidationError('Please enter a valid integer greater than 1.');
      return;
    }

    let numCountingQubits = null;

    if (!isAuto) {
      if (isNaN(manualCountingQubits) || manualCountingQubits < 1) {
        setValidationError('Please enter a positive integer for counting qubits.');
        return;
      }
      if (isExceedingLimit) {
        setValidationError('Total qubits cannot exceed the maximum limit of 20.');
        return;
      }
      numCountingQubits = manualCountingQubits;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const data = await runShor(nNum, numCountingQubits, token);
      setResult(data);
    } catch (err) {
      if (err.status === 401 || err.status === 403) openAuthModal(err.message);
      setApiError(err.message || 'Failed to execute Shor algorithm');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="shor-panel-container">
      <div className="card shor-input-card">
        <div className="card-header">
          <div>
            <h2>Shor's Algorithm</h2>
            <p className="card-subtitle">
              Factor a number, then explore the gates, measurements and classical checks in your run.
            </p>
          </div>
        </div>

        <div className="shor-input-form">
          <div className="form-group inline-group" style={{ flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
            {/* Number to factor Input */}
            <div>
              <label htmlFor="shor-input">Number to factor (N):</label>
              <input
                id="shor-input"
                type="number"
                min="2"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setValidationError(null);
                }}
                placeholder="e.g. 15"
                disabled={isLoading}
              />
            </div>

            {/* Counting Qubits Control */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label htmlFor="counting-qubits-input" style={{ margin: 0 }}>Counting Qubits:</label>
                <label style={{ fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="checkbox"
                    checked={isAuto}
                    onChange={(e) => {
                      setIsAuto(e.target.checked);
                      setValidationError(null);
                    }}
                    disabled={isLoading}
                  />
                  Auto
                </label>
              </div>

              <input
                id="counting-qubits-input"
                type="number"
                min="1"
                value={isAuto ? '' : countingQubits}
                onChange={(e) => {
                  setCountingQubits(e.target.value);
                  setValidationError(null);
                }}
                placeholder={isAuto ? 'Auto' : 'e.g. 4'}
                disabled={isLoading || isAuto}
                style={{ width: '120px' }}
              />
            </div>

            {/* Run Button */}
            <button
              className="btn btn-primary run-shor-btn"
              onClick={handleRun}
              disabled={isLoading || isExceedingLimit}
            >
              {isLoading ? 'Running Quantum Simulation...' : '▶ Run Shor'}
            </button>
          </div>

          {/* Helper Text */}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-sub, #64748b)', marginTop: '6px', marginBottom: '4px' }}>
            More counting qubits give better phase estimation precision but require more simulation memory.
          </p>

          {/* Qubit Counter & Limit Warning */}
          {!isAuto && !isNaN(nNum) && nNum > 1 && (
            <div style={{ fontSize: '0.8rem', fontWeight: '600', marginTop: '6px' }}>
              <span style={{ color: isExceedingLimit ? '#dc2626' : 'var(--text-main, #0f172a)' }}>
                Total qubits: {totalQubits} / 20
              </span>
              {isExceedingLimit && (
                <span style={{ color: '#dc2626', marginLeft: '8px' }}>
                  ⚠️ Exceeds max simulator capacity of 20 qubits.
                </span>
              )}
            </div>
          )}

          {validationError && <div className="validation-error">⚠️ {validationError}</div>}
          {apiError && <div className="error-banner">⚠️ {apiError}</div>}
        </div>
      </div>

      {isLoading && (
        <div className="card loading-card">
          <div className="spinner"></div>
          <p>Running quantum period finding and QFT phase estimation...</p>
        </div>
      )}

      {!isLoading && result && <ShorPlayback result={result} />}
    </div>
  );
}