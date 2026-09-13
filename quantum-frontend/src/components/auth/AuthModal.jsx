import { useState } from 'react';
import { useAuth } from '../../context/auth-context';

export default function AuthModal() {
  const { isAuthModalOpen, authModalReason, closeAuthModal, login, register } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (tab === 'register') {
        if (!fullName.trim()) {
          setError('Please enter your full name.');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setIsSubmitting(false);
          return;
        }
        await register(email, password, fullName);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay auth-ui" onClick={closeAuthModal}>
      <div role="dialog" aria-modal="true" aria-label="Account" className="modal-card auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={closeAuthModal} title="Close">
          ✕
        </button>

        <div className="auth-header">
          <div className="auth-logo">⚛</div>
          <h2>{tab === 'login' ? 'Welcome Back, Student' : 'Create Student Account'}</h2>
          <p>
            {tab === 'login'
              ? 'Sign in with your student email to access advanced multi-qubit simulations'
              : 'Register with email and password for free to unlock circuits with up to 15 qubits'}
          </p>
        </div>

        {authModalReason && (
          <div className="auth-reason-banner">
            <span className="banner-icon">🔒</span>
            <span>{authModalReason}</span>
          </div>
        )}

        {error && (
          <div className="auth-error-banner">
            <span>⚠️ {error}</span>
          </div>
        )}

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setTab('login');
              setError('');
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => {
              setTab('register');
              setError('');
            }}
          >
            Register
          </button>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {tab === 'register' && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="e.g. Marie Curie"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="student@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder={tab === 'register' ? 'Minimum 6 characters' : 'Enter password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary auth-submit-btn" disabled={isSubmitting}>
            {isSubmitting
              ? 'Processing...'
              : tab === 'register'
              ? '🚀 Create Student Account'
              : '🔑 Sign In'}
          </button>
        </form>

        <div className="auth-footer-note">
          <span>
            {tab === 'login' ? "Don't have an account yet?" : 'Already have an account?'}
          </span>{' '}
          <button
            type="button"
            className="auth-switch-link"
            onClick={() => {
              setTab(tab === 'login' ? 'register' : 'login');
              setError('');
            }}
          >
            {tab === 'login' ? 'Register now' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
