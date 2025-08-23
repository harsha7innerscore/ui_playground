export interface LoginCredentials {
  username?: string;
  password?: string;
}

export interface ModulePermissions {
  [key: string]: boolean;
}

export interface AccessControl {
  module?: string;
  permissions?: ModulePermissions;
}

export interface User {
  userId?: number;
  uuid?: string;
  userName?: string;
  email?: string;
  roleId?: number;
  roleKey?: string;
  roleName?: string;
  accessControl?: AccessControl[];
}

export interface AuthTokens {
  jwtToken?: string;
  expiresIn?: number;
}

export interface AuthResponse {
  message?: string;
  data?: User;
  jwtToken?: string;
  expiresIn?: number;
}

export interface AuthErrorResponse {
  message?: string;
}

export interface LoginState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface FormValidationErrors {
  email?: string;
  password?: string;
  general?: string;
}

export interface ApiError {
  message: string;
  code?: string | number;
  field?: string;
}

export enum AuthEvents {
  LOGIN_SUCCESS = 'onLoginSuccess',
  LOGIN_ERROR = 'onLoginError',
  LOGOUT = 'onLogout',
  TOKEN_REFRESH = 'onTokenRefresh',
  SESSION_EXPIRED = 'onSessionExpired'
}

export interface MicrofrontendConfig {
  apiGateway: string;
  environment: 'dev' | 'staging' | 'prod';
  branding?: {
    logo?: string;
    primaryColor?: string;
    companyName?: string;
  };
  features?: {
    rememberMe?: boolean;
    socialLogin?: boolean;
    passwordReset?: boolean;
  };
}

export interface AuthEventPayload {
  user?: User;
  error?: ApiError;
  tokens?: AuthTokens;
}

export type AuthEventHandler = (event: AuthEvents, payload?: AuthEventPayload) => void;