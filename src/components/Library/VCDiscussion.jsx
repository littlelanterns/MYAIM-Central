import React, { useState, useEffect } from 'react';
import VCCommentForm from './VCCommentForm';
import VCCommentThread from './VCCommentThread';
import VCReportModal from './VCReportModal';
import { VCAutoModerator } from './VCAutoModerator';
import './Library.css';

const VCDiscussion = ({ 
  tutorialId,
  user,
  onCommentCountChange 
}) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, mostReplies
  const [error, setError] = useState('');
  const [reportModal, setReportModal] = useState({ 
    isOpen: false, 
    commentId: null 
  });

  useEffect(() => {
    if (tutorialId) {
      loadComments();
    }
  }, [tutorialId, sortBy]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const { supabase } = await import('../../lib/supabase');

      // Get all comments for this tutorial with replies
      let query = supabase
        .from('vc_comments')
        .select(`
          *,
          replies:vc_comments!parent_comment_id(
            *
          )
        `)
        .eq('vault_content_id', tutorialId)
        .eq('moderation_status', 'approved')
        .is('parent_comment_id', null);

      // Apply sorting
      switch (sortBy) {
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      const { data, error: queryError } = await query;
      
      if (queryError) throw queryError;

      // Process nested replies recursively
      const processedComments = processNestedReplies(data || []);
      setComments(processedComments);
      
      // Update comment count
      const totalCount = calculateTotalComments(processedComments);
      if (onCommentCountChange) {
        onCommentCountChange(totalCount);
      }

    } catch (err) {
      console.error('Error loading comments:', err);
      setError('Failed to load comments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const processNestedReplies = (comments) => {
    return comments.map(comment => ({
      ...comment,
      replies: comment.replies ? processNestedReplies(comment.replies) : []
    }));
  };

  const calculateTotalComments = (comments) => {
    return comments.reduce((total, comment) => {
      return total + 1 + (comment.replies ? calculateTotalComments(comment.replies) : 0);
    }, 0);
  };

  const handleNewComment = async (commentData) => {
    try {
      const { supabase } = await import('../../lib/supabase');
      
      // Auto-moderate the comment
      const moderationResult = await VCAutoModerator.moderateContent(
        commentData.content,
        commentData.userId
      );

      let moderationStatus = 'approved';
      
      // Set moderation status based on auto-moderation result
      switch (moderationResult.action) {
        case 'immediate_hide':
        case 'auto_hide':
          moderationStatus = 'auto_hidden';
          break;
        case 'flag_for_review':
          moderationStatus = 'flagged';
          break;
        default:
          moderationStatus = 'approved';
      }
      
      // Insert new comment with moderation data
      const { data, error } = await supabase
        .from('vc_comments')
        .insert([{
          vault_content_id: commentData.tutorialId,
          parent_comment_id: commentData.parentCommentId,
          user_id: commentData.userId,
          author_name: commentData.authorName,
          content: commentData.content,
          depth_level: commentData.depth || 0,
          moderation_status: moderationStatus,
          sentiment_score: moderationResult.sentiment_score,
          flagged_keywords: moderationResult.flaggedKeywords
        }])
        .select()
        .single();

      if (error) throw error;

      // Log moderation action if comment was flagged/hidden
      if (moderationStatus !== 'approved') {
        await VCAutoModerator.logModerationAction(
          data.id,
          moderationResult.action,
          `Auto-moderated: ${moderationResult.flags.join(', ')}`,
          true
        );
      }

      // Reload comments to get updated list
      await loadComments();

      // Show user notification if comment was flagged/hidden
      if (moderationStatus !== 'approved') {
        // You might want to show a toast notification here
        console.log('Comment submitted for review due to content guidelines');
      }

    } catch (err) {
      console.error('Error posting comment:', err);
      throw new Error('Failed to post comment. Please try again.');
    }
  };

  const handleEditComment = async ({ commentId, content }) => {
    try {
      const { supabase } = await import('../../lib/supabase');
      
      const { error } = await supabase
        .from('vc_comments')
        .update({ 
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .eq('user_id', user.id); // Ensure user can only edit their own comments

      if (error) throw error;
      
      await loadComments();
    } catch (err) {
      console.error('Error editing comment:', err);
      throw new Error('Failed to edit comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const { supabase } = await import('../../lib/supabase');
      
      // Soft delete by updating moderation status
      const { error } = await supabase
        .from('vc_comments')
        .update({ moderation_status: 'deleted' })
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await loadComments();
    } catch (err) {
      console.error('Error deleting comment:', err);
      // Show error to user but don't throw
    }
  };

  const handleReportComment = (commentId) => {
    setReportModal({ isOpen: true, commentId });
  };

  const handleSubmitReport = async (reportData) => {
    try {
      const { supabase } = await import('../../lib/supabase');
      
      const { error } = await supabase
        .from('vc_comment_reports')
        .insert([{
          comment_id: reportData.commentId,
          reporter_id: reportData.reporterId,
          reason: reportData.reason,
          additional_details: reportData.additionalDetails
        }]);

      if (error) throw error;

      // Optionally show success message or notification
      console.log('Report submitted successfully');

    } catch (err) {
      console.error('Error submitting report:', err);
      throw new Error('Failed to submit report. Please try again.');
    }
  };

  const handleCloseReportModal = () => {
    setReportModal({ isOpen: false, commentId: null });
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
  };

  if (loading) {
    return (
      <div id={`comments-${tutorialId}`} className="vc-discussion">
        <div className="discussion-header">
          <h3>Discussion</h3>
        </div>
        <div className="comments-loading">
          <div className="loading-spinner"></div>
          <p>Loading comments...</p>
        </div>
      </div>
    );
  }

  return (
    <div id={`comments-${tutorialId}`} className="vc-discussion">
      <div className="discussion-header">
        <h3>
          Discussion 
          {comments.length > 0 && (
            <span className="comment-count">
              ({calculateTotalComments(comments)})
            </span>
          )}
        </h3>
        
        {comments.length > 1 && (
          <div className="discussion-controls">
            <select 
              value={sortBy} 
              onChange={(e) => handleSortChange(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="discussion-error">
          {error}
          <button onClick={loadComments}>Try Again</button>
        </div>
      )}

      {/* New Comment Form */}
      <div className="discussion-new-comment">
        <VCCommentForm
          tutorialId={tutorialId}
          user={user}
          onSubmit={handleNewComment}
          placeholder="Share your experience or ask a question..."
        />
      </div>

      {/* Comments List */}
      <div className="discussion-comments">
        {comments.length === 0 ? (
          <div className="no-comments">
            <p>Be the first to start the discussion!</p>
          </div>
        ) : (
          comments.map(comment => (
            <VCCommentThread
              key={comment.id}
              comment={comment}
              user={user}
              onReply={handleNewComment}
              onReport={handleReportComment}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
            />
          ))
        )}
      </div>

      {/* Report Modal */}
      <VCReportModal
        commentId={reportModal.commentId}
        isOpen={reportModal.isOpen}
        onClose={handleCloseReportModal}
        onSubmit={handleSubmitReport}
        user={user}
      />
    </div>
  );
};

export default VCDiscussion;