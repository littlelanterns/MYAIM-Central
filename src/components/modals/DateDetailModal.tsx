/**
 * DateDetailModal Component
 * Full-screen modal for viewing and editing date details on mobile/desktop
 * Shows all tasks, events, deadlines, and reminders for a selected date
 */

import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Clock, Tag, AlertCircle, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import './DateDetailModal.css';

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

interface DateDetailModalProps {
  date: Date | null;
  events: CalendarEvent[];
  onClose: () => void;
  onAddEvent?: () => void;
  onEditEvent?: (eventId: string) => void;
  onDeleteEvent?: (eventId: string) => void;
  onDateChange?: (newDate: Date) => void;
}

export const DateDetailModal: React.FC<DateDetailModalProps> = ({
  date,
  events,
  onClose,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  onDateChange
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  if (!date) return null;

  const handlePreviousDay = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 1);
    if (onDateChange) onDateChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    if (onDateChange) onDateChange(newDate);
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime()) && onDateChange) {
      onDateChange(newDate);
      setShowDatePicker(false);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return <AlertCircle size={16} />;
      case 'task':
        return <Tag size={16} />;
      case 'event':
        return <Clock size={16} />;
      case 'reminder':
        return <Clock size={16} />;
      default:
        return <Tag size={16} />;
    }
  };

  const getPriorityClass = (priority?: string): string => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };

  const getEventTypeClass = (type: string): string => {
    switch (type) {
      case 'deadline':
        return 'event-type-deadline';
      case 'task':
        return 'event-type-task';
      case 'event':
        return 'event-type-event';
      case 'reminder':
        return 'event-type-reminder';
      default:
        return 'event-type-event';
    }
  };

  // Group events by type
  const groupedEvents = events.reduce((acc, event) => {
    if (!acc[event.type]) {
      acc[event.type] = [];
    }
    acc[event.type].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  return (
    <div className="date-detail-modal-backdrop" onClick={onClose}>
      <div className="date-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="date-detail-modal-header">
          <div className="date-detail-header-left">
            {onDateChange && (
              <button
                className="date-nav-btn"
                onClick={handlePreviousDay}
                aria-label="Previous day"
              >
                <ChevronLeft size={20} />
              </button>
            )}
          </div>

          <div className="date-detail-header-content">
            <div className="date-detail-header-title-row">
              <h2 className="date-detail-modal-title">{formatDate(date)}</h2>
              {onDateChange && (
                <button
                  className="date-picker-btn"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  aria-label="Pick date"
                  title="Jump to date"
                >
                  <Calendar size={18} />
                </button>
              )}
            </div>
            {showDatePicker && onDateChange && (
              <input
                type="date"
                className="date-picker-input"
                value={date.toISOString().split('T')[0]}
                onChange={handleDateInputChange}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <div className="date-detail-event-count">
              {events.length} {events.length === 1 ? 'item' : 'items'}
            </div>
          </div>

          <div className="date-detail-header-right">
            {onDateChange && (
              <button
                className="date-nav-btn"
                onClick={handleNextDay}
                aria-label="Next day"
              >
                <ChevronRight size={20} />
              </button>
            )}
            <button
              className="date-detail-close-btn"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="date-detail-modal-content">
          {events.length > 0 ? (
            <>
              {/* Deadlines */}
              {groupedEvents.deadline && groupedEvents.deadline.length > 0 && (
                <div className="date-detail-section">
                  <h3 className="date-detail-section-title">
                    <AlertCircle size={18} />
                    Deadlines
                  </h3>
                  <div className="date-detail-event-list">
                    {groupedEvents.deadline.map((event) => (
                      <div
                        key={event.id}
                        className={`date-detail-event-card ${getEventTypeClass(event.type)} ${getPriorityClass(event.priority)}`}
                      >
                        <div className="date-detail-event-header">
                          <div className="date-detail-event-time">
                            {event.isAllDay ? (
                              <span className="all-day-badge">All Day</span>
                            ) : (
                              <span className="time-badge">
                                <Clock size={14} />
                                {formatTime(event.start)} - {formatTime(event.end)}
                              </span>
                            )}
                          </div>
                          {event.priority && (
                            <span className={`priority-badge ${getPriorityClass(event.priority)}`}>
                              {event.priority}
                            </span>
                          )}
                        </div>

                        <h4 className="date-detail-event-title">{event.title}</h4>

                        {event.description && (
                          <p className="date-detail-event-description">{event.description}</p>
                        )}

                        {event.category && (
                          <div className="date-detail-event-meta">
                            <Tag size={14} />
                            <span>{event.category}</span>
                          </div>
                        )}

                        <div className="date-detail-event-actions">
                          {onEditEvent && (
                            <button
                              className="event-action-btn edit-btn"
                              onClick={() => onEditEvent(event.id)}
                              aria-label="Edit event"
                            >
                              <Edit2 size={16} />
                              Edit
                            </button>
                          )}
                          {onDeleteEvent && (
                            <button
                              className="event-action-btn delete-btn"
                              onClick={() => onDeleteEvent(event.id)}
                              aria-label="Delete event"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {groupedEvents.task && groupedEvents.task.length > 0 && (
                <div className="date-detail-section">
                  <h3 className="date-detail-section-title">
                    <Tag size={18} />
                    Tasks
                  </h3>
                  <div className="date-detail-event-list">
                    {groupedEvents.task.map((event) => (
                      <div
                        key={event.id}
                        className={`date-detail-event-card ${getEventTypeClass(event.type)} ${getPriorityClass(event.priority)}`}
                      >
                        <div className="date-detail-event-header">
                          <div className="date-detail-event-time">
                            {event.isAllDay ? (
                              <span className="all-day-badge">All Day</span>
                            ) : (
                              <span className="time-badge">
                                <Clock size={14} />
                                {formatTime(event.start)} - {formatTime(event.end)}
                              </span>
                            )}
                          </div>
                          {event.priority && (
                            <span className={`priority-badge ${getPriorityClass(event.priority)}`}>
                              {event.priority}
                            </span>
                          )}
                        </div>

                        <h4 className="date-detail-event-title">{event.title}</h4>

                        {event.description && (
                          <p className="date-detail-event-description">{event.description}</p>
                        )}

                        {event.category && (
                          <div className="date-detail-event-meta">
                            <Tag size={14} />
                            <span>{event.category}</span>
                          </div>
                        )}

                        <div className="date-detail-event-actions">
                          {onEditEvent && (
                            <button
                              className="event-action-btn edit-btn"
                              onClick={() => onEditEvent(event.id)}
                              aria-label="Edit task"
                            >
                              <Edit2 size={16} />
                              Edit
                            </button>
                          )}
                          {onDeleteEvent && (
                            <button
                              className="event-action-btn delete-btn"
                              onClick={() => onDeleteEvent(event.id)}
                              aria-label="Delete task"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Events */}
              {groupedEvents.event && groupedEvents.event.length > 0 && (
                <div className="date-detail-section">
                  <h3 className="date-detail-section-title">
                    <Clock size={18} />
                    Events
                  </h3>
                  <div className="date-detail-event-list">
                    {groupedEvents.event.map((event) => (
                      <div
                        key={event.id}
                        className={`date-detail-event-card ${getEventTypeClass(event.type)} ${getPriorityClass(event.priority)}`}
                      >
                        <div className="date-detail-event-header">
                          <div className="date-detail-event-time">
                            {event.isAllDay ? (
                              <span className="all-day-badge">All Day</span>
                            ) : (
                              <span className="time-badge">
                                <Clock size={14} />
                                {formatTime(event.start)} - {formatTime(event.end)}
                              </span>
                            )}
                          </div>
                          {event.priority && (
                            <span className={`priority-badge ${getPriorityClass(event.priority)}`}>
                              {event.priority}
                            </span>
                          )}
                        </div>

                        <h4 className="date-detail-event-title">{event.title}</h4>

                        {event.description && (
                          <p className="date-detail-event-description">{event.description}</p>
                        )}

                        {event.category && (
                          <div className="date-detail-event-meta">
                            <Tag size={14} />
                            <span>{event.category}</span>
                          </div>
                        )}

                        <div className="date-detail-event-actions">
                          {onEditEvent && (
                            <button
                              className="event-action-btn edit-btn"
                              onClick={() => onEditEvent(event.id)}
                              aria-label="Edit event"
                            >
                              <Edit2 size={16} />
                              Edit
                            </button>
                          )}
                          {onDeleteEvent && (
                            <button
                              className="event-action-btn delete-btn"
                              onClick={() => onDeleteEvent(event.id)}
                              aria-label="Delete event"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reminders */}
              {groupedEvents.reminder && groupedEvents.reminder.length > 0 && (
                <div className="date-detail-section">
                  <h3 className="date-detail-section-title">
                    <Clock size={18} />
                    Reminders
                  </h3>
                  <div className="date-detail-event-list">
                    {groupedEvents.reminder.map((event) => (
                      <div
                        key={event.id}
                        className={`date-detail-event-card ${getEventTypeClass(event.type)} ${getPriorityClass(event.priority)}`}
                      >
                        <div className="date-detail-event-header">
                          <div className="date-detail-event-time">
                            {event.isAllDay ? (
                              <span className="all-day-badge">All Day</span>
                            ) : (
                              <span className="time-badge">
                                <Clock size={14} />
                                {formatTime(event.start)}
                              </span>
                            )}
                          </div>
                          {event.priority && (
                            <span className={`priority-badge ${getPriorityClass(event.priority)}`}>
                              {event.priority}
                            </span>
                          )}
                        </div>

                        <h4 className="date-detail-event-title">{event.title}</h4>

                        {event.description && (
                          <p className="date-detail-event-description">{event.description}</p>
                        )}

                        {event.category && (
                          <div className="date-detail-event-meta">
                            <Tag size={14} />
                            <span>{event.category}</span>
                          </div>
                        )}

                        <div className="date-detail-event-actions">
                          {onEditEvent && (
                            <button
                              className="event-action-btn edit-btn"
                              onClick={() => onEditEvent(event.id)}
                              aria-label="Edit reminder"
                            >
                              <Edit2 size={16} />
                              Edit
                            </button>
                          )}
                          {onDeleteEvent && (
                            <button
                              className="event-action-btn delete-btn"
                              onClick={() => onDeleteEvent(event.id)}
                              aria-label="Delete reminder"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="date-detail-empty-state">
              <Clock size={48} />
              <h3>No events scheduled</h3>
              <p>This day is free. Add an event, task, or reminder to get started.</p>
            </div>
          )}
        </div>

        {/* Footer with Add Button */}
        <div className="date-detail-modal-footer">
          {onAddEvent && (
            <button className="date-detail-add-btn" onClick={onAddEvent}>
              <Plus size={20} />
              Add Event
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateDetailModal;
