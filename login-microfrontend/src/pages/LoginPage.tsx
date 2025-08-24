import React from 'react';
import { LoginForm } from '../components';
import { useAuth } from '../hooks';

export interface LoginPageProps {
  onLoginSuccess?: () => void;
  onLoginError?: (error: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onLoginError,
}) => {
  const { isAuthenticated } = useAuth();

  // If already authenticated, show success message or redirect
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 text-center">
            <div className="flex flex-col gap-4">
              <h1 className="text-2xl font-bold text-green-500">
                Welcome Back!
              </h1>
              <p className="text-gray-600">
                You are already signed in.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen w-screen flex items-center justify-center relative"
      style={{
        background: 'linear-gradient(135deg, #a8e6cf 0%, #dcedc8 50%, #f8ffd6 100%)',
      }}
    >
      {/* Background pattern */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='3'/%3E%3Ccircle cx='53' cy='53' r='3'/%3E%3Ccircle cx='23' cy='43' r='2'/%3E%3Ccircle cx='37' cy='17' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      <div className="flex flex-col gap-12 relative z-10">
        {/* Coschool Branding - Outside the card */}
        <div className="flex flex-col gap-6 text-center">
          <div className="w-16 h-16 bg-white bg-opacity-40 backdrop-blur-sm rounded-2xl border border-white border-opacity-30 flex items-center justify-center shadow-lg mx-auto">
            <div className="text-xl font-bold text-gray-700">
              C
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Coschool
          </h1>
        </div>

        {/* Login Card - Centered */}
        <div className="bg-white bg-opacity-25 backdrop-blur-md rounded-3xl border border-white border-opacity-30 shadow-2xl p-12 relative max-w-sm w-full mx-auto">
          {/* Gradient overlay */}
          <div 
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)',
            }}
          />
          
          <div className="flex flex-col gap-8 relative z-20">
            {/* Login Form */}
            <div>
              <LoginForm
                onLoginSuccess={onLoginSuccess}
                onLoginError={onLoginError}
                showForgotPassword={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};