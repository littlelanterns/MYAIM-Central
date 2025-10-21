/**
 * PointsTracker Component
 * Displays points balance and recent point transactions
 */

import React from 'react';
import './PointsTracker.css';

interface PointsTrackerProps {
  familyMemberId: string;
}

const PointsTracker: React.FC<PointsTrackerProps> = ({ familyMemberId }) => {
  return (
    <div className="points-tracker">
      <div className="points-summary">
        <div className="total-points">
          <h3>Total Points</h3>
          <div className="points-value">0</div>
        </div>

        <div className="points-breakdown">
          <div className="breakdown-item">
            <span className="breakdown-label">This Week</span>
            <span className="breakdown-value">0</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">This Month</span>
            <span className="breakdown-value">0</span>
          </div>
        </div>
      </div>

      <div className="points-history">
        <h3>Recent Activity</h3>
        <div className="placeholder-message">
          <p>Point transactions will appear here</p>
        </div>
      </div>

      <div className="earning-tips">
        <h4>💡 Ways to Earn Points</h4>
        <ul>
          <li>✅ Complete tasks (+10)</li>
          <li>🏆 Record victories (+15)</li>
          <li>🔥 Maintain streaks (bonus +5)</li>
          <li>🤝 Help family members (+20)</li>
        </ul>
      </div>
    </div>
  );
};

export default PointsTracker;
