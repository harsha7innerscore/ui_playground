import React, { useState, useEffect } from 'react';

// Floating Particles Component
const FloatingParticles: React.FC = () => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="floating-particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </>
  );
};

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
      console.log('Login successful with:', { email, password });

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-950 via-charcoal-900 to-charcoal-800 flex">
      {/* Left Panel - Editorial Design Element */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-terracotta-600/20 via-transparent to-golden-600/10"></div>
        <div className="absolute inset-0 bg-noise opacity-[0.02]"></div>

        {/* Floating Particles */}
        <FloatingParticles />

        {/* Floating Geometric Elements */}
        <div className="absolute top-20 left-16 w-32 h-32 border-2 border-golden-500/20 rounded-luxury animate-float"></div>
        <div className="absolute bottom-32 right-20 w-20 h-20 bg-gradient-warm rounded-full opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-1 h-24 bg-gradient-to-b from-terracotta-500/40 to-transparent"></div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col justify-center pl-16 pr-12 py-16">
          {/* Brand Mark */}
          <div className="mb-16">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-warm rounded-editorial flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-sm"></div>
              </div>
              <h1 className="font-display text-2xl text-cream-50 font-medium">Luxoria</h1>
            </div>
            <div className="w-16 h-px bg-gradient-to-r from-golden-500 to-transparent"></div>
          </div>

          {/* Editorial Quote */}
          <div className="space-y-8">
            <blockquote className="space-y-6">
              <p className="font-display text-4xl lg:text-5xl text-cream-50 leading-tight">
                "Where sophisticated design meets seamless experience"
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-px bg-golden-500"></div>
                <cite className="font-body text-sm text-cream-300 not-italic tracking-wider uppercase">
                  Editorial Team
                </cite>
              </div>
            </blockquote>

            {/* Decorative Stats */}
            <div className="mt-16 space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <div className="text-3xl font-display text-golden-400">150K+</div>
                  <div className="text-sm text-cream-400 tracking-wide">Active Members</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-display text-golden-400">99.9%</div>
                  <div className="text-sm text-cream-400 tracking-wide">Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in-right">
          <div className="bg-green-500 text-white px-6 py-4 rounded-luxury shadow-luxury-lg flex items-center space-x-3">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-body font-medium">Successfully logged in!</span>
          </div>
        </div>
      )}

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-slide-up">
          {/* Mobile Brand */}
          <div className="lg:hidden text-center mb-12">
            <div className="inline-flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-warm rounded-editorial flex items-center justify-center">
                <div className="w-5 h-5 bg-white rounded-sm"></div>
              </div>
              <h1 className="font-display text-2xl text-cream-50 font-medium">Luxoria</h1>
            </div>
          </div>

          {/* Welcome Header */}
          <div className="text-center space-y-4">
            <h2 className="font-display text-3xl lg:text-4xl text-cream-50 font-medium">
              Welcome Back
            </h2>
            <p className="font-body text-base text-cream-300 leading-relaxed">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className={`block font-body text-sm font-medium transition-colors duration-300 ${
                    errors.email
                      ? 'text-red-400'
                      : focusedField === 'email'
                      ? 'text-terracotta-400'
                      : 'text-cream-300'
                  }`}
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) {
                        setErrors((prev) => ({ ...prev, email: undefined }));
                      }
                    }}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className={`input-field text-charcoal-800 font-body placeholder-charcoal-400 ${
                      errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''
                    }`}
                    placeholder="Enter your email"
                  />
                  <div className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${
                    errors.email
                      ? 'w-full bg-red-400 opacity-100'
                      : focusedField === 'email'
                      ? 'w-full bg-gradient-warm opacity-100'
                      : 'w-0 opacity-0'
                  }`}></div>
                  {errors.email && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p className="text-sm text-red-400 font-body animate-slide-up">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className={`block font-body text-sm font-medium transition-colors duration-300 ${
                    errors.password
                      ? 'text-red-400'
                      : focusedField === 'password'
                      ? 'text-terracotta-400'
                      : 'text-cream-300'
                  }`}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors((prev) => ({ ...prev, password: undefined }));
                      }
                    }}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className={`input-field text-charcoal-800 font-body placeholder-charcoal-400 ${
                      errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''
                    }`}
                    placeholder="Enter your password"
                  />
                  <div className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${
                    errors.password
                      ? 'w-full bg-red-400 opacity-100'
                      : focusedField === 'password'
                      ? 'w-full bg-gradient-warm opacity-100'
                      : 'w-0 opacity-0'
                  }`}></div>
                  {errors.password && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                {errors.password && (
                  <p className="text-sm text-red-400 font-body animate-slide-up">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-2 border-charcoal-300 text-terracotta-500 focus:ring-terracotta-500 focus:ring-2 focus:ring-offset-0"
                />
                <span className="font-body text-sm text-cream-300 group-hover:text-cream-200 transition-colors duration-300">
                  Remember me
                </span>
              </label>
              <a
                href="#"
                className="font-body text-sm text-terracotta-400 hover:text-terracotta-300 transition-colors duration-300 hover:underline"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full btn-primary font-body text-base py-4 relative overflow-hidden ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              <span className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                Sign In
              </span>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-charcoal-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-charcoal-900 font-body text-cream-400">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="social-btn shine-effect flex items-center justify-center px-4 py-3 border-2 border-charcoal-700 hover:border-charcoal-600 rounded-editorial transition-all duration-300 hover:bg-charcoal-800 group"
              >
                <svg className="w-5 h-5 text-cream-300 group-hover:text-cream-200" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="ml-2 font-body text-sm text-cream-300 group-hover:text-cream-200">Google</span>
              </button>
              <button
                type="button"
                className="social-btn shine-effect flex items-center justify-center px-4 py-3 border-2 border-charcoal-700 hover:border-charcoal-600 rounded-editorial transition-all duration-300 hover:bg-charcoal-800 group"
              >
                <svg className="w-5 h-5 text-cream-300 group-hover:text-cream-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="ml-2 font-body text-sm text-cream-300 group-hover:text-cream-200">Facebook</span>
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-4">
              <p className="font-body text-sm text-cream-400">
                Don't have an account?{' '}
                <a
                  href="#"
                  className="text-terracotta-400 hover:text-terracotta-300 transition-colors duration-300 font-medium hover:underline"
                >
                  Sign up now
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
