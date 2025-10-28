import React from 'react';

const ErrorState = ({ message, onRetry }) => {
  return (
    <div className="error-state">
      <div className="error-icon">⚠️</div>
      <p>Error: {message || 'Something went wrong'}</p>
      {onRetry && (
        <button className="retry-button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorState;