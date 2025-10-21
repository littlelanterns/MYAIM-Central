/**
 * VictoryRecorder Component
 * Main component for recording accomplishments with AI voice celebrations
 * Features: Quick capture, AI-generated celebration messages, victory history
 */

import React, { useState } from 'react';
import './VictoryRecorder.css';

interface Victory {
  id: string;
  family_member_id: string;
  description: string;
  category?: string;
  celebration_message?: string;
  voice_url?: string;
  created_at: string;
}

interface VictoryRecorderProps {
  familyMemberId: string;
  showInWidget?: boolean;
}

const VictoryRecorder: React.FC<VictoryRecorderProps> = ({
  familyMemberId,
  showInWidget = false
}) => {
  const [victoryText, setVictoryText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleRecordVictory = async () => {
    if (!victoryText.trim()) return;

    setIsRecording(true);

    // TODO: Implement actual victory recording with AI celebration
    console.log('Recording victory:', victoryText);

    setTimeout(() => {
      setVictoryText('');
      setIsRecording(false);
    }, 1000);
  };

  return (
    <div className={`victory-recorder ${showInWidget ? 'widget-mode' : ''}`}>
      <div className="victory-input-section">
        <h3>🏆 Record a Victory!</h3>
        <textarea
          className="victory-input"
          placeholder="What did you accomplish? (e.g., 'Cleaned my room!', 'Finished homework', 'Helped with dishes')"
          value={victoryText}
          onChange={(e) => setVictoryText(e.target.value)}
          rows={3}
        />
        <button
          className="record-victory-btn"
          onClick={handleRecordVictory}
          disabled={!victoryText.trim() || isRecording}
        >
          {isRecording ? '🎉 Celebrating...' : '✨ Record Victory'}
        </button>
      </div>

      {!showInWidget && (
        <div className="victory-history-section">
          <h3>Recent Victories</h3>
          <div className="placeholder-message">
            <p>Victory history coming soon!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VictoryRecorder;
