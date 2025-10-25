/**
 * FamilyModeDashboard Component
 * Mom's master view of entire family
 * NO EMOJIS - CSS VARIABLES ONLY - THEME AWARE
 */

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
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
    return mockEvents.filter(event => event.dayIndex === dayIndex);
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
    setCurrentWeek(new Date());
  };

  // Event handlers
  const handleViewMember = (memberId: string) => {
    navigate(`/member/${memberId}`);
  };

  const handleManageFamily = () => {
    navigate('/command-center?tab=family');
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
                  {/* Month/Year Navigation */}
                  <div className="calendar-month-nav">
                    <button
                      onClick={handlePreviousMonth}
                      className="calendar-month-nav-button"
                      title="Previous Month"
                    >
                      <ChevronLeft size={12} />
                      Month
                    </button>
                    <span className="calendar-month-year-display">
                      {currentWeek.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      onClick={handleNextMonth}
                      className="calendar-month-nav-button"
                      title="Next Month"
                    >
                      Month
                      <ChevronRight size={12} />
                    </button>
                  </div>

                  {/* Week Navigation */}
                  <div className="calendar-week-nav">
                    <button
                      onClick={handlePreviousWeek}
                      className="calendar-week-nav-button"
                      title="Previous Week"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="calendar-week-range">
                      {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                      {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <button
                      onClick={handleNextWeek}
                      className="calendar-week-nav-button"
                      title="Next Week"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Today Button */}
                  <button
                    onClick={handleToday}
                    className="calendar-today-button"
                  >
                    Today
                  </button>

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
                      <div className={`family-calendar-day-header ${isToday ? 'today' : 'regular'}`}>
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
                                background: getMemberColor(event.memberColor)
                              }}
                            >
                              <div className="family-calendar-event-time">
                                {event.time}
                              </div>
                              <div className="family-calendar-event-title">
                                {event.title}
                              </div>
                              <div className="family-calendar-event-member">
                                {event.memberName}
                              </div>
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
    </div>
  );
};

export default FamilyModeDashboard;
