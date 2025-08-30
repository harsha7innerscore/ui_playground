// Types for login microfrontend integration
interface User {
  userId?: number;
  userName?: string;
  email?: string;
  roleId?: number;
  roleName?: string;
}

interface LoginMicrofrontendAPI {
  // Configuration
  configure: (config: any) => void;
  
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
  render: (containerId: string, config?: any) => void;
  unmount: () => void;
}

// Augment the window interface
interface Window {
  // For the microfrontend integration
  LoginMicrofrontend?: LoginMicrofrontendAPI;
  
  // React and ReactDOM needed for the microfrontend
  React?: typeof import('react');
  ReactDOM?: typeof import('react-dom');
}