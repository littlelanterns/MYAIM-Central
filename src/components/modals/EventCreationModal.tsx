/**
 * EventCreationModal Component
 * Modal for creating calendar events with recurrence and family member selection
 * NO EMOJIS - CSS VARIABLES ONLY - THEME AWARE
 */

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Calendar, Clock, MapPin, Users, Repeat } from 'lucide-react';
import './EventCreationModal.css';

interface EventCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: any) => void;
  preselectedDate?: Date | null;
  familyMembers?: FamilyMember[];
}

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  member_color?: string;
}

const EventCreationModal: React.FC<EventCreationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  preselectedDate = null,
  familyMembers = []
}) => {
  // Event basic info
  const [eventTitle, setEventTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  // Date and time
  const [startDate, setStartDate] = useState(
    preselectedDate ? preselectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [allDay, setAllDay] = useState(false);

  // Recurrence
  const [recurrence, setRecurrence] = useState('one-time');
  const [customRecurrence, setCustomRecurrence] = useState({
    interval: 1,
    frequency: 'days', // days, weeks, months, years
    daysOfWeek: [] as string[],
    endType: 'never', // never, after, on
    endAfter: 1,
    endOnDate: ''
  });

  // Family members
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setEventTitle('');
      setDescription('');
      setLocation('');
      setStartDate(preselectedDate ? preselectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      setStartTime('09:00');
      setEndDate('');
      setEndTime('');
      setAllDay(false);
      setRecurrence('one-time');
      setSelectedMembers([]);
      setCustomRecurrence({
        interval: 1,
        frequency: 'days',
        daysOfWeek: [],
        endType: 'never',
        endAfter: 1,
        endOnDate: ''
      });
    }
  }, [isOpen, preselectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const eventData = {
      title: eventTitle,
      description,
      location,
      startDate,
      startTime: allDay ? null : startTime,
      endDate: endDate || startDate,
      endTime: allDay ? null : endTime,
      allDay,
      recurrence,
      customRecurrence: recurrence === 'custom' ? customRecurrence : null,
      attendees: selectedMembers
    };

    onSave(eventData);
    onClose();
  };

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const toggleAllMembers = () => {
    if (selectedMembers.length === familyMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(familyMembers.map(m => m.id));
    }
  };

  const toggleDayOfWeek = (day: string) => {
    setCustomRecurrence(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day]
    }));
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="event-modal-overlay" onClick={onClose}>
      <div className="event-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="event-modal-header">
          <h2 className="event-modal-title">
            <Calendar size={24} />
            Create Event
          </h2>
          <button onClick={onClose} className="event-modal-close" title="Close">
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="event-modal-body">
          {/* Event Title */}
          <section className="event-section">
            <label className="event-label" htmlFor="event-title">
              Event Title *
            </label>
            <input
              id="event-title"
              type="text"
              className="event-input"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Enter event name"
              required
            />
          </section>

          {/* Date and Time */}
          <section className="event-section">
            <h3 className="event-section-title">
              <Clock size={18} />
              Date & Time
            </h3>

            <div className="event-checkbox-wrapper">
              <input
                type="checkbox"
                id="all-day"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="event-checkbox"
              />
              <label htmlFor="all-day" className="event-checkbox-label">
                All day event
              </label>
            </div>

            <div className="event-datetime-grid">
              <div className="event-datetime-field">
                <label className="event-label-small">Start Date *</label>
                <input
                  type="date"
                  className="event-input-small"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              {!allDay && (
                <div className="event-datetime-field">
                  <label className="event-label-small">Start Time</label>
                  <input
                    type="time"
                    className="event-input-small"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
              )}

              <div className="event-datetime-field">
                <label className="event-label-small">End Date</label>
                <input
                  type="date"
                  className="event-input-small"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              {!allDay && (
                <div className="event-datetime-field">
                  <label className="event-label-small">End Time</label>
                  <input
                    type="time"
                    className="event-input-small"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              )}
            </div>
          </section>

          {/* Location */}
          <section className="event-section">
            <label className="event-label" htmlFor="event-location">
              <MapPin size={16} />
              Location (optional)
            </label>
            <input
              id="event-location"
              type="text"
              className="event-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location"
            />
          </section>

          {/* Description */}
          <section className="event-section">
            <label className="event-label" htmlFor="event-description">
              Description (optional)
            </label>
            <textarea
              id="event-description"
              className="event-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add event details"
              rows={3}
            />
          </section>

          {/* Recurrence */}
          <section className="event-section">
            <h3 className="event-section-title">
              <Repeat size={18} />
              Recurrence
            </h3>

            <div className="event-radio-group">
              {[
                { value: 'one-time', label: 'One-time - Single event on this date only' },
                { value: 'daily', label: 'Daily - Repeats every day' },
                { value: 'weekly', label: 'Weekly - Repeats every week on this day' },
                { value: 'monthly', label: 'Monthly - Repeats every month on this date' },
                { value: 'yearly', label: 'Yearly - Repeats annually on this date' },
                { value: 'custom', label: 'Custom - Define your own schedule' }
              ].map((option) => (
                <label key={option.value} className="event-radio-label">
                  <input
                    type="radio"
                    name="recurrence"
                    value={option.value}
                    checked={recurrence === option.value}
                    onChange={(e) => setRecurrence(e.target.value)}
                    className="event-radio"
                  />
                  {option.label}
                </label>
              ))}
            </div>

            {/* Custom Recurrence Options */}
            {recurrence === 'custom' && (
              <div className="event-custom-recurrence">
                <div className="event-custom-row">
                  <label className="event-label-small">Repeat every</label>
                  <input
                    type="number"
                    min="1"
                    className="event-input-number"
                    value={customRecurrence.interval}
                    onChange={(e) => setCustomRecurrence(prev => ({ ...prev, interval: parseInt(e.target.value) || 1 }))}
                  />
                  <select
                    className="event-select"
                    value={customRecurrence.frequency}
                    onChange={(e) => setCustomRecurrence(prev => ({ ...prev, frequency: e.target.value }))}
                  >
                    <option value="days">Day(s)</option>
                    <option value="weeks">Week(s)</option>
                    <option value="months">Month(s)</option>
                    <option value="years">Year(s)</option>
                  </select>
                </div>

                {customRecurrence.frequency === 'weeks' && (
                  <div className="event-days-of-week">
                    <label className="event-label-small">On days:</label>
                    <div className="event-days-grid">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <button
                          key={day}
                          type="button"
                          className={`event-day-btn ${customRecurrence.daysOfWeek.includes(day) ? 'active' : ''}`}
                          onClick={() => toggleDayOfWeek(day)}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="event-custom-end">
                  <label className="event-label-small">Ends:</label>
                  <div className="event-radio-group-inline">
                    <label className="event-radio-label-inline">
                      <input
                        type="radio"
                        name="custom-end"
                        value="never"
                        checked={customRecurrence.endType === 'never'}
                        onChange={(e) => setCustomRecurrence(prev => ({ ...prev, endType: 'never' }))}
                        className="event-radio"
                      />
                      Never
                    </label>
                    <label className="event-radio-label-inline">
                      <input
                        type="radio"
                        name="custom-end"
                        value="after"
                        checked={customRecurrence.endType === 'after'}
                        onChange={(e) => setCustomRecurrence(prev => ({ ...prev, endType: 'after' }))}
                        className="event-radio"
                      />
                      After
                      <input
                        type="number"
                        min="1"
                        className="event-input-number-inline"
                        value={customRecurrence.endAfter}
                        onChange={(e) => setCustomRecurrence(prev => ({ ...prev, endAfter: parseInt(e.target.value) || 1 }))}
                        disabled={customRecurrence.endType !== 'after'}
                      />
                      occurrences
                    </label>
                    <label className="event-radio-label-inline">
                      <input
                        type="radio"
                        name="custom-end"
                        value="on"
                        checked={customRecurrence.endType === 'on'}
                        onChange={(e) => setCustomRecurrence(prev => ({ ...prev, endType: 'on' }))}
                        className="event-radio"
                      />
                      On
                      <input
                        type="date"
                        className="event-input-date-inline"
                        value={customRecurrence.endOnDate}
                        onChange={(e) => setCustomRecurrence(prev => ({ ...prev, endOnDate: e.target.value }))}
                        disabled={customRecurrence.endType !== 'on'}
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Family Members */}
          {familyMembers.length > 0 && (
            <section className="event-section">
              <h3 className="event-section-title">
                <Users size={18} />
                Who's involved?
              </h3>

              <button
                type="button"
                onClick={toggleAllMembers}
                className="event-toggle-all-btn"
              >
                {selectedMembers.length === familyMembers.length ? 'Deselect All' : 'Select All'}
              </button>

              <div className="event-members-grid">
                {familyMembers.map(member => (
                  <label key={member.id} className="event-member-label">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member.id)}
                      onChange={() => toggleMemberSelection(member.id)}
                      className="event-checkbox"
                    />
                    <span className="event-member-name">{member.name}</span>
                    {member.role && <span className="event-member-role">({member.role})</span>}
                  </label>
                ))}
              </div>
            </section>
          )}

          {/* Footer Actions */}
          <div className="event-modal-footer">
            <button type="button" onClick={onClose} className="event-btn event-btn-cancel">
              Cancel
            </button>
            <button type="submit" className="event-btn event-btn-save" disabled={!eventTitle.trim()}>
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.getElementById('modal-root') as HTMLElement
  );
};

export default EventCreationModal;
