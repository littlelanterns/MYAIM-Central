/**
 * IndependentModeDashboard Component - Clean Family-Style Version
 * Dashboard for teens (13-18 years) with professional Family Dashboard styling
 * Features: This Week view, elegant cards, gradient background
 * All colors via CSS variables for theme compatibility
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { IndependentModeTaskWidget } from './IndependentModeTaskWidget';
import { IndependentModeVictoryRecorder } from './IndependentModeVictoryRecorder';
import { IndependentModeAnalytics } from './IndependentModeAnalytics';
import { IndependentModeCalendar } from './IndependentModeCalendar';
import { IndependentModeBestIntentions } from './IndependentModeBestIntentions';
import { personalThemes } from '../../../../styles/colors';
import './IndependentMode.css';

interface IndependentModeDashboardProps {
  familyMemberId: string;
}

export const IndependentModeDashboard: React.FC<IndependentModeDashboardProps> = ({
  familyMemberId
}) => {
  const [currentTheme, setCurrentTheme] = useState<keyof typeof personalThemes>('classic');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showMonthModal, setShowMonthModal] = useState(false);

  // Apply theme to root
  useEffect(() => {
    const theme = personalThemes[currentTheme] || personalThemes.classic;
    const root = document.documentElement;

    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--secondary-color', theme.secondary);
    root.style.setProperty('--accent-color', theme.accent);
    root.style.setProperty('--background-color', theme.background);
    root.style.setProperty('--text-color', theme.text);
    root.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`);
    root.style.setProperty('--gradient-background', `linear-gradient(135deg, ${theme.background}, ${theme.accent}20)`);
  }, [currentTheme]);

  // Week navigation
  const handlePreviousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  const handleNextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  // Get week dates
  const getWeekDates = () => {
    const week: Date[] = [];
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      week.push(date);
    }
    return week;
  };

  const weekDates = getWeekDates();
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get theme groups for organized selector
  const getThemeGroups = () => {
    const general: Array<{ key: string; theme: any }> = [];    // Standard adult/professional themes
    const seasonal: Array<{ key: string; theme: any }> = [];   // Seasonal and holiday themes combined
    const fun: Array<{ key: string; theme: any }> = [];        // Child-friendly themes

    Object.entries(personalThemes).forEach(([key, theme]) => {
      // Prioritize seasonal/holiday categorization over childFriendly
      if ((theme as any).seasonal || (theme as any).holiday) {
        seasonal.push({ key, theme });
      } else if ((theme as any).childFriendly) {
        fun.push({ key, theme });
      } else {
        general.push({ key, theme });
      }
    });

    return { general, seasonal, fun };
  };

  const { general, seasonal, fun } = getThemeGroups();

  return (
    <div style={{
      background: 'var(--gradient-primary)',
      minHeight: '100vh',
      color: 'var(--text-color)',
      fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '1.5rem'
    }}>
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '1.5rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid var(--accent-color)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h1 style={{
                margin: '0 0 0.5rem 0',
                fontSize: '2rem',
                fontWeight: 600,
                color: 'var(--primary-color)',
                fontFamily: '"The Seasons", "Playfair Display", serif'
              }}>
                My Dashboard
              </h1>
              <p style={{
                margin: 0,
                fontSize: '0.95rem',
                color: 'var(--text-color)',
                opacity: 0.7
              }}>
                Your personal productivity command center
              </p>
            </div>

            {/* Theme Selector - Organized by Category */}
            <select
              value={currentTheme}
              onChange={(e) => setCurrentTheme(e.target.value as keyof typeof personalThemes)}
              style={{
                background: 'var(--gradient-background)',
                border: '1px solid var(--accent-color)',
                borderRadius: '12px',
                padding: '0.875rem 1.5rem',
                fontSize: '1rem',
                color: 'var(--text-color)',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <optgroup label="General">
                {general.map(({ key, theme }) => (
                  <option key={key} value={key}>{theme.name}</option>
                ))}
              </optgroup>
              <optgroup label="Seasonal">
                {seasonal.map(({ key, theme }) => (
                  <option key={key} value={key}>{theme.name}</option>
                ))}
              </optgroup>
              <optgroup label="Fun">
                {fun.map(({ key, theme }) => (
                  <option key={key} value={key}>{theme.name}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Widgets Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '1.5rem'
        }}>
          {/* This Week - Full width */}
          <div style={{ gridColumn: 'span 12' }}>
            <div style={{
              background: 'var(--background-color)',
              border: '1px solid var(--accent-color)',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <h3 style={{
                  color: 'var(--primary-color)',
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: 600
                }}>
                  This Week
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      onClick={handlePreviousWeek}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--accent-color)',
                        borderRadius: '6px',
                        padding: '0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        color: 'var(--text-color)',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'var(--accent-color)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-color)'
                    }}>
                      {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                      {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <button
                      onClick={handleNextWeek}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--accent-color)',
                        borderRadius: '6px',
                        padding: '0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        color: 'var(--text-color)',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'var(--accent-color)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <button
                    onClick={() => setShowMonthModal(true)}
                    style={{
                      background: 'var(--primary-color)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.5rem 1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: 'white',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    <CalendarIcon size={14} />
                    View Month
                  </button>
                </div>
              </div>

              {/* Calendar grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '0.5rem'
              }}>
                {daysOfWeek.map((day, index) => {
                  const isToday = new Date().toDateString() === weekDates[index].toDateString();

                  return (
                    <div
                      key={day}
                      style={{
                        minHeight: '100px',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <div style={{
                        background: isToday ? 'var(--gradient-primary)' : 'var(--accent-color)',
                        color: isToday ? 'white' : 'var(--text-color)',
                        padding: '0.5rem',
                        borderRadius: '6px 6px 0 0',
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        <div>{day}</div>
                        <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                          {weekDates[index].getDate()}
                        </div>
                      </div>
                      <div style={{
                        flex: 1,
                        background: 'var(--background-color)',
                        border: '1px solid var(--accent-color)',
                        borderTop: 'none',
                        borderRadius: '0 0 6px 6px',
                        padding: '0.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem'
                      }}>
                        <div style={{
                          color: 'var(--text-color)',
                          opacity: 0.3,
                          fontSize: '0.75rem',
                          textAlign: 'center',
                          padding: '0.5rem 0'
                        }}>
                          No events
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tasks - Left side */}
          <div style={{ gridColumn: 'span 6' }}>
            <div style={{
              background: 'var(--background-color)',
              border: '1px solid var(--accent-color)',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              height: '100%'
            }}>
              <IndependentModeTaskWidget
                familyMemberId={familyMemberId}
                viewMode="self"
              />
            </div>
          </div>

          {/* Victory Recorder - Right side */}
          <div style={{ gridColumn: 'span 6' }}>
            <div style={{
              background: 'var(--background-color)',
              border: '1px solid var(--accent-color)',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              height: '100%'
            }}>
              <IndependentModeVictoryRecorder
                familyMemberId={familyMemberId}
                viewMode="self"
              />
            </div>
          </div>

          {/* Analytics - Left side */}
          <div style={{ gridColumn: 'span 7' }}>
            <div style={{
              background: 'var(--background-color)',
              border: '1px solid var(--accent-color)',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}>
              <IndependentModeAnalytics
                familyMemberId={familyMemberId}
                viewMode="self"
              />
            </div>
          </div>

          {/* Best Intentions - Right side */}
          <div style={{ gridColumn: 'span 5' }}>
            <div style={{
              background: 'var(--background-color)',
              border: '1px solid var(--accent-color)',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}>
              <IndependentModeBestIntentions
                familyMemberId={familyMemberId}
                viewMode="self"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Full Month Modal */}
      {showMonthModal && (
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
          onClick={() => setShowMonthModal(false)}
        >
          <div
            style={{
              background: 'var(--background-color)',
              borderRadius: '12px',
              width: '95%',
              height: '90%',
              maxWidth: '1200px',
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
              <h2 style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: 600
              }}>
                Full Month Calendar
              </h2>
              <button
                onClick={() => setShowMonthModal(false)}
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
                  transition: 'all 0.2s ease'
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

            {/* Modal Content - Calendar */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: '1.5rem'
            }}>
              <IndependentModeCalendar
                familyMemberId={familyMemberId}
                viewMode="self"
                initialExpanded={true}
                hideViewSelector={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndependentModeDashboard;
