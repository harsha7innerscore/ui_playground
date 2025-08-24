import React from 'react';
import { useAuth, useLoginForm } from '../hooks';

export interface LoginFormProps {
  onLoginSuccess?: () => void;
  onLoginError?: (error: string) => void;
  showForgotPassword?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
  onLoginError,
  showForgotPassword = false,
}) => {
  const { login, isLoading, error, clearError } = useAuth();
  const {
    credentials,
    errors,
    isValid,
    updateField,
    validateForm,
    resetForm,
    clearErrors,
  } = useLoginForm();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    clearError();
    const result = await login(credentials);
    
    if (result.success) {
      resetForm();
      onLoginSuccess?.();
    } else {
      if (result.errors) {
        // Form validation errors are already handled by useLoginForm
      } else {
        onLoginError?.(error || 'Login failed');
      }
    }
  };


  const handleInputChange = (field: 'username' | 'password') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    updateField(field, e.target.value);
  };

  const handleFocus = () => {
    if (error) {
      clearError();
    }
    clearErrors();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-6">
        {error && (
          <div className="bg-red-50 bg-opacity-10 text-red-700 p-4 rounded-xl border border-red-200 border-opacity-20 backdrop-blur-sm w-full">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <div className="relative">
              <input
                id="username"
                type="text"
                value={credentials.username || ''}
                onChange={handleInputChange('username')}
                onFocus={handleFocus}
                placeholder="Username"
                disabled={isLoading}
                className="w-full py-6 px-6 text-md text-gray-800 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-xl placeholder-gray-500 hover:bg-white hover:bg-opacity-30 hover:border-white hover:border-opacity-40 focus:bg-white focus:bg-opacity-30 focus:border-indigo-400 focus:border-opacity-40 focus:ring-4 focus:ring-indigo-100 focus:outline-none disabled:opacity-60 transition-all duration-200"
              />
            </div>
            {errors.username && (
              <p className="text-sm text-red-600 mt-1">{errors.username}</p>
            )}
          </div>

          <div className="flex flex-col">
            <div className="relative">
              <input
                id="password"
                type="password"
                value={credentials.password || ''}
                onChange={handleInputChange('password')}
                onFocus={handleFocus}
                placeholder="Password"
                disabled={isLoading}
                className="w-full py-6 px-6 text-md text-gray-800 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-xl placeholder-gray-500 hover:bg-white hover:bg-opacity-30 hover:border-white hover:border-opacity-40 focus:bg-white focus:bg-opacity-30 focus:border-indigo-400 focus:border-opacity-40 focus:ring-4 focus:ring-indigo-100 focus:outline-none disabled:opacity-60 transition-all duration-200"
              />
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">{errors.password}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {showForgotPassword && (
            <div className="text-right">
              <button
                type="button"
                disabled={isLoading}
                className="text-sm font-medium text-gray-600 p-1 hover:text-gray-800 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={!isValid || isLoading}
            className="w-full py-6 px-6 bg-gray-800 text-white font-semibold text-md rounded-xl hover:bg-gray-700 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-md disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all duration-200"
          >
            {isLoading ? 'Signing in...' : 'Login'}
          </button>
        </div>
      </div>
    </form>
  );
};