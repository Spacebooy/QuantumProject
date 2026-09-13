import { useState, useEffect } from 'react';
import { apiLogin, apiRegister, apiGetMe } from '../api';

import { AuthContext } from './auth-context';

const TOKEN_KEY = 'quantum_sim_token';
function storedToken() { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } }
function saveToken(token) { try { if (token) localStorage.setItem(TOKEN_KEY, token); else localStorage.removeItem(TOKEN_KEY); } catch { /* Session remains available in memory. */ } }

export function AuthProvider({ children }) {
  const [token, setToken] = useState(storedToken);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState('');
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (token) {
      apiGetMe(token).then(data => {
        if (!cancelled) setUser(data);
      }).catch(() => {
        if (!cancelled) { saveToken(null); setToken(null); setUser(null); }
      }).finally(() => { if (!cancelled) setIsLoading(false); });
    } else {
      Promise.resolve().then(() => { if (!cancelled) setIsLoading(false); });
    }
    return () => { cancelled = true; };
  }, [token]);

  const handleAuthSuccess = (data) => {
    saveToken(data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    setIsAuthModalOpen(false);
    setAuthModalReason('');
  };

  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    handleAuthSuccess(data);
    return data;
  };

  const register = async (email, password, fullName) => {
    const data = await apiRegister(email, password, fullName);
    handleAuthSuccess(data);
    return data;
  };

  const logout = () => {
    saveToken(null);
    setToken(null);
    setUser(null);
    setIsUsageModalOpen(false);
  };

  const openAuthModal = (reason = '') => {
    setAuthModalReason(reason);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalReason('');
  };

  const openUsageModal = () => {
    setIsUsageModalOpen(true);
  };

  const closeUsageModal = () => {
    setIsUsageModalOpen(false);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    isAuthModalOpen,
    authModalReason,
    openAuthModal,
    closeAuthModal,
    isUsageModalOpen,
    openUsageModal,
    closeUsageModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

