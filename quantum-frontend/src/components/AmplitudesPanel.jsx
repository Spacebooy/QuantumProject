import React from 'react';

export default function AmplitudesPanel({ amplitudes, states }) {
  if (!amplitudes || Object.keys(amplitudes).length === 0) {
    return null;
  }

  const entries = Object.entries(amplitudes);

  return (
    <div className="amplitudes-panel">
      <h4>Statevector Amplitudes</h4>
      <table className="data-table">
        <thead>
          <tr>
            <th>Basis State</th>
            <th>Amplitude (Re + i Im)</th>
            <th>Probability</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([state, amp]) => {
            const prob = states[state] !== undefined ? `${Math.round(states[state] * 100)}%` : '0%';
            return (
              <tr key={state}>
                <td>|{state}⟩</td>
                <td>| {amp.real.toFixed(3)} + {amp.imag.toFixed(3)}i</td>
                <td>{prob}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}