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
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">GitHub PR Review Agent</h1>
        <div className="user-info">
          {user && (
            <div className="user-details">
              {user.avatar_url && (
                <img
                  src={user.avatar_url}
                  alt={user.login}
                  className="user-avatar"
                />
              )}
              <span>Welcome, {user.name || user.login}!</span>
            </div>
          )}
          <button onClick={handleLogout} className="btn btn-secondary btn-sm">
            Logout
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="mb-0">Review a Pull Request</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="pr_url" className="form-label">
                GitHub PR URL:
              </label>
              <input
                type="text"
                id="pr_url"
                value={prUrl}
                onChange={(e) => setPrUrl(e.target.value)}
                placeholder="https://github.com/owner/repo/pull/123"
                className="form-input"
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !prUrl.trim()}
              className={`btn btn-lg ${loading ? 'btn-secondary' : 'btn-success'}`}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                    <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
                  </svg>
                  Analyze PR
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {loading && (
        <div className="loading-container">
          <h3 className="mb-3">Analyzing Pull Request</h3>
          <div className="loading-steps">
            <div className="loading-step">
              <div className="loading-spinner"></div>
              Fetching PR data...
            </div>
            <div className="loading-step">
              <div className="loading-spinner"></div>
              Running AI analysis...
            </div>
            <div className="loading-step">
              <div className="loading-spinner"></div>
              Generating review comments...
            </div>
            <p className="text-muted mt-3">
              <em>This may take 1-3 minutes depending on PR size.</em>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;