/**
 * PersonalDashboard Component
 * Mom's personal dashboard - completely private sanctuary
 * NO EMOJIS - CSS VARIABLES ONLY - THEME AWARE
 * Styled like IndependentModeDashboard with weekly/monthly calendar views
 */

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Plus, Lock, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { usePersonalDashboard } from '../../../hooks/dashboard/usePersonalDashboard';
import { useAuthContext } from '../../auth/shared/AuthContext';
import PersonalWidgetContainer from './PersonalWidgetContainer';
import { WidgetType, WidgetPosition, AVAILABLE_WIDGETS } from '../../../types/dashboard.types';
import PersonalBestIntentions from './widgets/PersonalBestIntentions';
import PersonalTasks from './widgets/PersonalTasks';
import PersonalCalendar from './widgets/PersonalCalendar';
import PersonalNotes from './widgets/PersonalNotes';
import MindSweepCapture from './widgets/MindSweepCapture';
import GiftPlanning from './widgets/GiftPlanning';
import PersonalVictoryRecorder from './widgets/PersonalVictoryRecorder';
import DashboardSwitcher from '../DashboardSwitcher';
import ManageDashboardsModal from '../ManageDashboardsModal';
import { IndependentModeCalendar } from '../modes/independent/IndependentModeCalendar';
import { personalThemes } from '../../../styles/colors';

