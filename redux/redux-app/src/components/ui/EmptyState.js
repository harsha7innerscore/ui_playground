import React from 'react';

const EmptyState = ({ message }) => {
  return (
    <div className="empty-state">
      <div className="empty-icon">📂</div>
      <p>{message || 'No data available'}</p>
    </div>
  );
};

export default EmptyState;