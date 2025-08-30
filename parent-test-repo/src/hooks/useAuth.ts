import { useState, useEffect, useCallback } from 'react';

interface User {
  userId?: number;
  userName?: string;
  email?: string;
  roleId?: number;
  roleName?: string;
}

/**
 * Custom hook to handle authentication state across the application
 * Handles:
 * - Loading user from localStorage on init
 * - Syncing user state with localStorage
 * - Login and logout operations
 * - Checking authentication status
 */
export function useAuth() {
  // Initialize user state from localStorage if available
  const [user, setUserState] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      return null;
    }
  });

  // Sync localStorage with user state
  useEffect(() => {
    console.log('Auth state changed, syncing with localStorage:', user);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  // Set user state and sync with localStorage
  const setUser = useCallback((newUser: User | null) => {
    console.log('Setting user:', newUser);
    setUserState(newUser);
  }, []);

  // Logout function that clears everything
  const logout = useCallback(() => {
    console.log('Logout called');
    
    // Clear localStorage
    localStorage.removeItem('currentUser');
    localStorage.clear();
    
    // Clear user state
    setUserState(null);
    
    // Call microfrontend logout if available
    if (window.LoginMicrofrontend) {
      try {
        window.LoginMicrofrontend.logout();
      } catch (error) {
        console.error('Error during microfrontend logout:', error);
      }
    }
    
    console.log('Logout completed, localStorage:', localStorage.getItem('currentUser'));
  }, []);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return user !== null;
  }, [user]);

  return {
    user,
    setUser,
    logout,
    isAuthenticated
  };
}

export default useAuth;