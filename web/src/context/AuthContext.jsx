import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'authenticated' | 'unauthenticated'
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    authService.me().then((existingUser) => {
      if (cancelled) return;
      setUser(existingUser);
      setStatus(existingUser ? 'authenticated' : 'unauthenticated');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const loggedInUser = await authService.login(email, password);
      setUser(loggedInUser);
      setStatus('authenticated');
      return loggedInUser;
    } catch (err) {
      setError(err.message || 'Unable to sign in.');
      throw err;
    }
  }, []);

  const signup = useCallback(async (userData, remember = true) => {
    setError(null);
    try {
      const newUser = await authService.signup(userData, remember);
      setUser(newUser);
      setStatus('authenticated');
      return newUser;
    } catch (err) {
      setError(err.message || 'Unable to create account.');
      throw err;
    }
  }, []);

  const resetPassword = useCallback(async (email) => {
    setError(null);
    return await authService.resetPassword(email);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      error,
      login,
      signup,
      resetPassword,
      logout,
      isAuthenticated: status === 'authenticated',
    }),
    [user, status, error, login, signup, resetPassword, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
