import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import VCUserAvatar from './VCUserAvatar';
import './Library.css';

const ModerationTabs = {
  FLAGGED: 'flagged',
  REPORTED: 'reported', 
  HIDDEN: 'auto_hidden',
  HISTORY: 'history'
};

const VCModerationPanel = () => {
  const [activeTab, setActiveTab] = useState(ModerationTabs.FLAGGED);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    flagged: 0,
    reported: 0,
    hidden: 0
  });

  useEffect(() => {
    loadModerationStats();
    loadComments();
  }, [activeTab]);

  const loadModerationStats = async () => {
    try {
      // Get counts for each tab
      const { data: flaggedData, count: flaggedCount } = await supabase
        .from('vc_comments')
        .select('id', { count: 'exact' })
        .eq('moderation_status', 'flagged');

      const { data: hiddenData, count: hiddenCount } = await supabase
        .from('vc_comments')
        .select('id', { count: 'exact' })
        .eq('moderation_status', 'auto_hidden');

      // Get reported comments count
      const { data: reportedData, count: reportedCount } = await supabase
        .from('vc_comment_reports')
        .select('comment_id', { count: 'exact' });

      setStats({
        flagged: flaggedCount || 0,
        reported: reportedCount || 0,
        hidden: hiddenCount || 0
      });

    } catch (error) {
      console.error('Error loading moderation stats:', error);
    }
  };

  const loadComments = async () => {
    setLoading(true);
    try {
      let query;

      switch (activeTab) {
        case ModerationTabs.FLAGGED:
          query = supabase
            .from('vc_comments')
            .select(`
              *,
              library_items!inner(title, id)
            `)
            .eq('moderation_status', 'flagged')
            .order('created_at', { ascending: false });
          break;

        case ModerationTabs.HIDDEN:
          query = supabase
            .from('vc_comments')
            .select(`
              *,
              library_items!inner(title, id)
            `)
            .eq('moderation_status', 'auto_hidden')
            .order('created_at', { ascending: false });
          break;

        case ModerationTabs.REPORTED:
          query = supabase
            .from('vc_comment_reports')
            .select(`
              *,
              vc_comments!inner(
                *,
                library_items!inner(title, id)
              )
            `)
            .order('created_at', { ascending: false });
          break;

        case ModerationTabs.HISTORY:
          query = supabase
            .from('vc_moderation_log')
            .select(`
              *,
              vc_comments!inner(content, author_name, vault_content_id)
            `)
            .order('created_at', { ascending: false })
            .limit(50);
          break;

        default:
          query = supabase
            .from('vc_comments')
            .select('*')
            .eq('moderation_status', 'flagged');
      }

      const { data, error } = await query;
      if (error) throw error;

      setComments(data || []);

    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const moderationActions = {
    approve: async (commentId, reason = 'manual_review') => {
      try {
        await supabase
          .from('vc_comments')
          .update({ 
            moderation_status: 'approved',
            updated_at: new Date().toISOString()
          })
          .eq('id', commentId);

        await logModerationAction(commentId, 'approve', reason);
        await loadComments();
        await loadModerationStats();

      } catch (error) {
        console.error('Error approving comment:', error);
      }
    },
    
    delete: async (commentId, reason = 'violates_guidelines') => {
      try {
        await supabase
          .from('vc_comments')
          .update({ 
            moderation_status: 'deleted',
            updated_at: new Date().toISOString()
          })
          .eq('id', commentId);

        await logModerationAction(commentId, 'delete', reason);
        await loadComments();
        await loadModerationStats();

      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    },
    
    hide: async (commentId, reason = 'inappropriate_content') => {
      try {
        await supabase
          .from('vc_comments')
          .update({ 
            moderation_status: 'auto_hidden',
            updated_at: new Date().toISOString()
          })
          .eq('id', commentId);

        await logModerationAction(commentId, 'hide', reason);
        await loadComments();
        await loadModerationStats();

      } catch (error) {
        console.error('Error hiding comment:', error);
      }
    },

    restore: async (commentId, reason = 'false_positive') => {
      try {
        await supabase
          .from('vc_comments')
          .update({ 
            moderation_status: 'approved',
            updated_at: new Date().toISOString()
          })
          .eq('id', commentId);

        await logModerationAction(commentId, 'restore', reason);
        await loadComments();
        await loadModerationStats();

      } catch (error) {
        console.error('Error restoring comment:', error);
      }
    }
  };

  const logModerationAction = async (commentId, action, reason) => {
    try {
      await supabase
        .from('vc_moderation_log')
        .insert([{
          comment_id: commentId,
          moderator_id: 'admin', // You might want to get actual admin user ID
          action,
          reason,
          automated: false
        }]);
    } catch (error) {
      console.error('Error logging moderation action:', error);
    }
  };

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

  const getSentimentColor = (score) => {
    if (score > 0.2) return '#4CAF50'; // Green
    if (score < -0.2) return '#F44336'; // Red
    return '#FF9800'; // Orange
  };

  const renderComment = (comment, isReported = false) => {
    const actualComment = isReported ? comment.vc_comments : comment;
    const tutorial = actualComment.library_items;
    
    return (
      <div key={comment.id} className="moderation-comment-card">
        <div className="comment-header">
          <VCUserAvatar 
            user={{ 
              name: actualComment.author_name,
              id: actualComment.user_id 
            }} 
            size="small"
          />
          <div className="comment-meta">
            <span className="author-name">{actualComment.author_name}</span>
            <span className="comment-time">{formatTimeAgo(actualComment.created_at)}</span>
            <span className="tutorial-name">
              on "{tutorial?.title || 'Unknown Tutorial'}"
            </span>
          </div>
          <div className="comment-status">
            <span className={`status-badge ${actualComment.moderation_status}`}>
              {actualComment.moderation_status}
            </span>
          </div>
        </div>

        <div className="comment-content">
          <p>{actualComment.content}</p>
        </div>

        <div className="comment-analysis">
          {actualComment.flagged_keywords?.length > 0 && (
            <div className="flagged-keywords">
              <strong>Flagged Keywords:</strong> {actualComment.flagged_keywords.join(', ')}
            </div>
          )}
          
          {actualComment.sentiment_score !== null && (
            <div className="sentiment-score">
              <strong>Sentiment:</strong> 
              <span 
                className="sentiment-value"
                style={{ color: getSentimentColor(actualComment.sentiment_score) }}
              >
                {(actualComment.sentiment_score * 100).toFixed(0)}%
              </span>
            </div>
          )}

          {isReported && (
            <div className="report-reason">
              <strong>Report Reason:</strong> {comment.reason.replace('_', ' ')}
              {comment.additional_details && (
                <div className="report-details">"{comment.additional_details}"</div>
              )}
            </div>
          )}

          {actualComment.report_count > 0 && (
            <div className="report-count">
              <strong>Community Reports:</strong> {actualComment.report_count}
            </div>
          )}
        </div>

        <div className="moderation-actions">
          {actualComment.moderation_status === 'flagged' && (
            <>
              <button 
                onClick={() => moderationActions.approve(actualComment.id)}
                className="action-btn approve-btn"
              >
                Approve
              </button>
              <button 
                onClick={() => moderationActions.hide(actualComment.id)}
                className="action-btn hide-btn"
              >
                Hide
              </button>
              <button 
                onClick={() => moderationActions.delete(actualComment.id)}
                className="action-btn delete-btn"
              >
                Delete
              </button>
            </>
          )}

          {actualComment.moderation_status === 'auto_hidden' && (
            <>
              <button 
                onClick={() => moderationActions.restore(actualComment.id)}
                className="action-btn restore-btn"
              >
                Restore
              </button>
              <button 
                onClick={() => moderationActions.delete(actualComment.id)}
                className="action-btn delete-btn"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="vc-moderation-panel">
      <div className="panel-header">
        <h2>Comment Moderation</h2>
        <div className="moderation-stats">
          <div className="stat">
            <span className="stat-number">{stats.flagged}</span>
            <span className="stat-label">Flagged</span>
          </div>
          <div className="stat">
            <span className="stat-number">{stats.reported}</span>
            <span className="stat-label">Reported</span>
          </div>
          <div className="stat">
            <span className="stat-number">{stats.hidden}</span>
            <span className="stat-label">Hidden</span>
          </div>
        </div>
      </div>

      <div className="moderation-tabs">
        {Object.entries(ModerationTabs).map(([key, value]) => (
          <button
            key={key}
            className={`tab-btn ${activeTab === value ? 'active' : ''}`}
            onClick={() => setActiveTab(value)}
          >
            {key.charAt(0) + key.slice(1).toLowerCase()}
            {stats[value] > 0 && <span className="tab-count">({stats[value]})</span>}
          </button>
        ))}
      </div>

      <div className="moderation-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="empty-state">
            <p>No comments need moderation in this category.</p>
          </div>
        ) : (
          <div className="comments-list">
            {comments.map(comment => 
              renderComment(comment, activeTab === ModerationTabs.REPORTED)
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VCModerationPanel;