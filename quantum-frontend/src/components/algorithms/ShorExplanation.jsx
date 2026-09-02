import React, { useState } from 'react';

export default function ShorExplanation({ result }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!result || !result.success) return null;

  const { method, N, a, phase, fraction, period, candidate_period, factors } = result;

  return (
    <div className="explanation-container card">
      <button
        className="explanation-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>📖 How Shor found the factors ({isOpen ? 'Hide Details' : 'Show Details'})</span>
        <span className="arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="explanation-body">
          {method === 'shor' && (
            <ul className="step-explanation-list">
              <li>
                <strong>Chosen Base (a):</strong> The algorithm randomly selected <code>a = {a}</code>, which is coprime to <code>N = {N}</code>.
              </li>
              <li>
                <strong>Quantum Period Finding:</strong> Executed modular exponentiation <code>{a}^x mod {N}</code> in superposition and applied the inverse Quantum Fourier Transform (QFT).
              </li>
              <li>
                <strong>Phase Estimation:</strong> Measured a quantum phase of <code>{phase}</code> from the counting register.
              </li>
              <li>
                <strong>Fraction Approximation:</strong> Converted the phase <code>{phase}</code> into the continued fraction <code>{fraction || 'N/A'}</code>, suggesting a candidate period of <code>r = {candidate_period ?? period}</code>.
              </li>
              <li>
                <strong>Period Verification:</strong> Verified that <code>{a}^{period} mod {N} = 1</code>, giving a valid period <code>r = {period}</code>.
              </li>
              <li>
                <strong>Classical Factor Extraction:</strong> Computed <code>gcd({a}^({period}/2) ± 1, {N})</code> to extract nontrivial factors {factors ? `(${factors.join(' and ')})` : ''}.
              </li>
            </ul>
          )}

          {method === 'gcd_shortcut' && (
            <p className="explanation-text">
              The randomly chosen value <code>a = {a}</code> already shared a nontrivial factor with <code>N = {N}</code>. The classical <code>gcd({a}, {N})</code> check found the factors immediately without requiring quantum period finding.
            </p>
          )}

          {method === 'even_number_shortcut' && (
            <p className="explanation-text">
              Because <code>N = {N}</code> is an even number, the factor <code>2</code> was identified instantly via classical parity check without initializing quantum circuits.
            </p>
          )}
        </div>
      )}
    </div>
  );
}