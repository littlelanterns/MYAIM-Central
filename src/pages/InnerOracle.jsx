// src/pages/InnerOracle.jsx - Inner Oracle page (Coming Soon)
import React, { useState, useEffect } from 'react';
import { ComingSoonModal } from '../components/global/ComingSoonModal';

export default function InnerOracle() {
  const [showModal, setShowModal] = useState(false);

  // Show modal on page load
  useEffect(() => {
    setShowModal(true);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff4ec 0%, #d4e3d9 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        {/* Placeholder content - blank for now */}
        <div style={{
          padding: '4rem',
          color: '#5a4033',
          opacity: 0.3
        }}>
          <h1 style={{
            fontSize: '3rem',
            marginBottom: '1rem',
            fontFamily: "'The Seasons', 'Playfair Display', serif"
          }}>
            Inner Oracle
          </h1>
          <p style={{ fontSize: '1.2rem' }}>
            Feature in development...
          </p>
        </div>
      </div>

      <ComingSoonModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        featureName="Inner Oracle"
        message="Your intuition's best friend. Guided reflection, mindful decision-making, and deep wisdom discovery. We're working on this feature and we're so excited to offer it soon!!!"
      />
    </div>
  );
}
