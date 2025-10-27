/**
 * IndependentModeCalendar Component
 * Full-featured calendar for teens
 * Features: Monthly/weekly/daily views, task integration, event management
 * All colors via CSS variables for theme compatibility
 */

import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Calendar } from 'lucide-react';
import '../independent/IndependentMode.css';
import DateDetailModal from '../../../modals/DateDetailModal';
import { supabase } from '../../../../lib/supabase';

interface CalendarProps {
  familyMemberId: string;
  viewMode?: 'self' | 'parent';
  initialExpanded?: boolean;
  defaultWeekStartsOnMonday?: boolean;
  initialDate?: Date;
  hideViewSelector?: boolean;
}

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  type: 'task' | 'event' | 'deadline' | 'reminder';
  category?: string;
  isAllDay: boolean;
  isRecurring?: boolean;
  priority?: 'low' | 'medium' | 'high';
}

type CalendarView = 'month' | 'week' | 'day';

const DAYS_OF_WEEK_SUNDAY_START = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_OF_WEEK_MONDAY_START = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];

export const IndependentModeCalendar: React.FC<CalendarProps> = ({
  familyMemberId,
  viewMode = 'self',
  initialExpanded = false,
  defaultWeekStartsOnMonday = false,
  initialDate,
  hideViewSelector = false
}) => {
  // State
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [weekStartsOnMonday, setWeekStartsOnMonday] = useState(defaultWeekStartsOnMonday);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Update currentDate when initialDate changes (for date picker navigation)
  useEffect(() => {
    if (initialDate) {
      setCurrentDate(initialDate);
    }
  }, [initialDate]);

  // Load user's week start preference from database
  useEffect(() => {
    const loadWeekStartPreference = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('family_members')
          .select('week_start_preference')
          .eq('auth_user_id', user.id)
          .single();

        if (error) {
          console.log('No week start preference found, using default');
          return;
        }

        if (data?.week_start_preference !== undefined && data?.week_start_preference !== null) {
          setWeekStartsOnMonday(data.week_start_preference === 'monday');
        }
      } catch (error) {
        console.error('Error loading week start preference:', error);
      }
    };
    loadWeekStartPreference();
  }, []);

  // Update weekStartsOnMonday when prop changes
  useEffect(() => {
    setWeekStartsOnMonday(defaultWeekStartsOnMonday);
  }, [defaultWeekStartsOnMonday]);

  // Mock events - in real implementation, fetch from Supabase
  const events: CalendarEvent[] = [
    {
      id: '1',
      title: 'Math Test',
      description: 'Chapter 5-7',
      start: new Date(2025, 9, 23, 10, 0),
      end: new Date(2025, 9, 23, 11, 30),
      type: 'deadline',
      category: 'academic',
      isAllDay: false,
      priority: 'high'
    },
    {
      id: '2',
      title: 'Soccer Practice',
      start: new Date(2025, 9, 21, 16, 0),
      end: new Date(2025, 9, 21, 18, 0),
      type: 'event',
      category: 'sports',
      isAllDay: false,
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Book Report Due',
      start: new Date(2025, 9, 25, 0, 0),
      end: new Date(2025, 9, 25, 23, 59),
      type: 'deadline',
      category: 'academic',
      isAllDay: true,
      priority: 'high'
    },
    {
      id: '4',
      title: 'Complete Week 3 Tasks',
      start: new Date(2025, 9, 22, 14, 0),
      end: new Date(2025, 9, 22, 16, 0),
      type: 'task',
      category: 'personal',
      isAllDay: false,
      priority: 'medium'
    }
  ];

  // Get days of week based on preference
  const DAYS_OF_WEEK = weekStartsOnMonday ? DAYS_OF_WEEK_MONDAY_START : DAYS_OF_WEEK_SUNDAY_START;

  // Get current week's days
  const currentWeekDays = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    const weekStart = new Date(today);

    // Adjust for Monday start if needed
    if (weekStartsOnMonday) {
      const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      weekStart.setDate(today.getDate() - offset);
    } else {
      weekStart.setDate(today.getDate() - dayOfWeek); // Start from Sunday
    }

    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      week.push(day);
    }
    return week;
  }, [weekStartsOnMonday]);

  // Get calendar grid for current month view
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    let startingDayOfWeek = firstDay.getDay();

    // Adjust for Monday start
    if (weekStartsOnMonday) {
      startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    }

    const days: (Date | null)[] = [];

    // Add previous month's trailing days
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push(prevMonthDay);
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    // Add next month's leading days to fill the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  }, [currentDate, weekStartsOnMonday]);

  // Handle week start preference change and save to database
  const handleWeekStartChange = async (startsOnMonday: boolean) => {
    setWeekStartsOnMonday(startsOnMonday);

    // Save to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('family_members')
          .update({ week_start_preference: startsOnMonday ? 'monday' : 'sunday' })
          .eq('auth_user_id', user.id);

        if (error) {
          console.error('Error saving week start preference:', error);
        }
      }
    } catch (error) {
      console.error('Error updating week start preference:', error);
    }
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Date picker handlers
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(parseInt(e.target.value));
    setCurrentDate(newDate);
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = new Date(currentDate);
    newDate.setDate(parseInt(e.target.value));
    setCurrentDate(newDate);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(parseInt(e.target.value));
    setCurrentDate(newDate);
  };

  // Generate options for date picker
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Check if date is in current month
  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentDate.getMonth();
  };

  // Get event type color class
  const getEventTypeClass = (type: string): string => {
    switch (type) {
      case 'deadline': return 'event-deadline';
      case 'task': return 'event-task';
      case 'event': return 'event-general';
      case 'reminder': return 'event-reminder';
      default: return 'event-general';
    }
  };

  // Compact week view (default)
  if (!isExpanded) {
    return (
      <div className="independent-calendar-compact" onClick={() => setIsExpanded(true)} style={{
        cursor: 'pointer',
        border: '1px solid var(--accent-color)',
        borderRadius: '8px',
        padding: '1rem',
        background: 'var(--gradient-background)',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem'
        }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--primary-color)' }}>
            This Week
          </h3>
          <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Click to expand</span>
        </div>

        {/* Compact Week Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '0.5rem'
        }}>
          {currentWeekDays.map((date, index) => {
            const dayEvents = getEventsForDate(date);
            const isTodayDate = isToday(date);

            return (
              <div
                key={index}
                style={{
                  textAlign: 'center',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  background: isTodayDate ? 'var(--primary-color)' : 'transparent',
                  color: isTodayDate ? 'white' : 'var(--text-color)',
                  border: `1px solid ${isTodayDate ? 'var(--primary-color)' : 'transparent'}`
                }}
              >
                <div style={{ fontSize: '0.625rem', opacity: 0.8, marginBottom: '0.25rem' }}>
                  {DAYS_OF_WEEK[index]}
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  {date.getDate()}
                </div>
                {dayEvents.length > 0 && (
                  <div style={{
                    marginTop: '0.25rem',
                    fontSize: '0.625rem',
                    opacity: 0.7
                  }}>
                    {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Calendar content (can be used standalone or in a modal)
  const calendarContent = (
    <div className="independent-calendar-container">
            {/* Header */}
            <div className="independent-calendar-header">
        {/* View Controls on Left */}
        <div className="independent-calendar-controls">
          {/* View Switcher - Hidden when hideViewSelector is true */}
          {!hideViewSelector ? (
            <>
              <div className="independent-calendar-view-switcher">
                <button
                  className={`independent-view-btn ${view === 'month' ? 'active' : ''}`}
                  onClick={() => setView('month')}
                >
                  Month
                </button>
                <button
                  className={`independent-view-btn ${view === 'week' ? 'active' : ''}`}
                  onClick={() => setView('week')}
                >
                  Week
                </button>
                <button
                  className={`independent-view-btn ${view === 'day' ? 'active' : ''}`}
                  onClick={() => setView('day')}
                >
                  Day
                </button>
              </div>

              {/* Week Start Toggle */}
              <div className="independent-calendar-view-switcher">
                <button
                  className={`independent-view-btn ${!weekStartsOnMonday ? 'active' : ''}`}
                  onClick={() => handleWeekStartChange(false)}
                  title="Week starts on Sunday"
                >
                  Sun
                </button>
                <button
                  className={`independent-view-btn ${weekStartsOnMonday ? 'active' : ''}`}
                  onClick={() => handleWeekStartChange(true)}
                  title="Week starts on Monday"
                >
                  Mon
                </button>
              </div>
            </>
          ) : (
            /* Month/Year Display when view selector is hidden */
            <h2 className="independent-calendar-month-title">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
          )}
        </div>

        {/* Navigation on Right */}
        <div className="independent-calendar-nav">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="independent-nav-btn"
            title="Jump to date"
          >
            <Calendar size={18} />
          </button>
          <button onClick={goToPreviousMonth} className="independent-nav-btn">
            ←
          </button>
          <button onClick={goToNextMonth} className="independent-nav-btn">
            →
          </button>
        </div>
      </div>

      {/* Date Picker Dropdowns - Shows below header when toggled */}
      {showDatePicker && (
        <div className="independent-calendar-date-picker">
          <select
            className="independent-date-select independent-month-select"
            value={currentDate.getMonth()}
            onChange={handleMonthChange}
            aria-label="Select month"
          >
            {months.map((month, index) => (
              <option key={index} value={index}>
                {month}
              </option>
            ))}
          </select>

          <select
            className="independent-date-select independent-day-select"
            value={currentDate.getDate()}
            onChange={handleDayChange}
            aria-label="Select day"
          >
            {days.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>

          <select
            className="independent-date-select independent-year-select"
            value={currentDate.getFullYear()}
            onChange={handleYearChange}
            aria-label="Select year"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Month View */}
      {view === 'month' && (
        <div className="independent-calendar-month-view">
          {/* Day Headers */}
          <div className="independent-calendar-day-headers">
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="independent-calendar-day-header">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="independent-calendar-grid">
            {calendarDays.map((date, index) => {
              if (!date) return null;

              const dayEvents = getEventsForDate(date);
              const isTodayDate = isToday(date);
              const isOtherMonth = !isCurrentMonth(date);

              return (
                <div
                  key={index}
                  className={`independent-calendar-day ${isTodayDate ? 'is-today' : ''} ${isOtherMonth ? 'other-month' : ''}`}
                  onClick={() => setSelectedDate(date)}
                >
                  <div className="independent-calendar-day-number">
                    {date.getDate()}
                  </div>

                  <div className="independent-calendar-day-events">
                    {dayEvents.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className={`independent-calendar-event-dot ${getEventTypeClass(event.type)}`}
                        title={event.title}
                      >
                        <span className="independent-event-dot-label">{event.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="independent-calendar-event-more">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* Date Detail Modal - Replaces sidebar with full-screen modal */}
      <DateDetailModal
        date={selectedDate}
        events={selectedDate ? getEventsForDate(selectedDate) : []}
        onClose={() => setSelectedDate(null)}
        onDateChange={(newDate) => setSelectedDate(newDate)}
        onAddEvent={() => setShowEventForm(true)}
        onEditEvent={(eventId) => {
          console.log('Edit event:', eventId);
          // TODO: Implement event editing
        }}
        onDeleteEvent={(eventId) => {
          console.log('Delete event:', eventId);
          // TODO: Implement event deletion
        }}
      />

      {/* Legend */}
      <div className="independent-calendar-legend">
        <div className="independent-legend-item">
          <div className="independent-legend-dot event-deadline"></div>
          <span>Deadline</span>
        </div>
        <div className="independent-legend-item">
          <div className="independent-legend-dot event-task"></div>
          <span>Task</span>
        </div>
        <div className="independent-legend-item">
          <div className="independent-legend-dot event-general"></div>
          <span>Event</span>
        </div>
        <div className="independent-legend-item">
          <div className="independent-legend-dot event-reminder"></div>
          <span>Reminder</span>
        </div>
      </div>
    </div>
  );

  // If initialExpanded is true, render just the content (parent provides modal)
  if (initialExpanded) {
    return calendarContent;
  }

  // Otherwise, render with our own modal wrapper using React Portal
  return ReactDOM.createPortal(
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
      onClick={() => setIsExpanded(false)}
    >
      <div
        style={{
          background: 'var(--background-color)',
          borderRadius: '12px',
          width: '95%',
          height: '95%',
          maxWidth: '1400px',
          maxHeight: '95vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header with Close Button */}
        <div style={{
          background: 'var(--gradient-primary)',
          padding: '1.5rem 2rem',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '3px solid var(--accent-color)'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
            Full Calendar
          </h2>
          <button
            onClick={() => setIsExpanded(false)}
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

        {/* Calendar Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
          {calendarContent}
        </div>
      </div>
    </div>,
    document.getElementById('modal-root') as HTMLElement
  );
};

export default IndependentModeCalendar;
