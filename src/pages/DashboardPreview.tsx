/**
 * Dashboard Preview Page
 * Allows moms to preview all dashboard modes to choose the best fit for their kids
 * Also useful for development and testing
 * Features: Global header with Smart Notepad & Lila, live previews of all dashboard modes
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import GlobalHeader from '../components/global/GlobalHeader';
import PlayModeDashboard from '../components/dashboard/modes/play/PlayModeDashboard';
import GuidedModeDashboard from '../components/dashboard/modes/guided/GuidedModeDashboard';
import IndependentModeDashboard from '../components/dashboard/modes/independent/IndependentModeDashboard';
import FamilyModeDashboard from '../components/dashboard/modes/family/FamilyModeDashboard';
import PersonalDashboard from '../components/dashboard/personal/PersonalDashboard';
import AdditionalAdultDashboard from '../components/dashboard/additional-adult/AdditionalAdultDashboard';
import TrackerGallery from '../components/trackers/gallery/TrackerGallery';
import { personalThemes } from '../styles/colors';
import '../components/global/GlobalHeader.css';

type DashboardMode = 'play' | 'guided' | 'independent' | 'family' | 'personal-mom' | 'additional-adult';

const DASHBOARD_MODES = [
  {
    id: 'play' as DashboardMode,
    name: 'Play Mode',
    ageRange: 'Young Children (Ish...)',
    description: 'Fun, gamified experience with bright colors and animations. Perfect for young children.',
    features: ['Animated tasks', 'Star rewards', 'Victory celebrations', 'Simple interface']
  },
  {
    id: 'guided' as DashboardMode,
    name: 'Guided Mode',
    ageRange: 'Pre-Teens (Ish...)',
    description: 'Balanced approach with some gamification but more structure. For pre-teens.',
    features: ['Task management', 'Calendar', 'Points system', 'Parent guidance']
  },
  {
    id: 'independent' as DashboardMode,
    name: 'Independent Mode',
    ageRange: 'Teens (Ish...)',
    description: 'Sophisticated, professional dashboard for teens. Full-featured productivity tools.',
    features: ['Advanced task manager', 'Analytics', 'Victory recorder', 'Privacy controls', 'Keyboard shortcuts']
  },
  {
    id: 'family' as DashboardMode,
    name: 'Family Mode',
    ageRange: 'Parent/Guardian',
    description: "Dashboard to manage the whole family. Overview of everyone's activities and family coordination.",
    features: ['Family overview', 'Task assignment', 'Calendar management', 'Reports']
  },
  {
    id: 'personal-mom' as DashboardMode,
    name: "Mom's Personal",
    ageRange: '',
    description: "Your personal productivity dashboard. Separate from family management - for your own tasks, goals, and personal organization.",
    features: ['Personal task manager', 'Goal tracking', 'Time management', 'Self-care reminders', 'Personal analytics']
  },
  {
    id: 'additional-adult' as DashboardMode,
    name: 'Additional Adult',
    ageRange: 'Adult',
    description: 'For husbands, grandparents, babysitters, tutors, and other helpers. Permission-based access with customizable viewing and editing rights.',
    features: ['Permission-based access', 'View family data', 'Customizable permissions', 'Limited editing based on access']
  }
];

export const DashboardPreview: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<DashboardMode | null>(null);
  const [currentTheme, setCurrentTheme] = useState('classic');
  const [showTrackerGallery, setShowTrackerGallery] = useState(false);

  // Apply theme
  React.useEffect(() => {
    const theme = personalThemes[currentTheme as keyof typeof personalThemes] || personalThemes.classic;
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--secondary-color', theme.secondary);
    root.style.setProperty('--accent-color', theme.accent);
    root.style.setProperty('--background-color', theme.background);
    root.style.setProperty('--text-color', theme.text);
    root.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`);
    root.style.setProperty('--gradient-background', `linear-gradient(135deg, ${theme.background}, ${theme.accent}20)`);
  }, [currentTheme]);

  const selectedDashboard = selectedMode ? DASHBOARD_MODES.find(d => d.id === selectedMode) : null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background-color)',
      color: 'var(--text-color)',
      paddingBottom: '3rem',
      position: 'relative'
    }}>
      {/* Global Header with Smart Notepad and Lila */}
      <div className="header-grid" style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--gradient-primary)',
        borderBottom: '3px solid var(--accent-color)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        padding: '0.75rem 1.5rem'
      }}>
        <GlobalHeader
          contextType="preview"
        />
      </div>

      {/* Page Title */}
      <div style={{
        maxWidth: '1400px',
        margin: '2rem auto 1rem',
        padding: '0 1.5rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--primary-color)'
            }}>
              Dashboard Preview
            </h1>
            <p style={{
              margin: '0.5rem 0 0 0',
              fontSize: '0.9375rem',
              opacity: 0.8
            }}>
              Preview dashboard modes to choose the best fit for your family members
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setShowTrackerGallery(true)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                background: 'var(--primary-color)',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              Browse Trackers
            </button>
            <Link
              to="/"
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid var(--primary-color)',
                background: 'transparent',
                color: 'var(--primary-color)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 600
              }}
            >
              ← Back to App
            </Link>
          </div>
        </div>
      </div>

      {/* Mode Selector */}
      <div style={{
        maxWidth: '1400px',
        margin: '2rem auto',
        padding: '0 1.5rem',
        paddingBottom: '2rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '0.75rem',
          marginBottom: '2rem'
        }}>
          {DASHBOARD_MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              style={{
                background: 'var(--background-color)',
                border: '2px solid var(--accent-color)',
                borderRadius: '6px',
                padding: '0.75rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: 'var(--text-color)',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '120px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--gradient-primary)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = 'var(--primary-color)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--background-color)';
                e.currentTarget.style.color = 'var(--text-color)';
                e.currentTarget.style.borderColor = 'var(--accent-color)';
              }}
            >
              <h3 style={{
                margin: '0 0 0.25rem 0',
                fontSize: '0.875rem',
                fontWeight: 600
              }}>
                {mode.name}
              </h3>
              <p style={{
                margin: '0',
                fontSize: '0.6875rem',
                opacity: 0.85,
                fontWeight: 500
              }}>
                {mode.ageRange}
              </p>
            </button>
          ))}
        </div>

        {/* Dashboard Info */}
        <div style={{
          background: 'var(--gradient-background)',
          border: '1px solid var(--accent-color)',
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h2 style={{
            margin: '0 0 0.75rem 0',
            fontSize: '1.5rem',
            fontWeight: 600,
            color: 'var(--primary-color)'
          }}>
            Click a Dashboard Mode to Preview
          </h2>
          <p style={{
            margin: 0,
            fontSize: '1rem',
            opacity: 0.8
          }}>
            Each dashboard mode will open in a full-screen preview so you can explore all the features and see which one works best for your family members.
          </p>
        </div>
      </div>

      {/* Modal for Dashboard Preview */}
      {selectedMode && selectedDashboard && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
          onClick={() => setSelectedMode(null)}
        >
          <div
            style={{
              background: 'var(--background-color)',
              borderRadius: '12px',
              width: '95%',
              height: '95%',
              maxWidth: '1600px',
              maxHeight: '95vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              background: 'var(--gradient-primary)',
              padding: '1.5rem 2rem',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '3px solid var(--accent-color)'
            }}>
              <div>
                <h2 style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  fontWeight: 600
                }}>
                  {selectedDashboard.name}{selectedDashboard.ageRange ? ` - ${selectedDashboard.ageRange}` : ''}
                </h2>
                <p style={{
                  margin: '0.5rem 0 0 0',
                  fontSize: '0.9375rem',
                  opacity: 0.95
                }}>
                  {selectedDashboard.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedMode(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  color: 'white',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                  marginLeft: '2rem'
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
                ×
              </button>
            </div>

            {/* Modal Content - Dashboard Preview */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              background: 'var(--background-color)'
            }}>
              {selectedMode === 'play' && (
                <PlayModeDashboard familyMemberId="preview-play" />
              )}
              {selectedMode === 'guided' && (
                <GuidedModeDashboard familyMemberId="preview-guided" />
              )}
              {selectedMode === 'independent' && (
                <IndependentModeDashboard familyMemberId="preview-independent" />
              )}
              {selectedMode === 'family' && (
                <FamilyModeDashboard familyId="preview-family" />
              )}
              {selectedMode === 'personal-mom' && (
                <PersonalDashboard />
              )}
              {selectedMode === 'additional-adult' && (
                <AdditionalAdultDashboard familyMemberId="preview-adult" />
              )}
            </div>

            {/* Modal Footer with Feature List */}
            <div style={{
              background: 'var(--gradient-background)',
              padding: '1rem 2rem',
              borderTop: '1px solid var(--accent-color)'
            }}>
              <div style={{
                display: 'flex',
                gap: '2rem',
                flexWrap: 'wrap',
                fontSize: '0.875rem'
              }}>
                <div style={{ fontWeight: 600, opacity: 0.7 }}>Key Features:</div>
                {selectedDashboard.features.map((feature, idx) => (
                  <div key={idx} style={{ opacity: 0.9 }}>• {feature}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tracker Gallery */}
      <TrackerGallery
        isOpen={showTrackerGallery}
        onClose={() => setShowTrackerGallery(false)}
        onAddTracker={(template) => {
          console.log('Adding tracker:', template);
          // TODO: Open customization modal
          setShowTrackerGallery(false);
        }}
      />
    </div>
  );
};

export default DashboardPreview;
