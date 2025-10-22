/**
 * PlayModeRewardWidget Component
 * Visual gamification rewards for young children
 * Features: Flower garden, pet collection, ocean aquarium, dragon academy themes
 */

import React from 'react';
import { Star, Award, Trophy } from 'lucide-react';
import './PlayModeRewardWidget.css';

export type GamificationTheme = 'flower-garden' | 'pet-collection' | 'ocean-aquarium' | 'dragon-academy';

export interface RewardProgress {
  theme: GamificationTheme;
  level: number;
  points: number;
  pointsToNextLevel: number;
  items: string[];
  achievements: string[];
}

interface PlayModeRewardWidgetProps {
  progress: RewardProgress;
}

export const PlayModeRewardWidget: React.FC<PlayModeRewardWidgetProps> = ({
  progress
}) => {
  const renderThemeVisual = () => {
    switch (progress.theme) {
      case 'flower-garden':
        return <FlowerGarden items={progress.items} level={progress.level} />;
      case 'pet-collection':
        return <PetCollection items={progress.items} level={progress.level} />;
      case 'ocean-aquarium':
        return <OceanAquarium items={progress.items} level={progress.level} />;
      case 'dragon-academy':
        return <DragonAcademy items={progress.items} level={progress.level} />;
      default:
        return <StarCounter points={progress.points} />;
    }
  };

  const progressPercent = (progress.points / progress.pointsToNextLevel) * 100;

  return (
    <div className="play-reward-widget">
      {/* Theme Visual */}
      <div className="reward-visual-container">
        {renderThemeVisual()}
      </div>

      {/* Progress Bar */}
      <div className="reward-progress-section">
        <div className="reward-level-badge">
          <Trophy size={20} />
          <span>Level {progress.level}</span>
        </div>

        <div className="reward-progress-bar">
          <div
            className="reward-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="reward-progress-text">
          {progress.points} / {progress.pointsToNextLevel} stars
        </div>
      </div>

      {/* Recent Achievement */}
      {progress.achievements.length > 0 && (
        <div className="reward-recent-achievement">
          <Award size={20} />
          <span className="achievement-text">
            Latest: {progress.achievements[progress.achievements.length - 1]}
          </span>
        </div>
      )}
    </div>
  );
};

/* ========================================
   FLOWER GARDEN THEME
   ======================================== */

interface FlowerGardenProps {
  items: string[];
  level: number;
}

const FlowerGarden: React.FC<FlowerGardenProps> = ({ items, level }) => {
  const flowerEmojis = ['🌸', '🌼', '🌻', '🌺', '🌷', '🌹', '🏵️', '💐'];
  const displayedFlowers = items.slice(0, 12);

  return (
    <div className="theme-visual flower-garden">
      <div className="garden-title">🌱 My Garden</div>
      <div className="garden-grid">
        {displayedFlowers.map((item, i) => (
          <div key={i} className="garden-item flower-item">
            {flowerEmojis[i % flowerEmojis.length]}
          </div>
        ))}
        {Array.from({ length: Math.max(0, 12 - displayedFlowers.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="garden-item empty">
            <div className="empty-spot">•</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ========================================
   PET COLLECTION THEME
   ======================================== */

interface PetCollectionProps {
  items: string[];
  level: number;
}

const PetCollection: React.FC<PetCollectionProps> = ({ items, level }) => {
  const petEmojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'];
  const displayedPets = items.slice(0, 12);

  return (
    <div className="theme-visual pet-collection">
      <div className="pet-title">🏠 My Pets</div>
      <div className="pet-grid">
        {displayedPets.map((item, i) => (
          <div key={i} className="pet-item">
            <div className="pet-emoji">{petEmojis[i % petEmojis.length]}</div>
          </div>
        ))}
        {Array.from({ length: Math.max(0, 12 - displayedPets.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="pet-item empty">
            <div className="empty-cage">🔒</div>
          </div>
        ))}
      </div>
      <div className="pet-count">{displayedPets.length} / 12 pets</div>
    </div>
  );
};

/* ========================================
   OCEAN AQUARIUM THEME
   ======================================== */

interface OceanAquariumProps {
  items: string[];
  level: number;
}

const OceanAquarium: React.FC<OceanAquariumProps> = ({ items, level }) => {
  const oceanEmojis = ['🐠', '🐟', '🐡', '🦈', '🐙', '🦑', '🦀', '🦞', '🐚', '⭐', '🐢', '🐳'];
  const displayedCreatures = items.slice(0, 10);

  return (
    <div className="theme-visual ocean-aquarium">
      <div className="ocean-title">🌊 My Aquarium</div>
      <div className="aquarium-tank">
        {displayedCreatures.map((item, i) => (
          <div
            key={i}
            className="ocean-creature"
            style={{
              left: `${Math.random() * 80}%`,
              top: `${Math.random() * 70 + 10}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          >
            {oceanEmojis[i % oceanEmojis.length]}
          </div>
        ))}
        {displayedCreatures.length === 0 && (
          <div className="empty-tank">Add fish by completing tasks!</div>
        )}
      </div>
      <div className="ocean-floor">🪸 🪨 🌿 🐚 🪸</div>
    </div>
  );
};

/* ========================================
   DRAGON ACADEMY THEME
   ======================================== */

interface DragonAcademyProps {
  items: string[];
  level: number;
}

const DragonAcademy: React.FC<DragonAcademyProps> = ({ items, level }) => {
  const dragonEmojis = ['🐲', '🐉', '🦎', '🐍'];
  const dragonSize = Math.min(items.length, 10);
  const mainDragon = dragonEmojis[level % dragonEmojis.length];

  return (
    <div className="theme-visual dragon-academy">
      <div className="dragon-title">🏰 Dragon Academy</div>
      <div className="dragon-container">
        <div
          className="main-dragon"
          style={{
            fontSize: `${2 + dragonSize * 0.3}rem`
          }}
        >
          {mainDragon}
        </div>
        <div className="dragon-level-text">Level {level} Dragon</div>
      </div>
      <div className="dragon-stats">
        <div className="dragon-stat">
          <span className="stat-icon">⚡</span>
          <span className="stat-value">{items.length * 10}</span>
        </div>
        <div className="dragon-stat">
          <span className="stat-icon">🔥</span>
          <span className="stat-value">{level * 5}</span>
        </div>
        <div className="dragon-stat">
          <span className="stat-icon">💎</span>
          <span className="stat-value">{items.length}</span>
        </div>
      </div>
    </div>
  );
};

/* ========================================
   STAR COUNTER (Simple fallback)
   ======================================== */

interface StarCounterProps {
  points: number;
}

const StarCounter: React.FC<StarCounterProps> = ({ points }) => {
  const fullStars = Math.floor(points / 10);
  const displayStars = Math.min(fullStars, 20);

  return (
    <div className="theme-visual star-counter">
      <div className="star-count-number">{points}</div>
      <div className="star-grid">
        {Array.from({ length: displayStars }).map((_, i) => (
          <div key={i} className="star-item">⭐</div>
        ))}
      </div>
      <div className="star-message">
        {points < 10 && "Keep going! 🎯"}
        {points >= 10 && points < 50 && "You're doing great! 🌟"}
        {points >= 50 && points < 100 && "Amazing work! ✨"}
        {points >= 100 && "You're a superstar! 🎉"}
      </div>
    </div>
  );
};
