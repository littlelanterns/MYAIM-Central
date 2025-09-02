import React, { useState } from 'react';
import './Library.css';

const VCLikeButton = ({ 
  tutorialId, 
  userId, 
  initialCount = 0, 
  initialLiked = false, 
  onLikeChange 
}) => {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!userId || loading) return;

    const newLiked = !liked;
    const newCount = newLiked ? count + 1 : count - 1;

    // Optimistic update
    setLiked(newLiked);
    setCount(newCount);
    setAnimating(true);
    setLoading(true);

    try {
      const { supabase } = await import('../../lib/supabase');
      
      if (newLiked) {
        // Add like
        const { error } = await supabase
          .from('vc_engagement')
          .insert([{
            vault_content_id: tutorialId,
            user_id: userId,
            engagement_type: 'like'
          }]);
        
        if (error) throw error;
      } else {
        // Remove like
        const { error } = await supabase
          .from('vc_engagement')
          .delete()
          .eq('vault_content_id', tutorialId)
          .eq('user_id', userId)
          .eq('engagement_type', 'like');
        
        if (error) throw error;
      }

      // Notify parent component
      if (onLikeChange) {
        onLikeChange(newCount, newLiked);
      }

    } catch (error) {
      console.error('Error updating like:', error);
      // Revert optimistic update on error
      setLiked(!newLiked);
      setCount(newLiked ? count - 1 : count + 1);
    } finally {
      setLoading(false);
      setTimeout(() => setAnimating(false), 300);
    }
  };

  return (
    <button
      className={`vc-like-btn ${liked ? 'liked' : ''} ${animating ? 'animate' : ''} ${loading ? 'loading' : ''}`}
      onClick={handleClick}
      disabled={!userId || loading}
      title={liked ? 'Unlike this tutorial' : 'Like this tutorial'}
      aria-label={`${liked ? 'Unlike' : 'Like'} this tutorial. Currently ${count} likes`}
    >
      <span className="like-icon">
        {liked ? '❤️' : '🤍'}
      </span>
      <span className="like-count">{count}</span>
      {animating && <div className="like-animation" />}
    </button>
  );
};

export default VCLikeButton;