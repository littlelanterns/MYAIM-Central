import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { OptimizeWithLiLaButton } from './OptimizeWithLiLaButton';
import VCEngagement from './VCEngagement';
import VCDiscussion from './VCDiscussion';
import './Library.css';

const TutorialPreviewModal = ({
  tutorial,
  onClose,
  onStartTutorial,
  onBookmark,
  isBookmarked,
  currentUser
}) => {
  const [userAccess, setUserAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgradeNeeded, setUpgradeNeeded] = useState(false);

  useEffect(() => {
    checkUserAccess();
  }, [tutorial, currentUser]);

  const checkUserAccess = async () => {
    if (!currentUser) {
      setUserAccess(false);
      setUpgradeNeeded(true);
      setLoading(false);
      return;
    }

    try {
      // Get user's subscription tier
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('subscription_tier')
        .eq('user_id', currentUser.id)
        .single();

      // Get tier levels for comparison
      const { data: tiers } = await supabase
        .from('subscription_tiers')
        .select('tier_name, tier_level');
      
      const userTierLevel = tiers.find(t => t.tier_name === userProfile?.subscription_tier)?.tier_level || 0;
      const requiredTierLevel = tiers.find(t => t.tier_name === tutorial.required_tier)?.tier_level || 1;
      
      const hasAccess = userTierLevel >= requiredTierLevel;
      setUserAccess(hasAccess);
      setUpgradeNeeded(!hasAccess);
    } catch (error) {
      console.error('Error checking user access:', error);
      setUserAccess(false);
      setUpgradeNeeded(true);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTutorial = async () => {
    if (!userAccess) {
      setUpgradeNeeded(true);
      return;
    }

    try {
      // Track tutorial start
      await supabase
        .from('user_library_progress')
        .upsert({
          user_id: currentUser.id,
          library_item_id: tutorial.id,
          status: 'in-progress',
          last_accessed: new Date().toISOString()
        });

      // Increment view count
      await supabase
        .from('library_items')
        .update({ view_count: (tutorial.view_count || 0) + 1 })
        .eq('id', tutorial.id);

      onStartTutorial(tutorial);
    } catch (error) {
      console.error('Error starting tutorial:', error);
    }
  };

  const handleBookmark = async () => {
    try {
      if (isBookmarked) {
        await supabase
          .from('user_library_bookmarks')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('library_item_id', tutorial.id);
      } else {
        await supabase
          .from('user_library_bookmarks')
          .insert({
            user_id: currentUser.id,
            library_item_id: tutorial.id
          });
      }
      
      onBookmark(tutorial.id);
    } catch (error) {
      console.error('Error managing bookmark:', error);
    }
  };

  const getTierDisplayName = (tierName) => {
    const tierMap = {
      'essential': 'Essential ($9.99)',
      'enhanced': 'Enhanced ($16.99)', 
      'full_magic': 'Full Magic ($24.99)',
      'creator': 'Creator ($39.99)'
    };
    return tierMap[tierName] || tierName;
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div className="preview-modal loading">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="preview-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <div className="modal-image">
            <img 
              src={tutorial.preview_image_url || tutorial.thumbnail_url || '/api/placeholder/400/250'} 
              alt={tutorial.title}
              onError={(e) => {
                e.target.src = '/api/placeholder/400/250';
              }}
            />
            {!userAccess && (
              <div className="access-overlay">
                <div className="lock-icon">🔒</div>
                <p>Upgrade Required</p>
              </div>
            )}
          </div>
          
          <div className="modal-header-content">
            <h2 className="modal-title">{tutorial.title}</h2>
            <p className="modal-description">{tutorial.description}</p>
            
            <div className="modal-meta-info">
              <span className="modal-category">{tutorial.category}</span>
              <span className="modal-difficulty">{tutorial.difficulty_level}</span>
              {tutorial.estimated_time_minutes && (
                <span className="modal-duration">{tutorial.estimated_time_minutes} min</span>
              )}
              <span className="modal-content-type">{tutorial.content_type}</span>
            </div>

            <div className="subscription-requirement">
              <span className="tier-required">
                Requires: {getTierDisplayName(tutorial.required_tier)}
              </span>
            </div>
          </div>
        </div>

        <div className="modal-body">
          {tutorial.learning_outcomes && tutorial.learning_outcomes.length > 0 && (
            <div className="modal-section">
              <h4>What You'll Learn:</h4>
              <ul className="outcomes-list">
                {tutorial.learning_outcomes.map((outcome, index) => (
                  <li key={index}>{outcome}</li>
                ))}
              </ul>
            </div>
          )}

          {tutorial.prerequisites && tutorial.prerequisites.length > 0 && (
            <div className="modal-section">
              <h4>Prerequisites:</h4>
              <ul className="prerequisites-list">
                {tutorial.prerequisites.map((prereq, index) => (
                  <li key={index}>{prereq}</li>
                ))}
              </ul>
            </div>
          )}

          {tutorial.tools_mentioned && tutorial.tools_mentioned.length > 0 && (
            <div className="modal-section">
              <h4>Tools & Platforms:</h4>
              <div className="tool-tags">
                {tutorial.tools_mentioned.map((tool, index) => (
                  <span key={index} className="tool-tag">{tool}</span>
                ))}
              </div>
            </div>
          )}

          {tutorial.tags && tutorial.tags.length > 0 && (
            <div className="modal-section">
              <h4>Topics:</h4>
              <div className="topic-tags">
                {tutorial.tags.map((tag, index) => (
                  <span key={index} className="topic-tag">#{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          {currentUser && (
            <button
              className={`heart-bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
              onClick={handleBookmark}
              title={isBookmarked ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isBookmarked ? '❤️' : '🤍'}
            </button>
          )}

          {tutorial.enable_lila_optimization && userAccess && (
            <OptimizeWithLiLaButton
              libraryItem={tutorial}
              customPrompt={tutorial.lila_optimization_prompt}
            />
          )}

          <button
            className={`start-tutorial-btn ${!userAccess ? 'disabled' : ''}`}
            onClick={handleStartTutorial}
            disabled={!userAccess}
          >
            {!userAccess ? '🔒 Upgrade to Access' : '▶️ Start Tutorial'}
          </button>
        </div>

        {upgradeNeeded && (
          <div className="upgrade-notice">
            <p>
              This tutorial requires the <strong>{getTierDisplayName(tutorial.required_tier)}</strong> subscription or higher.
            </p>
            <button className="upgrade-cta-btn">
              Upgrade Now
            </button>
          </div>
        )}

        {/* Engagement Section */}
        <VCEngagement
          tutorialId={tutorial.id}
          userId={currentUser?.id}
          onEngagementChange={(stats) => {
            // Optional: Update parent component with engagement stats
            console.log('Engagement updated:', stats);
          }}
        />

        {/* Discussion Section */}
        <VCDiscussion
          tutorialId={tutorial.id}
          user={currentUser}
          onCommentCountChange={(count) => {
            // Optional: Update parent component with comment count
            console.log('Comment count updated:', count);
          }}
        />
      </div>
    </div>
  );
};

export default TutorialPreviewModal;