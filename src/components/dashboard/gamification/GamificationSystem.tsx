/**
 * GamificationSystem Component
 * Main gamification dashboard showing points, badges, and rewards
 */

import React, { useState } from 'react';
import './GamificationSystem.css';

interface GamificationSystemProps {
  familyMemberId: string;
  showInWidget?: boolean;
}

const GamificationSystem: React.FC<GamificationSystemProps> = ({
  familyMemberId,
  showInWidget = false
}) => {
  const [activeTab, setActiveTab] = useState<'points' | 'badges' | 'rewards'>('points');

  return (
    <div className={`gamification-system ${showInWidget ? 'widget-mode' : ''}`}>
      <header className="gamification-header">
        <h2>🎮 Your Achievements</h2>
        <div className="quick-stats">
          <div className="stat">
            <span className="stat-icon">⭐</span>
            <span className="stat-value">0</span>
            <span className="stat-label">Points</span>
          </div>
          <div className="stat">
            <span className="stat-icon">🏅</span>
            <span className="stat-value">0</span>
            <span className="stat-label">Badges</span>
          </div>
          <div className="stat">
            <span className="stat-icon">🔥</span>
            <span className="stat-value">0</span>
            <span className="stat-label">Streak</span>
          </div>
        </div>
      </header>

      {!showInWidget && (
        <>
          <div className="gamification-tabs">
            <button
              className={`tab ${activeTab === 'points' ? 'active' : ''}`}
              onClick={() => setActiveTab('points')}
            >
              ⭐ Points
            </button>
            <button
              className={`tab ${activeTab === 'badges' ? 'active' : ''}`}
              onClick={() => setActiveTab('badges')}
            >
              🏅 Badges
            </button>
            <button
              className={`tab ${activeTab === 'rewards' ? 'active' : ''}`}
              onClick={() => setActiveTab('rewards')}
            >
              🎁 Rewards
            </button>
          </div>

          <div className="gamification-content">
            <div className="placeholder-message">
              <div className="placeholder-icon">🎯</div>
              <h3>Gamification System Coming Soon!</h3>
              <p>Earn points, collect badges, and redeem rewards for your achievements</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GamificationSystem;
