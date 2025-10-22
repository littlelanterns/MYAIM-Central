/**
 * IndependentModeVictoryRecorder Component (Simplified)
 * Quick victory logging with voice and text input
 *
 * Features:
 * - Text input (like messaging)
 * - Voice input (OpenRouter/OpenAI speech-to-text integration ready)
 * - Simple list of recent victories
 * - Compact widget design
 */

import React, { useState, useEffect } from 'react';
import { Award, Mic, Send } from 'lucide-react';
import './IndependentMode.css';

interface Victory {
  id: string;
  title: string;
  date: string;
}

interface IndependentModeVictoryRecorderProps {
  familyMemberId: string;
  viewMode?: 'self' | 'parent';
}

export const IndependentModeVictoryRecorder: React.FC<IndependentModeVictoryRecorderProps> = ({
  familyMemberId,
  viewMode = 'self'
}) => {
  const [victories, setVictories] = useState<Victory[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // Load victories
  useEffect(() => {
    // TODO: Fetch from Supabase
    const sampleVictories: Victory[] = [
      {
        id: '1',
        title: 'Got an A on math test',
        date: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Ran 5k without stopping',
        date: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: '3',
        title: 'Had a good conversation with mom',
        date: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ];

    setVictories(sampleVictories);
  }, [familyMemberId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const victory: Victory = {
      id: Date.now().toString(),
      title: inputText,
      date: new Date().toISOString()
    };

    setVictories([victory, ...victories]);
    setInputText('');
  };

  const handleVoiceInput = async () => {
    // TODO: Integrate with OpenRouter or OpenAI speech-to-text
    setIsRecording(!isRecording);

    if (!isRecording) {
      // Start recording
      alert('Voice input integration coming soon! Will connect to OpenRouter/OpenAI speech-to-text.');
    } else {
      // Stop recording
      // After transcription, set inputText with the transcribed text
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div style={{
      background: 'var(--gradient-background)',
      border: '1px solid var(--accent-color)',
      borderRadius: '8px',
      padding: '1rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem',
        borderBottom: '1px solid var(--accent-color)',
        paddingBottom: '0.75rem'
      }}>
        <Award size={20} color="var(--primary-color)" />
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-color)' }}>
          Victory Recorder
        </h3>
      </div>

      {/* Input Form - Message Style */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          background: 'var(--background-color)',
          border: '1px solid var(--accent-color)',
          borderRadius: '8px',
          padding: '0.5rem'
        }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="What did you accomplish today?"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-color)',
              fontSize: '0.875rem',
              padding: '0.5rem'
            }}
          />
          <button
            type="button"
            onClick={handleVoiceInput}
            style={{
              background: isRecording ? 'var(--primary-color)' : 'transparent',
              border: `1px solid ${isRecording ? 'var(--primary-color)' : 'var(--accent-color)'}`,
              borderRadius: '6px',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            title="Voice input"
          >
            <Mic size={18} color={isRecording ? 'white' : 'var(--primary-color)'} />
          </button>
          <button
            type="submit"
            disabled={!inputText.trim()}
            style={{
              background: inputText.trim() ? 'var(--primary-color)' : 'transparent',
              border: `1px solid ${inputText.trim() ? 'var(--primary-color)' : 'var(--accent-color)'}`,
              borderRadius: '6px',
              padding: '0.5rem',
              cursor: inputText.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              opacity: inputText.trim() ? 1 : 0.5
            }}
            title="Send"
          >
            <Send size={18} color={inputText.trim() ? 'white' : 'var(--text-color)'} />
          </button>
        </div>
      </form>

      {/* Recent Victories - Compact List */}
      <div>
        <h4 style={{
          fontSize: '0.75rem',
          color: 'var(--text-color)',
          opacity: 0.7,
          marginBottom: '0.5rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Recent Wins ({victories.length})
        </h4>
        <div style={{ maxHeight: '200px', overflow: 'auto' }}>
          {victories.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem 1rem',
              color: 'var(--text-color)',
              opacity: 0.6
            }}>
              <Award size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
              <p style={{ margin: 0, fontSize: '0.875rem' }}>Start recording your victories</p>
            </div>
          ) : (
            victories.slice(0, 5).map(victory => (
              <div
                key={victory.id}
                style={{
                  background: 'var(--background-color)',
                  border: '1px solid var(--accent-color)',
                  borderLeft: '3px solid var(--primary-color)',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'var(--text-color)',
                  marginBottom: '0.25rem'
                }}>
                  {victory.title}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-color)',
                  opacity: 0.6
                }}>
                  {formatDate(victory.date)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default IndependentModeVictoryRecorder;
