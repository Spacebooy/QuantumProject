import React from 'react';
import ProbabilityPanel from './ProbabilityPanel';
import AmplitudesPanel from './AmplitudesPanel';

export default function ResultsPanel({ results, error }) {
  return (
    <div className="card results-panel">
      <div className="card-header">
        <h3>Results</h3>
      </div>

      {error && <div className="error-banner">⚠️ {error}</div>}

      {!results && !error && (
        <div className="placeholder-text">Click "Run Circuit" to execute simulation.</div>
      )}

      {results && (
        <div className="results-grid">
          <ProbabilityPanel states={results.states} />
          <AmplitudesPanel amplitudes={results.amplitudes} states={results.states} />
          
          <div className="measurement-readout">
            <h4>Measurement Outcomes</h4>
            {results.measurements && results.measurements.length > 0 ? (
              results.measurements.map((m, idx) => (
                <div key={idx} className="measurement-item">
                  <span>Qubit {m.qubit}:</span> <strong>|{m.value}⟩</strong>
                </div>
              ))
            ) : (
              <p className="empty-msg">No measure operations executed.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}