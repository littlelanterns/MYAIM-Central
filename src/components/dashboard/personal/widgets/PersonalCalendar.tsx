/**
 * PersonalCalendar Widget
 * Mom's private calendar - hidden from family
 * Part of Mom's Personal Dashboard
 * NO EMOJIS - CSS VARIABLES ONLY
 */

import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { IndependentModeCalendar } from '../../modes/independent/IndependentModeCalendar';

interface PersonalCalendarProps {
  familyMemberId: string;
}

const PersonalCalendar: React.FC<PersonalCalendarProps> = ({ familyMemberId }) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showMonthModal, setShowMonthModal] = useState(false);

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

  return (
    <>
      <div style={{
        background: 'var(--background-color)',
        border: `1px solid var(--accent-color)`,
        borderRadius: '12px',
        padding: '1.5rem',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
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
                My Personal Calendar
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
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PersonalCalendar;
