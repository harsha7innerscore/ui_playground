import type { MicrofrontendConfig, User } from '../types';
import { logout as authLogout, isAuthenticated as checkIsAuthenticated, getCurrentUser as getUser } from '../services/authPresenter';

export interface MicrofrontendAPI {
  // Configuration
  configure: (config: MicrofrontendConfig) => void;
  
  // Authentication methods
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // State access
  isAuthenticated: () => boolean;
  getCurrentUser: () => User | null;
  
  // Event handling for parent applications
  onLoginSuccess: (callback: (user: User) => void) => () => void;
  onLoginError: (callback: (error: string) => void) => () => void;
  onLogout: (callback: () => void) => () => void;
  
  // UI methods
  render: (containerId: string, config?: Partial<MicrofrontendConfig>) => void;
  unmount: () => void;
}

declare global {
  interface Window {
    LoginMicrofrontend: MicrofrontendAPI;
  }
}

// Event callbacks storage
const eventCallbacks = {
  onLoginSuccess: [] as ((user: User) => void)[],
  onLoginError: [] as ((error: string) => void)[],
  onLogout: [] as (() => void)[],
};

// Microfrontend API implementation
export const createMicrofrontendAPI = (): MicrofrontendAPI => {
  let currentConfig: MicrofrontendConfig | null = null;
  let mountedContainer: HTMLElement | null = null;

  return {
    configure: (config: MicrofrontendConfig) => {
      currentConfig = config;
      
      // Configure HTTP service with new config
      import('../services/http').then(({ httpService }) => {
        httpService.setConfig(config);
      });
    },

    login: async (username: string, password: string): Promise<boolean> => {
      const { login } = await import('../services/authPresenter');
      const result = await login({ username, password });
      
      if (result.success) {
        const { getCurrentUser } = await import('../services/authPresenter');
        const user = getCurrentUser();
        if (user) {
          // Notify parent application
          eventCallbacks.onLoginSuccess.forEach(callback => callback(user));
        }
      } else {
        const errorMessage = result.errors?.general || 'Login failed';
        eventCallbacks.onLoginError.forEach(callback => callback(errorMessage));
      }
      
      return result.success;
    },

    logout: () => {
      authLogout();
      
      // Notify parent application
      eventCallbacks.onLogout.forEach(callback => callback());
    },

    isAuthenticated: () => {
      return checkIsAuthenticated();
    },

    getCurrentUser: () => {
      return getUser();
    },

    onLoginSuccess: (callback: (user: User) => void) => {
      eventCallbacks.onLoginSuccess.push(callback);
      
      // Return unsubscribe function
      return () => {
        const index = eventCallbacks.onLoginSuccess.indexOf(callback);
        if (index > -1) {
          eventCallbacks.onLoginSuccess.splice(index, 1);
        }
      };
    },

    onLoginError: (callback: (error: string) => void) => {
      eventCallbacks.onLoginError.push(callback);
      
      return () => {
        const index = eventCallbacks.onLoginError.indexOf(callback);
        if (index > -1) {
          eventCallbacks.onLoginError.splice(index, 1);
        }
      };
    },

    onLogout: (callback: () => void) => {
      eventCallbacks.onLogout.push(callback);
      
      return () => {
        const index = eventCallbacks.onLogout.indexOf(callback);
        if (index > -1) {
          eventCallbacks.onLogout.splice(index, 1);
        }
      };
    },

    render: async (containerId: string, config?: Partial<MicrofrontendConfig>) => {
      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error(`Container with id "${containerId}" not found`);
      }

      // Update configuration if provided
      if (config && currentConfig) {
        currentConfig = { ...currentConfig, ...config };
      }

      // Dynamically import React and ReactDOM
      const React = await import('react');
      const ReactDOM = await import('react-dom/client');
      const App = (await import('../App')).default;

      // Create root and render
      const root = ReactDOM.createRoot(container);
      root.render(
        React.createElement(
          React.StrictMode,
          {},
          React.createElement(App)
        )
      );

      mountedContainer = container;
    },

    unmount: async () => {
      if (mountedContainer) {
        const ReactDOM = await import('react-dom/client');
        const root = ReactDOM.createRoot(mountedContainer);
        root.unmount();
        mountedContainer = null;
      }
    },
  };
};

// Initialize and expose the API
export const initializeMicrofrontend = () => {
  if (typeof window !== 'undefined') {
    window.LoginMicrofrontend = createMicrofrontendAPI();
  }
};

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  initializeMicrofrontend();
}