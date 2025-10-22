/**
 * PlayModeVictoryRecorder Component
 * Simplified Victory Recorder for young children
 * Features: Big buttons, simple celebration, visual star counter
 */

import React, { useState } from 'react';
import { Star, Sparkles, PartyPopper } from 'lucide-react';
import { BalloonCelebration } from './PlayModeAnimations';
import './PlayModeVictoryRecorder.css';

interface PlayModeVictoryRecorderProps {
  familyMemberId: string;
  todaysStars?: number;
  onAddVictory?: () => void;
  onCelebrate?: () => void;
}

export const PlayModeVictoryRecorder: React.FC<PlayModeVictoryRecorderProps> = ({
  familyMemberId,
  todaysStars = 0,
  onAddVictory,
  onCelebrate
}) => {
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  const handleCelebrate = () => {
    setIsCelebrating(true);
    onCelebrate?.();

    setTimeout(() => {
      setIsCelebrating(false);
    }, 4000);
  };

  const handleAddVictory = () => {
    setShowVictoryModal(true);
  };

  const handleVictoryAdded = () => {
    setShowVictoryModal(false);
    onAddVictory?.();
  };

  return (
    <div className="play-victory-widget">
      {/* Big Star Counter */}
      <div className="play-victory-stars">
        <div className="star-display">
          <Star size={60} fill="currentColor" className="star-icon" />
          <span className="star-count">{todaysStars}</span>
        </div>
        <div className="star-label">Stars Today!</div>
      </div>

      {/* Big Action Buttons */}
      <div className="play-victory-actions">
        <button
          className="victory-action-btn add-victory-btn"
          onClick={handleAddVictory}
        >
          <Sparkles size={32} />
          <span>I Did Something Great!</span>
        </button>

        <button
          className="victory-action-btn celebrate-btn"
          onClick={handleCelebrate}
          disabled={isCelebrating || todaysStars === 0}
        >
          <PartyPopper size={32} />
          <span>{isCelebrating ? 'Celebrating!' : 'Celebrate Me!'}</span>
        </button>
      </div>

      {/* Visual Star Display */}
      <div className="star-collection">
        {Array.from({ length: Math.min(todaysStars, 20) }).map((_, i) => (
          <div
            key={i}
            className="collected-star"
            style={{
              animationDelay: `${i * 0.1}s`
            }}
          >
            ⭐
          </div>
        ))}
        {todaysStars > 20 && (
          <div className="star-overflow">
            +{todaysStars - 20} more!
          </div>
        )}
      </div>

      {/* Celebration Animation */}
      <BalloonCelebration
        isActive={isCelebrating}
        onComplete={() => setIsCelebrating(false)}
      />

      {/* Victory Modal */}
      {showVictoryModal && (
        <QuickVictoryModal
          onClose={() => setShowVictoryModal(false)}
          onSubmit={handleVictoryAdded}
        />
      )}
    </div>
  );
};

/* ========================================
   QUICK VICTORY MODAL
   ======================================== */

interface QuickVictoryModalProps {
  onClose: () => void;
  onSubmit: () => void;
}

const QuickVictoryModal: React.FC<QuickVictoryModalProps> = ({
  onClose,
  onSubmit
}) => {
  const quickVictories = [
    { emoji: '🧹', label: 'Cleaned Up' },
    { emoji: '🥦', label: 'Ate Veggies' },
    { emoji: '😊', label: 'Was Kind' },
    { emoji: '🎨', label: 'Made Art' },
    { emoji: '📚', label: 'Read a Book' },
    { emoji: '🛏️', label: 'Made Bed' },
    { emoji: '🦷', label: 'Brushed Teeth' },
    { emoji: '👕', label: 'Got Dressed' },
    { emoji: '🎵', label: 'Practiced Music' },
    { emoji: '🏃', label: 'Exercised' },
    { emoji: '🤝', label: 'Helped Someone' },
    { emoji: '✨', label: 'Something Else' }
  ];

  const handleSelect = (label: string) => {
    // In real implementation, save the victory
    console.log('Victory selected:', label);
    onSubmit();
  };

  return (
    <div className="quick-victory-modal-overlay" onClick={onClose}>
      <div className="quick-victory-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-play">
          <h2>🎉 What Did You Do?</h2>
          <button className="modal-close-btn-play" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="quick-victory-grid">
          {quickVictories.map((victory, i) => (
            <button
              key={i}
              className="quick-victory-option"
              onClick={() => handleSelect(victory.label)}
            >
              <div className="option-emoji">{victory.emoji}</div>
              <div className="option-label">{victory.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ========================================
   COMPACT VERSION
   ======================================== */

interface CompactVictoryRecorderProps {
  todaysStars: number;
  onCelebrate?: () => void;
}

export const CompactVictoryRecorder: React.FC<CompactVictoryRecorderProps> = ({
  todaysStars,
  onCelebrate
}) => {
  const [isCelebrating, setIsCelebrating] = useState(false);

  const handleCelebrate = () => {
    setIsCelebrating(true);
    onCelebrate?.();

    setTimeout(() => {
      setIsCelebrating(false);
    }, 4000);
  };

  return (
    <div className="compact-victory">
      <div className="compact-star-count">
        <Star size={40} fill="currentColor" />
        <span>{todaysStars}</span>
      </div>

      <button
        className="compact-celebrate-btn"
        onClick={handleCelebrate}
        disabled={isCelebrating || todaysStars === 0}
      >
        {isCelebrating ? '🎉' : '🎊'} Celebrate!
      </button>

      <BalloonCelebration
        isActive={isCelebrating}
        onComplete={() => setIsCelebrating(false)}
      />
    </div>
  );
};
