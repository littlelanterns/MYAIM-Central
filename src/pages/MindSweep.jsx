// src/pages/MindSweep.jsx - MindSweep page (Coming Soon)
import React, { useState, useEffect } from 'react';
import { ComingSoonModal } from '../components/global/ComingSoonModal';

export default function MindSweep() {
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
            MindSweep
          </h1>
          <p style={{ fontSize: '1.2rem' }}>
            Feature in development...
          </p>
        </div>
      </div>

      <ComingSoonModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        featureName="MindSweep"
        message="Brain dump everything—voice memos, photos, random thoughts, that thing you need to remember—and watch it organize itself into family intelligence. We're working on this feature and we're so excited to offer it soon!!!"
      />
    </div>
  );
}
