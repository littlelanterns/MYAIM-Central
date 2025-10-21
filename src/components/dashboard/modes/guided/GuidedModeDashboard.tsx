/**
 * GuidedModeDashboard Component
 * Dashboard for elementary-age children (ages 8-12)
 * Features: Structured tasks, progress tracking, gentle guidance
 */

import React from 'react';
import './GuidedModeDashboard.css';

interface GuidedModeDashboardProps {
  familyMemberId: string;
}

const GuidedModeDashboard: React.FC<GuidedModeDashboardProps> = ({ familyMemberId }) => {
  return (
    <div className="guided-mode-dashboard">
      <header className="guided-header">
        <h1>🎯 My Guided Dashboard</h1>
        <p className="guided-subtitle">Learning to organize step by step</p>
      </header>

      <div className="guided-widgets-container">
        <div className="placeholder-message">
          <div className="placeholder-icon">📚</div>
          <h2>Coming Soon!</h2>
          <p>Structured widgets with helpful prompts and progress tracking</p>
        </div>
      </div>
    </div>
  );
};

export default GuidedModeDashboard;
