// src/components/archives/ConversationalContextModal.tsx
// Conversational "Tell me about..." interface for adding context

import React, { useState } from 'react';
import { X, MessageCircle, Sparkles, Save } from 'lucide-react';
import { archivesService } from '../../lib/archivesService';
import type { ArchiveFolder } from '../../types/archives';

interface ConversationalContextModalProps {
  folder: ArchiveFolder;
  onClose: () => void;
  onComplete: () => void;
}

interface QuickQuestion {
  field: string;
  question: string;
  placeholder: string;
}

export function ConversationalContextModal({ folder, onClose, onComplete }: ConversationalContextModalProps) {
  const [mode, setMode] = useState<'questions' | 'braindump'>('questions');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [brainDumpText, setBrainDumpText] = useState('');
  const [saving, setSaving] = useState(false);

  // Quick questions based on folder type
  const quickQuestions: QuickQuestion[] = folder.folder_type === 'family_member'
    ? [
        {
          field: 'personality',
          question: `Tell me about ${folder.folder_name}'s personality`,
          placeholder: 'Are they introverted or extroverted? Calm or energetic? Serious or playful?'
        },
        {
          field: 'interests',
          question: `What does ${folder.folder_name} love to do?`,
          placeholder: 'Hobbies, activities, favorite games, sports...'
        },
        {
          field: 'learning_style',
          question: `How does ${folder.folder_name} learn best?`,
          placeholder: 'Visual, hands-on, verbal instructions, needs movement...'
        },
        {
          field: 'strengths',
          question: `What are ${folder.folder_name}'s greatest strengths?`,
          placeholder: 'What they excel at, natural talents, character strengths...'
        },
        {
          field: 'challenges',
          question: `What challenges does ${folder.folder_name} face?`,
          placeholder: 'Areas where they struggle or need extra support...'
        },
        {
          field: 'communication_style',
          question: `How does ${folder.folder_name} communicate best?`,
          placeholder: 'Direct? Need time to process? Visual cues? Written vs verbal?'
        },
        {
          field: 'motivators',
          question: `What motivates ${folder.folder_name}?`,
          placeholder: 'Rewards, competition, praise, independence, helping others...'
        }
      ]
    : [
        {
          field: 'family_values',
          question: 'What are your family\'s core values?',
          placeholder: 'Honesty, kindness, hard work, creativity, faith, service...'
        },
        {
          field: 'parenting_philosophy',
          question: 'Describe your parenting approach',
          placeholder: 'Authoritative, gentle, structured, child-led...'
        },
        {
          field: 'priorities',
          question: 'What are your family\'s top priorities?',
          placeholder: 'Education, health, relationships, experiences, faith...'
        },
        {
          field: 'traditions',
          question: 'What family traditions matter to you?',
          placeholder: 'Daily rituals, holiday traditions, weekly activities...'
        },
        {
          field: 'communication_style',
          question: 'How does your family communicate?',
          placeholder: 'Family meetings, open dialogue, notes, scheduled talks...'
        }
      ];

  async function handleSaveQuestions() {
    const filledAnswers = Object.entries(answers).filter(([_, value]) => value.trim());

    if (filledAnswers.length === 0) {
      alert('Please answer at least one question');
      return;
    }

    setSaving(true);
    try {
      const items = filledAnswers.map(([field, value]) => ({
        folder_id: folder.id,
        context_field: field,
        context_value: value.trim(),
        context_type: 'text' as const,
        use_for_context: true,
        added_by: 'conversation' as const
      }));

      await archivesService.addMultipleContextItems(items);
      onComplete();
      onClose();
    } catch (error) {
      console.error('Error saving context:', error);
      alert('Failed to save context. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveBrainDump() {
    if (!brainDumpText.trim()) {
      alert('Please write something first');
      return;
    }

    setSaving(true);
    try {
      await archivesService.addContextItem({
        folder_id: folder.id,
        context_field: 'brain_dump',
        context_value: brainDumpText.trim(),
        context_type: 'text',
        use_for_context: false, // Don't use until mom organizes it
        added_by: 'conversation'
      });

      onComplete();
      onClose();
    } catch (error) {
      console.error('Error saving brain dump:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>
              <MessageCircle size={24} style={{ marginRight: '0.5rem' }} />
              Tell me about {folder.folder_name}
            </h2>
            <p style={styles.subtitle}>
              Answer a few questions or just brain dump - whatever works!
            </p>
          </div>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        {/* Mode Selector */}
        <div style={styles.modeSelector}>
          <button
            onClick={() => setMode('questions')}
            style={{
              ...styles.modeButton,
              ...(mode === 'questions' ? styles.modeButtonActive : {})
            }}
          >
            <MessageCircle size={18} />
            Quick Questions
          </button>
          <button
            onClick={() => setMode('braindump')}
            style={{
              ...styles.modeButton,
              ...(mode === 'braindump' ? styles.modeButtonActive : {})
            }}
          >
            <Sparkles size={18} />
            Brain Dump
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {mode === 'questions' ? (
            <div style={styles.questionsMode}>
              <p style={styles.instructions}>
                Answer as many as you'd like. LiLa can organize this later.
              </p>

              {quickQuestions.map((q) => (
                <div key={q.field} style={styles.questionBox}>
                  <label style={styles.questionLabel}>
                    {q.question}
                  </label>
                  <textarea
                    value={answers[q.field] || ''}
                    onChange={(e) => setAnswers({ ...answers, [q.field]: e.target.value })}
                    placeholder={q.placeholder}
                    style={styles.questionInput}
                    rows={3}
                  />
                </div>
              ))}

              <button
                onClick={handleSaveQuestions}
                style={styles.saveButton}
                disabled={saving}
              >
                {saving ? 'Saving...' : (
                  <>
                    <Save size={16} />
                    Save Answers
                  </>
                )}
              </button>
            </div>
          ) : (
            <div style={styles.brainDumpMode}>
              <p style={styles.instructions}>
                Just write everything that comes to mind. No structure needed -
                let it all out and LiLa can help organize it later.
              </p>

              <textarea
                value={brainDumpText}
                onChange={(e) => setBrainDumpText(e.target.value)}
                placeholder={`Tell me everything about ${folder.folder_name}. What should I know? What matters? What's important to understand?

Start typing and don't worry about organization - just capture your thoughts...`}
                style={styles.brainDumpInput}
                rows={15}
              />

              <div style={styles.brainDumpFooter}>
                <p style={styles.hint}>
                  <Sparkles size={14} style={{ marginRight: '0.25rem' }} />
                  Future feature: LiLa will read this and suggest organized context items
                </p>
                <button
                  onClick={handleSaveBrainDump}
                  style={styles.saveButton}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : (
                    <>
                      <Save size={16} />
                      Save Brain Dump
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem'
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '1.5rem',
    borderBottom: '1px solid var(--accent-color, #d4e3d9)',
    background: 'var(--gradient-background, linear-gradient(135deg, var(--background-color, #fff4ec) 0%, var(--accent-color, #d4e3d9) 100%))'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: 'var(--primary-color, #68a395)',
    margin: '0 0 0.25rem 0',
    display: 'flex',
    alignItems: 'center'
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-color, #5a4033)',
    opacity: 0.7,
    margin: 0
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--primary-color, #68a395)',
    padding: '0.25rem',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modeSelector: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid var(--accent-color, #d4e3d9)'
  },
  modeButton: {
    flex: 1,
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    border: '1px solid var(--accent-color, #d4e3d9)',
    borderRadius: '8px',
    background: 'white',
    color: 'var(--text-color, #5a4033)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s'
  },
  modeButtonActive: {
    background: 'var(--primary-color, #68a395)',
    color: 'white',
    borderColor: 'var(--primary-color, #68a395)'
  },
  content: {
    padding: '1.5rem'
  },
  instructions: {
    fontSize: '0.875rem',
    color: 'var(--text-color, #5a4033)',
    opacity: 0.8,
    marginBottom: '1.5rem',
    lineHeight: 1.6
  },
  questionsMode: {},
  questionBox: {
    marginBottom: '1.5rem'
  },
  questionLabel: {
    display: 'block',
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: 'var(--primary-color, #68a395)',
    marginBottom: '0.5rem'
  },
  questionInput: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '0.875rem',
    border: '1px solid var(--accent-color, #d4e3d9)',
    borderRadius: '8px',
    background: 'white',
    color: 'var(--text-color, #5a4033)',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box'
  },
  brainDumpMode: {},
  brainDumpInput: {
    width: '100%',
    padding: '1rem',
    fontSize: '0.875rem',
    border: '1px solid var(--accent-color, #d4e3d9)',
    borderRadius: '8px',
    background: 'white',
    color: 'var(--text-color, #5a4033)',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box',
    lineHeight: 1.6
  },
  brainDumpFooter: {
    marginTop: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem'
  },
  hint: {
    fontSize: '0.75rem',
    color: 'var(--secondary-color, #d6a461)',
    display: 'flex',
    alignItems: 'center',
    fontStyle: 'italic',
    margin: 0
  },
  saveButton: {
    padding: '0.75rem 1.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    background: 'var(--primary-color, #68a395)',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
    marginTop: '1rem'
  }
};
