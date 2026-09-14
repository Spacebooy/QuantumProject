import ProbabilityPanel from './ProbabilityPanel';
import AmplitudesPanel from './AmplitudesPanel';

export default function ResultsPanel({ results, error }) {
  return (
    <div className="card results-panel" data-tutorial-id="results" aria-live="polite">
      <div className="card-header">
        <h3>Results</h3>
      </div>

      {error && <div className="error-banner">⚠️ {error}</div>}

      {!results && !error && (
        <div className="placeholder-text">Your results will appear here. Run the circuit to explore probabilities, amplitudes, and measurement outcomes.</div>
      )}

      {results && (
        <div className="results-grid">
          <ProbabilityPanel states={results.states} />
          <AmplitudesPanel amplitudes={results.amplitudes} states={results.states} />
          
          <div className="measurement-readout" data-tutorial-id="measurement">
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