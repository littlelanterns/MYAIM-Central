/**
 * MindSweepCapture Widget
 * Quick brain dump capture for overwhelm moments
 * Part of Mom's Personal Dashboard
 * NO EMOJIS - CSS VARIABLES ONLY
 */

import React, { useState } from 'react';
import { Lightbulb, Save, Sparkles } from 'lucide-react';

interface MindSweepCaptureProps {
  familyMemberId: string;
}

const MindSweepCapture: React.FC<MindSweepCaptureProps> = ({ familyMemberId }) => {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleCapture = async () => {
    if (!content.trim()) return;

    setIsSaving(true);
    // TODO: Save to database
    console.log('Capturing mind sweep:', { familyMemberId, content });

    setTimeout(() => {
      setContent('');
      setIsSaving(false);
    }, 500);
  };

  const handleCaptureAndCategorize = async () => {
    if (!content.trim()) return;

    setIsSaving(true);
    // TODO: Open categorization modal or process with AI
    console.log('Capturing and categorizing:', { familyMemberId, content });

    setTimeout(() => {
      setContent('');
      setIsSaving(false);
    }, 500);
  };

  const handleProcessWithLiLa = async () => {
    if (!content.trim()) return;

    // TODO: Send to LiLa for processing
    console.log('Processing with LiLa:', { familyMemberId, content });
  };

  return (
    <div style={{
      background: 'var(--gradient-background)',
      border: `1px solid var(--accent-color)`,
      borderRadius: '12px',
      padding: '2rem',
      height: '100%'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1rem'
      }}>
        <Lightbulb size={20} color="var(--primary-color)" />
        <h3 style={{
          color: 'var(--primary-color)',
          margin: 0,
          fontSize: '1.25rem'
        }}>
          Mind Sweep
        </h3>
      </div>

      <p style={{
        color: 'var(--text-color)',
        opacity: 0.8,
        fontSize: '0.9375rem',
        marginTop: '0.5rem',
        marginBottom: '1rem',
        lineHeight: '1.5'
      }}>
        Feeling overwhelmed? Brain dump everything here. We'll help you sort it later.
      </p>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's swirling in your mind right now?"
        style={{
          width: '100%',
          minHeight: '200px',
          padding: '1rem',
          borderRadius: '8px',
          border: `1px solid var(--accent-color)`,
          background: 'var(--background-color)',
          color: 'var(--text-color)',
          fontSize: '1rem',
          fontFamily: 'inherit',
          lineHeight: '1.6',
          resize: 'vertical'
        }}
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.75rem',
        marginTop: '1rem'
      }}>
        <button
          onClick={handleCapture}
          disabled={!content.trim() || isSaving}
          style={{
            background: 'var(--primary-color)',
            color: 'var(--background-color)',
            border: 'none',
            borderRadius: '6px',
            padding: '0.75rem',
            cursor: content.trim() && !isSaving ? 'pointer' : 'not-allowed',
            opacity: content.trim() && !isSaving ? 1 : 0.6,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem'
          }}
        >
          <Save size={16} />
          Just Capture
        </button>

        <button
          onClick={handleCaptureAndCategorize}
          disabled={!content.trim() || isSaving}
          style={{
            background: 'var(--secondary-color)',
            color: 'var(--background-color)',
            border: 'none',
            borderRadius: '6px',
            padding: '0.75rem',
            cursor: content.trim() && !isSaving ? 'pointer' : 'not-allowed',
            opacity: content.trim() && !isSaving ? 1 : 0.6,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem'
          }}
        >
          Categorize
        </button>

        <button
          onClick={handleProcessWithLiLa}
          disabled={!content.trim() || isSaving}
          style={{
            background: 'var(--gradient-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '0.75rem',
            cursor: content.trim() && !isSaving ? 'pointer' : 'not-allowed',
            opacity: content.trim() && !isSaving ? 1 : 0.6,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem'
          }}
        >
          <Sparkles size={16} />
          Process with LiLa
        </button>
      </div>
    </div>
  );
};

export default MindSweepCapture;
