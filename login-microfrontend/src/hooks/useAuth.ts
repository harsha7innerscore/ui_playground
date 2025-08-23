import { useState, useEffect, useCallback } from 'react';
import {
  getAuthState,
  subscribeToStateChanges,
  login as authLogin,
  logout as authLogout,
  getCurrentUser,
  isAuthenticated,
  isLoading,
  getError,
  clearError,
} from '../services/authPresenter';
import type { LoginCredentials, User, FormValidationErrors } from '../types';

export interface UseAuthReturn {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; errors?: FormValidationErrors }>;
  logout: () => void;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [state, setState] = useState(() => getAuthState());

  useEffect(() => {
    // Subscribe to state changes
    const unsubscribe = subscribeToStateChanges(() => {
      setState(getAuthState());
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    return await authLogin(credentials);
  }, []);

  const logout = useCallback(() => {
    authLogout();
  }, []);

  const handleClearError = useCallback(() => {
    clearError();
  }, []);

  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    logout,
    clearError: handleClearError,
  };
};