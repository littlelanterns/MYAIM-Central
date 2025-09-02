import React, { useState } from 'react';
import VCUserAvatar from './VCUserAvatar';
import './Library.css';

const VCCommentForm = ({ 
  tutorialId,
  parentCommentId = null,
  user,
  onSubmit,
  onCancel,
  placeholder = "Share your experience or ask a question...",
  submitText = "Post Comment"
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please enter a comment');
      return;
    }

    if (!user?.id) {
      setError('Please sign in to comment');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit({
        content: content.trim(),
        tutorialId,
        parentCommentId,
        userId: user.id,
        authorName: user.name
      });

      // Clear form on success
      setContent('');
      
      // Call onCancel if it's a reply form
      if (onCancel) {
        onCancel();
      }

    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent('');
    setError('');
    if (onCancel) {
      onCancel();
    }
  };

  if (!user?.id) {
    return (
      <div className="vc-comment-form signin-prompt">
        <p>Please sign in to join the discussion</p>
      </div>
    );
  }

  return (
    <div className={`vc-comment-form ${parentCommentId ? 'reply-form' : 'main-form'}`}>
      <div className="comment-form-header">
        <VCUserAvatar user={user} size="small" showName={false} />
      </div>
      
      <form onSubmit={handleSubmit} className="comment-form-body">
        <div className="form-input-container">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="comment-textarea"
            rows={parentCommentId ? 2 : 3}
            maxLength={2000}
            disabled={isSubmitting}
          />
          <div className="character-count">
            {content.length}/2000
          </div>
        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="submit-btn primary"
          >
            {isSubmitting ? 'Posting...' : submitText}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="cancel-btn secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default VCCommentForm;