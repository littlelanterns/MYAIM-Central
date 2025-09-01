import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import TutorialCard from './TutorialCard';
import './Library.css';

const CategoryRow = ({ 
  category, 
  onSelectTutorial, 
  userBookmarks = [],
  onBookmark,
  onQuickAction 
}) => {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    loadTutorials();
  }, [category]);

  useEffect(() => {
    checkScrollButtons();
  }, [tutorials]);

  const loadTutorials = async () => {
    try {
      const { data, error } = await supabase
        .from('library_items')
        .select('*')
        .eq('category', category.id || category)
        .eq('status', 'published')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTutorials(data || []);
    } catch (error) {
      console.error('Error loading tutorials for category:', category, error);
    } finally {
      setLoading(false);
    }
  };

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < (container.scrollWidth - container.clientWidth)
    );
  };

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth = 300; // Approximate card width
    const scrollAmount = cardWidth * 3; // Scroll 3 cards at a time
    const newScrollLeft = direction === 'left' 
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  const handleScroll = () => {
    checkScrollButtons();
  };

  if (loading) {
    return (
      <div className="category-row">
        <div className="category-header">
          <h2 className="category-title">
            {category.display_name || category}
          </h2>
        </div>
        <div className="loading-cards">
          {[1,2,3,4].map(i => (
            <div key={i} className="card-skeleton"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!tutorials.length) {
    return null; // Don't show empty categories
  }

  return (
    <div className="category-row">
      <div className="category-header">
        <h2 
          className="category-title"
          style={{ color: category.color_hex || '#68a395' }}
        >
          {category.icon_name && (
            <span className="category-icon">{category.icon_name}</span>
          )}
          {category.display_name || category}
        </h2>
        
        {category.description && (
          <p className="category-description">{category.description}</p>
        )}
        
        <span className="tutorial-count">
          {tutorials.length} tutorial{tutorials.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="category-scroll-container">
        {canScrollLeft && (
          <button 
            className="scroll-btn scroll-left"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            ‹
          </button>
        )}

        <div 
          className="tutorials-container"
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          {tutorials.map((tutorial) => (
            <TutorialCard
              key={tutorial.id}
              tutorial={tutorial}
              onSelect={onSelectTutorial}
              isBookmarked={userBookmarks.includes(tutorial.id)}
              onBookmark={onBookmark}
              onQuickAction={onQuickAction}
            />
          ))}
        </div>

        {canScrollRight && (
          <button 
            className="scroll-btn scroll-right"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
};

export default CategoryRow;