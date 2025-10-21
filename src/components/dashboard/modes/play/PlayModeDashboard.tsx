/**
 * PlayModeDashboard Component
 * Dashboard for young children (ages 3-7)
 * Features: Large buttons, visual rewards, simple interactions
 */

import React from 'react';
import './PlayModeDashboard.css';

interface PlayModeDashboardProps {
  familyMemberId: string;
}

const PlayModeDashboard: React.FC<PlayModeDashboardProps> = ({ familyMemberId }) => {
  return (
    <div className="play-mode-dashboard">
      <header className="play-header">
        <h1>🎮 My Play Dashboard</h1>
        <p className="play-subtitle">Fun and easy!</p>
      </header>

      <div className="play-widgets-container">
        <div className="placeholder-message">
          <div className="placeholder-icon">🎨</div>
          <h2>Coming Soon!</h2>
          <p>Colorful widgets with big buttons and fun sounds</p>
        </div>
      </div>
    </div>
  );
};

export default PlayModeDashboard;
