/**
 * BadgesDisplay Component
 * Shows earned badges and available badges to unlock
 */

import React, { useState } from 'react';
import './BadgesDisplay.css';
import { BADGE_DEFINITIONS } from './GamificationTypes';

interface BadgesDisplayProps {
  familyMemberId: string;
}

const BadgesDisplay: React.FC<BadgesDisplayProps> = ({ familyMemberId }) => {
  const [filter, setFilter] = useState<'all' | 'earned' | 'available'>('all');

  return (
    <div className="badges-display">
      <div className="badges-header">
        <h3>🏅 Badge Collection</h3>
        <div className="badge-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'earned' ? 'active' : ''}`}
            onClick={() => setFilter('earned')}
          >
            Earned
          </button>
          <button
            className={`filter-btn ${filter === 'available' ? 'active' : ''}`}
            onClick={() => setFilter('available')}
          >
            Available
          </button>
        </div>
      </div>

      <div className="badges-grid">
        {BADGE_DEFINITIONS.map((badge) => (
          <div key={badge.id} className={`badge-card locked`}>
            <div className="badge-icon">{badge.icon}</div>
            <h4 className="badge-name">{badge.name}</h4>
            <p className="badge-description">{badge.description}</p>
            <div className="badge-footer">
              <span className={`badge-rarity ${badge.rarity}`}>{badge.rarity}</span>
              <span className="badge-points">+{badge.points_value} pts</span>
            </div>
          </div>
        ))}
      </div>

      <div className="placeholder-message">
        <p>Start completing tasks and recording victories to earn badges!</p>
      </div>
    </div>
  );
};

export default BadgesDisplay;
