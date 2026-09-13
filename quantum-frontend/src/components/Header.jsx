import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/auth-context';
export default function Header({ currentPage, setCurrentPage, theme, onToggleTheme }) {
  const { user, isAuthenticated, openAuthModal, logout, openUsageModal } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      <div className="account-actions auth-ui">
        {isAuthenticated ? (
          <div className="user-profile-menu" ref={dropdownRef}>
            <button
              className="user-pill-btn"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              title="Account Menu"
            >
              <span className="user-avatar-circle">
                {user?.full_name ? user.full_name[0].toUpperCase() : 'S'}
              </span>
              <div className="user-pill-info">
                <span className="user-pill-name">{user?.full_name}</span>
                <span className="user-pill-badge">🎓 Student</span>
              </div>
              <span className="dropdown-arrow">{isDropdownOpen ? '▲' : '▼'}</span>
            </button>

            {isDropdownOpen && (
              <div className="user-dropdown-card">
                <div className="dropdown-user-header">
                  <strong>{user?.full_name}</strong>
                  <span className="dropdown-email">{user?.email}</span>
                </div>

                <div className="dropdown-divider" />

                <button
                  className="dropdown-item"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    openUsageModal();
                  }}
                >
                  📊 Simulation History & Logs
                </button>

                <div className="dropdown-divider" />

                <button
                  className="dropdown-item text-danger"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    logout();
                  }}
                >
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            className="btn-auth-signin"
            onClick={() => openAuthModal('Sign in to access simulations with 3 to 15 qubits!')}
          >
            <span className="signin-lock-icon">🔒</span>
            <span>Sign In / Register</span>
          </button>
        )}
      </div>
    </header>
  );
}
