/**
 * PersonalVictoryRecorder Widget
 * Wrapper for VictoryRecorder with mom-specific celebration
 * Part of Mom's Personal Dashboard
 * NO EMOJIS - CSS VARIABLES ONLY
 */

import React from 'react';
import VictoryRecorderWidget from '../../victory-recorder/VictoryRecorderWidget';

interface PersonalVictoryRecorderProps {
  familyMemberId: string;
}

const PersonalVictoryRecorder: React.FC<PersonalVictoryRecorderProps> = ({ familyMemberId }) => {
  return (
    <div style={{
      background: 'var(--gradient-background)',
      border: `1px solid var(--accent-color)`,
      borderRadius: '12px',
      padding: '0.5rem',
      height: '100%'
    }}>
      <VictoryRecorderWidget familyMemberId={familyMemberId} />
    </div>
  );
};

export default PersonalVictoryRecorder;
