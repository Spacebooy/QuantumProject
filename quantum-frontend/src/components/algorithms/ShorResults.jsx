import React from 'react';
import ShorExplanation from './ShorExplanation';

export default function ShorResults({ result }) {
  if (!result) return null;

  if (!result.success) {
    return (
      <div className="shor-results-container">
        <div className="result-banner banner-failed">
          <h4>Factorization Result</h4>
          <p className="result-message">{result.message}</p>
          {result.attempts !== undefined && (
            <span className="sub-detail">Attempts made: {result.attempts}</span>
          )}
        </div>
      </div>
    );
  }

  const {
    method,
    N,
    a,
    attempts,
    measurement,
    measurement_decimal,
    phase,
    fraction,
    candidate_period,
    period,
    factors,
  } = result;

  return (
    <div className="shor-results-container">
      {/* Prominent Factorization Display */}
      <div className="result-banner banner-success">
        <span className="banner-label">Final Factorization</span>
        <h2 className="factor-display">
          {N} = {factors ? factors.join(' × ') : 'Found'}
        </h2>
        <span className="method-badge">
          Method: {method === 'shor' ? 'Full Quantum Period Finding' : method === 'gcd_shortcut' ? 'Classical GCD Shortcut' : 'Even Number Shortcut'}
        </span>
      </div>

      {method === 'shor' && (
        <div className="quantum-classical-grid">
          {/* Quantum Part Panel */}
          <div className="card process-panel">
            <div className="card-header">
              <h3>⚛ Quantum Execution</h3>
            </div>
            <ol className="process-list">
              <li>Prepare counting register</li>
              <li>Create superposition using Hadamard gates</li>
              <li>Perform modular exponentiation <code>a^x mod N</code></li>
              <li>Apply inverse QFT</li>
              <li>Measure counting register</li>
            </ol>
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">Chosen a</span>
                <span className="metric-val">{a}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Binary Measurement</span>
                <span className="metric-val">|{measurement}⟩</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Decimal Value</span>
                <span className="metric-val">{measurement_decimal}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Measured Phase</span>
                <span className="metric-val">{phase}</span>
              </div>
            </div>
          </div>

          {/* Classical Part Panel */}
          <div className="card process-panel">
            <div className="card-header">
              <h3>🖥 Classical Postprocessing</h3>
            </div>
            <ol className="process-list" start="6">
              <li>Convert measurement into phase</li>
              <li>Approximate phase as fraction using continued fractions</li>
              <li>Recover period (r)</li>
              <li>Compute factors using <code>gcd(a^(r/2) ± 1, N)</code></li>
            </ol>
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">Fraction Approx.</span>
                <span className="metric-val">{fraction || 'N/A'}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Candidate Period</span>
                <span className="metric-val">{candidate_period ?? period}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Recovered Period</span>
                <span className="metric-val">{period}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Total Attempts</span>
                <span className="metric-val">{attempts}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {method === 'gcd_shortcut' && (
        <div className="card shortcut-card">
          <h4>⚡ Classical Shortcut Triggered</h4>
          <p>
            The randomly chosen base <code>a = {a}</code> shares a common divisor with <code>N = {N}</code>.
            Factors were extracted directly using <code>gcd({a}, {N})</code> in {attempts} attempt(s).
          </p>
        </div>
      )}

      {method === 'even_number_shortcut' && (
        <div className="card shortcut-card">
          <h4>⚡ Parity Shortcut Triggered</h4>
          <p>
            <code>N = {N}</code> is an even number. The factor <code>2</code> was determined immediately without quantum simulation.
          </p>
        </div>
      )}

      {/* Dynamic Step-by-Step Explanation */}
      <ShorExplanation result={result} />
    </div>
  );
}