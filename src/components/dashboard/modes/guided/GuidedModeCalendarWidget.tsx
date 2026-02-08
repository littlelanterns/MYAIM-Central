/**
 * GuidedModeCalendarWidget Component
 * Calendar view with event display and Google Calendar sync (coming soon)
 * CRITICAL: All colors use CSS variables - theme compatible
 * Features: Month/week view, event display, sync ready
 */

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { IndependentModeCalendar } from '../independent/IndependentModeCalendar';
import DateDetailModal from '../../../modals/DateDetailModal';
import EventCreationModal from '../../../modals/EventCreationModal';
import { EventsService } from '../../../../services/eventsService';
import { convertModalDataToEventInput } from '../../../../utils/eventHelpers';
import './GuidedModeCalendarWidget.css';

export interface CalendarEvent {
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
  location?: string;
  color?: string;
  source?: 'family' | 'google' | 'mindsweep';
}

interface GuidedModeCalendarWidgetProps {
  familyMemberId: string;
  events?: CalendarEvent[];
  onEventClick?: (eventId: string) => void;
}

export const GuidedModeCalendarWidget: React.FC<GuidedModeCalendarWidgetProps> = ({
  familyMemberId,
  events: propEvents = [],
  onEventClick
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'month'>('week');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventPreselectedDate, setEventPreselectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>(propEvents);
  const [familyId, setFamilyId] = useState<string>('');

  // Load family ID and events - with silent failure to prevent app blocking
  useEffect(() => {
    const loadData = async () => {
      try {
        // Guard: don't query if no familyMemberId
        if (!familyMemberId) {
          console.log('[CALENDAR] No familyMemberId provided, skipping data load');
          return;
        }

        // Get family ID from family member
        const { supabase } = await import('../../../../lib/supabase');
        const { data: memberData, error: memberError } = await supabase
          .from('family_members')
          .select('family_id')
          .eq('id', familyMemberId)
          .single();

        if (memberError) {
          console.log('[CALENDAR] Could not load family ID (non-blocking):', memberError.message);
          return;
        }

        if (memberData) {
          setFamilyId(memberData.family_id);
        }

        // Load events for the week - already has internal try/catch
        try {
          const weekEvents = await EventsService.getWeekEvents(familyMemberId);
          setEvents(weekEvents);
        } catch (eventErr) {
          console.log('[CALENDAR] Could not load events (non-blocking):', eventErr);
          setEvents([]);
        }
      } catch (error) {
        // Silently handle any errors - calendar data is not critical
        console.log('[CALENDAR] Data load failed (non-blocking):', error);
        setEvents([]);
      }
    };

    loadData();
  }, [familyMemberId]);

  const refreshEvents = async () => {
    try {
      const weekEvents = await EventsService.getWeekEvents(familyMemberId);
      setEvents(weekEvents);
    } catch (error) {
      console.log('[CALENDAR] Could not refresh events (non-blocking):', error);
    }
  };

  // Get current week dates (starts on Sunday for guided mode)
  const getWeekDates = () => {
    const week: Date[] = [];
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();

    // Start on Sunday
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      week.push(date);
    }
    return week;
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Navigation
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
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

  const weekDates = getWeekDates();
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  return (
    <div className="guided-calendar-widget">
      {/* Calendar Header */}
      <div className="calendar-header">
        <div className="calendar-nav">
          <button
            className="nav-btn"
            onClick={() => setShowDatePicker(!showDatePicker)}
            title="Jump to date"
          >
            <Calendar size={20} />
          </button>
          <button className="nav-btn" onClick={handlePrevious}>
            <ChevronLeft size={20} />
          </button>
          <button className="today-btn" onClick={handleToday}>
            Today
          </button>
          <button className="nav-btn" onClick={handleNext}>
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="calendar-title">
          <span className="month-year">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        <div className="view-toggle">
          <button
            className={`view-btn ${view === 'week' ? 'active' : ''}`}
            onClick={() => setView('week')}
          >
            Week
          </button>
          <button
            className={`view-btn ${view === 'month' ? 'active' : ''}`}
            onClick={() => setShowMonthModal(true)}
          >
            Month
          </button>
        </div>
      </div>

      {/* Date Picker Dropdowns */}
      {showDatePicker && (
        <div className="guided-calendar-date-picker">
          <select
            className="guided-date-select guided-month-select"
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
            className="guided-date-select guided-day-select"
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
            className="guided-date-select guided-year-select"
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

      {/* Week View */}
      {view === 'week' && (
        <div className="week-view">
          <div className="week-grid">
            {weekDates.map((date, index) => {
              const isToday = date.toDateString() === today.toDateString();
              const dayEvents = getEventsForDate(date);

              return (
                <div key={index} className={`day-column ${isToday ? 'today' : ''}`}>
                  <div
                    className="day-header"
                    onClick={() => setSelectedDate(date)}
                    style={{ cursor: 'pointer' }}
                    title="Click to view day details"
                  >
                    <div className="day-name">{daysOfWeek[index]}</div>
                    <div className="day-number">{date.getDate()}</div>
                  </div>

                  <div className="day-events">
                    {dayEvents.length === 0 ? (
                      <div className="no-events">No events</div>
                    ) : (
                      dayEvents.map(event => (
                        <div
                          key={event.id}
                          className="event-card"
                          onClick={() => onEventClick?.(event.id)}
                        >
                          <div className="event-time">
                            <Clock size={12} />
                            {new Date(event.start).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </div>
                          <div className="event-title">{event.title}</div>
                          {event.location && (
                            <div className="event-location">
                              <MapPin size={10} />
                              {event.location}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sync Status */}
      <div className="sync-status">
        <div className="sync-indicator">
          <div className="sync-dot"></div>
          <span className="sync-text">Calendar sync ready for Google Calendar integration</span>
        </div>
      </div>

      {/* Full Month Modal */}
      {showMonthModal && ReactDOM.createPortal(
        <div
          className="calendar-modal-overlay"
          onClick={() => setShowMonthModal(false)}
        >
          <div
            className="calendar-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="calendar-modal-header">
              <h2 className="calendar-modal-title">
                Calendar - {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={() => setShowMonthModal(false)}
                className="calendar-modal-close"
              >
                ×
              </button>
            </div>

            {/* Modal Content - Calendar */}
            <div className="calendar-modal-body">
              <IndependentModeCalendar
                familyMemberId={familyMemberId}
                viewMode="self"
                initialExpanded={true}
                hideViewSelector={true}
              />
            </div>
          </div>
        </div>,
        document.getElementById('modal-root') as HTMLElement
      )}

      {/* Date Detail Modal */}
      <DateDetailModal
        date={selectedDate}
        events={selectedDate ? getEventsForDate(selectedDate) : []}
        onClose={() => setSelectedDate(null)}
        onAddEvent={() => {
          setEventPreselectedDate(selectedDate);
          setShowEventModal(true);
          setSelectedDate(null); // Close date detail modal
        }}
      />

      {/* Event Creation Modal */}
      <EventCreationModal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setEventPreselectedDate(null);
        }}
        onSave={async (eventData) => {
          try {
            const input = convertModalDataToEventInput(eventData);
            const newEvent = await EventsService.createEvent(input, familyMemberId, familyId);

            if (newEvent) {
              await refreshEvents();
              setShowEventModal(false);
              setEventPreselectedDate(null);
            } else {
              alert('Failed to create event. Please try again.');
            }
          } catch (error) {
            console.error('Error creating event:', error);
            alert('Error creating event. Please try again.');
          }
        }}
        preselectedDate={eventPreselectedDate}
        familyMembers={[]} // TODO: Pass actual family members
      />
    </div>
  );
};

export default GuidedModeCalendarWidget;
