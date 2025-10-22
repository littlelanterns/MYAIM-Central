/**
 * GuidedModeRewardWidget Component
 * Progress bars, badges, points, and streak tracking
 * CRITICAL: All colors use CSS variables - theme compatible
 * Features: Gamification themes, visual progress, achievement tracking
 */

import React from 'react';
import { Trophy, Star, Flame, Award } from 'lucide-react';
import './GuidedModeRewardWidget.css';

export type GamificationTheme = 'dragon-academy' | 'flower-garden' | 'ocean-aquarium' | 'hero-quest';

export interface RewardProgress {
  theme: GamificationTheme;
  level: number;
  points: number;
  pointsToNextLevel: number;
  items: string[];
  achievements: string[];
  currentStreaks: { type: string; days: number }[];
}

interface GuidedModeRewardWidgetProps {
  familyMemberId: string;
}

const themeConfig: Record<GamificationTheme, { icon: string; name: string; itemName: string }> = {
  'dragon-academy': { icon: '🐉', name: 'Dragon Academy', itemName: 'dragon' },
  'flower-garden': { icon: '🌸', name: 'Flower Garden', itemName: 'flower' },
  'ocean-aquarium': { icon: '🐠', name: 'Ocean Aquarium', itemName: 'fish' },
  'hero-quest': { icon: '⚔️', name: 'Hero Quest', itemName: 'treasure' }
};

export const GuidedModeRewardWidget: React.FC<GuidedModeRewardWidgetProps> = ({ familyMemberId }) => {
  // Mock data - in real implementation, fetch from Supabase
  const progress: RewardProgress = {
    theme: 'dragon-academy',
    level: 5,
    points: 175,
    pointsToNextLevel: 250,
    items: ['dragon1', 'dragon2', 'dragon3', 'dragon4', 'dragon5', 'dragon6', 'dragon7'],
    achievements: ['First Task Complete', '7 Day Streak', 'Early Riser'],
    currentStreaks: [
      { type: 'homework', days: 7 },
      { type: 'morning routine', days: 4 }
    ]
  };

  const theme = themeConfig[progress.theme];
  const progressPercent = Math.round((progress.points / progress.pointsToNextLevel) * 100);

  return (
    <div className="guided-reward-widget">
      {/* Theme Header */}
      <div className="reward-theme-header">
        <span className="theme-icon">{theme.icon}</span>
        <div>
          <h4 className="theme-name">{theme.name}</h4>
          <p className="theme-level">Level {progress.level}</p>
        </div>
      </div>

      {/* Points Progress */}
      <div className="points-progress-section">
        <div className="points-header">
          <span className="points-label">
            <Star className="inline-icon" size={16} />
            Points
          </span>
          <span className="points-count">{progress.points} / {progress.pointsToNextLevel}</span>
        </div>

        <div className="reward-progress-bar">
          <div
            className="reward-progress-fill"
            style={{ width: `${progressPercent}%` }}
          >
            <span className="progress-percent">{progressPercent}%</span>
          </div>
        </div>

        <p className="next-level-message">
          {progress.pointsToNextLevel - progress.points} points to Level {progress.level + 1}!
        </p>
      </div>

      {/* Collection Display */}
      <div className="collection-section">
        <h5 className="collection-title">
          <Award className="inline-icon" size={16} />
          My {theme.itemName}s ({progress.items.length})
        </h5>
        <div className="collection-grid">
          {progress.items.slice(0, 6).map((item, idx) => (
            <div key={idx} className="collection-item">
              {theme.icon}
            </div>
          ))}
          {progress.items.length > 6 && (
            <div className="collection-item collection-more">
              +{progress.items.length - 6}
            </div>
          )}
        </div>
      </div>

      {/* Streaks */}
      {progress.currentStreaks.length > 0 && (
        <div className="streaks-section">
          <h5 className="streaks-title">
            <Flame className="inline-icon" size={16} />
            Active Streaks
          </h5>
          <div className="streaks-list">
            {progress.currentStreaks.map((streak, idx) => (
              <div key={idx} className="streak-item">
                <span className="streak-flame">🔥</span>
                <span className="streak-type">{streak.type}</span>
                <span className="streak-days">{streak.days} days</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Achievements */}
      {progress.achievements.length > 0 && (
        <div className="achievements-section">
          <h5 className="achievements-title">
            <Trophy className="inline-icon" size={16} />
            Recent Achievements
          </h5>
          <div className="achievements-list">
            {progress.achievements.slice(-3).map((achievement, idx) => (
              <div key={idx} className="achievement-badge">
                <span className="badge-icon">🏆</span>
                <span className="badge-text">{achievement}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GuidedModeRewardWidget;
