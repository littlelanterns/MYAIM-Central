/**
 * FamilyModeDashboard Component
 * Mom's master view of entire family
 * NO EMOJIS - CSS VARIABLES ONLY - THEME AWARE
 */

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { useFamilyDashboard } from '../../../../hooks/dashboard/useFamilyDashboard';
import { familyMemberColors } from '../../../../styles/colors';
import FamilyOverviewWidget from './FamilyOverviewWidget';
import TaskManagementWidget from './TaskManagementWidget';
import FamilyAnalyticsWidget from './FamilyAnalyticsWidget';
import RewardManagementWidget from './RewardManagementWidget';
import TaskCreationModal from '../../../tasks/TaskCreationModal';
import { IndependentModeCalendar } from '../independent/IndependentModeCalendar';
import DashboardSwitcher from '../../DashboardSwitcher';
import ManageDashboardsModal from '../../ManageDashboardsModal';
import DateDetailModal from '../../../modals/DateDetailModal';
import EventCreationModal from '../../../modals/EventCreationModal';
import { EventsService } from '../../../../services/eventsService';
import { CalendarEvent } from '../../../../types/events.types';
import { convertModalDataToEventInput } from '../../../../utils/eventHelpers';
import { supabase } from '../../../../lib/supabase';
import './FamilyModeDashboard.css';

interface FamilyModeDashboardProps {
  familyId?: string;
}

const FamilyModeDashboard: React.FC<FamilyModeDashboardProps> = ({ familyId }) => {
  const navigate = useNavigate();
  const { loading, error, refresh } = useFamilyDashboard(familyId || null);

  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showTaskCreationModal, setShowTaskCreationModal] = useState(false);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showManageDashboards, setShowManageDashboards] = useState(false);
  const [weekStartsOnMonday, setWeekStartsOnMonday] = useState(false);
  const [showCalendarSettings, setShowCalendarSettings] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventPreselectedDate, setEventPreselectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentFamilyId, setCurrentFamilyId] = useState<string | null>(null);

  // Load family ID and events
  useEffect(() => {
    const loadFamilyEvents = async () => {
      if (!familyId) {
        // Get family ID from current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: memberData } = await supabase
          .from('family_members')
          .select('family_id')
          .eq('auth_user_id', user.id)
          .single();

        if (memberData) {
          setCurrentFamilyId(memberData.family_id);
          const weekEvents = await EventsService.getEventsForFamily(
            memberData.family_id,
            getWeekStart(currentWeek),
            getWeekEnd(currentWeek)
          );
          setEvents(weekEvents);
        }
      } else {
        setCurrentFamilyId(familyId);
        const weekEvents = await EventsService.getEventsForFamily(
          familyId,
          getWeekStart(currentWeek),
          getWeekEnd(currentWeek)
        );
        setEvents(weekEvents);
      }
    };

    loadFamilyEvents();
  }, [familyId, currentWeek]);

  const refreshEvents = async () => {
    if (currentFamilyId) {
      const weekEvents = await EventsService.getEventsForFamily(
        currentFamilyId,
        getWeekStart(currentWeek),
        getWeekEnd(currentWeek)
      );
      setEvents(weekEvents);
    }
  };

  // Helper functions for week calculation
  const getWeekStart = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = weekStartsOnMonday ? (day === 0 ? -6 : 1 - day) : -day;
    start.setDate(start.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const getWeekEnd = (date: Date) => {
    const end = getWeekStart(date);
    end.setDate(end.getDate() + 7);
    return end;
  };

  // Mock data for development - will be replaced with real data from overview
  const mockFamilyMembers = [
    {
      id: '1',
      name: 'Emma',
      role: 'teen',
      dashboard_mode: 'independent',
      member_color: 'AIMfM Sage Teal',
      stats: {
        completedTasks: 5,
        totalTasks: 8,
        completionRate: 63,
        streak: 3,
        nextEvent: 'Soccer practice 4pm'
      }
    },
    {
      id: '2',
      name: 'Noah',
      role: 'child',
      dashboard_mode: 'guided',
      member_color: 'Golden Honey',
      stats: {
        completedTasks: 5,
        totalTasks: 5,
        completionRate: 100,
        streak: 7,
        nextEvent: 'Reading time 6pm'
      }
    }
  ];

  const mockMemberBalances = [
    {
      id: '1',
      name: 'Emma',
      member_color: 'AIMfM Sage Teal',
      points: 450,
      allowance: 25,
      privilegesEarned: 3
    },
    {
      id: '2',
      name: 'Noah',
      member_color: 'Golden Honey',
      points: 680,
      allowance: 15,
      privilegesEarned: 5
    }
  ];

  const mockPendingRequests = [
    {
      id: 'req1',
      memberId: '1',
      memberName: 'Emma',
      memberColor: 'AIMfM Sage Teal',
      rewardType: 'privilege' as const,
      amount: 1,
      reason: 'Completed all tasks for 3 days in a row',
      status: 'pending' as const,
      timestamp: new Date()
    }
  ];

  const mockEvents = [
    {
      id: '1',
      title: 'Soccer Practice',
      time: '4:00 PM',
      memberName: 'Emma',
      memberColor: 'AIMfM Sage Teal',
      dayIndex: 1
    },
    {
      id: '2',
      title: 'Reading Time',
      time: '6:00 PM',
      memberName: 'Noah',
      memberColor: 'Golden Honey',
      dayIndex: 1
    },
    {
      id: '3',
      title: 'Math Tutoring',
      time: '3:30 PM',
      memberName: 'Emma',
      memberColor: 'AIMfM Sage Teal',
      dayIndex: 3
    }
  ];

  const mockTasks = [
    {
      id: '1',
      title: 'Clean bedroom',
      assignedTo: ['1'],
      assignedToNames: ['Emma'],
      assignedColors: ['AIMfM Sage Teal'],
      completed: false,
      priority: 'high' as const
    },
    {
      id: '2',
      title: 'Finish homework',
      assignedTo: ['1', '2'],
      assignedToNames: ['Emma', 'Noah'],
      assignedColors: ['AIMfM Sage Teal', 'Golden Honey'],
      dueDate: 'Today',
      completed: false,
      priority: 'high' as const
    },
    {
      id: '3',
      title: 'Water plants',
      assignedTo: ['2'],
      assignedToNames: ['Noah'],
      assignedColors: ['Golden Honey'],
      completed: true,
      priority: 'low' as const
    }
  ];

  // Calendar week navigation
  const getWeekDates = () => {
    const week: Date[] = [];
    const startOfWeek = new Date(currentWeek);
    const dayOfWeek = startOfWeek.getDay();

    // Adjust for Monday start if needed
    const offset = weekStartsOnMonday ? (dayOfWeek === 0 ? -6 : 1 - dayOfWeek) : -dayOfWeek;
    startOfWeek.setDate(startOfWeek.getDate() + offset);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      week.push(date);
    }
    return week;
  };

  const weekDates = getWeekDates();
  const daysOfWeek = weekStartsOnMonday
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get events for a specific day
  const getEventsForDay = (dayIndex: number) => {
    const targetDate = weekDates[dayIndex];
    if (!targetDate) return [];

    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === targetDate.toDateString();
    });
  };

  // Get member color
  const getMemberColor = (colorName: string) => {
    const colorObj = familyMemberColors.find(c => c.name === colorName);
    return colorObj ? colorObj.color : familyMemberColors[0].color;
  };

  // Month/year navigation
  const handlePreviousMonth = () => {
    const newDate = new Date(currentWeek);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentWeek(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentWeek);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentWeek(newDate);
  };

  const handleToday = () => {
    // Open date detail modal for today
    setSelectedDate(new Date());
  };

  // Event handlers
  const handleViewMember = (memberId: string) => {
    navigate(`/commandcenter/member/${memberId}`);
  };

  const handleManageFamily = () => {
    navigate('/commandcenter?tab=family');
  };

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

  const handleCreateTask = () => {
    setShowTaskCreationModal(true);
  };

  const handleTaskSave = (taskData: any) => {
    console.log('Task data to save:', taskData);
    // TODO: Save task to database
    setShowTaskCreationModal(false);
    refresh(); // Refresh dashboard data
  };

  const handleToggleTask = (taskId: string) => {
    console.log('Toggle task:', taskId);
    // TODO: Toggle task completion in database
  };

  const handleDeleteTask = (taskId: string) => {
    console.log('Delete task:', taskId);
    // TODO: Delete task from database
  };

  // Reward management handlers
  const handleApproveRequest = (requestId: string) => {
    console.log('Approve request:', requestId);
    // TODO: Approve reward request in database
  };

  const handleDenyRequest = (requestId: string) => {
    console.log('Deny request:', requestId);
    // TODO: Deny reward request in database
  };

  const handleAdjustBalance = (memberId: string, type: 'points' | 'money', amount: number) => {
    console.log('Adjust balance:', memberId, type, amount);
    // TODO: Adjust member balance in database
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

  // Note: Quick actions are now handled by global QuickActions in header
  // Task creation is triggered from there via the "Create Task" button

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
        Loading family dashboard...
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
          border: '1px solid var(--accent-color)'
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

  return (
    <div className="family-mode-dashboard">
      <div className="family-dashboard-content">
        {/* Header with Dashboard Switcher */}
        <div className="family-dashboard-header">
          <div className="family-header-content">
            <div>
              <h1 className="family-dashboard-title">
                Family Dashboard
              </h1>
              <p className="family-dashboard-subtitle">
                Mission control for your entire family
              </p>
            </div>

            {/* Dashboard Switcher */}
            <DashboardSwitcher onManageDashboards={() => setShowManageDashboards(true)} />
          </div>
        </div>

        {/* Widgets Grid */}
        <div className="family-widgets-grid">
          {/* This Week - Combined Family Calendar - Full width - AT TOP */}
          <div style={{ gridColumn: 'span 12' }}>
            <div className="family-calendar-container">
              <div className="family-calendar-header">
                <h3 className="family-calendar-title">
                  This Week
                </h3>
                <div className="family-calendar-controls">
                  {/* Week Navigation */}
                  <div className="calendar-week-nav">
                    <button
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      className="calendar-week-nav-button"
                      title="Jump to date"
                    >
                      <CalendarIcon size={16} />
                    </button>
                    <button
                      onClick={handlePreviousWeek}
                      className="calendar-week-nav-button"
                      title="Previous Week"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={handleToday}
                      className="calendar-today-button"
                    >
                      Today
                    </button>
                    <button
                      onClick={handleNextWeek}
                      className="calendar-week-nav-button"
                      title="Next Week"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Settings Button */}
                  <button
                    onClick={() => setShowCalendarSettings(!showCalendarSettings)}
                    className="calendar-settings-button"
                    title="Calendar Settings"
                  >
                    <Settings size={16} />
                  </button>

                  {/* View Month Button */}
                  <button
                    onClick={() => setShowMonthModal(true)}
                    className="calendar-view-month-button"
                  >
                    <CalendarIcon size={14} />
                    View Month
                  </button>
                </div>
              </div>

              {/* Calendar Settings Dropdown */}
              {showCalendarSettings && (
                <div className="calendar-settings-panel">
                  <h4 className="calendar-settings-title">
                    Calendar Settings
                  </h4>
                  <label className="calendar-settings-option">
                    <input
                      type="checkbox"
                      checked={weekStartsOnMonday}
                      onChange={(e) => setWeekStartsOnMonday(e.target.checked)}
                      style={{
                        cursor: 'pointer',
                        width: '16px',
                        height: '16px'
                      }}
                    />
                    <span>Week starts on Monday</span>
                  </label>
                </div>
              )}

              {/* Date Picker Dropdowns */}
              {showDatePicker && (
                <div className="family-calendar-date-picker">
                  <select
                    className="family-date-select family-month-select"
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
                    className="family-date-select family-day-select"
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
                    className="family-date-select family-year-select"
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

              {/* Calendar Grid - Aggregates all family members' events */}
              <div className="family-calendar-week-grid">
                {daysOfWeek.map((day, index) => {
                  const isToday = new Date().toDateString() === weekDates[index].toDateString();
                  const dayEvents = getEventsForDay(index);

                  return (
                    <div
                      key={day}
                      className="family-calendar-day-column"
                    >
                      <div
                        className={`family-calendar-day-header ${isToday ? 'today' : 'regular'}`}
                        onClick={() => setSelectedDate(weekDates[index])}
                        style={{ cursor: 'pointer' }}
                        title="Click to view day details"
                      >
                        <div className="family-calendar-day-name">{day}</div>
                        <div className="family-calendar-day-number">
                          {weekDates[index].getDate()}
                        </div>
                      </div>
                      <div className="family-calendar-day-content">
                        {dayEvents.length === 0 ? (
                          <div className="family-calendar-no-events">
                            No events
                          </div>
                        ) : (
                          dayEvents.map((event) => (
                            <div
                              key={event.id}
                              className="family-calendar-event"
                              style={{
                                background: 'var(--primary-color)',
                                opacity: 0.9
                              }}
                            >
                              <div className="family-calendar-event-time">
                                {event.isAllDay
                                  ? 'All Day'
                                  : new Date(event.start).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit'
                                    })
                                }
                              </div>
                              <div className="family-calendar-event-title">
                                {event.title}
                              </div>
                              {event.location && (
                                <div className="family-calendar-event-member">
                                  📍 {event.location}
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
          </div>

          {/* Family Overview - Full width */}
          <div style={{ gridColumn: 'span 12' }}>
            <FamilyOverviewWidget
              familyMembers={mockFamilyMembers}
              onViewMember={handleViewMember}
              onManageFamily={handleManageFamily}
            />
          </div>

          {/* Task Management - Full width */}
          <div style={{ gridColumn: 'span 12' }}>
            <TaskManagementWidget
              tasks={mockTasks}
              onCreateTask={handleCreateTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
            />
          </div>

          {/* Analytics - Left side */}
          <div style={{ gridColumn: 'span 7' }}>
            <FamilyAnalyticsWidget
              familyMembers={mockFamilyMembers}
              weeklyTrend={12}
              totalTasksThisWeek={13}
              totalCompletedThisWeek={10}
              averageCompletionTime={18}
            />
          </div>

          {/* Reward Management - Right side */}
          <div style={{ gridColumn: 'span 5' }}>
            <RewardManagementWidget
              memberBalances={mockMemberBalances}
              pendingRequests={mockPendingRequests}
              onApproveRequest={handleApproveRequest}
              onDenyRequest={handleDenyRequest}
              onAdjustBalance={handleAdjustBalance}
            />
          </div>
        </div>
      </div>

      {/* Task Creation Modal */}
      <TaskCreationModal
        isOpen={showTaskCreationModal}
        onClose={() => setShowTaskCreationModal(false)}
        onSave={handleTaskSave}
        familyMembers={mockFamilyMembers}
      />

      {/* Full Month Calendar Modal */}
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
                Family Calendar
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
                familyMemberId={familyId || ''}
                viewMode="parent"
                initialExpanded={true}
                hideViewSelector={true}
              />
            </div>
          </div>
        </div>,
        document.getElementById('modal-root') || document.body
      )}

      {/* Manage Dashboards Modal */}
      <ManageDashboardsModal
        isOpen={showManageDashboards}
        onClose={() => setShowManageDashboards(false)}
      />

      {/* Date Detail Modal */}
      <DateDetailModal
        date={selectedDate}
        events={[]} // TODO: Get actual events for the selected date
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
            // Get current user/family member ID
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
              alert('You must be logged in to create events');
              return;
            }

            const { data: memberData } = await supabase
              .from('family_members')
              .select('id, family_id')
              .eq('auth_user_id', user.id)
              .single();

            if (!memberData) {
              alert('Could not find your family member profile');
              return;
            }

            const input = convertModalDataToEventInput(eventData);
            const newEvent = await EventsService.createEvent(
              input,
              memberData.id,
              memberData.family_id
            );

            if (newEvent) {
              await refreshEvents();
              setShowEventModal(false);
              setEventPreselectedDate(null);
              refresh(); // Refresh dashboard data
            } else {
              alert('Failed to create event. Please try again.');
            }
          } catch (error) {
            console.error('Error creating event:', error);
            alert('Error creating event. Please try again.');
          }
        }}
        preselectedDate={eventPreselectedDate}
        familyMembers={mockFamilyMembers}
      />
    </div>
  );
};

export default FamilyModeDashboard;
