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
import { usePermissions } from '../../../../hooks/usePermissions';
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
import { getFamilyMembers } from '../../../../lib/api';
import './FamilyModeDashboard.css';

// Helper: Sort family members by role priority and age
function sortFamilyMembers(members: any[]): any[] {
  const rolePriority: Record<string, number> = {
    'primary_organizer': 1,
    'self': 1,
    'mom': 1,
    'partner': 2,
    'dad': 2,
    'child': 3,
    'teen': 3,
    'out-of-nest': 4,
    'special': 5,
    'other': 6
  };

  return [...members].sort((a, b) => {
    const priorityA = rolePriority[a.role] || 6;
    const priorityB = rolePriority[b.role] || 6;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // For same priority (especially children), sort by age descending (oldest first)
    if (a.age && b.age) {
      return b.age - a.age;
    }

    // If no age, sort alphabetically by name
    return (a.name || '').localeCompare(b.name || '');
  });
}

interface FamilyModeDashboardProps {
  familyId?: string;
  familyMemberId?: string; // For permission checking when restrictToPermissions is true
  restrictToPermissions?: boolean; // When true, filter features by family member's permissions
}

const FamilyModeDashboard: React.FC<FamilyModeDashboardProps> = ({
  familyId,
  familyMemberId,
  restrictToPermissions = false
}) => {
  const navigate = useNavigate();
  const { loading, error, refresh } = useFamilyDashboard(familyId || null);

  // Conditionally use permissions hook when restrictToPermissions is true
  const permissionsHook = usePermissions(familyMemberId || '');
  const checkPermission = restrictToPermissions && familyMemberId
    ? permissionsHook.checkPermission
    : () => true; // Always return true if not restricting

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

  // Real data state
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Load family data (members, tasks)
  useEffect(() => {
    const loadFamilyData = async () => {
      try {
        setDataLoading(true);

        // Get current user and their family
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get family ID
        let targetFamilyId = familyId;
        if (!targetFamilyId) {
          const { data: familyData } = await supabase
            .from('families')
            .select('id')
            .eq('auth_user_id', user.id)
            .single();

          if (familyData) {
            targetFamilyId = familyData.id;
            setCurrentFamilyId(targetFamilyId);
          }
        }

        if (!targetFamilyId) {
          console.log('No family found for user');
          setDataLoading(false);
          return;
        }

        // Load family members
        const membersResult = await getFamilyMembers(targetFamilyId);
        if (membersResult.success && membersResult.members) {
          // Filter to only show household members with dashboards
          // Context-only members (out-of-nest like Sariah, Esther, Matthew, Timothy) should not appear
          const householdMembers = membersResult.members.filter((m: any) => m.in_household === true);
          // Sort members: primary_organizer → partner → children by age → special
          const sortedMembers = sortFamilyMembers(householdMembers);
          setFamilyMembers(sortedMembers);
        }

        // Load tasks (handle gracefully if RLS blocks access)
        try {
          const { data: tasksData, error: tasksError } = await supabase
            .from('tasks')
            .select('*')
            .eq('family_id', targetFamilyId)
            .order('created_at', { ascending: false });

          if (!tasksError && tasksData) {
            setTasks(tasksData);
          }
        } catch (taskErr) {
          console.log('Could not load tasks (RLS may be blocking):', taskErr);
          setTasks([]);
        }

      } catch (error) {
        console.error('Error loading family data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    loadFamilyData();
  }, [familyId]);

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

  // Transform family members for FamilyOverviewWidget
  const familyMembersForOverview = familyMembers.map(member => {
    // Count tasks for this member
    const memberTasks = tasks.filter(task =>
      task.assignee && Array.isArray(task.assignee) && task.assignee.includes(member.id)
    );
    const completedTasks = memberTasks.filter(t => t.status === 'completed').length;
    const totalTasks = memberTasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      id: member.id,
      name: member.name,
      role: member.role,
      dashboard_mode: member.dashboard_type || member.dashboard_mode || 'guided',
      member_color: member.member_color || 'AIMfM Sage Teal',
      stats: {
        completedTasks,
        totalTasks,
        completionRate,
        streak: 0, // TODO: Calculate from task_completions
        nextEvent: '' // TODO: Get from calendar events
      }
    };
  });

  // Transform tasks for TaskManagementWidget
  const tasksForWidget = tasks.map(task => {
    // Find assigned member names and colors
    const assignedMembers = (task.assignee || []).map((memberId: string) => {
      const member = familyMembers.find(m => m.id === memberId);
      return member ? { name: member.name, color: member.member_color || 'AIMfM Sage Teal' } : null;
    }).filter(Boolean);

    return {
      id: task.id,
      title: task.task_name || task.title || 'Untitled Task',
      assignedTo: task.assignee || [],
      assignedToNames: assignedMembers.map((m: any) => m.name),
      assignedColors: assignedMembers.map((m: any) => m.color),
      dueDate: task.due_date ? new Date(task.due_date).toLocaleDateString() : undefined,
      completed: task.status === 'completed',
      priority: (task.priority || 'medium') as 'high' | 'medium' | 'low'
    };
  });

  // Empty rewards data (rewards system not yet set up)
  const memberBalances: any[] = [];
  const pendingRequests: any[] = [];

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
    navigate('/commandcenter/family-setup');
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

            {/* Dashboard Switcher - Only for mom, not additional adults */}
            {!restrictToPermissions && (
              <DashboardSwitcher onManageDashboards={() => setShowManageDashboards(true)} />
            )}
          </div>
        </div>

        {/* Widgets Grid */}
        <div className="family-widgets-grid">
          {/* This Week - Combined Family Calendar - Full width - AT TOP (Permission: view_calendar) */}
          {checkPermission('view_calendar') && (
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
          )}

          {/* Family Overview - Full width (Permission: view_family_data) */}
          {checkPermission('view_family_data') && (
            <div style={{ gridColumn: 'span 12' }}>
              <FamilyOverviewWidget
                familyMembers={familyMembersForOverview}
                onViewMember={handleViewMember}
                onManageFamily={handleManageFamily}
              />
            </div>
          )}

          {/* Task Management - Full width (Permission: view_tasks) */}
          {checkPermission('view_tasks') && (
            <div style={{ gridColumn: 'span 12' }}>
              <TaskManagementWidget
                tasks={tasksForWidget}
                onCreateTask={checkPermission('create_tasks') ? handleCreateTask : undefined}
                onToggleTask={checkPermission('edit_tasks') ? handleToggleTask : undefined}
                onDeleteTask={checkPermission('edit_tasks') ? handleDeleteTask : undefined}
              />
            </div>
          )}

          {/* Analytics - Left side (Permission: access_reports) */}
          {checkPermission('access_reports') && (
            <div style={{ gridColumn: 'span 7' }}>
              <FamilyAnalyticsWidget
                familyMembers={familyMembersForOverview}
                weeklyTrend={0}
                totalTasksThisWeek={tasks.length}
                totalCompletedThisWeek={tasks.filter(t => t.status === 'completed').length}
                averageCompletionTime={0}
              />
            </div>
          )}

          {/* Reward Management - Right side (Permission: manage_rewards) */}
          {checkPermission('manage_rewards') && (
            <div style={{ gridColumn: 'span 5' }}>
              <RewardManagementWidget
                memberBalances={memberBalances}
                pendingRequests={pendingRequests}
                onApproveRequest={handleApproveRequest}
                onDenyRequest={handleDenyRequest}
                onAdjustBalance={handleAdjustBalance}
              />
            </div>
          )}
        </div>
      </div>

      {/* Task Creation Modal (Permission: create_tasks) */}
      {checkPermission('create_tasks') && (
        <TaskCreationModal
          isOpen={showTaskCreationModal}
          onClose={() => setShowTaskCreationModal(false)}
          onSave={handleTaskSave}
          familyMembers={familyMembersForOverview}
        />
      )}

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

      {/* Manage Dashboards Modal - Only for mom, not additional adults */}
      {!restrictToPermissions && (
        <ManageDashboardsModal
          isOpen={showManageDashboards}
          onClose={() => setShowManageDashboards(false)}
        />
      )}

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
        familyMembers={familyMembersForOverview}
      />
    </div>
  );
};

export default FamilyModeDashboard;
