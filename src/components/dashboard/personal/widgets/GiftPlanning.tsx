/**
 * GiftPlanning Widget
 * Track gift ideas and occasions - completely private
 * Part of Mom's Personal Dashboard
 * NO EMOJIS - CSS VARIABLES ONLY
 */

import React, { useState } from 'react';
import { Gift, Plus, Calendar as CalendarIcon } from 'lucide-react';

interface GiftOccasion {
  id: string;
  person: string;
  event: string;
  date: string;
  daysUntil: number;
  ideas: Array<{
    item: string;
    budget: number;
    purchased: boolean;
  }>;
}

interface GiftPlanningProps {
  familyMemberId: string;
}

const GiftPlanning: React.FC<GiftPlanningProps> = ({ familyMemberId }) => {
  const [occasions, setOccasions] = useState<GiftOccasion[]>([
    {
      id: '1',
      person: 'Sarah',
      event: 'Birthday',
      date: '2025-11-15',
      daysUntil: 25,
      ideas: [
        { item: 'Art supplies set', budget: 45, purchased: false },
        { item: 'Book series', budget: 30, purchased: false }
      ]
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div style={{
      background: 'var(--background-color)',
      border: `1px solid var(--accent-color)`,
      borderRadius: '12px',
      padding: '1.5rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <Gift size={20} color="var(--primary-color)" />
          <h3 style={{
            color: 'var(--primary-color)',
            margin: 0,
            fontSize: '1.25rem'
          }}>
            Gift Planning
          </h3>
        </div>
        <span style={{
          fontSize: '0.75rem',
          background: 'var(--accent-color)',
          color: 'var(--secondary-color)',
          padding: '0.25rem 0.75rem',
          borderRadius: '12px'
        }}>
          Private
        </span>
      </div>

      <div style={{
        flex: 1,
        overflow: 'auto',
        marginBottom: '1rem'
      }}>
        {occasions.map(occasion => (
          <div
            key={occasion.id}
            style={{
              background: 'var(--gradient-background)',
              border: `1px solid var(--accent-color)`,
              borderRadius: '6px',
              padding: '1rem',
              marginBottom: '0.75rem'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem'
            }}>
              <div>
                <div style={{
                  color: 'var(--text-color)',
                  fontWeight: '500',
                  fontSize: '1rem'
                }}>
                  {occasion.person} - {occasion.event}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-color)',
                  opacity: 0.7,
                  marginTop: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <CalendarIcon size={14} />
                  {occasion.date} ({occasion.daysUntil} days)
                </div>
              </div>
              <button style={{
                background: 'var(--primary-color)',
                color: 'var(--background-color)',
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Plus size={14} />
                Add Ideas
              </button>
            </div>

            {occasion.ideas && occasion.ideas.length > 0 && (
              <div style={{
                marginTop: '0.75rem',
                paddingTop: '0.75rem',
                borderTop: `1px solid var(--accent-color)`
              }}>
                {occasion.ideas.map((idea, idx) => (
                  <div
                    key={idx}
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-color)',
                      padding: '0.5rem 0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      textDecoration: idea.purchased ? 'line-through' : 'none',
                      opacity: idea.purchased ? 0.6 : 1
                    }}
                  >
                    <span>{idea.item}</span>
                    <span style={{
                      fontWeight: '500',
                      color: 'var(--secondary-color)'
                    }}>
                      ${idea.budget}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {occasions.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: 'var(--text-color)',
            opacity: 0.6
          }}>
            <Gift size={48} color="var(--accent-color)" style={{ marginBottom: '1rem' }} />
            <p>No upcoming occasions yet</p>
            <p style={{ fontSize: '0.875rem' }}>Add birthdays, holidays, and special events</p>
          </div>
        )}
      </div>

      <button style={{
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
      }}>
        <Plus size={16} />
        Add Occasion
      </button>
    </div>
  );
};

export default GiftPlanning;
