import React, { useState } from 'react';
import './Library.css';

const VCReportModal = ({ 
  commentId, 
  isOpen, 
  onClose, 
  onSubmit,
  user
}) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const reportReasons = [
    { value: 'inappropriate_language', label: 'Inappropriate language' },
    { value: 'spam_promotional', label: 'Spam or promotional content' },
    { value: 'harassment_bullying', label: 'Harassment or bullying' },
    { value: 'harmful_advice', label: 'Potentially harmful advice' },
    { value: 'off_topic', label: 'Off-topic or irrelevant' },
    { value: 'other', label: 'Other concern' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason) {
      setError('Please select a reason for reporting');
      return;
    }

    if (reason === 'other' && !details.trim()) {
      setError('Please provide details about your concern');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit({
        commentId,
        reporterId: user.id,
        reason,
        additionalDetails: details.trim() || null
      });

      // Reset form
      setReason('');
      setDetails('');
      onClose();

    } catch (err) {
      console.error('Error submitting report:', err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setDetails('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="vc-report-modal-overlay" onClick={handleClose}>
      <div className="vc-report-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Help Keep Our Community Safe</h3>
          <button 
            className="close-btn"
            onClick={handleClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <div className="modal-content">
          <p className="modal-description">
            We want AIMfM to be a supportive space for all families. 
            What's concerning about this comment?
          </p>
          
          <form onSubmit={handleSubmit} className="report-form">
            <div className="report-reasons">
              {reportReasons.map(option => (
                <label key={option.value} className="reason-option">
                  <input 
                    type="radio" 
                    name="reason" 
                    value={option.value}
                    checked={reason === option.value}
                    onChange={(e) => setReason(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <span className="reason-label">{option.label}</span>
                </label>
              ))}
            </div>
            
            {reason === 'other' && (
              <div className="additional-details">
                <label htmlFor="details">Please describe your concern:</label>
                <textarea
                  id="details"
                  placeholder="Please provide more details about why you're reporting this comment..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  maxLength={500}
                  disabled={isSubmitting}
                />
                <small>{details.length}/500 characters</small>
              </div>
            )}

            {error && (
              <div className="form-error">
                {error}
              </div>
            )}
            
            <div className="modal-actions">
              <button 
                type="submit"
                className="submit-btn primary"
                disabled={isSubmitting || !reason}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
              <button 
                type="button"
                className="cancel-btn secondary"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
        
        <div className="modal-footer">
          <p className="privacy-note">
            <small>
              Your report will be reviewed by our moderation team. 
              Reports are anonymous and help keep our community safe.
            </small>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VCReportModal;