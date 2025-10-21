/**
 * VictoryCelebration Component
 * Displays AI-generated celebration message with voice playback
 */

import React from 'react';
import './VictoryCelebration.css';

interface VictoryCelebrationProps {
  celebrationMessage: string;
  voiceUrl?: string;
  onClose: () => void;
}

const VictoryCelebration: React.FC<VictoryCelebrationProps> = ({
  celebrationMessage,
  voiceUrl,
  onClose
}) => {
  const handlePlayVoice = () => {
    if (voiceUrl) {
      // TODO: Implement actual voice playback
      console.log('Playing celebration voice:', voiceUrl);
    }
  };

  return (
    <div className="victory-celebration-overlay">
      <div className="victory-celebration-modal">
        <div className="celebration-animation">
          <div className="confetti">🎉</div>
          <div className="confetti">✨</div>
          <div className="confetti">🌟</div>
          <div className="confetti">🎊</div>
        </div>

        <div className="celebration-content">
          <h2>Amazing Work!</h2>
          <p className="celebration-message">{celebrationMessage}</p>

          {voiceUrl && (
            <button className="play-voice-btn" onClick={handlePlayVoice}>
              🔊 Play Celebration
            </button>
          )}

          <button className="close-celebration-btn" onClick={onClose}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default VictoryCelebration;
