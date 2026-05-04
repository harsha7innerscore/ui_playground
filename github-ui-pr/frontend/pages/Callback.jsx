import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import axios from 'axios';

const Callback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const oauthError = searchParams.get('error');

    if (oauthError) {
      console.error('OAuth error:', oauthError);
      setError('OAuth authorization failed');
      setLoading(false);
      return;
    }

    if (!code) {
      console.error('No authorization code received');
      setError('No authorization code received');
      setLoading(false);
      return;
    }

    // Send code to backend for token exchange
    console.log('Sending authorization code to backend:', code);

    axios.post('/auth/callback', { code })
      .then(response => {
        console.log('Backend response:', response.data);
        if (response.data.access_token) {
          // Use AuthContext login method
          login(response.data.user, response.data.access_token);
          navigate('/home');
        } else {
          throw new Error('No access token received');
        }
      })
      .catch(error => {
        console.error('Auth callback error:', error);
        console.error('Error response:', error.response?.data);
        const errorMsg = error.response?.data?.detail || error.message || 'Authentication failed';
        setError(`Authentication failed: ${errorMsg}`);
        setLoading(false);
      });
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>
        <button onClick={() => navigate('/login')}>Try Again</button>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh'
    }}>
      <div>Processing authentication...</div>
    </div>
  );
};

export default Callback;