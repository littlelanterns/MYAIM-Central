import React, { useState } from 'react';
import './Library.css';

const VCFavoriteButton = ({ 
  tutorialId, 
  userId, 
  initialCount = 0, 
  initialFavorited = false, 
  onFavoriteChange 
}) => {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!userId || loading) return;

    const newFavorited = !favorited;
    const newCount = newFavorited ? count + 1 : count - 1;

    // Optimistic update
    setFavorited(newFavorited);
    setCount(newCount);
    setLoading(true);

    try {
      const { supabase } = await import('../../lib/supabase');
      
      if (newFavorited) {
        // Add favorite
        const { error } = await supabase
          .from('vc_engagement')
          .insert([{
            vault_content_id: tutorialId,
            user_id: userId,
            engagement_type: 'favorite'
          }]);
        
        if (error) throw error;
      } else {
        // Remove favorite
        const { error } = await supabase
          .from('vc_engagement')
          .delete()
          .eq('vault_content_id', tutorialId)
          .eq('user_id', userId)
          .eq('engagement_type', 'favorite');
        
        if (error) throw error;
      }

      // Notify parent component
      if (onFavoriteChange) {
        onFavoriteChange(newCount, newFavorited);
      }

    } catch (error) {
      console.error('Error updating favorite:', error);
      // Revert optimistic update on error
      setFavorited(!newFavorited);
      setCount(newFavorited ? count - 1 : count + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`vc-favorite-btn ${favorited ? 'favorited' : ''} ${loading ? 'loading' : ''}`}
      onClick={handleClick}
      disabled={!userId || loading}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
      aria-label={`${favorited ? 'Remove from' : 'Add to'} favorites. Currently ${count} favorites`}
    >
      <span className="favorite-icon">
        {favorited ? '⭐' : '☆'}
      </span>
      <span className="favorite-count">{count}</span>
    </button>
  );
};

export default VCFavoriteButton;