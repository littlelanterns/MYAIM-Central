/**
 * RewardsCatalog Component
 * Displays available rewards that can be redeemed with points
 */

import React, { useState } from 'react';
import './RewardsCatalog.css';

interface RewardsCatalogProps {
  familyMemberId: string;
  currentPoints: number;
}

const RewardsCatalog: React.FC<RewardsCatalogProps> = ({
  familyMemberId,
  currentPoints = 0
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const mockRewards = [
    {
      id: '1',
      name: '30 Minutes Extra Screen Time',
      description: 'Add 30 minutes to your daily screen time',
      icon: '📱',
      points_cost: 50,
      category: 'screen_time',
      requires_approval: true
    },
    {
      id: '2',
      name: 'Ice Cream Treat',
      description: 'Choose your favorite ice cream flavor',
      icon: '🍦',
      points_cost: 30,
      category: 'treats',
      requires_approval: true
    },
    {
      id: '3',
      name: 'Movie Night Choice',
      description: 'Pick the family movie for movie night',
      icon: '🎬',
      points_cost: 75,
      category: 'activities',
      requires_approval: false
    }
  ];

  const canAfford = (cost: number) => currentPoints >= cost;

  return (
    <div className="rewards-catalog">
      <div className="rewards-header">
        <div className="points-display">
          <span className="points-label">Your Points:</span>
          <span className="points-amount">⭐ {currentPoints}</span>
        </div>

        <div className="category-filters">
          <button
            className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All
          </button>
          <button
            className={`category-btn ${selectedCategory === 'screen_time' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('screen_time')}
          >
            Screen Time
          </button>
          <button
            className={`category-btn ${selectedCategory === 'treats' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('treats')}
          >
            Treats
          </button>
          <button
            className={`category-btn ${selectedCategory === 'activities' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('activities')}
          >
            Activities
          </button>
        </div>
      </div>

      <div className="rewards-grid">
        {mockRewards.map((reward) => (
          <div key={reward.id} className={`reward-card ${!canAfford(reward.points_cost) ? 'locked' : ''}`}>
            <div className="reward-icon">{reward.icon}</div>
            <h4 className="reward-name">{reward.name}</h4>
            <p className="reward-description">{reward.description}</p>
            <div className="reward-footer">
              <div className="reward-cost">
                <span className="cost-amount">{reward.points_cost}</span>
                <span className="cost-label">points</span>
              </div>
              <button
                className="redeem-btn"
                disabled={!canAfford(reward.points_cost)}
              >
                {canAfford(reward.points_cost) ? 'Redeem' : 'Locked'}
              </button>
            </div>
            {reward.requires_approval && (
              <div className="approval-notice">
                <small>⚠️ Requires parent approval</small>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="placeholder-message">
        <p>Custom family rewards coming soon! Parents can create custom rewards tailored to your family.</p>
      </div>
    </div>
  );
};

export default RewardsCatalog;
