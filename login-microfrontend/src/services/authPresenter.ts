import httpService from './http';
import type { 
  LoginCredentials, 
  AuthResponse, 
  User, 
  LoginState,
  FormValidationErrors
} from '../types';

// State management
let authState: LoginState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// State change listeners for React hooks
const stateChangeListeners: (() => void)[] = [];

// Helper functions
const updateState = (updates: Partial<LoginState>): void => {
  authState = { ...authState, ...updates };
  // Notify React hooks about state changes
  stateChangeListeners.forEach(listener => listener());
};

const storeAuthData = (user: User, jwtToken: string, expiresIn?: number): void => {
  try {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('authToken', jwtToken);
    if (expiresIn) {
      localStorage.setItem('tokenExpiry', (Date.now() + (expiresIn * 1000)).toString());
    }
    
    httpService.setAuthToken(jwtToken);
  } catch (error) {
    console.error('Error storing auth data:', error);
  }
};

const clearStoredAuth = (): void => {
  localStorage.removeItem('user');
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenExpiry');
  httpService.setAuthToken();
};

const initializeFromStorage = (): void => {
  try {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('authToken');
    const storedExpiry = localStorage.getItem('tokenExpiry');

    if (storedUser && storedToken) {
      const user = JSON.parse(storedUser);
      const expiry = storedExpiry ? parseInt(storedExpiry) : 0;
      
      if (Date.now() < expiry) {
        authState = {
          ...authState,
          user,
          tokens: {
            jwtToken: storedToken,
            expiresIn: expiry,
          },
          isAuthenticated: true,
        };
        
        httpService.setAuthToken(storedToken);
      } else {
        clearStoredAuth();
      }
    }
  } catch (error) {
    console.error('Error initializing auth from storage:', error);
    clearStoredAuth();
  }
};

// Public API functions
export const getAuthState = (): LoginState => {
  return { ...authState };
};

export const subscribeToStateChanges = (listener: () => void): (() => void) => {
  stateChangeListeners.push(listener);
  
  // Return unsubscribe function
  return () => {
    const index = stateChangeListeners.indexOf(listener);
    if (index > -1) {
      stateChangeListeners.splice(index, 1);
    }
  };
};

export const validateLoginForm = (credentials: LoginCredentials): FormValidationErrors => {
  const errors: FormValidationErrors = {};

  if (!credentials.username?.trim()) {
    errors.username = 'Username is required';
  }

  if (!credentials.password?.trim()) {
    errors.password = 'Password is required';
  } else if (credentials.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return errors;
};

export const login = async (credentials: LoginCredentials): Promise<{ success: boolean; errors?: FormValidationErrors }> => {
  // Validate form data
  const validationErrors = validateLoginForm(credentials);
  if (Object.keys(validationErrors).length > 0) {
    updateState({ error: 'Please fix the validation errors' });
    return { success: false, errors: validationErrors };
  }

  // Set loading state
  updateState({ isLoading: true, error: null });

  try {
    const response = await httpService.post('/login', {
      username: credentials.username,
      password: credentials.password,
    });

    if (response.success) {
      const authData = response.data as AuthResponse;
      
      if (authData.data && authData.jwtToken) {
        // Store authentication data
        storeAuthData(authData.data, authData.jwtToken, authData.expiresIn);
        
        // Update state
        updateState({
          user: authData.data,
          tokens: {
            jwtToken: authData.jwtToken,
            expiresIn: authData.expiresIn,
          },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return { success: true };
      }
    }

    // Handle API error
    const errorMessage = response.errorMessage || 'Login failed';
    updateState({ 
      isLoading: false, 
      error: errorMessage,
      isAuthenticated: false,
      user: null,
      tokens: null,
    });

    return { success: false, errors: { general: errorMessage } };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    
    updateState({ 
      isLoading: false, 
      error: errorMessage,
      isAuthenticated: false,
      user: null,
      tokens: null,
    });

    return { success: false, errors: { general: errorMessage } };
  }
};

export const logout = (): void => {
  clearStoredAuth();
  
  updateState({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });
};

export const isTokenExpired = (): boolean => {
  const expiry = localStorage.getItem('tokenExpiry');
  if (!expiry) return true;
  
  return Date.now() >= parseInt(expiry);
};

export const getCurrentUser = (): User | null => {
  return authState.user;
};

export const isAuthenticated = (): boolean => {
  return authState.isAuthenticated && !isTokenExpired();
};

export const isLoading = (): boolean => {
  return authState.isLoading;
};

export const getError = (): string | null => {
  return authState.error;
};

export const clearError = (): void => {
  updateState({ error: null });
};

// Initialize on module load
initializeFromStorage();