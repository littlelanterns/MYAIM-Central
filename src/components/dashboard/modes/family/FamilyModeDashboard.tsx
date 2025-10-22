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
    navigate(`/member-dashboard/${memberId}`);
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
    <div style={{
      background: 'var(--gradient-primary)',
      minHeight: '100vh',
      color: 'var(--text-color)',
      fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '1.5rem'
    }}>
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto'
      }}>
        {/* Header with Dashboard Switcher */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '1.5rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid var(--accent-color)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h1 style={{
                margin: '0 0 0.5rem 0',
                fontSize: '2rem',
                fontWeight: 600,
                color: 'var(--primary-color)',
                fontFamily: '"The Seasons", "Playfair Display", serif'
              }}>
                Family Dashboard
              </h1>
              <p style={{
                margin: 0,
                fontSize: '0.95rem',
                color: 'var(--text-color)',
                opacity: 0.7
              }}>
                Mission control for your entire family
              </p>
            </div>

            {/* Dashboard Switcher */}
            <DashboardSwitcher onManageDashboards={() => setShowManageDashboards(true)} />
          </div>
        </div>

        {/* Widgets Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '1.5rem'
        }}>
          {/* This Week - Combined Family Calendar - Full width - AT TOP */}
          <div style={{ gridColumn: 'span 12' }}>
            <div style={{
              background: 'var(--background-color)',
              border: '1px solid var(--accent-color)',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
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
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Month/Year Navigation */}
                  <div style={{
                    display: 'flex',
                    gap: '0.375rem',
                    alignItems: 'center',
                    background: 'var(--gradient-background)',
                    padding: '0.25rem',
                    borderRadius: '8px',
                    border: '1px solid var(--accent-color)'
                  }}>
                    <button
                      onClick={handlePreviousMonth}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.375rem 0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        color: 'var(--text-color)',
                        transition: 'all 0.2s',
                        fontSize: '0.75rem',
                        fontWeight: 500
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'var(--accent-color)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                      title="Previous Month"
                    >
                      <ChevronLeft size={12} />
                      Month
                    </button>
                    <span style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-color)',
                      fontWeight: 600,
                      padding: '0 0.5rem'
                    }}>
                      {currentWeek.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      onClick={handleNextMonth}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.375rem 0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        color: 'var(--text-color)',
                        transition: 'all 0.2s',
                        fontSize: '0.75rem',
                        fontWeight: 500
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'var(--accent-color)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                      title="Next Month"
                    >
                      Month
                      <ChevronRight size={12} />
                    </button>
                  </div>

                  {/* Week Navigation */}
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
                      title="Previous Week"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-color)',
                      minWidth: '120px',
                      textAlign: 'center'
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
                      title="Next Week"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Today Button */}
                  <button
                    onClick={handleToday}
                    style={{
                      background: 'var(--gradient-background)',
                      border: '1px solid var(--accent-color)',
                      borderRadius: '6px',
                      padding: '0.5rem 0.75rem',
                      cursor: 'pointer',
                      color: 'var(--text-color)',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'var(--accent-color)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'var(--gradient-background)'}
                  >
                    Today
                  </button>

                  {/* Settings Button */}
                  <button
                    onClick={() => setShowCalendarSettings(!showCalendarSettings)}
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
                    title="Calendar Settings"
                  >
                    <Settings size={16} />
                  </button>

                  {/* View Month Button */}
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

              {/* Calendar Settings Dropdown */}
              {showCalendarSettings && (
                <div style={{
                  background: 'var(--gradient-background)',
                  border: '1px solid var(--accent-color)',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{
                    margin: '0 0 0.75rem 0',
                    color: 'var(--primary-color)',
                    fontSize: '0.9375rem',
                    fontWeight: 600
                  }}>
                    Calendar Settings
                  </h4>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: 'var(--text-color)'
                  }}>
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
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '0.5rem'
              }}>
                {daysOfWeek.map((day, index) => {
                  const isToday = new Date().toDateString() === weekDates[index].toDateString();
                  const dayEvents = getEventsForDay(index);

                  return (
                    <div
                      key={day}
                      style={{
                        minHeight: '120px',
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
                        gap: '0.375rem',
                        overflow: 'auto'
                      }}>
                        {dayEvents.length === 0 ? (
                          <div style={{
                            color: 'var(--text-color)',
                            opacity: 0.3,
                            fontSize: '0.75rem',
                            textAlign: 'center',
                            padding: '0.5rem 0'
                          }}>
                            No events
                          </div>
                        ) : (
                          dayEvents.map((event) => (
                            <div
                              key={event.id}
                              style={{
                                background: getMemberColor(event.memberColor),
                                color: 'white',
                                borderRadius: '4px',
                                padding: '0.375rem 0.5rem',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.opacity = '0.8';
                                e.currentTarget.style.transform = 'scale(1.02)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.opacity = '1';
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                            >
                              <div style={{
                                fontWeight: 600,
                                marginBottom: '0.125rem',
                                lineHeight: 1.2
                              }}>
                                {event.time}
                              </div>
                              <div style={{
                                marginBottom: '0.25rem',
                                lineHeight: 1.3,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {event.title}
                              </div>
                              <div style={{
                                fontSize: '0.625rem',
                                opacity: 0.9
                              }}>
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
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            zIndex: 9999,
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
                Family Calendar
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
                familyMemberId={familyId || ''}
                viewMode="parent"
                initialExpanded={true}
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
