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

  useEffect(() => {
    initializeLibrary();
    getCurrentUser();
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
      {!isSearching && categories.map((category) => (
        <CategoryRow
          key={category.id}
          category={category}
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
      {!isSearching && categories.length === 0 && (
        <div className="empty-state">
          <h2>No tutorials available yet</h2>
          <p>Check back soon for new AI tutorials and tools!</p>
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