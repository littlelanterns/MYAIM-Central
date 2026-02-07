/**
 * TrackerCustomizationModal Component
 * Customize tracker before adding to dashboard(s)
 * Supports multi-select family members, goal-based resets, and full customization
 * NO EMOJIS - CSS VARIABLES ONLY - THEME AWARE
 */

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Info } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { getFamilyMembers } from '../../../lib/api';

interface TrackerTemplate {
  id: string;
  name: string;
  description: string;
  category: 'habit' | 'mood' | 'goal' | 'milestone' | 'kid-gamified';
  type: 'grid' | 'circle' | 'streak' | 'progress-bar' | 'chart' | 'collection' | 'gameboard' | 'coloring';
  visualStyle: 'artistic' | 'modern' | 'kid-friendly' | 'professional';
  icon: string;
}

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  dashboard_mode?: string;
}

interface TrackerCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: TrackerTemplate;
  onSave: (customization: TrackerCustomization) => void;
  familyMembers?: FamilyMember[];
}

interface TrackerCustomization {
  templateId: string;
  assignedMembers: string[];
  trackerName: string;
  goal: string;
  resetSchedule: 'daily' | 'weekly' | 'monthly' | '60-days' | '90-days' | '1-year' | 'goal-completion' | 'never' | 'streak-break';
  goalTarget?: number;
  goalUnit?: string;
  visualStyle: 'artistic' | 'modern' | 'kid-friendly' | 'professional';
  widgetSize: 'small' | 'medium' | 'large';
  notesEnabled: boolean;
  emotionsEnabled: boolean;
  journalEnabled: boolean;
  autoTrackEnabled: boolean;
}

