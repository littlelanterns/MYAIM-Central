/**
 * PersonalCalendar Widget
 * Mom's private calendar - hidden from family
 * Part of Mom's Personal Dashboard
 * NO EMOJIS - CSS VARIABLES ONLY
 */

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { IndependentModeCalendar } from '../../modes/independent/IndependentModeCalendar';
import './PersonalCalendar.css';

interface PersonalCalendarProps {
  familyMemberId: string;
}

const PersonalCalendar: React.FC<PersonalCalendarProps> = ({ familyMemberId }) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  // Date picker handlers
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = new Date(currentWeek);
    newDate.setMonth(parseInt(e.target.value));
    setCurrentWeek(newDate);
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(parseInt(e.target.value));
    setCurrentWeek(newDate);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDate = new Date(currentWeek);
    newDate.setFullYear(parseInt(e.target.value));
    setCurrentWeek(newDate);
  };

  // Generate options for date picker
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  const daysInMonth = new Date(currentWeek.getFullYear(), currentWeek.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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
      <div className="personal-calendar-container">
        <div className="calendar-header">
          <h3 className="calendar-title">
            This Week
          </h3>
          <div className="calendar-controls">
            <div className="calendar-week-nav">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="calendar-nav-button"
                title="Jump to date"
              >
                <CalendarIcon size={16} />
              </button>
              <button
                onClick={handlePreviousWeek}
                className="calendar-nav-button"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="calendar-week-range">
                {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <button
                onClick={handleNextWeek}
                className="calendar-nav-button"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <button
              onClick={() => setShowMonthModal(true)}
              className="calendar-view-month-button"
            >
              <CalendarIcon size={14} />
              View Month
            </button>
          </div>
        </div>

        {/* Date Picker Dropdowns - Shows below header when toggled */}
        {showDatePicker && (
          <div className="personal-calendar-date-picker">
            <select
              className="personal-date-select personal-month-select"
              value={currentWeek.getMonth()}
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
              className="personal-date-select personal-day-select"
              value={currentWeek.getDate()}
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
              className="personal-date-select personal-year-select"
              value={currentWeek.getFullYear()}
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

        {/* Calendar grid */}
        <div className="calendar-week-grid">
          {daysOfWeek.map((day, index) => {
            const isToday = new Date().toDateString() === weekDates[index].toDateString();

            return (
              <div
                key={day}
                className="calendar-day-column"
              >
                <div className={`calendar-day-header ${isToday ? 'today' : 'regular'}`}>
                  <div className="calendar-day-name">{day}</div>
                  <div className="calendar-day-number">
                    {weekDates[index].getDate()}
                  </div>
                </div>
                <div className="calendar-day-content">
                  <div className="calendar-no-events">
                    No events
                  </div>
                </div>
              </div>
            );
          })}
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
                My Personal Calendar
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
    </>
  );
};

export default PersonalCalendar;