const PersonalDashboard: React.FC = () => {
  const { state } = useAuthContext();
  const { config, loading, error, addWidget, removeWidget, updateWidgetPosition, refresh } =
    usePersonalDashboard(state.user?.id ? String(state.user.id) : null);

  const [showAddWidget, setShowAddWidget] = useState(false);
  const [showManageDashboards, setShowManageDashboards] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<keyof typeof personalThemes>('classic');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [weekStartsOnMonday, setWeekStartsOnMonday] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

  // Get days in month for selected month/year
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  // Handle date jump
  const handleDateJump = () => {
    const newDate = new Date(selectedYear, selectedMonth - 1, selectedDay);
    setCurrentWeek(newDate);
  };

  // Update when month/day/year changes
  useEffect(() => {
    handleDateJump();
  }, [selectedMonth, selectedDay, selectedYear]);

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

  if (loading) {
    return (
      <div style={{
        background: 'var(--gradient-primary)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div>Loading your personal space...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: 'var(--gradient-primary)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          background: 'var(--background-color)',
          padding: '2rem',
          borderRadius: '16px',
          textAlign: 'center',
          maxWidth: '400px',
          border: `1px solid var(--accent-color)`
        }}>
          <h3 style={{ color: 'var(--text-color)', marginBottom: '1rem' }}>Error loading dashboard</h3>
          <p style={{ color: 'var(--text-color)', opacity: 0.7, marginBottom: '1.5rem' }}>{error}</p>
          <button
            onClick={refresh}
            style={{
              background: 'var(--gradient-primary)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const handleAddWidget = async (widgetType: WidgetType) => {
    if (!config) return;

    const position: WidgetPosition = {
      x: 0,
      y: config.widgets.length * 2,
      w: 2,
      h: 2
    };

    const success = await addWidget(widgetType, position);
    if (success) {
      setShowAddWidget(false);
    }
  };

  const renderWidgetContent = (widget: any) => {
    const widgetProps = { familyMemberId: String(state.user?.id || '') };

    switch (widget.widget_type) {
      case 'best_intentions':
        return <PersonalBestIntentions {...widgetProps} />;
      case 'tasks':
        return <PersonalTasks {...widgetProps} />;
      case 'calendar':
        return <PersonalCalendar {...widgetProps} />;
      case 'archives':
        return <PersonalNotes {...widgetProps} />;
      case 'victory_recorder':
        return <PersonalVictoryRecorder {...widgetProps} />;
      default:
        return null;
    }
  };

  const personalWidgets = AVAILABLE_WIDGETS.filter(w =>
    ['best_intentions', 'tasks', 'calendar', 'archives', 'victory_recorder'].includes(w.type)
  );

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
        {/* Header Card */}
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
                My Personal Dashboard
              </h1>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.95rem',
                color: 'var(--text-color)',
                opacity: 0.7
              }}>
                <Lock size={14} />
                <span>Private - Hidden from Family</span>
              </div>
            </div>

            {/* Dashboard Controls */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <DashboardSwitcher onManageDashboards={() => setShowManageDashboards(true)} />

              <button
                onClick={() => setShowAddWidget(!showAddWidget)}
                style={{
                  background: 'var(--gradient-primary)',
                  color: 'white',
                  border: 'none',
                  padding: '0.875rem 1.75rem',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Plus size={18} />
                {showAddWidget ? 'Close' : 'Add Widget'}
              </button>
            </div>
          </div>
        </div>

        {/* Widget Selector */}
        {showAddWidget && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '1.5rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: `1px solid var(--accent-color)`
          }}>
            <h3 style={{
              margin: '0 0 1.5rem 0',
              color: 'var(--primary-color)',
              fontSize: '1.5rem',
              fontWeight: 600
            }}>
              Add a Widget
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {/* Add custom personal widgets */}
              <div
                onClick={() => handleAddWidget('best_intentions' as WidgetType)}
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: `2px solid var(--accent-color)`,
                  borderRadius: '16px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
              >
                <h4 style={{
                  margin: '0 0 0.5rem 0',
                  color: 'var(--text-color)',
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}>
                  Mind Sweep
                </h4>
                <p style={{
                  margin: 0,
                  color: 'var(--text-color)',
                  opacity: 0.7,
                  fontSize: '0.9rem'
                }}>
                  Quick brain dump capture
                </p>
              </div>

              <div
                onClick={() => handleAddWidget('tasks' as WidgetType)}
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: `2px solid var(--accent-color)`,
                  borderRadius: '16px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
              >
                <h4 style={{
                  margin: '0 0 0.5rem 0',
                  color: 'var(--text-color)',
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}>
                  Gift Planning
                </h4>
                <p style={{
                  margin: 0,
                  color: 'var(--text-color)',
                  opacity: 0.7,
                  fontSize: '0.9rem'
                }}>
                  Completely private gift tracking
                </p>
              </div>

              {personalWidgets.map((widget) => (
                <div
                  key={widget.type}
                  onClick={() => handleAddWidget(widget.type)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    border: `2px solid var(--accent-color)`,
                    borderRadius: '16px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                >
                  <h4 style={{
                    margin: '0 0 0.5rem 0',
                    color: 'var(--text-color)',
                    fontSize: '1.1rem',
                    fontWeight: 600
                  }}>
                    {widget.title}
                  </h4>
                  <p style={{
                    margin: 0,
                    color: 'var(--text-color)',
                    opacity: 0.7,
                    fontSize: '0.9rem'
                  }}>
                    {widget.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* This Week Calendar View - Full Width */}
        <div style={{
          background: 'var(--background-color)',
          border: '1px solid var(--accent-color)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h3 style={{
                color: 'var(--primary-color)',
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 600
              }}>
                This Week
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8125rem',
                color: 'var(--text-color)',
                opacity: 0.6
              }}>
                <Lock size={12} />
                <span>Private</span>
              </div>
            </div>
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

          {/* Calendar Grid */}
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

        {/* Widgets Grid */}
        {config && config.widgets.length === 0 ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '4rem 2rem',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: `2px dashed var(--primary-color)`
          }}>
            <h3 style={{
              color: 'var(--primary-color)',
              fontSize: '1.75rem',
              margin: '0 0 1rem 0',
              fontFamily: '"The Seasons", "Playfair Display", serif'
            }}>
              Your Personal Sanctuary
            </h3>
            <p style={{
              color: 'var(--text-color)',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.7',
              fontSize: '1.05rem'
            }}>
              Add widgets for your eyes only - gift planning, personal goals, private notes, and more.
              This is your space for personal growth and reflection.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '1.5rem'
          }}>
            {config?.widgets.map((widget) => (
              <div
                key={widget.id}
                style={{
                  gridColumn: 'span 6', // Each widget takes half width by default
                }}
              >
                <div style={{
                  background: 'var(--background-color)',
                  border: '1px solid var(--accent-color)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  height: '100%',
                  position: 'relative'
                }}>
                  {/* Privacy indicator for each widget */}
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-color)',
                    opacity: 0.5,
                    fontStyle: 'italic'
                  }}>
                    <Lock size={10} />
                    <span>Private</span>
                  </div>
                  <PersonalWidgetContainer
                    widget={widget}
                    onRemove={() => removeWidget(widget.id)}
                    onMove={(newPosition) => updateWidgetPosition(widget.id, newPosition)}
                  >
                    {renderWidgetContent(widget)}
                  </PersonalWidgetContainer>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Manage Dashboards Modal */}
        <ManageDashboardsModal
          isOpen={showManageDashboards}
          onClose={() => setShowManageDashboards(false)}
        />
      </div>

      {/* Full Month Calendar Modal */}
      {showMonthModal && ReactDOM.createPortal(
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {/* Month and Year Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <h2 style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    fontWeight: 600
                  }}>
                    {['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'][currentWeek.getMonth()]} {currentWeek.getFullYear()}
                  </h2>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    opacity: 0.9
                  }}>
                    <Lock size={14} />
                    <span>Private</span>
                  </div>
                </div>

                {/* Week Start Toggle - Small Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  padding: '2px'
                }}>
                  <button
                    onClick={() => setWeekStartsOnMonday(false)}
                    style={{
                      background: !weekStartsOnMonday ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      opacity: !weekStartsOnMonday ? 1 : 0.7
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = !weekStartsOnMonday ? 'rgba(255, 255, 255, 0.3)' : 'transparent'}
                  >
                    Sun
                  </button>
                  <button
                    onClick={() => setWeekStartsOnMonday(true)}
                    style={{
                      background: weekStartsOnMonday ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      opacity: weekStartsOnMonday ? 1 : 0.7
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = weekStartsOnMonday ? 'rgba(255, 255, 255, 0.3)' : 'transparent'}
                  >
                    Mon
                  </button>
                </div>

                {/* Date Picker - Jump to any date with dropdowns */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.75rem',
                  opacity: 0.85
                }}>
                  <span>Jump to:</span>

                  {/* Month Dropdown */}
                  <select
                    value={selectedMonth}
                    onChange={(e) => {
                      const newMonth = parseInt(e.target.value);
                      setSelectedMonth(newMonth);
                      // Adjust day if it exceeds days in new month
                      const daysInNewMonth = getDaysInMonth(newMonth, selectedYear);
                      if (selectedDay > daysInNewMonth) {
                        setSelectedDay(daysInNewMonth);
                      }
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      color: 'white',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      minWidth: '50px'
                    }}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month} style={{ background: 'var(--primary-color)', color: 'white' }}>
                        {String(month).padStart(2, '0')}
                      </option>
                    ))}
                  </select>

                  {/* Day Dropdown */}
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      color: 'white',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      minWidth: '50px'
                    }}
                  >
                    {Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day} style={{ background: 'var(--primary-color)', color: 'white' }}>
                        {String(day).padStart(2, '0')}
                      </option>
                    ))}
                  </select>

                  {/* Year Input */}
                  <input
                    type="number"
                    value={selectedYear}
                    onChange={(e) => {
                      const newYear = parseInt(e.target.value);
                      if (!isNaN(newYear) && newYear > 1900 && newYear < 2200) {
                        setSelectedYear(newYear);
                        // Adjust day if needed (leap year changes)
                        const daysInMonth = getDaysInMonth(selectedMonth, newYear);
                        if (selectedDay > daysInMonth) {
                          setSelectedDay(daysInMonth);
                        }
                      }
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      color: 'white',
                      fontSize: '0.75rem',
                      width: '70px',
                      textAlign: 'center'
                    }}
                  />
                </div>
              </div>

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

            {/* Modal Content - Calendar with Full Month View */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: '1.5rem'
            }}>
              <IndependentModeCalendar
                familyMemberId={String(state.user?.id || '')}
                viewMode="self"
                initialExpanded={true}
                defaultWeekStartsOnMonday={weekStartsOnMonday}
                initialDate={currentWeek}
                hideViewSelector={true}
              />
            </div>
          </div>
        </div>,
        document.getElementById('modal-root') || document.body
      )}
    </div>
  );
};

export default PersonalDashboard;
