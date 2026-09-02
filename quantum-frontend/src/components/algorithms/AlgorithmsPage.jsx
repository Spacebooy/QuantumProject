import React, { useState } from 'react';
import ShorPanel from './ShorPanel';

const ALGORITHMS = [
  {
    id: 'shor',
    title: "Shor's Algorithm",
    purpose: 'Integer Factorization',
    status: 'Available',
    description: 'Finds nontrivial prime factors of a composite integer using quantum order finding.',
  },
  {
    id: 'grover',
    title: 'Grover Search',
    purpose: 'Unstructured Search',
    status: 'Coming Soon',
    description: 'Provides quadratic speedup for searching unsorted databases.',
  },
  {
    id: 'teleportation',
    title: 'Quantum Teleportation',
    purpose: 'State Transfer',
    status: 'Coming Soon',
    description: 'Transmits quantum information using entanglement and classical communication.',
  },
  {
    id: 'deutsch-jozsa',
    title: 'Deutsch-Jozsa',
    purpose: 'Function Property Evaluation',
    status: 'Coming Soon',
    description: 'Determines if a black-box function is constant or balanced in a single query.',
  },
  {
    id: 'bernstein-vazirani',
    title: 'Bernstein-Vazirani',
    purpose: 'Secret Bitstring Recovery',
    status: 'Coming Soon',
    description: 'Finds a hidden string encoded in a function in 1 step versus N classical steps.',
  },
  {
    id: 'qft',
    title: 'Quantum Fourier Transform',
    purpose: 'Phase Processing',
    status: 'Coming Soon',
    description: 'The quantum analogue of the discrete Fourier transform used in phase estimation.',
  },
];

export default function AlgorithmsPage() {
  const [selectedAlgo, setSelectedAlgo] = useState('shor');

  return (
    <div className="algorithms-page">
      <div className="algorithm-selector-bar card">
        <h3>Quantum Algorithms Catalog</h3>
        <div className="algorithm-cards-grid">
          {ALGORITHMS.map((algo) => (
            <div
              key={algo.id}
              className={`algo-card ${selectedAlgo === algo.id ? 'active' : ''} ${
                algo.status === 'Coming Soon' ? 'disabled' : ''
              }`}
              onClick={() => algo.status === 'Available' && setSelectedAlgo(algo.id)}
            >
              <div className="algo-card-header">
                <h4>{algo.title}</h4>
                <span className={`status-badge ${algo.status === 'Available' ? 'badge-active' : 'badge-soon'}`}>
                  {algo.status}
                </span>
              </div>
              <p className="algo-purpose">{algo.purpose}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="algorithm-content">
        {selectedAlgo === 'shor' && <ShorPanel />}
      </div>
    </div>
  );
}