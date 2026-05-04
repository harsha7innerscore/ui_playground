import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { parsePrUrl } from '../src/services/github-api';
import { reviewPR } from '../src/services/claude-api';

const Home = () => {
  const [prUrl, setPrUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ type: '', message: '' });
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prUrl.trim()) return;

    setLoading(true);
    setProgress({ type: 'start', message: 'Starting PR analysis...' });

    try {
      // Parse PR URL
      const { owner, repo, prNumber } = parsePrUrl(prUrl);

      setProgress({ type: 'parsing', message: `Parsed PR: ${owner}/${repo}#${prNumber}` });

      // Start PR review with progress tracking
      const result = await reviewPR(owner, repo, prNumber, token, (progressUpdate) => {
        switch (progressUpdate.type) {
          case 'iteration':
            setProgress({
              type: 'iteration',
              message: `Analysis iteration ${progressUpdate.iteration}...`
            });
            break;
          case 'tool_call':
            setProgress({
              type: 'tool_call',
              message: `Calling ${progressUpdate.toolName}...`
            });
            break;
          case 'message':
            setProgress({
              type: 'message',
              message: progressUpdate.message
            });
            break;
          case 'complete':
            setProgress({
              type: 'complete',
              message: 'Review analysis completed!'
            });
            break;
          case 'error':
            setProgress({
              type: 'error',
              message: `Error: ${progressUpdate.error}`
            });
            break;
        }
      });

      if (result.success) {
        // For now, just show success and navigate back
        // In a real implementation, you'd want to extract the review data
        // from Claude's final response and format it for the Review component
        alert('Review completed successfully! (Integration with Review page coming soon)');
        console.log('Review result:', result);

        // Navigate to review page with mock data for now
        const mockReviewData = {
          owner,
          repo,
          pr_number: prNumber,
          summary: result.finalMessage || 'Review completed successfully',
          comments: [], // Would extract from Claude's response
          total_files: 0,
          total_comments: 0
        };

        navigate('/review', { state: { reviewData: mockReviewData } });
      } else {
        alert(`Review failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error analyzing PR:', error);
      alert(`Error: ${error.message}`);
      setProgress({ type: 'error', message: `Error: ${error.message}` });
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
              {progress.message || 'Starting analysis...'}
            </div>
            {progress.type === 'error' && (
              <div className="loading-step" style={{ color: 'red' }}>
                ❌ {progress.message}
              </div>
            )}
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