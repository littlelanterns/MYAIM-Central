import React, { useState } from 'react';
import VCUserAvatar from './VCUserAvatar';
import VCCommentActions from './VCCommentActions';
import VCCommentForm from './VCCommentForm';
import './Library.css';

const VCCommentThread = ({ 
  comment,
  user,
  depth = 0,
  maxDepth = 3,
  onReply,
  onReport,
  onEdit,
  onDelete
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

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
    if (depth >= maxDepth) {
      // For deeply nested replies, we might want to show a different UI
      // or limit further nesting
      return;
    }
    setShowReplyForm(true);
  };

  const handleReplySubmit = async (replyData) => {
    try {
      await onReply({
        ...replyData,
        parentCommentId: comment.id,
        depth: depth + 1
      });
      setShowReplyForm(false);
    } catch (error) {
      throw error; // Let the form handle the error display
    }
  };

  const handleCancelReply = () => {
    setShowReplyForm(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleEditSubmit = async (editData) => {
    try {
      await onEdit({
        commentId: comment.id,
        content: editData.content
      });
      setIsEditing(false);
    } catch (error) {
      throw error;
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  const isAuthor = user?.id === comment.user_id;
  const canReply = depth < maxDepth && user?.id;
  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className={`vc-comment-thread depth-${Math.min(depth, maxDepth)}`}>
      <div className="comment-main">
        <div className="comment-avatar">
          <VCUserAvatar 
            user={{ 
              id: comment.user_id, 
              name: comment.author_name,
              avatar_url: comment.avatar_url 
            }} 
            size={depth > 0 ? 'small' : 'medium'}
            showName={false}
          />
        </div>
        
        <div className="comment-body">
          <div className="comment-header">
            <span className="comment-author">{comment.author_name}</span>
            <span className="comment-timestamp">
              {formatTimeAgo(comment.created_at)}
            </span>
            {comment.updated_at !== comment.created_at && (
              <span className="comment-edited">(edited)</span>
            )}
          </div>
          
          <div className="comment-content">
            {isEditing ? (
              <VCCommentForm
                user={user}
                onSubmit={handleEditSubmit}
                onCancel={handleCancelEdit}
                placeholder="Edit your comment..."
                submitText="Save Changes"
              />
            ) : (
              <div className="comment-text">
                {comment.content}
              </div>
            )}
          </div>
          
          {!isEditing && (
            <VCCommentActions
              commentId={comment.id}
              user={user}
              canReply={canReply}
              onReply={handleReply}
              onReport={() => onReport(comment.id)}
              onEdit={handleEdit}
              onDelete={() => onDelete(comment.id)}
              isAuthor={isAuthor}
            />
          )}
        </div>
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div className="comment-reply-form">
          <VCCommentForm
            user={user}
            parentCommentId={comment.id}
            onSubmit={handleReplySubmit}
            onCancel={handleCancelReply}
            placeholder="Write a reply..."
            submitText="Reply"
          />
        </div>
      )}

      {/* Nested Replies */}
      {hasReplies && (
        <div className="comment-replies">
          {/* Toggle replies button for deeply nested comments */}
          {comment.replies.length > 0 && depth > 1 && (
            <button 
              className="toggle-replies-btn"
              onClick={toggleReplies}
            >
              {showReplies ? '−' : '+'} 
              {comment.replies.length} 
              {comment.replies.length === 1 ? ' reply' : ' replies'}
            </button>
          )}
          
          {showReplies && comment.replies.map(reply => (
            <VCCommentThread
              key={reply.id}
              comment={reply}
              user={user}
              depth={depth + 1}
              maxDepth={maxDepth}
              onReply={onReply}
              onReport={onReport}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VCCommentThread;