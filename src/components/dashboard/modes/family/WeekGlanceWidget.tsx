/**
 * WeekGlanceWidget Component
 * Shows family's week at a glance with color-coded events
 * NO EMOJIS - CSS VARIABLES ONLY - THEME AWARE
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { familyMemberColors } from '../../../../styles/colors';

interface FamilyEvent {
  id: string;
  title: string;
  time: string;
  memberName: string;
  memberColor: string;
  dayIndex: number;
}

interface WeekGlanceWidgetProps {
  events: FamilyEvent[];
  currentWeek: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onEventClick?: (eventId: string) => void;
}

const WeekGlanceWidget: React.FC<WeekGlanceWidgetProps> = ({
  events,
  currentWeek,
  onPreviousWeek,
  onNextWeek,
  onEventClick
}) => {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Get the week dates
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

  // Group events by day
  const getEventsForDay = (dayIndex: number) => {
    return events.filter(event => event.dayIndex === dayIndex);
  };

  // Get member color
  const getMemberColor = (colorName: string) => {
    const colorObj = familyMemberColors.find(c => c.name === colorName);
    return colorObj ? colorObj.color : familyMemberColors[0].color;
  };

  return (
    <div style={{
      background: 'var(--background-color)',
      border: '1px solid var(--accent-color)',
      borderRadius: '12px',
      padding: '1.5rem'
    }}>
      {/* Header with week navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{
          color: 'var(--primary-color)',
          margin: 0,
          fontSize: '1.25rem',
          fontWeight: 600,
          fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          This Week
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={onPreviousWeek}
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
            color: 'var(--text-color)',
            fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
            {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <button
            onClick={onNextWeek}
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
      </div>

      {/* Calendar grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '0.5rem',
        maxHeight: '400px',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        {daysOfWeek.map((day, index) => {
          const dayEvents = getEventsForDay(index);
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
              {/* Day header */}
              <div style={{
                background: isToday ? 'var(--gradient-primary)' : 'var(--accent-color)',
                color: isToday ? 'white' : 'var(--text-color)',
                padding: '0.5rem',
                borderRadius: '6px 6px 0 0',
                textAlign: 'center',
                fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                <div>{day.substring(0, 3)}</div>
                <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {weekDates[index].getDate()}
                </div>
              </div>

              {/* Events for this day */}
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
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    onClick={() => onEventClick?.(event.id)}
                    style={{
                      background: getMemberColor(event.memberColor),
                      color: 'white',
                      borderRadius: '4px',
                      padding: '0.375rem 0.5rem',
                      fontSize: '0.75rem',
                      cursor: onEventClick ? 'pointer' : 'default',
                      transition: 'all 0.2s',
                      fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                    onMouseOver={(e) => {
                      if (onEventClick) {
                        e.currentTarget.style.opacity = '0.8';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: '0.125rem' }}>
                      {event.time}
                    </div>
                    <div style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {event.title}
                    </div>
                    <div style={{ fontSize: '0.625rem', opacity: 0.9 }}>
                      {event.memberName}
                    </div>
                  </div>
                ))}
                {dayEvents.length === 0 && (
                  <div style={{
                    color: 'var(--text-color)',
                    opacity: 0.3,
                    fontSize: '0.75rem',
                    textAlign: 'center',
                    padding: '0.5rem 0',
                    fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}>
                    No events
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekGlanceWidget;
