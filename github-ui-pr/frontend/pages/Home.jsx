import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { getAuthHeaders } from '../utils/auth';

const Home = () => {
  const [prUrl, setPrUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prUrl.trim()) return;

    setLoading(true);

    try {
      const response = await fetch('/api/review/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ pr_url: prUrl }),
        credentials: 'same-origin'
      });

      if (response.ok) {
        const reviewData = await response.json();
        navigate('/review', { state: { reviewData } });
      } else {
        const error = await response.text();
        alert('Error: ' + error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1>GitHub PR Review Agent</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {user.avatar_url && (
                <img
                  src={user.avatar_url}
                  alt={user.login}
                  style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                />
              )}
              <span>Welcome, {user.name || user.login}!</span>
            </div>
          )}
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <h2>Review a Pull Request</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="pr_url" style={{ display: 'block', marginBottom: '10px' }}>
            GitHub PR URL:
          </label>
          <input
            type="text"
            id="pr_url"
            value={prUrl}
            onChange={(e) => setPrUrl(e.target.value)}
            placeholder="https://github.com/owner/repo/pull/123"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            required
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !prUrl.trim()}
          style={{
            background: loading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Analyzing...' : 'Analyze PR'}
        </button>
      </form>

      {loading && (
        <div style={{ marginTop: '20px', color: '#666' }}>
          <p>🔍 Fetching PR data...</p>
          <p>🤖 Running AI analysis...</p>
          <p>📝 Generating review comments...</p>
          <p><em>This may take 1-3 minutes depending on PR size.</em></p>
        </div>
      )}
    </div>
  );
};

export default Home;