import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Review = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reviewData = location.state?.reviewData;

  const [submitting, setSubmitting] = useState(false);

  if (!reviewData) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <p>No review data found</p>
        <button onClick={() => navigate('/home')}>Go Back</button>
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

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#dc3545';
      case 'warning': return '#ffc107';
      default: return '#28a745';
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '50px auto', padding: '20px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1>Review Preview</h1>
        <button onClick={() => navigate('/home')}>Back to Home</button>
      </div>

      <div style={{
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h3>PR Summary</h3>
        <p><strong>Repository:</strong> {reviewData.owner}/{reviewData.repo}</p>
        <p><strong>PR Number:</strong> #{reviewData.pr_number}</p>
        <p><strong>Total Files:</strong> {reviewData.total_files}</p>
        <p><strong>Total Comments:</strong> {reviewData.total_comments}</p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3>AI Summary</h3>
        <div style={{
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '15px'
        }}>
          {reviewData.summary}
        </div>
      </div>

      <h3>Review Comments ({reviewData.comments.length})</h3>
      <div style={{ marginBottom: '30px' }}>
        {reviewData.comments.map((comment, index) => (
          <div
            key={index}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              marginBottom: '15px',
              background: 'white'
            }}
          >
            <div style={{
              background: '#f8f9fa',
              padding: '10px 15px',
              borderBottom: '1px solid #ddd',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span><strong>{comment.path}:{comment.line}</strong></span>
              <span
                style={{
                  color: getSeverityColor(comment.severity),
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  fontSize: '12px'
                }}
              >
                {comment.severity || 'normal'}
              </span>
            </div>
            <div style={{ padding: '15px' }}>
              {comment.body}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h3>Actions</h3>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button
            onClick={() => handleSubmit('COMMENT')}
            disabled={submitting}
            style={{
              background: '#28a745',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? 'Submitting...' : 'Post Review'}
          </button>

          <button
            onClick={handleRegenerate}
            disabled={submitting}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Regenerate
          </button>

          <button
            onClick={() => navigate('/home')}
            disabled={submitting}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Review;