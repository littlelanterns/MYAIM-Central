/**
 * FamilyModeDashboard Component
 * Mom's master view of entire family
 * NO EMOJIS - CSS VARIABLES ONLY - THEME AWARE
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useFamilyDashboard } from '../../../../hooks/dashboard/useFamilyDashboard';
import FamilyOverviewWidget from './FamilyOverviewWidget';
import WeekGlanceWidget from './WeekGlanceWidget';
import TaskManagementWidget from './TaskManagementWidget';
import FamilyAnalyticsWidget from './FamilyAnalyticsWidget';
import RewardManagementWidget from './RewardManagementWidget';
import TaskCreationModal from '../../../tasks/TaskCreationModal';

interface FamilyModeDashboardProps {
  familyId?: string;
}

const FamilyModeDashboard: React.FC<FamilyModeDashboardProps> = ({ familyId }) => {
  const navigate = useNavigate();
  const { loading, error, refresh } = useFamilyDashboard(familyId || null);

  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [showTaskCreationModal, setShowTaskCreationModal] = useState(false);

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
        {/* Header with Member Quick-Switch */}
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

            {/* Member Quick-Switch Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                style={{
                  background: 'var(--gradient-background)',
                  border: '1px solid var(--accent-color)',
                  borderRadius: '12px',
                  padding: '0.875rem 1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '1rem',
                  color: 'var(--text-color)',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  minWidth: '220px',
                  justifyContent: 'space-between'
                }}
                onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'}
                onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <span>Viewing as: Mom (Family)</span>
                <ChevronDown size={16} />
              </button>

              {showMemberDropdown && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 0.5rem)',
                  right: 0,
                  background: 'var(--background-color)',
                  border: '1px solid var(--accent-color)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                  minWidth: '220px',
                  zIndex: 100,
                  overflow: 'hidden'
                }}>
                  <div
                    style={{
                      padding: '0.875rem 1.25rem',
                      cursor: 'pointer',
                      background: 'var(--primary-color)',
                      color: 'white',
                      fontWeight: 600
                    }}
                  >
                    Family View
                  </div>
                  {mockFamilyMembers.map(member => (
                    <div
                      key={member.id}
                      onClick={() => {
                        handleViewMember(member.id);
                        setShowMemberDropdown(false);
                      }}
                      style={{
                        padding: '0.875rem 1.25rem',
                        cursor: 'pointer',
                        borderTop: '1px solid var(--accent-color)',
                        color: 'var(--text-color)',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'var(--accent-color)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      View as: {member.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Widgets Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '1.5rem'
        }}>
          {/* Family Overview - Full width */}
          <div style={{ gridColumn: 'span 12' }}>
            <FamilyOverviewWidget
              familyMembers={mockFamilyMembers}
              onViewMember={handleViewMember}
              onManageFamily={handleManageFamily}
            />
          </div>

          {/* Week at a Glance - Full width */}
          <div style={{ gridColumn: 'span 12' }}>
            <WeekGlanceWidget
              events={mockEvents}
              currentWeek={currentWeek}
              onPreviousWeek={handlePreviousWeek}
              onNextWeek={handleNextWeek}
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
    </div>
  );
};

export default FamilyModeDashboard;
