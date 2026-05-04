import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { authenticateWithDeviceFlow } from '../src/services/github-auth';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [deviceCode, setDeviceCode] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      // Start device flow
      const deviceData = await authenticateWithDeviceFlow();

      setDeviceCode(deviceData);

      // Open GitHub device verification page
      window.open(deviceData.verification_uri, '_blank');

      // Poll for completion
      const result = await deviceData.pollForToken();

      // Login successful
      login(result.user, result.access_token);
      navigate('/home');

    } catch (err) {
      console.error('Device flow error:', err);
      setError(err.message);
      setDeviceCode(null);
    } finally {
      setLoading(false);
    }
  };

  if (deviceCode) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">GitHub Authentication</h1>

          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <h2 style={{ margin: '10px 0', fontSize: '32px', fontFamily: 'monospace', background: '#f6f8fa', padding: '10px', borderRadius: '6px' }}>
              {deviceCode.user_code}
            </h2>

            <p style={{ margin: '15px 0' }}>
              1. Copy the code above
            </p>

            <p style={{ margin: '15px 0' }}>
              2. Go to{' '}
              <a
                href={deviceCode.verification_uri}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0969da', textDecoration: 'none' }}
              >
                {deviceCode.verification_uri}
              </a>
            </p>

            <p style={{ margin: '15px 0' }}>
              3. Enter the code and authorize the app
            </p>

            {loading && (
              <div style={{ margin: '20px 0' }}>
                <div style={{ marginBottom: '10px' }}>Waiting for authorization...</div>
                <div style={{
                  width: '24px',
                  height: '24px',
                  border: '3px solid #f3f3f3',
                  borderTop: '3px solid #0969da',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto'
                }}></div>
              </div>
            )}

            <button
              onClick={() => {
                setDeviceCode(null);
                setLoading(false);
              }}
              style={{ marginTop: '20px', padding: '8px 16px' }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">GitHub PR Review Agent</h1>
        <p className="login-subtitle">AI-powered code review with Claude</p>

        {error && (
          <div style={{
            color: 'red',
            margin: '10px 0',
            padding: '10px',
            background: '#fff5f5',
            border: '1px solid #fed7d7',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="btn btn-github btn-lg"
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          {loading ? 'Starting...' : 'Login with GitHub'}
        </button>
      </div>
    </div>
  );
};

export default Login;