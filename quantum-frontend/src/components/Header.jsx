import React from 'react';

export default function Header({ currentPage, setCurrentPage }) {
  return (
    <header className="app-header">
      <div className="header-brand">
        <span className="logo-icon">⚛️</span>
        <h1>Quantum Simulator</h1>
      </div>

      <nav className="header-nav">
        <button
          className={`nav-btn ${currentPage === 'simulator' ? 'active' : ''}`}
          onClick={() => setCurrentPage('simulator')}
        >
          🎛️ Circuit Builder
        </button>
        <button
          className={`nav-btn ${currentPage === 'algorithms' ? 'active' : ''}`}
          onClick={() => setCurrentPage('algorithms')}
        >
          ⚡ Algorithms
        </button>
        <button
          className={`nav-btn ${currentPage === 'visualizer' ? 'active' : ''}`}
          onClick={() => setCurrentPage('visualizer')}
        >
          🌐 Visual Qubit
        </button>
      </nav>
    </header>
  );
}