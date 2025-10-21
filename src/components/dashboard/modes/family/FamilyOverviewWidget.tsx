/**
 * FamilyOverviewWidget Component
 * Shows all family members with status and quick-switch capability
 * NO EMOJIS - CSS VARIABLES ONLY - THEME AWARE
 */

import React from 'react';
import { Eye, User } from 'lucide-react';
import { familyMemberColors } from '../../../../styles/colors';

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  dashboard_mode: string;
  member_color?: string;
  stats?: {
    completedTasks: number;
    totalTasks: number;
    nextEvent?: string;
  };
}

interface FamilyOverviewWidgetProps {
  familyMembers: FamilyMember[];
  onViewMember: (memberId: string) => void;
  onManageFamily: () => void;
}

const FamilyOverviewWidget: React.FC<FamilyOverviewWidgetProps> = ({
  familyMembers,
  onViewMember,
  onManageFamily
}) => {
  // Get member color from familyMemberColors or use default
  const getMemberColor = (memberColorName?: string) => {
    if (!memberColorName) return familyMemberColors[0].color;
    const colorObj = familyMemberColors.find(c => c.name === memberColorName);
    return colorObj ? colorObj.color : familyMemberColors[0].color;
  };

  return (
    <div style={{
      background: 'var(--gradient-background)',
      border: '1px solid var(--accent-color)',
      borderRadius: '12px',
      padding: '1.5rem'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{
          color: 'var(--primary-color)',
          margin: 0,
          fontSize: '1.25rem',
          fontWeight: 600,
          fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          Family Overview
        </h3>
        <button
          onClick={onManageFamily}
          style={{
            background: 'var(--primary-color)',
            color: 'var(--background-color)',
            border: 'none',
            borderRadius: '6px',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            transition: 'opacity 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
        >
          Manage Family
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        {familyMembers.map(member => (
          <div
            key={member.id}
            style={{
              background: 'var(--background-color)',
              border: `2px solid ${getMemberColor(member.member_color)}`,
              borderRadius: '8px',
              padding: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '0.75rem'
            }}>
              <div style={{ flex: 1 }}>
                <h4 style={{
                  color: 'var(--text-color)',
                  margin: '0 0 0.25rem 0',
                  fontSize: '1rem',
                  fontWeight: 600,
                  fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}>
                  {member.name}
                </h4>
                <span style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-color)',
                  opacity: 0.7,
                  textTransform: 'capitalize',
                  fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}>
                  {member.dashboard_mode || 'independent'}
                </span>
              </div>
              <div style={{
                background: getMemberColor(member.member_color),
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <User size={16} />
              </div>
            </div>

            {member.stats && (
              <div style={{
                marginBottom: '0.75rem',
                fontSize: '0.875rem',
                color: 'var(--text-color)',
                opacity: 0.8,
                fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                <div style={{ marginBottom: '0.25rem' }}>
                  Tasks: {member.stats.completedTasks}/{member.stats.totalTasks}
                </div>
                {member.stats.nextEvent && (
                  <div style={{
                    fontSize: '0.75rem',
                    opacity: 0.7
                  }}>
                    Next: {member.stats.nextEvent}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => onViewMember(member.id)}
              style={{
                width: '100%',
                padding: '0.5rem',
                background: 'transparent',
                border: `1px solid var(--accent-color)`,
                borderRadius: '6px',
                cursor: 'pointer',
                color: 'var(--text-color)',
                fontSize: '0.875rem',
                fontWeight: 500,
                fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'var(--accent-color)';
                e.currentTarget.style.borderColor = 'var(--primary-color)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'var(--accent-color)';
              }}
            >
              <Eye size={14} />
              View Dashboard
            </button>
          </div>
        ))}
      </div>

      {familyMembers.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: 'var(--text-color)',
          opacity: 0.6,
          fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          No family members added yet. Click "Manage Family" to add members.
        </div>
      )}
    </div>
  );
};

export default FamilyOverviewWidget;