const TrackerCustomizationModal: React.FC<TrackerCustomizationModalProps> = ({
  isOpen,
  onClose,
  template,
  onSave,
  familyMembers = []
}) => {
  // State for loaded family members
  const [loadedMembers, setLoadedMembers] = useState<FamilyMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // Load family members from database if none provided
  useEffect(() => {
    const loadMembers = async () => {
      if (familyMembers.length > 0 || !isOpen) return;

      try {
        setMembersLoading(true);

        // Get current user's family
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: familyData } = await supabase
          .from('families')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();

        if (!familyData) return;

        // Load family members
        const result = await getFamilyMembers(familyData.id);
        if (result.success && result.members) {
          const formattedMembers = result.members.map(m => ({
            id: m.id,
            name: m.name,
            role: m.role,
            dashboard_mode: m.dashboard_type || m.dashboard_mode || 'guided'
          }));
          setLoadedMembers(formattedMembers);
        }
      } catch (error) {
        console.error('Error loading family members:', error);
      } finally {
        setMembersLoading(false);
      }
    };

    loadMembers();
  }, [familyMembers.length, isOpen]);

  // Use provided members, or loaded members, or empty array
  const members = familyMembers.length > 0 ? familyMembers : loadedMembers;

  // State
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [trackerName, setTrackerName] = useState('');
  const [goal, setGoal] = useState('');
  const [resetSchedule, setResetSchedule] = useState<TrackerCustomization['resetSchedule']>('monthly');
  const [goalTarget, setGoalTarget] = useState<number>(30);
  const [goalUnit, setGoalUnit] = useState('items');
  const [visualStyle, setVisualStyle] = useState<TrackerCustomization['visualStyle']>(template.visualStyle);
  const [widgetSize, setWidgetSize] = useState<TrackerCustomization['widgetSize']>('medium');
  const [notesEnabled, setNotesEnabled] = useState(true);
  const [emotionsEnabled, setEmotionsEnabled] = useState(true);
  const [journalEnabled, setJournalEnabled] = useState(true);
  const [autoTrackEnabled, setAutoTrackEnabled] = useState(false);

  if (!isOpen) return null;

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSave = () => {
    if (selectedMembers.length === 0) {
      alert('Please select at least one family member');
      return;
    }
    if (!trackerName.trim()) {
      alert('Please enter what you are tracking');
      return;
    }

    const customization: TrackerCustomization = {
      templateId: template.id,
      assignedMembers: selectedMembers,
      trackerName: trackerName.trim(),
      goal: goal.trim(),
      resetSchedule,
      goalTarget: resetSchedule === 'goal-completion' ? goalTarget : undefined,
      goalUnit: resetSchedule === 'goal-completion' ? goalUnit : undefined,
      visualStyle,
      widgetSize,
      notesEnabled,
      emotionsEnabled,
      journalEnabled,
      autoTrackEnabled
    };

    onSave(customization);
    onClose();
  };

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--background-color)',
          borderRadius: '12px',
          width: '95%',
          height: '90%',
          maxWidth: '700px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: 'var(--gradient-primary)',
          padding: '1rem 1.5rem',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid var(--accent-color)',
          flexShrink: 0
        }}>
          <div>
            <h2 style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 600,
              fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              Customize Tracker
            </h2>
            <p style={{
              margin: '0.25rem 0 0 0',
              fontSize: '0.875rem',
              opacity: 0.95
            }}>
              {template.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: 'white',
              fontSize: '1.25rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              flexShrink: 0,
              marginLeft: '1rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '1.5rem'
        }}>
          {/* Who is this for? */}
          <section style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '0.75rem',
              color: 'var(--text-color)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              Who is this for? (Select one or more)
            </label>
            {membersLoading ? (
              <div style={{
                padding: '1rem',
                textAlign: 'center',
                color: 'var(--text-color)',
                opacity: 0.7
              }}>
                Loading family members...
              </div>
            ) : members.length === 0 ? (
              <div style={{
                padding: '1rem',
                textAlign: 'center',
                color: 'var(--text-color)',
                opacity: 0.7,
                background: 'var(--accent-color)',
                borderRadius: '6px'
              }}>
                No family members found. Add family members in Family Settings first.
              </div>
            ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '0.5rem'
            }}>
              {members.map(member => (
                <label
                  key={member.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    background: selectedMembers.includes(member.id)
                      ? 'var(--primary-color)'
                      : 'var(--accent-color)',
                    color: selectedMembers.includes(member.id)
                      ? 'white'
                      : 'var(--text-color)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: `2px solid ${selectedMembers.includes(member.id) ? 'var(--primary-color)' : 'var(--accent-color)'}`,
                    fontSize: '0.875rem',
                    fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                  onMouseOver={(e) => {
                    if (!selectedMembers.includes(member.id)) {
                      e.currentTarget.style.background = 'var(--background-color)';
                      e.currentTarget.style.borderColor = 'var(--primary-color)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!selectedMembers.includes(member.id)) {
                      e.currentTarget.style.background = 'var(--accent-color)';
                      e.currentTarget.style.borderColor = 'var(--accent-color)';
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => handleMemberToggle(member.id)}
                    style={{
                      accentColor: 'var(--secondary-color)',
                      cursor: 'pointer'
                    }}
                  />
                  <span>{member.name}</span>
                </label>
              ))}
            </div>
            )}
          </section>

          {/* What are you tracking? */}
          <section style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '0.5rem',
              color: 'var(--text-color)',
              fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              What are you tracking? *
            </label>
            <input
              type="text"
              value={trackerName}
              onChange={(e) => setTrackerName(e.target.value)}
              placeholder="e.g., Water Intake, Swimming Practice, Daily Reading..."
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--accent-color)',
                borderRadius: '6px',
                fontSize: '0.9375rem',
                background: 'var(--background-color)',
                color: 'var(--text-color)',
                fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            />
          </section>

          {/* Goal/Description */}
          <section style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '0.5rem',
              color: 'var(--text-color)',
              fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              Goal/Description (optional)
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Drink 8 glasses per day, Practice 5 days a week..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--accent-color)',
                borderRadius: '6px',
                fontSize: '0.875rem',
                background: 'var(--background-color)',
                color: 'var(--text-color)',
                fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            />
          </section>

          {/* Reset Schedule */}
          <section style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '0.75rem',
              color: 'var(--text-color)',
              fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              Reset Schedule
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              {[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: '60-days', label: '60 Days' },
                { value: '90-days', label: '90 Days' },
                { value: '1-year', label: '1 Year' },
                { value: 'goal-completion', label: 'Goal Completion' },
                { value: 'never', label: 'Never Reset' },
                { value: 'streak-break', label: 'On Streak Break' }
              ].map(option => (
                <label
                  key={option.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    background: resetSchedule === option.value
                      ? 'var(--primary-color)'
                      : 'var(--accent-color)',
                    color: resetSchedule === option.value
                      ? 'white'
                      : 'var(--text-color)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '0.8125rem',
                    fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                  onMouseOver={(e) => {
                    if (resetSchedule !== option.value) {
                      e.currentTarget.style.background = 'var(--background-color)';
                      e.currentTarget.style.borderColor = 'var(--primary-color)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (resetSchedule !== option.value) {
                      e.currentTarget.style.background = 'var(--accent-color)';
                    }
                  }}
                >
                  <input
                    type="radio"
                    name="resetSchedule"
                    value={option.value}
                    checked={resetSchedule === option.value}
                    onChange={(e) => setResetSchedule(e.target.value as any)}
                    style={{
                      accentColor: 'var(--secondary-color)',
                      cursor: 'pointer'
                    }}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>

            {/* Goal Target (shows when goal-completion selected) */}
            {resetSchedule === 'goal-completion' && (
              <div style={{
                background: 'rgba(104, 163, 149, 0.1)',
                padding: '1rem',
                borderRadius: '6px',
                marginTop: '0.75rem'
              }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: 'var(--text-color)',
                  fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}>
                  Goal Target
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="number"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(parseInt(e.target.value) || 0)}
                    min="1"
                    style={{
                      width: '100px',
                      padding: '0.5rem',
                      border: '1px solid var(--accent-color)',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      background: 'var(--background-color)',
                      color: 'var(--text-color)',
                      fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                  />
                  <select
                    value={goalUnit}
                    onChange={(e) => setGoalUnit(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      border: '1px solid var(--accent-color)',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      background: 'var(--background-color)',
                      color: 'var(--text-color)',
                      cursor: 'pointer',
                      fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                  >
                    <option value="items">Items</option>
                    <option value="books">Books</option>
                    <option value="days">Days</option>
                    <option value="stars">Stars</option>
                    <option value="points">Points</option>
                    <option value="hours">Hours</option>
                    <option value="sessions">Sessions</option>
                    <option value="times">Times</option>
                  </select>
                </div>
                <p style={{
                  margin: '0.5rem 0 0 0',
                  fontSize: '0.75rem',
                  opacity: 0.7,
                  fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}>
                  <Info size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  Tracker stays active until reaching {goalTarget} {goalUnit}
                </p>
              </div>
            )}
          </section>

          {/* Visual Style */}
          <section style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '0.75rem',
              color: 'var(--text-color)',
              fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              Visual Style
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '0.5rem'
            }}>
              {['artistic', 'modern', 'kid-friendly', 'professional'].map(style => (
                <label
                  key={style}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    background: visualStyle === style
                      ? 'var(--primary-color)'
                      : 'var(--accent-color)',
                    color: visualStyle === style
                      ? 'white'
                      : 'var(--text-color)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '0.8125rem',
                    textTransform: 'capitalize',
                    fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                >
                  <input
                    type="radio"
                    name="visualStyle"
                    value={style}
                    checked={visualStyle === style}
                    onChange={(e) => setVisualStyle(e.target.value as any)}
                    style={{
                      accentColor: 'var(--secondary-color)',
                      cursor: 'pointer'
                    }}
                  />
                  <span>{style.replace('-', ' ')}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Widget Size */}
          <section style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '0.75rem',
              color: 'var(--text-color)',
              fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              Size on Dashboard
            </label>
            <div style={{
              display: 'flex',
              gap: '0.5rem'
            }}>
              {['small', 'medium', 'large'].map(size => (
                <label
                  key={size}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    background: widgetSize === size
                      ? 'var(--primary-color)'
                      : 'var(--accent-color)',
                    color: widgetSize === size
                      ? 'white'
                      : 'var(--text-color)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '0.8125rem',
                    textTransform: 'capitalize',
                    fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                >
                  <input
                    type="radio"
                    name="widgetSize"
                    value={size}
                    checked={widgetSize === size}
                    onChange={(e) => setWidgetSize(e.target.value as any)}
                    style={{
                      accentColor: 'var(--secondary-color)',
                      cursor: 'pointer'
                    }}
                  />
                  <span>{size}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Features */}
          <section style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '0.75rem',
              color: 'var(--text-color)',
              fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              Features
            </label>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {[
                { key: 'notesEnabled', label: 'Allow notes on each entry', state: notesEnabled, setState: setNotesEnabled },
                { key: 'emotionsEnabled', label: 'Allow emotion/mood tags', state: emotionsEnabled, setState: setEmotionsEnabled },
                { key: 'journalEnabled', label: 'Allow journal/story entries', state: journalEnabled, setState: setJournalEnabled },
                { key: 'autoTrackEnabled', label: 'Auto-track from Victory Recorder (when available)', state: autoTrackEnabled, setState: setAutoTrackEnabled }
              ].map(feature => (
                <label
                  key={feature.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    background: 'var(--accent-color)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={feature.state}
                    onChange={(e) => feature.setState(e.target.checked)}
                    style={{
                      accentColor: 'var(--primary-color)',
                      cursor: 'pointer'
                    }}
                  />
                  <span>{feature.label}</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--accent-color)',
          background: 'var(--gradient-background)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div style={{
            fontSize: '0.875rem',
            color: 'var(--text-color)',
            opacity: 0.7,
            fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            {selectedMembers.length > 0 ? (
              <span>Will create {selectedMembers.length} tracker{selectedMembers.length > 1 ? 's' : ''}</span>
            ) : (
              <span>Select family member(s) to continue</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '1px solid var(--accent-color)',
                borderRadius: '6px',
                padding: '0.5rem 1.5rem',
                cursor: 'pointer',
                color: 'var(--text-color)',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s',
                fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'var(--accent-color)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={selectedMembers.length === 0 || !trackerName.trim()}
              style={{
                background: selectedMembers.length === 0 || !trackerName.trim()
                  ? 'var(--accent-color)'
                  : 'var(--primary-color)',
                color: selectedMembers.length === 0 || !trackerName.trim()
                  ? 'var(--text-color)'
                  : 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem 1.5rem',
                cursor: selectedMembers.length === 0 || !trackerName.trim() ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600,
                transition: 'all 0.2s',
                fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                opacity: selectedMembers.length === 0 || !trackerName.trim() ? 0.5 : 1
              }}
              onMouseOver={(e) => {
                if (selectedMembers.length > 0 && trackerName.trim()) {
                  e.currentTarget.style.opacity = '0.9';
                }
              }}
              onMouseOut={(e) => {
                if (selectedMembers.length > 0 && trackerName.trim()) {
                  e.currentTarget.style.opacity = '1';
                }
              }}
            >
              Add to Dashboard{selectedMembers.length > 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root') || document.body
  );
};

export default TrackerCustomizationModal;
