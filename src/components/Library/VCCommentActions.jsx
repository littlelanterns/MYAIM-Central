import React, { useState } from 'react';
import './Library.css';

const VCCommentActions = ({ 
  commentId,
  user,
  canReply = true,
  onReply,
  onReport,
  onEdit,
  onDelete,
  isAuthor = false,
  isAdmin = false
}) => {
  const [showActions, setShowActions] = useState(false);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - commentTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return commentTime.toLocaleDateString();
  };

  const handleReply = () => {
    if (onReply) onReply();
  };

  const handleReport = () => {
    if (onReport) onReport(commentId);
  };

  const handleEdit = () => {
    if (onEdit) onEdit();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      if (onDelete) onDelete();
    }
  };

  return (
    <div className="vc-comment-actions">
      <div className="primary-actions">
        {user?.id && canReply && (
          <button 
            className="action-btn reply-btn"
            onClick={handleReply}
            title="Reply to this comment"
          >
            Reply
          </button>
        )}
        
        {user?.id && !isAuthor && (
          <button 
            className="action-btn report-btn"
            onClick={handleReport}
            title="Report this comment"
          >
            Report
          </button>
        )}

        {isAuthor && (
          <>
            <button 
              className="action-btn edit-btn"
              onClick={handleEdit}
              title="Edit your comment"
            >
              Edit
            </button>
            <button 
              className="action-btn delete-btn"
              onClick={handleDelete}
              title="Delete your comment"
            >
              Delete
            </button>
          </>
        )}

        {isAdmin && !isAuthor && (
          <div className="admin-actions">
            <button className="action-btn admin-btn">
              Moderate
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VCCommentActions;