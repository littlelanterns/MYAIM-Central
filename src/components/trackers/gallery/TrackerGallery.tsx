/**
 * TrackerGallery Component
 * Pinterest-style browsable gallery of tracker templates
 * Mom can filter, search, and add trackers to family member dashboards
 * NO EMOJIS - CSS VARIABLES ONLY - THEME AWARE
 */

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Search, Filter } from 'lucide-react';
import TrackerTemplateCard from './TrackerTemplateCard';
import TrackerCustomizationModal from '../customization/TrackerCustomizationModal';

interface TrackerTemplate {
  id: string;
  name: string;
  description: string;
  category: 'habit' | 'mood' | 'goal' | 'milestone' | 'kid-gamified';
  type: 'grid' | 'circle' | 'streak' | 'progress-bar' | 'chart' | 'collection' | 'gameboard' | 'coloring';
  visualStyle: 'artistic' | 'modern' | 'kid-friendly' | 'professional';
  previewImage?: string;
  icon: string;
  recommendedFor: ('preschool' | 'elementary' | 'teen' | 'adult')[];
  dashboardModes: ('play' | 'guided' | 'independent' | 'personal')[];
  tags: string[];
}

interface TrackerGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTracker: (template: TrackerTemplate) => void;
}

// Mock data for development - will be replaced with database data
const MOCK_TEMPLATES: TrackerTemplate[] = [
  {
    id: '1',
    name: 'Monthly Habit Grid',
    description: '28-day grid for daily habit tracking',
    category: 'habit',
    type: 'grid',
    visualStyle: 'artistic',
    icon: 'Grid',
    recommendedFor: ['elementary', 'teen', 'adult'],
    dashboardModes: ['guided', 'independent', 'personal'],
    tags: ['habits', 'daily', 'simple']
  },
  {
    id: '2',
    name: 'Mood Circles',
    description: 'Track daily mood with color-coded circles',
    category: 'mood',
    type: 'circle',
    visualStyle: 'modern',
    icon: 'Circle',
    recommendedFor: ['elementary', 'teen', 'adult'],
    dashboardModes: ['guided', 'independent', 'personal'],
    tags: ['mood', 'emotional', 'awareness']
  },
  {
    id: '3',
    name: 'Water Tracker',
    description: 'Daily water intake tracker',
    category: 'habit',
    type: 'progress-bar',
    visualStyle: 'kid-friendly',
    icon: 'Droplet',
    recommendedFor: ['preschool', 'elementary', 'teen', 'adult'],
    dashboardModes: ['play', 'guided', 'independent', 'personal'],
    tags: ['health', 'hydration', 'daily']
  },
  {
    id: '4',
    name: 'Reading Adventure',
    description: 'Gameboard-style reading progress tracker',
    category: 'kid-gamified',
    type: 'gameboard',
    visualStyle: 'kid-friendly',
    icon: 'Book',
    recommendedFor: ['preschool', 'elementary'],
    dashboardModes: ['play', 'guided'],
    tags: ['reading', 'gamified', 'fun']
  },
  {
    id: '5',
    name: 'Kindness Coloring',
    description: 'Color a picture as you complete kind acts',
    category: 'kid-gamified',
    type: 'coloring',
    visualStyle: 'kid-friendly',
    icon: 'Palette',
    recommendedFor: ['preschool', 'elementary'],
    dashboardModes: ['play', 'guided'],
    tags: ['kindness', 'art', 'gamified']
  },
  {
    id: '6',
    name: 'Streak Tracker',
    description: 'Build consecutive day streaks',
    category: 'habit',
    type: 'streak',
    visualStyle: 'modern',
    icon: 'Flame',
    recommendedFor: ['elementary', 'teen', 'adult'],
    dashboardModes: ['guided', 'independent', 'personal'],
    tags: ['streaks', 'consistency', 'motivation']
  },
  {
    id: '7',
    name: 'Weekly Study Hours',
    description: 'Track and visualize study time',
    category: 'goal',
    type: 'chart',
    visualStyle: 'professional',
    icon: 'BarChart',
    recommendedFor: ['teen', 'adult'],
    dashboardModes: ['independent', 'personal'],
    tags: ['study', 'time', 'analytics']
  },
  {
    id: '8',
    name: 'Achievement Stickers',
    description: 'Collect stickers for accomplishments',
    category: 'kid-gamified',
    type: 'collection',
    visualStyle: 'kid-friendly',
    icon: 'Star',
    recommendedFor: ['preschool', 'elementary'],
    dashboardModes: ['play', 'guided'],
    tags: ['achievements', 'collection', 'rewards']
  },
  {
    id: '9',
    name: 'Prayer Tracker',
    description: 'Daily prayer habit tracker',
    category: 'habit',
    type: 'grid',
    visualStyle: 'artistic',
    icon: 'Heart',
    recommendedFor: ['elementary', 'teen', 'adult'],
    dashboardModes: ['guided', 'independent', 'personal'],
    tags: ['spiritual', 'daily', 'habits']
  },
  {
    id: '10',
    name: 'Reading Goal',
    description: 'Track progress toward reading goal',
    category: 'goal',
    type: 'progress-bar',
    visualStyle: 'modern',
    icon: 'BookOpen',
    recommendedFor: ['elementary', 'teen', 'adult'],
    dashboardModes: ['guided', 'independent', 'personal'],
    tags: ['reading', 'goals', 'progress']
  }
];

