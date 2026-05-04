import React from 'react';

const Login = () => {
  const handleLogin = () => {
    const clientId = process.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/callback`;
    const scope = 'read:user user:email repo';

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;

    console.log('GitHub OAuth URL:', githubAuthUrl);
    console.log('Client ID:', clientId);
    console.log('Redirect URI:', redirectUri);

    if (!clientId) {
      alert('GitHub Client ID not configured. Check environment variables.');
      return;
    }

    window.location.href = githubAuthUrl;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>GitHub PR Review Agent</h1>
      <p>AI-powered code review with Claude</p>

      <button
        onClick={handleLogin}
        style={{
          background: '#24292e',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '6px',
          fontSize: '16px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Login with GitHub
      </button>
    </div>
  );
};

export default Login;