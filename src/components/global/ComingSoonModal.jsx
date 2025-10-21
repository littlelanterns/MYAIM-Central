// src/components/global/ComingSoonModal.jsx - Coming Soon modal for features in development
import React from 'react';
import './ComingSoonModal.css';

export function ComingSoonModal({
  isOpen,
  onClose,
  featureName = 'This Feature',
  message = 'We are working on this feature and we are so excited to offer it soon!!!'
}) {
  if (!isOpen) return null;

  return (
    <div className="coming-soon-overlay" onClick={onClose}>
      <div className="coming-soon-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header with gradient background */}
        <div className="coming-soon-header">
          <div className="coming-soon-icon">✨</div>
          <h2 className="coming-soon-title">Coming Soon!</h2>
          <p className="coming-soon-feature">{featureName}</p>
        </div>

        {/* Content */}
        <div className="coming-soon-content">
          <p className="coming-soon-message">{message}</p>

          <div className="coming-soon-tip">
            <p>
              💡 <strong>Did you know?</strong> We're constantly adding new features to make your family's life easier and more organized!
            </p>
          </div>

          {/* Close Button */}
          <button onClick={onClose} className="coming-soon-button">
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
