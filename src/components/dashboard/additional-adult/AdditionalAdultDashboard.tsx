/**
 * AdditionalAdultDashboard Component
 * Dashboard for additional adults (dads, grandparents, babysitters, tutors)
 * Features: Permission-based access, professional interface, NO EMOJIS
 * CRITICAL: Uses CSS variables ONLY - works with all 26+ themes
 */

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Users, Calendar, ListTodo, Settings, BarChart3, LayoutDashboard, Calendar as CalendarIcon } from 'lucide-react';
import { usePermissions } from '../../../hooks/usePermissions';
import PermissionIndicator from './PermissionIndicator';
import PermissionGate from './PermissionGate';
import FamilyModeDashboard from '../modes/family/FamilyModeDashboard';
import { IndependentModeCalendar } from '../modes/independent/IndependentModeCalendar';
import './AdditionalAdultDashboard.css';

interface AdditionalAdultDashboardProps {
  familyMemberId: string;
}

const AdditionalAdultDashboard: React.FC<AdditionalAdultDashboardProps> = ({
  familyMemberId
}) => {
  const { checkPermission, loading } = usePermissions(familyMemberId);
  const [activeView, setActiveView] = useState<'overview' | 'tasks' | 'calendar' | 'family' | 'familyDashboard'>('overview');
  const [showMonthModal, setShowMonthModal] = useState(false);

  if (loading) {
    return (
      <div className="additional-adult-dashboard">
        <div className="additional-adult-card">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If viewing Family Dashboard and has permission
  if (activeView === 'familyDashboard' && checkPermission('view_family_dashboard')) {
    return <FamilyModeDashboard familyId={familyMemberId} />;
  }

  return (
    <div className="additional-adult-dashboard">
      {/* Header */}
      <header className="additional-adult-header">
        <h1>Additional Adult Dashboard</h1>
        <p className="role-description">
          Supporting family management with granted permissions
        </p>
      </header>

      {/* Main Content Grid */}
      <div className="additional-adult-widgets">

        {/* Permission Indicator - Always visible */}
        <PermissionIndicator familyMemberId={familyMemberId} />

        {/* Quick Actions Panel */}
        <div className="additional-adult-card">
          <h3>Quick Actions</h3>
          <div className="quick-actions-grid">

            <PermissionGate
              action="view_family_dashboard"
              familyMemberId={familyMemberId}
              fallback={
                <button className="additional-adult-button" disabled>
                  Family Dashboard
                </button>
              }
            >
              <button
                className="additional-adult-button"
                onClick={() => setActiveView('familyDashboard')}
                style={{
                  background: 'var(--gradient-primary)',
                  color: 'white',
                  borderColor: 'var(--primary-color)',
                  fontWeight: 600
                }}
              >
                <LayoutDashboard size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                Family Dashboard
              </button>
            </PermissionGate>

            <PermissionGate
              action="view_family_data"
              familyMemberId={familyMemberId}
              fallback={
                <button className="additional-adult-button" disabled>
                  View Family
                </button>
              }
            >
              <button
                className="additional-adult-button"
                onClick={() => setActiveView('family')}
              >
                <Users size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                View Family
              </button>
            </PermissionGate>

            <PermissionGate
              action="view_tasks"
              familyMemberId={familyMemberId}
              fallback={
                <button className="additional-adult-button" disabled>
                  View Tasks
                </button>
              }
            >
              <button
                className="additional-adult-button"
                onClick={() => setActiveView('tasks')}
              >
                <ListTodo size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                View Tasks
              </button>
            </PermissionGate>

            <PermissionGate
              action="view_calendar"
              familyMemberId={familyMemberId}
              fallback={
                <button className="additional-adult-button" disabled>
                  View Calendar
                </button>
              }
            >
              <button
                className="additional-adult-button"
                onClick={() => setActiveView('calendar')}
              >
                <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                View Calendar
              </button>
            </PermissionGate>

            <PermissionGate
              action="create_tasks"
              familyMemberId={familyMemberId}
              fallback={
                <button className="additional-adult-button" disabled>
                  Create Task
                </button>
              }
            >
              <button
                className="additional-adult-button"
                onClick={() => {
                  // TODO: Open task creation modal
                  alert('Task creation coming soon!');
                }}
              >
                <ListTodo size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                Create Task
              </button>
            </PermissionGate>

          </div>
        </div>

        {/* Family Overview - Permission Gated */}
        <PermissionGate action="view_family_data" familyMemberId={familyMemberId}>
          <div className="additional-adult-card">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem',
              borderBottom: '1px solid var(--accent-color)',
              paddingBottom: '0.75rem',
            }}>
              <Users size={24} color="var(--primary-color)" />
              <h3 style={{ margin: 0 }}>Family Overview</h3>
            </div>
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--text-color)',
              opacity: 0.7,
            }}>
              <p style={{ margin: 0 }}>Family member cards and overview coming soon</p>
            </div>
          </div>
        </PermissionGate>

        {/* Task Management - Permission Gated */}
        <PermissionGate action="view_tasks" familyMemberId={familyMemberId}>
          <div className="additional-adult-card">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              borderBottom: '1px solid var(--accent-color)',
              paddingBottom: '0.75rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ListTodo size={24} color="var(--primary-color)" />
                <h3 style={{ margin: 0 }}>Task Management</h3>
              </div>
              {checkPermission('create_tasks') && (
                <button className="additional-adult-button" style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}>
                  Add Task
                </button>
              )}
            </div>
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--text-color)',
              opacity: 0.7,
            }}>
              <p style={{ margin: 0 }}>Task list and management interface coming soon</p>
            </div>
          </div>
        </PermissionGate>

        {/* Calendar View - Permission Gated */}
        <PermissionGate action="view_calendar" familyMemberId={familyMemberId}>
          <div className="additional-adult-card">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              borderBottom: '1px solid var(--accent-color)',
              paddingBottom: '0.75rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Calendar size={24} color="var(--primary-color)" />
                <h3 style={{ margin: 0 }}>Family Calendar</h3>
              </div>
              <button
                className="additional-adult-button"
                onClick={() => setShowMonthModal(true)}
                style={{
                  background: 'var(--primary-color)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <CalendarIcon size={14} />
                View Month
              </button>
            </div>
            <div style={{
              padding: '1rem',
              textAlign: 'center',
              color: 'var(--text-color)',
              opacity: 0.7
            }}>
              <p style={{ margin: 0 }}>Calendar week view coming soon</p>
            </div>
          </div>
        </PermissionGate>

        {/* Reports - Permission Gated */}
        <PermissionGate action="access_reports" familyMemberId={familyMemberId}>
          <div className="additional-adult-card">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem',
              borderBottom: '1px solid var(--accent-color)',
              paddingBottom: '0.75rem',
            }}>
              <BarChart3 size={24} color="var(--primary-color)" />
              <h3 style={{ margin: 0 }}>Family Reports</h3>
            </div>
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--text-color)',
              opacity: 0.7,
            }}>
              <p style={{ margin: 0 }}>Reports and analytics coming soon</p>
            </div>
          </div>
        </PermissionGate>

        {/* Settings */}
        <div className="additional-adult-card">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem',
            borderBottom: '1px solid var(--accent-color)',
            paddingBottom: '0.75rem',
          }}>
            <Settings size={24} color="var(--primary-color)" />
            <h3 style={{ margin: 0 }}>Preferences</h3>
          </div>
          <div style={{ padding: '1rem 0' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              background: 'var(--gradient-background)',
              borderRadius: '6px',
              cursor: 'pointer',
            }}>
              <input type="checkbox" defaultChecked />
              <span style={{ color: 'var(--text-color)', fontSize: '0.875rem' }}>
                Notify me when permissions change
              </span>
            </label>
          </div>
        </div>

      </div>

      {/* Full Month Calendar Modal - Permission Gated */}
      {showMonthModal && checkPermission('view_calendar') && ReactDOM.createPortal(
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
                familyMemberId={familyMemberId}
                viewMode="parent"
                initialExpanded={true}
                hideViewSelector={true}
              />
            </div>
          </div>
        </div>,
        document.getElementById('modal-root') as HTMLElement
      )}
    </div>
  );
};

export default AdditionalAdultDashboard;
