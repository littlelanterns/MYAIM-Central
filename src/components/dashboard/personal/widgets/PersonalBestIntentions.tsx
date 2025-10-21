/**
 * PersonalBestIntentions Widget
 * Full-power Best Intentions for adults
 * Part of Mom's Personal Dashboard
 * NO EMOJIS - CSS VARIABLES ONLY
 */

import React, { useState } from 'react';
import { Target, Plus } from 'lucide-react';
import BestIntentionsModal from '../../../BestIntentions/BestIntentionsModal';

interface PersonalBestIntentionsProps {
  familyMemberId: string;
}

const PersonalBestIntentions: React.FC<PersonalBestIntentionsProps> = ({ familyMemberId }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div style={{
        background: 'var(--gradient-background)',
        border: `1px solid var(--accent-color)`,
        borderRadius: '12px',
        padding: '2rem',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          <Target size={24} color="var(--primary-color)" />
          <h3 style={{
            color: 'var(--primary-color)',
            margin: 0,
            fontSize: '1.5rem'
          }}>
            My Best Intentions
          </h3>
        </div>

        <p style={{
          color: 'var(--text-color)',
          opacity: 0.8,
          fontSize: '0.9375rem',
          marginBottom: '1.5rem',
          lineHeight: '1.6'
        }}>
          Deep personal goal setting and reflection. Your intentions are private and hidden from family.
        </p>

        <div style={{
          background: 'var(--background-color)',
          border: `1px solid var(--accent-color)`,
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem',
          flex: 1
        }}>
          <div style={{
            textAlign: 'center',
            padding: '2rem 1rem',
            color: 'var(--text-color)',
            opacity: 0.6
          }}>
            <Target size={48} color="var(--accent-color)" style={{ marginBottom: '1rem' }} />
            <p>No active intentions yet</p>
            <p style={{ fontSize: '0.875rem' }}>Set personal goals and track your growth</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            background: 'var(--gradient-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem',
            width: '100%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontWeight: '500'
          }}
        >
          <Plus size={16} />
          Add New Intention
        </button>
      </div>

      {showModal && (
        <BestIntentionsModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default PersonalBestIntentions;
