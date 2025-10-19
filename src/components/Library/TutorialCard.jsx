import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import './Library.css';

const TutorialCard = ({
  tutorial,
  onSelect,
  isBookmarked,
  onBookmark,
  onQuickAction,
  currentUser  // User object with id
}) => {
  const [showNew, setShowNew] = useState(false);

  // Check if item should show NEW badge based on first-visit tracking
  useEffect(() => {
    if (!tutorial.is_new || !tutorial.first_seen_tracking || !currentUser?.id) {
      setShowNew(false);
      return;
    }

    checkIfNew();
  }, [tutorial.id, tutorial.is_new, tutorial.first_seen_tracking, currentUser?.id]);

  const checkIfNew = async () => {
    try {
      // Check if user has seen this item before
      const { data: firstVisit } = await supabase
        .from('user_library_first_visits')
        .select('first_visit_at')
        .eq('user_id', currentUser.id)
        .eq('library_item_id', tutorial.id)
        .single();

      if (!firstVisit) {
        // First time seeing this item - mark it and show NEW badge
        await supabase.from('user_library_first_visits').insert({
          user_id: currentUser.id,
          library_item_id: tutorial.id
        });
        setShowNew(true);
        return;
      }

      // Check if within the NEW badge duration window
      const daysSinceFirstSeen = Math.floor(
        (Date.now() - new Date(firstVisit.first_visit_at)) / (1000 * 60 * 60 * 24)
      );

      const badgeDuration = tutorial.new_badge_duration_days || 30;
      setShowNew(daysSinceFirstSeen < badgeDuration);

    } catch (error) {
      console.error('Error checking NEW badge status:', error);
      // Fallback to simple is_new check
      setShowNew(tutorial.is_new);
    }
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    onBookmark(tutorial.id);
  };

  const handleCardClick = () => {
    onSelect(tutorial);
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'beginner': return '#68a395';
      case 'intermediate': return '#d6a461'; 
      case 'advanced': return '#d4734d';
      default: return '#68a395';
    }
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'tutorial': return '📚';
      case 'custom-gpt': return '🤖';
      case 'gemini-gem': return '💎';
      case 'opal-app': return '🔮';
      case 'caffeine-app': return '☕';
      case 'perplexity-app': return '🔍';
      case 'custom-link': return '🔗';
      case 'tool-collection': return '🛠️';
      case 'workflow': return '⚡';
      case 'prompt-pack': return '💬';
      default: return '📚';
    }
  };

  return (
    <div className="tutorial-card" onClick={handleCardClick}>
      <div className="card-image-container">
        <img 
          src={tutorial.thumbnail_url || '/api/placeholder/300/200'} 
          alt={tutorial.title}
          onError={(e) => {
            e.target.src = '/api/placeholder/300/200';
          }}
        />
        
        <div className="card-overlay">
          <button 
            className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
            onClick={handleBookmarkClick}
            aria-label={isBookmarked ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isBookmarked ? '❤️' : '🤍'}
          </button>

          {showNew && <span className="new-badge">NEW</span>}
          {tutorial.is_featured && <span className="featured-badge">★</span>}

          {/* Gift idea badge */}
          {tutorial.gift_idea_tags && tutorial.gift_idea_tags.length > 0 && (
            <span className="gift-badge">🎁</span>
          )}
        </div>

        <div className="card-quick-actions">
          <button 
            className="quick-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              onQuickAction && onQuickAction(tutorial, 'lila');
            }}
            title="Use with LiLa"
          >
            🤖
          </button>
        </div>
      </div>
      
      <div className="card-content">
        <div className="card-header">
          <span className="content-type-icon">
            {getContentTypeIcon(tutorial.content_type)}
          </span>
          <h3 className="card-title">{tutorial.title}</h3>
        </div>
        
        <p className="card-description">
          {tutorial.short_description || tutorial.description?.substring(0, 100) + '...'}
        </p>
        
        <div className="card-meta">
          <span 
            className="difficulty-badge"
            style={{ backgroundColor: getDifficultyColor(tutorial.difficulty_level) }}
          >
            {tutorial.difficulty_level}
          </span>
          
          {tutorial.estimated_time_minutes && (
            <span className="duration-badge">
              {tutorial.estimated_time_minutes} min
            </span>
          )}
          
          <span className="tier-badge">
            {tutorial.required_tier}
          </span>
        </div>

        <div className="card-tags">
          {tutorial.tags && tutorial.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="tag">
              #{tag}
            </span>
          ))}
        </div>

        <div className="card-stats">
          <span className="view-count">👁️ {tutorial.view_count || 0}</span>
          <span className="engagement-count">❤️ {tutorial.engagement_likes || 0}</span>
          <span className="comment-count">💬 {tutorial.engagement_comments || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default TutorialCard;