import React from 'react';

export default function LearnPanel() {
  return (
    <div className="card learn-panel">
      <h3>Learn about this circuit</h3>
      <p>
        This simulator lets you visualize quantum superpositions, logic gates, and measurement outcomes.
      </p>
      <ul>
        <li><strong>Hadamard (H):</strong> Puts a qubit into an equal superposition of |0⟩ and |1⟩ states.</li>
        <li><strong>CNOT:</strong> Flips the target qubit if the control qubit is in state |1⟩, generating quantum entanglement.</li>
        <li><strong>Measurement:</strong> Collapses the statevector to a definite classical bit outcome.</li>
      </ul>
    </div>
  );
}