/**
 * AdditionalAdultDashboard Component
 * Dashboard for additional adults (grandparents, nannies, etc.)
 * Features: Limited access with granular permissions, view-only or limited edit
 */

import React from 'react';
import './AdditionalAdultDashboard.css';

interface AdditionalAdultDashboardProps {
  familyMemberId: string;
  permissions?: {
    canViewCalendar?: boolean;
    canViewTasks?: boolean;
    canEditTasks?: boolean;
    canViewVictories?: boolean;
    canRecordVictories?: boolean;
  };
}

const AdditionalAdultDashboard: React.FC<AdditionalAdultDashboardProps> = ({
  familyMemberId,
  permissions = {}
}) => {
  const {
    canViewCalendar = false,
    canViewTasks = false,
    canEditTasks = false,
    canViewVictories = false,
    canRecordVictories = false
  } = permissions;

  return (
    <div className="additional-adult-dashboard">
      <header className="additional-adult-header">
        <h1>Family Helper Dashboard</h1>
        <p className="role-description">
          Limited access - set by family organizer
        </p>
      </header>

      <div className="permission-notice">
        <h3>Your Permissions</h3>
        <ul className="permissions-list">
          <li className={canViewCalendar ? 'granted' : 'denied'}>
            {canViewCalendar ? '✓' : '×'} View Family Calendar
          </li>
          <li className={canViewTasks ? 'granted' : 'denied'}>
            {canViewTasks ? '✓' : '×'} View Tasks
          </li>
          <li className={canEditTasks ? 'granted' : 'denied'}>
            {canEditTasks ? '✓' : '×'} Edit Tasks
          </li>
          <li className={canViewVictories ? 'granted' : 'denied'}>
            {canViewVictories ? '✓' : '×'} View Victories
          </li>
          <li className={canRecordVictories ? 'granted' : 'denied'}>
            {canRecordVictories ? '✓' : '×'} Record Victories
          </li>
        </ul>
      </div>

      <div className="additional-adult-widgets">
        <div className="placeholder-message">
          <h2>Permission-Based Widgets Coming Soon!</h2>
          <p>
            You'll see widgets here based on the permissions granted by the family organizer.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdditionalAdultDashboard;
