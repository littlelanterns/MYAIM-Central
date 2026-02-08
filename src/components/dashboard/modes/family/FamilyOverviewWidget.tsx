/**
 * FamilyOverviewWidget Component
 * Shows all family members with status and quick-switch capability
 * Compact design for large families (9+ kids)
 * NO EMOJIS - CSS VARIABLES ONLY - THEME AWARE
 */

import React, { useState } from 'react';
import { Eye, User, Grid3x3, List, ChevronDown, ChevronUp } from 'lucide-react';
import { familyMemberColors } from '../../../../styles/colors';

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  custom_role?: string;
  dashboard_mode: string;
  dashboard_type?: string;
  member_color?: string;
  stats?: {
    completedTasks: number;
    totalTasks: number;
    nextEvent?: string;
  };
}

// Helper function to format dashboard type for display
const formatDashboardType = (dashboardType: string | undefined): string => {
  if (!dashboardType) return 'Guided Mode';

  const typeMap: Record<string, string> = {
    'play': 'Play Mode',
    'guided': 'Guided Mode',
    'independent': 'Independent Mode',
    'additional_adult': 'Partner Dashboard',
    'partner': 'Partner Dashboard'
  };

  return typeMap[dashboardType.toLowerCase()] || dashboardType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

// Helper function to format role for display
// Role mappings: primary_organizer → Mom, partner → Husband (or custom_role),
// child → Child, out-of-nest → Adult Child (or custom_role), special → custom_role
const formatRole = (role: string | undefined, customRole?: string): string => {
  if (!role) return '';

  const roleMap: Record<string, string> = {
    'primary_organizer': 'Mom',
    'partner': customRole || 'Husband',
    'child': 'Child',
    'teen': 'Teen',
    'out-of-nest': customRole || 'Adult Child',
    'special': customRole || 'Special'
  };

  return roleMap[role.toLowerCase()] || customRole || role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

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
  const [viewMode, setViewMode] = useState<'compact' | 'cards'>('compact');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Get member color from familyMemberColors or use default
  const getMemberColor = (memberColorName?: string) => {
    if (!memberColorName) return familyMemberColors[0].color;
    const colorObj = familyMemberColors.find(c => c.name === memberColorName);
    return colorObj ? colorObj.color : familyMemberColors[0].color;
  };

  // Smart column calculation: find best multiple of 3, 4, or 5
  // Prefer LARGEST remainder to avoid lonely single cards at the bottom
  const getOptimalColumns = () => {
    const count = familyMembers.length;
    if (count === 0) return 3;

    // Calculate remainders for each option
    const options = [
      { cols: 5, remainder: count % 5 },
      { cols: 4, remainder: count % 4 },
      { cols: 3, remainder: count % 3 }
    ];

    // First check if any option divides evenly (remainder = 0)
    const perfectDivision = options.find(opt => opt.remainder === 0);
    if (perfectDivision) return perfectDivision.cols;

    // Otherwise, sort by remainder (descending - largest first), then by columns (descending)
    options.sort((a, b) => {
      if (a.remainder !== b.remainder) return b.remainder - a.remainder; // Largest remainder wins
      return b.cols - a.cols; // Prefer higher column count on tie
    });

    return options[0].cols;
  };

  return (
    <div style={{
      background: 'var(--gradient-background)',
      border: '1px solid var(--accent-color)',
      borderRadius: '12px',
      padding: '1.5rem'
    }}>
      {/* Header with controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isCollapsed ? 0 : '1rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h3 style={{
            color: 'var(--primary-color)',
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: 600,
            fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            Family Overview
          </h3>
          <span style={{
            color: 'var(--text-color)',
            opacity: 0.6,
            fontSize: '0.875rem',
            fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            {familyMembers.length} {familyMembers.length === 1 ? 'member' : 'members'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* Collapse/Expand Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              background: 'transparent',
              border: '1px solid var(--accent-color)',
              borderRadius: '6px',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-color)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--accent-color)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>

          {/* View Mode Toggle */}
          {!isCollapsed && (
            <div style={{
              background: 'var(--background-color)',
              border: '1px solid var(--accent-color)',
              borderRadius: '6px',
              padding: '0.25rem',
              display: 'flex',
              gap: '0.25rem'
            }}>
              <button
                onClick={() => setViewMode('compact')}
                style={{
                  background: viewMode === 'compact' ? 'var(--primary-color)' : 'transparent',
                  color: viewMode === 'compact' ? 'white' : 'var(--text-color)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.375rem 0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
                title="Compact List"
              >
                <List size={14} />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                style={{
                  background: viewMode === 'cards' ? 'var(--primary-color)' : 'transparent',
                  color: viewMode === 'cards' ? 'white' : 'var(--text-color)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.375rem 0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
                title="Card View"
              >
                <Grid3x3 size={14} />
              </button>
            </div>
          )}

          {/* Manage Family Button */}
          <button
            onClick={onManageFamily}
            style={{
              background: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              transition: 'opacity 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            Manage Family
          </button>
        </div>
      </div>

      {/* Member Display - Conditional based on collapsed state and view mode */}
      {!isCollapsed && (
        <>
          {viewMode === 'compact' ? (
            /* Compact List View - Perfect for large families */
            <div style={{
              background: 'var(--background-color)',
              border: '1px solid var(--accent-color)',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              {familyMembers.map((member, index) => (
                <div
                  key={member.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr auto',
                    gap: '1rem',
                    padding: '0.75rem 1rem',
                    alignItems: 'center',
                    borderBottom: index < familyMembers.length - 1 ? '1px solid var(--accent-color)' : 'none',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--accent-color)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Color indicator */}
                  <div style={{
                    background: getMemberColor(member.member_color),
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    flexShrink: 0
                  }}>
                    <User size={14} />
                  </div>

                  {/* Member info */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2rem',
                    minWidth: 0,
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ minWidth: '120px' }}>
                      <div style={{
                        color: 'var(--text-color)',
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                        fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        marginBottom: '0.125rem'
                      }}>
                        {member.name}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-color)',
                        opacity: 0.6,
                        fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                      }}>
                        {formatRole(member.role, member.custom_role)} · {formatDashboardType(member.dashboard_type || member.dashboard_mode)}
                      </div>
                    </div>

                    {member.stats && (
                      <>
                        <div style={{
                          fontSize: '0.8125rem',
                          color: 'var(--text-color)',
                          fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }}>
                          <span style={{ opacity: 0.6 }}>Tasks: </span>
                          <span style={{ fontWeight: 600 }}>
                            {member.stats.completedTasks}/{member.stats.totalTasks}
                          </span>
                        </div>
                        {member.stats.nextEvent && (
                          <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-color)',
                            opacity: 0.7,
                            fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '200px'
                          }}>
                            Next: {member.stats.nextEvent}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* View button - Skip for primary_organizer (mom viewing her own dashboard doesn't make sense) */}
                  {member.role !== 'primary_organizer' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewMember(member.id);
                      }}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--accent-color)',
                        borderRadius: '6px',
                        padding: '0.5rem 0.75rem',
                        cursor: 'pointer',
                        color: 'var(--text-color)',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'var(--primary-color)';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.borderColor = 'var(--primary-color)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-color)';
                        e.currentTarget.style.borderColor = 'var(--accent-color)';
                      }}
                    >
                      <Eye size={12} />
                      View
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* Card View - Smart column count using multiples of 3, 4, or 5 */
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${getOptimalColumns()}, 1fr)`,
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
                        fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                      }}>
                        {formatRole(member.role, member.custom_role)} · {formatDashboardType(member.dashboard_type || member.dashboard_mode)}
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

                  {/* View button - Skip for primary_organizer */}
                  {member.role !== 'primary_organizer' && (
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
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

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
