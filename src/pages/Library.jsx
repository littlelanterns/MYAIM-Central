/* 
 * AIMfM Library - Main Library Page
 * 
 * EMOJI POLICY: No emojis in this file or related Library components
 * Emojis should only be used on children's dashboards for age-appropriate UI
 * Use proper icons, symbols, or text instead
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import LibraryService from '../services/libraryService';
import CategoryRow from '../components/Library/CategoryRow';
import TutorialPreviewModal from '../components/Library/TutorialPreviewModal';
import '../components/Library/Library.css';

const Library = () => {
  const [categories, setCategories] = useState([]);
  const [featuredTutorials, setFeaturedTutorials] = useState([]);
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [userBookmarks, setUserBookmarks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    tag: null,          // Any tag (seasonal, gift, or general hashtag)
    toolType: null      // Filter by tool type
  });
  const [groupedTagOptions, setGroupedTagOptions] = useState({
    seasonal: [],
    giftIdeas: [],
    general: []
  });
  const [toolTypeOptions, setToolTypeOptions] = useState([]);

  useEffect(() => {
    initializeLibrary();
    getCurrentUser();
    loadFilterOptions();
  }, []);

  const initializeLibrary = async () => {
    try {
      // Load categories with tutorials
      const categoriesData = await LibraryService.getTutorialsByCategory();
      setCategories(categoriesData);

      // Load featured tutorials
      const featured = await LibraryService.getFeaturedTutorials(6);
      setFeaturedTutorials(featured);

    } catch (error) {
      console.error('Error initializing library:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        loadUserBookmarks(user.id);
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const loadFilterOptions = async () => {
    try {
      // Get all published library items with ALL tag fields
      const { data: items, error } = await supabase
        .from('library_items')
        .select('seasonal_tags, gift_idea_tags, tags, tool_type')
        .eq('status', 'published');

      if (error) throw error;

      // Organize tags by category with counts
      const seasonalMap = new Map();
      const giftIdeasMap = new Map();
      const generalMap = new Map();

      items?.forEach(item => {
        // Seasonal tags
        if (item.seasonal_tags && Array.isArray(item.seasonal_tags)) {
          item.seasonal_tags.forEach(tag => {
            const count = seasonalMap.get(tag) || 0;
            seasonalMap.set(tag, count + 1);
          });
        }

        // Gift idea tags
        if (item.gift_idea_tags && Array.isArray(item.gift_idea_tags)) {
          item.gift_idea_tags.forEach(tag => {
            const count = giftIdeasMap.get(tag) || 0;
            giftIdeasMap.set(tag, count + 1);
          });
        }

        // General hashtags
        if (item.tags && Array.isArray(item.tags)) {
          item.tags.forEach(tag => {
            // Remove # if present
            const cleanTag = tag.startsWith('#') ? tag.substring(1) : tag;
            const count = generalMap.get(cleanTag) || 0;
            generalMap.set(cleanTag, count + 1);
          });
        }
      });

      // Convert each category to sorted arrays
      const seasonalOptions = Array.from(seasonalMap.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);

      const giftIdeasOptions = Array.from(giftIdeasMap.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);

      const generalOptions = Array.from(generalMap.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);

      setGroupedTagOptions({
        seasonal: seasonalOptions,
        giftIdeas: giftIdeasOptions,
        general: generalOptions
      });

      // Extract unique tool types with counts
      const toolTypeMap = new Map();
      items?.forEach(item => {
        if (item.tool_type) {
          const count = toolTypeMap.get(item.tool_type) || 0;
          toolTypeMap.set(item.tool_type, count + 1);
        }
      });

      // Convert to array and sort by count (descending)
      const toolOptions = Array.from(toolTypeMap.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

      setToolTypeOptions(toolOptions);

    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const loadUserBookmarks = async (userId) => {
    try {
      const bookmarks = await LibraryService.getUserBookmarks(userId);
      const bookmarkIds = bookmarks.map(b => b.library_item_id);
      setUserBookmarks(bookmarkIds);
    } catch (error) {
      console.error('Error loading user bookmarks:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const results = await LibraryService.searchTutorials(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching tutorials:', error);
      setSearchResults([]);
    }
  };

  const handleSelectTutorial = async (tutorial) => {
    // Track view
    await LibraryService.trackTutorialView(tutorial.id);
    setSelectedTutorial(tutorial);
  };

  const handleBookmark = async (tutorialId) => {
    if (!currentUser) {
      alert('Please log in to bookmark tutorials');
      return;
    }

    try {
      const result = await LibraryService.toggleBookmark(currentUser.id, tutorialId);
      
      if (result.bookmarked) {
        setUserBookmarks([...userBookmarks, tutorialId]);
      } else {
        setUserBookmarks(userBookmarks.filter(id => id !== tutorialId));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      alert('Error updating bookmark. Please try again.');
    }
  };

  const handleStartTutorial = async (tutorial) => {
    if (!currentUser) {
      alert('Please log in to access tutorials');
      return;
    }

    try {
      // Update progress
      await LibraryService.updateProgress(currentUser.id, tutorial.id, {
        status: 'in-progress',
        progress_percent: 0
      });

      // Open tutorial through proxy to hide Gamma URL
      const proxyUrl = `/tutorial-proxy/${tutorial.id}`;
      window.open(proxyUrl, '_blank');
      
      setSelectedTutorial(null);
    } catch (error) {
      console.error('Error starting tutorial:', error);
      alert('Unable to start tutorial. Please try again.');
    }
  };

  const handleUseWithLila = (tutorial) => {
    // Integrate with your existing LiLa system
    // This would send tutorial context to your AI assistant
    const lilaContext = {
      tutorialTitle: tutorial.title,
      tutorialDescription: tutorial.description,
      learningOutcomes: tutorial.learning_outcomes,
      toolsMentioned: tutorial.tools_mentioned,
      difficulty: tutorial.difficulty_level
    };
    
    // You can dispatch this to your existing LiLa context or modal
    console.log('Using tutorial with LiLa:', lilaContext);
    alert('Tutorial context has been sent to LiLa for personalized assistance!');
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  // Format tag names for display (capitalize, replace dashes with spaces)
  const formatTagName = (tag) => {
    return tag
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format tool type names for display
  const formatToolTypeName = (type) => {
    const typeMap = {
      'tutorial': 'Tutorials',
      'custom-gpt': 'Custom GPTs',
      'gemini-gem': 'Gemini Gems',
      'opal-app': 'Opal Apps',
      'caffeine-app': 'Caffeine Apps',
      'perplexity-app': 'Perplexity Tools',
      'custom-link': 'Custom Links',
      'tool-collection': 'Tool Collections',
      'workflow': 'Workflows',
      'prompt-pack': 'Prompt Packs'
    };
    return typeMap[type] || formatTagName(type);
  };

  // Filter tutorials based on active filters
  const filterTutorials = (tutorials) => {
    if (!tutorials || tutorials.length === 0) return tutorials;

    return tutorials.filter(item => {
      // Tag filter - check ALL tag fields (seasonal, gift, general hashtags)
      if (activeFilters.tag) {
        const hasTag = (
          (item.seasonal_tags && item.seasonal_tags.includes(activeFilters.tag)) ||
          (item.gift_idea_tags && item.gift_idea_tags.includes(activeFilters.tag)) ||
          (item.tags && item.tags.some(t => {
            const cleanTag = t.startsWith('#') ? t.substring(1) : t;
            return cleanTag === activeFilters.tag;
          }))
        );

        if (!hasTag) return false;
      }

      // Tool type filter
      if (activeFilters.toolType && item.tool_type !== activeFilters.toolType) {
        return false;
      }

      return true;
    });
  };

  // Apply filters to categories
  const getFilteredCategories = () => {
    if (!activeFilters.tag && !activeFilters.toolType) {
      return categories; // No filters active, return all
    }

    return categories
      .map(category => ({
        ...category,
        tutorials: filterTutorials(category.tutorials)
      }))
      .filter(category => category.tutorials && category.tutorials.length > 0); // Remove empty categories
  };

  if (loading) {
    return (
      <div className="library-container">
        <div className="loading-spinner">
          Loading your tutorial library...
        </div>
      </div>
    );
  }

  return (
    <div className="library-container">
      {/* Header Section */}
      <header className="library-header">
        <h1 className="library-title">The Vault</h1>
        <p className="library-subtitle">Your Vault-style AI tutorial library</p>
        
        {/* Search */}
        <form className="library-search" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="Search tutorials, tools, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send" aria-hidden="true">
              <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path>
              <path d="m21.854 2.147-10.94 10.939"></path>
            </svg>
          </button>
        </form>

        {/* Filter Bar */}
        <div className="library-filters">
          {/* Grouped Tags Filter - organized by category */}
          {(groupedTagOptions.seasonal.length > 0 || groupedTagOptions.giftIdeas.length > 0 || groupedTagOptions.general.length > 0) && (
            <select
              className="filter-select"
              value={activeFilters.tag || ''}
              onChange={(e) => setActiveFilters({...activeFilters, tag: e.target.value || null})}
            >
              <option value="">Browse by Tag</option>

              {/* Seasonal Tags Group */}
              {groupedTagOptions.seasonal.length > 0 && (
                <optgroup label="Seasonal">
                  {groupedTagOptions.seasonal.map(option => (
                    <option key={option.tag} value={option.tag}>
                      {formatTagName(option.tag)} ({option.count})
                    </option>
                  ))}
                </optgroup>
              )}

              {/* Gift Ideas Group */}
              {groupedTagOptions.giftIdeas.length > 0 && (
                <optgroup label="Gift Ideas">
                  {groupedTagOptions.giftIdeas.map(option => (
                    <option key={option.tag} value={option.tag}>
                      {formatTagName(option.tag)} ({option.count})
                    </option>
                  ))}
                </optgroup>
              )}

              {/* General Tags Group */}
              {groupedTagOptions.general.length > 0 && (
                <optgroup label="Topics">
                  {groupedTagOptions.general.map(option => (
                    <option key={option.tag} value={option.tag}>
                      {formatTagName(option.tag)} ({option.count})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          )}

          {/* Dynamic Tool Type Filter - only shows types that exist in your content */}
          {toolTypeOptions.length > 0 && (
            <select
              className="filter-select"
              value={activeFilters.toolType || ''}
              onChange={(e) => setActiveFilters({...activeFilters, toolType: e.target.value || null})}
            >
              <option value="">All Types</option>
              {toolTypeOptions.map(option => (
                <option key={option.type} value={option.type}>
                  {formatToolTypeName(option.type)} ({option.count})
                </option>
              ))}
            </select>
          )}

          {(activeFilters.tag || activeFilters.toolType) && (
            <button
              className="filter-btn clear-filters"
              onClick={() => setActiveFilters({ tag: null, toolType: null })}
            >
              Clear Filters
            </button>
          )}
        </div>
      </header>

      {/* Search Results */}
      {isSearching && (
        <div className="search-results-section">
          <div className="section-header">
            <h2 className="featured-title">
              Search Results for "{searchQuery}" ({searchResults.length})
            </h2>
            <button className="clear-search-btn" onClick={clearSearch}>
              Clear Search
            </button>
          </div>
          
          {searchResults.length > 0 ? (
            <div className="search-results-container">
              <CategoryRow
                category={{ display_name: 'Search Results', id: 'search' }}
                onSelectTutorial={handleSelectTutorial}
                userBookmarks={userBookmarks}
                onBookmark={handleBookmark}
                onQuickAction={(tutorial, action) => {
                  if (action === 'lila') {
                    handleUseWithLila(tutorial);
                  }
                }}
              />
            </div>
          ) : (
            <div className="no-results">
              <p>No tutorials found for "{searchQuery}"</p>
              <p>Try searching for terms like: ChatGPT, automation, prompting, AI basics</p>
            </div>
          )}
        </div>
      )}

      {/* Featured Section (only show when not searching) */}
      {!isSearching && featuredTutorials.length > 0 && (
        <section className="featured-section">
          <h2 className="featured-title">⭐ Featured Tutorials</h2>
          <div className="featured-container">
            {featuredTutorials.map((tutorial) => (
              <div
                key={tutorial.id}
                className="tutorial-card featured-card"
                onClick={() => handleSelectTutorial(tutorial)}
              >
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
                      className={`bookmark-btn ${userBookmarks.includes(tutorial.id) ? 'bookmarked' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookmark(tutorial.id);
                      }}
                    >
                      {userBookmarks.includes(tutorial.id) ? '❤️' : '🤍'}
                    </button>
                    <span className="featured-badge">★</span>
                  </div>
                </div>
                <div className="card-content">
                  <h3 className="card-title">{tutorial.title}</h3>
                  <p className="card-description">{tutorial.short_description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Category Rows (only show when not searching) */}
      {!isSearching && getFilteredCategories().map((category) => (
        <CategoryRow
          key={category.id}
          category={category}
          currentUser={currentUser}
          onSelectTutorial={handleSelectTutorial}
          userBookmarks={userBookmarks}
          onBookmark={handleBookmark}
          onQuickAction={(tutorial, action) => {
            if (action === 'lila') {
              handleUseWithLila(tutorial);
            }
          }}
        />
      ))}

      {/* Empty State */}
      {!isSearching && getFilteredCategories().length === 0 && (
        <div className="empty-state">
          <h2>
            {(activeFilters.giftIdeas || activeFilters.seasonal || activeFilters.toolType)
              ? 'No items match your filters'
              : 'No tutorials available yet'}
          </h2>
          <p>
            {(activeFilters.giftIdeas || activeFilters.seasonal || activeFilters.toolType)
              ? 'Try adjusting your filters to see more content'
              : 'Check back soon for new AI tutorials and tools!'}
          </p>
        </div>
      )}

      {/* Tutorial Preview Modal */}
      {selectedTutorial && (
        <TutorialPreviewModal
          tutorial={selectedTutorial}
          onClose={() => setSelectedTutorial(null)}
          onStartTutorial={handleStartTutorial}
          onBookmark={handleBookmark}
          onUseWithLila={handleUseWithLila}
          isBookmarked={userBookmarks.includes(selectedTutorial.id)}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default Library;