const TrackerGallery: React.FC<TrackerGalleryProps> = ({ isOpen, onClose, onAddTracker }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [selectedPerson, setSelectedPerson] = useState<string>('anyone');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TrackerTemplate | null>(null);
  const [showCustomization, setShowCustomization] = useState(false);

  if (!isOpen) return null;

  // Filter templates based on search and filters
  const filteredTemplates = MOCK_TEMPLATES.filter(template => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }

    // Category filter
    if (selectedCategories.length > 0) {
      if (!selectedCategories.includes(template.category)) return false;
    }

    // Style filter
    if (selectedStyle !== 'all') {
      if (template.visualStyle !== selectedStyle) return false;
    }

    // Person filter (based on age group)
    if (selectedPerson !== 'anyone') {
      // This would be more sophisticated with real family data
      // For now, just basic filtering
      if (selectedPerson === 'kids' && !template.recommendedFor.includes('preschool') && !template.recommendedFor.includes('elementary')) {
        return false;
      }
      if (selectedPerson === 'teens' && !template.recommendedFor.includes('teen')) {
        return false;
      }
      if (selectedPerson === 'adults' && !template.recommendedFor.includes('adult')) {
        return false;
      }
    }

    return true;
  });

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleAddTracker = (template: TrackerTemplate) => {
    setSelectedTemplate(template);
    setShowCustomization(true);
  };

  const handleSaveCustomization = (customization: any) => {
    console.log('Tracker customization saved:', customization);
    // Call the parent's onAddTracker with the customization
    onAddTracker(customization);
    setShowCustomization(false);
    setSelectedTemplate(null);
    // Optionally close the gallery after adding
    // onClose();
  };

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--background-color)',
          borderRadius: '12px',
          width: '95%',
          height: '90%',
          maxWidth: '1400px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Compact */}
        <div style={{
          background: 'var(--gradient-primary)',
          padding: '1rem 1.5rem',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid var(--accent-color)'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: 600,
            fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            Tracker Gallery
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: 'white',
              fontSize: '1.25rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              flexShrink: 0,
              marginLeft: '1rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search and Filter Controls - Compact */}
        <div style={{
          padding: '0.75rem 1.5rem',
          borderBottom: '1px solid var(--accent-color)',
          background: 'var(--gradient-background)'
        }}>
          {/* Search Bar */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: showFilters ? '0.75rem' : 0,
            alignItems: 'center'
          }}>
            <div style={{
              flex: 1,
              position: 'relative'
            }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-color)',
                  opacity: 0.5
                }}
              />
              <input
                type="text"
                placeholder="Search trackers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                  border: '1px solid var(--accent-color)',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  background: 'var(--background-color)',
                  color: 'var(--text-color)',
                  fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                background: showFilters ? 'var(--primary-color)' : 'transparent',
                color: showFilters ? 'white' : 'var(--text-color)',
                border: `1px solid ${showFilters ? 'var(--primary-color)' : 'var(--accent-color)'}`,
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                transition: 'all 0.2s',
                fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={(e) => {
                if (!showFilters) {
                  e.currentTarget.style.background = 'var(--accent-color)';
                }
              }}
              onMouseOut={(e) => {
                if (!showFilters) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Filter size={16} />
              Filters
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {/* Category Filters */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: 'var(--text-color)',
                  opacity: 0.7,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}>
                  Filter by Category:
                </label>
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap'
                }}>
                  {['habit', 'mood', 'goal', 'milestone', 'kid-gamified'].map(category => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      style={{
                        background: selectedCategories.includes(category) ? 'var(--primary-color)' : 'var(--background-color)',
                        color: selectedCategories.includes(category) ? 'white' : 'var(--text-color)',
                        border: `1px solid ${selectedCategories.includes(category) ? 'var(--primary-color)' : 'var(--accent-color)'}`,
                        borderRadius: '6px',
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        transition: 'all 0.2s',
                        textTransform: 'capitalize',
                        fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                      }}
                      onMouseOver={(e) => {
                        if (!selectedCategories.includes(category)) {
                          e.currentTarget.style.background = 'var(--accent-color)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!selectedCategories.includes(category)) {
                          e.currentTarget.style.background = 'var(--background-color)';
                        }
                      }}
                    >
                      {category.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style and Person Filters */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem'
              }}>
                {/* Style Filter */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: 'var(--text-color)',
                    opacity: 0.7,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}>
                    Style:
                  </label>
                  <select
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--accent-color)',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      background: 'var(--background-color)',
                      color: 'var(--text-color)',
                      cursor: 'pointer',
                      fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                  >
                    <option value="all">All Styles</option>
                    <option value="artistic">Artistic</option>
                    <option value="modern">Modern</option>
                    <option value="kid-friendly">Kid-Friendly</option>
                    <option value="professional">Professional</option>
                  </select>
                </div>

                {/* Person Filter */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: 'var(--text-color)',
                    opacity: 0.7,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}>
                    Who:
                  </label>
                  <select
                    value={selectedPerson}
                    onChange={(e) => setSelectedPerson(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--accent-color)',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      background: 'var(--background-color)',
                      color: 'var(--text-color)',
                      cursor: 'pointer',
                      fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                  >
                    <option value="anyone">Anyone</option>
                    <option value="kids">Young Kids</option>
                    <option value="teens">Teens</option>
                    <option value="adults">Adults</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Template Grid - Maximized Space */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '1.5rem'
        }}>
          {filteredTemplates.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: 'var(--text-color)',
              opacity: 0.6
            }}>
              <p style={{
                fontSize: '1.125rem',
                marginBottom: '0.5rem',
                fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                No trackers found
              </p>
              <p style={{
                fontSize: '0.9375rem',
                fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {filteredTemplates.map(template => (
                <TrackerTemplateCard
                  key={template.id}
                  template={template}
                  onAdd={() => handleAddTracker(template)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer - Compact */}
        <div style={{
          padding: '0.75rem 1.5rem',
          borderTop: '1px solid var(--accent-color)',
          background: 'var(--gradient-background)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '0.875rem',
            color: 'var(--text-color)',
            opacity: 0.7,
            fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            Showing {filteredTemplates.length} of {MOCK_TEMPLATES.length} trackers
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid var(--accent-color)',
              borderRadius: '6px',
              padding: '0.5rem 1.5rem',
              cursor: 'pointer',
              color: 'var(--text-color)',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'all 0.2s',
              fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'var(--accent-color)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Close
          </button>
        </div>
      </div>

      {/* Tracker Customization Modal */}
      {showCustomization && selectedTemplate && (
        <TrackerCustomizationModal
          isOpen={showCustomization}
          onClose={() => {
            setShowCustomization(false);
            setSelectedTemplate(null);
          }}
          template={selectedTemplate}
          onSave={handleSaveCustomization}
        />
      )}
    </div>,
    document.getElementById('modal-root') || document.body
  );
};

export default TrackerGallery;
