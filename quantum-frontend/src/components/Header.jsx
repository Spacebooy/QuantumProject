import React from 'react';

export default function Header({ currentPage, setCurrentPage }) {
  return (
    <header className="app-header">
      <div className="header-branding">
        <span className="logo-icon">⚛</span>
        <div>
          <h1>Q-SIM | Quantum Circuit Simulator</h1>
          <p>Interactive Learning and Visualization for Quantum Computing</p>
        </div>
      </div>

      <nav className="header-nav">
        <button
          className={`nav-tab ${currentPage === 'simulator' ? 'active' : ''}`}
          onClick={() => setCurrentPage('simulator')}
        >
          ⚡ Circuit Simulator
        </button>
        <button
          className={`nav-tab ${currentPage === 'algorithms' ? 'active' : ''}`}
          onClick={() => setCurrentPage('algorithms')}
        >
          🔬 Quantum Algorithms
        </button>
      </nav>

      <div className="header-actions">
        <button className="icon-btn" title="Account">👤</button>
        <button className="icon-btn" title="Settings">⚙</button>
        <button className="icon-btn" title="Help">?</button>
      </div>
    </header>
  );
}