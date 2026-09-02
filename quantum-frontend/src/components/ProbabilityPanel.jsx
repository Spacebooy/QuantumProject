import React from 'react';

export default function ProbabilityPanel({ states }) {
  if (!states || Object.keys(states).length === 0) {
    return <p className="empty-msg">No simulation results available.</p>;
  }

  const entries = Object.entries(states);

  return (
    <div className="probability-panel">
      <h4>Probabilities of Basis States</h4>
      <div className="bar-chart">
        {entries.map(([state, prob]) => {
          const percentage = Math.round(prob * 100);
          return (
            <div key={state} className="chart-column">
              <span className="col-value">{percentage}%</span>
              <div className="bar-wrapper">
                <div className="bar-fill" style={{ height: `${Math.max(percentage, 4)}%` }}></div>
              </div>
              <span className="col-label">|{state}⟩</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}