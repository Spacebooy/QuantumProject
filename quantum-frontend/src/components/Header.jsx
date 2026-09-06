export default function Header({ currentPage, setCurrentPage, theme, onToggleTheme }) {
  return (
    <header className="app-header">
      <div className="header-brand">
        <span className="brand-mark" aria-hidden="true">q<span>·</span></span>
        <h1>Quantum Simulator</h1>
      </div>
      <nav className="header-nav" aria-label="Main navigation">
        { [['simulator', 'Circuit Builder'], ['algorithms', 'Algorithms'], ['visualizer', 'Visual Qubit'], ['missions', 'Quantum Missions']].map(([page, label]) => (
          <button key={page} className={`nav-btn ${currentPage === page ? 'active' : ''}`}
            aria-current={currentPage === page ? 'page' : undefined} onClick={() => setCurrentPage(page)}>{label}</button>
        )) }
      </nav>
      <button className="theme-toggle" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>{theme === 'dark' ? '☀ Light' : '☾ Dark'}</button>
    </header>
  );
}
