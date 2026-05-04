import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuthHeaders } from '../utils/auth';

const Review = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reviewData = location.state?.reviewData;

  const [submitting, setSubmitting] = useState(false);

  if (!reviewData) {
    return (
      <div className="page-container-narrow">
        <div className="card">
          <div className="card-body text-center">
            <h3 className="mb-3">No review data found</h3>
            <p className="text-muted mb-4">Please start a new review from the home page.</p>
            <button onClick={() => navigate('/home')} className="btn btn-primary">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (event = 'COMMENT') => {
    setSubmitting(true);

    try {
      const response = await fetch('/api/review/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          owner: reviewData.owner,
          repo: reviewData.repo,
          pr_number: reviewData.pr_number,
          comments: reviewData.comments,
          summary: reviewData.summary,
          event: event
        }),
        credentials: 'same-origin'
      });

      if (response.ok) {
        const result = await response.json();
        alert('Review submitted successfully!');
        navigate('/home');
      } else {
        const error = await response.text();
        alert('Error submitting review: ' + error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegenerate = () => {
    navigate('/home');
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'critical': return 'severity-critical';
      case 'warning': return 'severity-warning';
      default: return 'severity-normal';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Review Preview</h1>
        <button onClick={() => navigate('/home')} className="btn btn-secondary">
          Back to Home
        </button>
      </div>

      <div className="review-summary">
        <h3>PR Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-label">Repository</div>
            <div className="summary-value">{reviewData.owner}/{reviewData.repo}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">PR Number</div>
            <div className="summary-value">#{reviewData.pr_number}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Total Files</div>
            <div className="summary-value">{reviewData.total_files}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Total Comments</div>
            <div className="summary-value">{reviewData.total_comments}</div>
          </div>
        </div>
      </div>

      <div className="card mb-5">
        <div className="card-header">
          <h3 className="mb-0">AI Summary</h3>
        </div>
        <div className="card-body">
          {reviewData.summary}
        </div>
      </div>

      <h3 className="mb-4">Review Comments ({reviewData.comments.length})</h3>
      <div className="comment-list">
        {reviewData.comments.map((comment, index) => (
          <div key={index} className="comment-item">
            <div className="comment-header">
              <span className="comment-location">{comment.path}:{comment.line}</span>
              <span className={`comment-severity ${getSeverityClass(comment.severity)}`}>
                {comment.severity || 'normal'}
              </span>
            </div>
            <div className="comment-body">
              {comment.body}
            </div>
          </div>
        ))}
      </div>

      <div className="actions-section">
        <h3 className="actions-title">Actions</h3>
        <div className="actions-buttons">
          <button
            onClick={() => handleSubmit('COMMENT')}
            disabled={submitting}
            className="btn btn-success btn-lg"
          >
            {submitting ? (
              <>
                <div className="loading-spinner"></div>
                Submitting...
              </>
            ) : (
              <>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697ZM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757Zm3.436-.586L16 11.801V4.697l-5.803 3.546Z"/>
                </svg>
                Post Review
              </>
            )}
          </button>

          <button
            onClick={handleRegenerate}
            disabled={submitting}
            className="btn btn-secondary btn-lg"
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
              <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
            </svg>
            Regenerate
          </button>

          <button
            onClick={() => navigate('/home')}
            disabled={submitting}
            className="btn btn-danger btn-lg"
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
            </svg>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Review;