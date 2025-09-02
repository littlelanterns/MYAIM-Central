import React, { useState, useEffect } from 'react';
import './Library.css';

const VCEngagementStats = ({ tutorialId, onStatsLoad }) => {
  const [stats, setStats] = useState({
    likes: 0,
    favorites: 0,
    comments: 0,
    loading: true
  });

  useEffect(() => {
    if (tutorialId) {
      loadStats();
    }
  }, [tutorialId]);

  const loadStats = async () => {
    try {
      const { supabase } = await import('../../lib/supabase');

      // Get engagement counts
      const { data: engagementData } = await supabase
        .from('vc_engagement')
        .select('engagement_type')
        .eq('vault_content_id', tutorialId);

      // Get comment count
      const { count: commentCount } = await supabase
        .from('vc_comments')
        .select('id', { count: 'exact' })
        .eq('vault_content_id', tutorialId)
        .eq('moderation_status', 'approved');

      const likes = engagementData?.filter(e => e.engagement_type === 'like').length || 0;
      const favorites = engagementData?.filter(e => e.engagement_type === 'favorite').length || 0;
      const comments = commentCount || 0;

      const newStats = {
        likes,
        favorites,
        comments,
        loading: false
      };

      setStats(newStats);

      // Notify parent component
      if (onStatsLoad) {
        onStatsLoad(newStats);
      }

    } catch (error) {
      console.error('Error loading engagement stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  // Method to update stats from parent components
  const updateStats = (newStats) => {
    setStats(prev => ({
      ...prev,
      ...newStats
    }));
  };

  if (stats.loading) {
    return (
      <div className="vc-engagement-stats loading">
        <div className="stat-skeleton" />
        <div className="stat-skeleton" />
        <div className="stat-skeleton" />
      </div>
    );
  }

  return (
    <div className="vc-engagement-stats">
      <div className="engagement-stat">
        <span className="stat-icon">❤️</span>
        <span className="stat-count">{stats.likes}</span>
        <span className="stat-label">likes</span>
      </div>
      
      <div className="engagement-stat">
        <span className="stat-icon">⭐</span>
        <span className="stat-count">{stats.favorites}</span>
        <span className="stat-label">favorites</span>
      </div>
      
      <div className="engagement-stat">
        <span className="stat-icon">💬</span>
        <span className="stat-count">{stats.comments}</span>
        <span className="stat-label">comments</span>
      </div>
    </div>
  );
};

// Export the component with the updateStats method accessible
VCEngagementStats.displayName = 'VCEngagementStats';
export default VCEngagementStats;