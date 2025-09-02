import React, { useState, useEffect } from 'react';
import VCLikeButton from './VCLikeButton';
import VCFavoriteButton from './VCFavoriteButton';
import VCEngagementStats from './VCEngagementStats';
import './Library.css';

const VCEngagement = ({ 
  tutorialId, 
  userId, 
  onEngagementChange,
  showCommentButton = true 
}) => {
  const [userEngagement, setUserEngagement] = useState({
    hasLiked: false,
    hasFavorited: false,
    loading: true
  });
  const [stats, setStats] = useState({
    likes: 0,
    favorites: 0,
    comments: 0
  });

  useEffect(() => {
    if (tutorialId && userId) {
      loadUserEngagement();
    }
  }, [tutorialId, userId]);

  const loadUserEngagement = async () => {
    try {
      const { supabase } = await import('../../lib/supabase');
      
      const { data: userEngagementData } = await supabase
        .from('vc_engagement')
        .select('engagement_type')
        .eq('vault_content_id', tutorialId)
        .eq('user_id', userId);

      const hasLiked = userEngagementData?.some(e => e.engagement_type === 'like') || false;
      const hasFavorited = userEngagementData?.some(e => e.engagement_type === 'favorite') || false;

      setUserEngagement({
        hasLiked,
        hasFavorited,
        loading: false
      });

    } catch (error) {
      console.error('Error loading user engagement:', error);
      setUserEngagement(prev => ({ ...prev, loading: false }));
    }
  };

  const handleStatsLoad = (newStats) => {
    setStats(newStats);
    
    if (onEngagementChange) {
      onEngagementChange(newStats);
    }
  };

  const handleLikeChange = (newCount, isLiked) => {
    const newStats = { ...stats, likes: newCount };
    setStats(newStats);
    setUserEngagement(prev => ({ ...prev, hasLiked: isLiked }));
    
    if (onEngagementChange) {
      onEngagementChange(newStats);
    }
  };

  const handleFavoriteChange = (newCount, isFavorited) => {
    const newStats = { ...stats, favorites: newCount };
    setStats(newStats);
    setUserEngagement(prev => ({ ...prev, hasFavorited: isFavorited }));
    
    if (onEngagementChange) {
      onEngagementChange(newStats);
    }
  };

  const handleDiscussionClick = () => {
    // Scroll to comments section
    const commentsSection = document.getElementById(`comments-${tutorialId}`);
    if (commentsSection) {
      commentsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="vc-engagement">
      {/* Engagement Stats Display */}
      <VCEngagementStats 
        tutorialId={tutorialId}
        onStatsLoad={handleStatsLoad}
      />

      {/* User Action Buttons */}
      <div className="engagement-actions">
        <VCLikeButton
          tutorialId={tutorialId}
          userId={userId}
          initialCount={stats.likes}
          initialLiked={userEngagement.hasLiked}
          onLikeChange={handleLikeChange}
        />
        
        <VCFavoriteButton
          tutorialId={tutorialId}
          userId={userId}
          initialCount={stats.favorites}
          initialFavorited={userEngagement.hasFavorited}
          onFavoriteChange={handleFavoriteChange}
        />

        {showCommentButton && (
          <button
            className="vc-comment-btn"
            onClick={handleDiscussionClick}
            title="Join the discussion"
          >
            <span className="comment-icon">💬</span>
            <span className="comment-text">Comment</span>
          </button>
        )}
      </div>

      {/* Login Prompt */}
      {!userId && (
        <div className="engagement-login-prompt">
          <p>
            <small>
              Sign in to like, save, and comment on tutorials
            </small>
          </p>
        </div>
      )}
    </div>
  );
};

export default VCEngagement;