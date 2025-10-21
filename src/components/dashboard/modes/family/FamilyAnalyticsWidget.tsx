/**
 * FamilyAnalyticsWidget Component
 * High-level metrics and insights for family performance
 * NO EMOJIS - CSS VARIABLES ONLY - THEME AWARE
 */

import React from 'react';
import { TrendingUp, TrendingDown, Award, Clock } from 'lucide-react';
import { familyMemberColors } from '../../../../styles/colors';

interface FamilyMember {
  id: string;
  name: string;
  member_color?: string;
  stats: {
    completedTasks: number;
    totalTasks: number;
    completionRate: number;
    streak: number;
  };
}

interface FamilyAnalyticsWidgetProps {
  familyMembers: FamilyMember[];
  weeklyTrend?: number; // Percentage change from last week
  totalTasksThisWeek?: number;
  totalCompletedThisWeek?: number;
  averageCompletionTime?: number; // In minutes
}

const FamilyAnalyticsWidget: React.FC<FamilyAnalyticsWidgetProps> = ({
  familyMembers,
  weeklyTrend = 0,
  totalTasksThisWeek = 0,
  totalCompletedThisWeek = 0,
  averageCompletionTime = 0
}) => {
  const getMemberColor = (memberColorName?: string) => {
    if (!memberColorName) return familyMemberColors[0].color;
    const colorObj = familyMemberColors.find(c => c.name === memberColorName);
    return colorObj ? colorObj.color : familyMemberColors[0].color;
  };

  const overallCompletionRate = totalTasksThisWeek > 0
    ? Math.round((totalCompletedThisWeek / totalTasksThisWeek) * 100)
    : 0;

  return (
    <div style={{
      background: 'var(--gradient-background)',
      border: '1px solid var(--accent-color)',
      borderRadius: '12px',
      padding: '1.5rem'
    }}>
      <h3 style={{
        color: 'var(--primary-color)',
        margin: '0 0 1.5rem 0',
        fontSize: '1.25rem',
        fontWeight: 600,
        fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        Family Analytics
      </h3>

      {/* Key Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {/* Overall Completion Rate */}
        <div style={{
          background: 'var(--background-color)',
          border: '1px solid var(--accent-color)',
          borderRadius: '8px',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--primary-color)',
            marginBottom: '0.25rem',
            fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            {overallCompletionRate}%
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-color)',
            opacity: 0.7,
            fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            Completion Rate
          </div>
        </div>

        {/* Weekly Trend */}
        <div style={{
          background: 'var(--background-color)',
          border: '1px solid var(--accent-color)',
          borderRadius: '8px',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem',
            marginBottom: '0.25rem'
          }}>
            <span style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: weeklyTrend >= 0 ? 'var(--primary-color)' : 'var(--secondary-color)',
              fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              {weeklyTrend >= 0 ? '+' : ''}{weeklyTrend}%
            </span>
            {weeklyTrend >= 0 ? (
              <TrendingUp size={20} style={{ color: 'var(--primary-color)' }} />
            ) : (
              <TrendingDown size={20} style={{ color: 'var(--secondary-color)' }} />
            )}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-color)',
            opacity: 0.7,
            fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            vs Last Week
          </div>
        </div>

        {/* Tasks This Week */}
        <div style={{
          background: 'var(--background-color)',
          border: '1px solid var(--accent-color)',
          borderRadius: '8px',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--primary-color)',
            marginBottom: '0.25rem',
            fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            {totalCompletedThisWeek}/{totalTasksThisWeek}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-color)',
            opacity: 0.7,
            fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            Tasks Completed
          </div>
        </div>

        {/* Average Time */}
        <div style={{
          background: 'var(--background-color)',
          border: '1px solid var(--accent-color)',
          borderRadius: '8px',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '0.25rem'
          }}>
            <Clock size={20} style={{ color: 'var(--primary-color)' }} />
            <span style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--primary-color)',
              fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              {averageCompletionTime}m
            </span>
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-color)',
            opacity: 0.7,
            fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            Avg Completion
          </div>
        </div>
      </div>

      {/* Member Performance Bars */}
      <div style={{
        background: 'var(--background-color)',
        border: '1px solid var(--accent-color)',
        borderRadius: '8px',
        padding: '1rem'
      }}>
        <h4 style={{
          color: 'var(--text-color)',
          margin: '0 0 1rem 0',
          fontSize: '1rem',
          fontWeight: 600,
          fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          Member Performance
        </h4>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {familyMembers.map(member => (
            <div key={member.id}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: getMemberColor(member.member_color)
                  }} />
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-color)',
                    fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}>
                    {member.name}
                  </span>
                  {member.stats.streak > 0 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      background: 'var(--gradient-primary)',
                      color: 'white',
                      padding: '0.125rem 0.375rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem'
                    }}>
                      <Award size={12} />
                      {member.stats.streak} day streak
                    </div>
                  )}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-color)',
                  fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}>
                  {member.stats.completionRate}%
                </div>
              </div>

              {/* Progress bar */}
              <div style={{
                width: '100%',
                height: '8px',
                background: 'var(--accent-color)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${member.stats.completionRate}%`,
                  height: '100%',
                  background: getMemberColor(member.member_color),
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }} />
              </div>

              <div style={{
                fontSize: '0.75rem',
                color: 'var(--text-color)',
                opacity: 0.7,
                marginTop: '0.25rem',
                fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                {member.stats.completedTasks} of {member.stats.totalTasks} tasks completed
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Celebration Opportunities */}
      {familyMembers.some(m => m.stats.completionRate === 100 || m.stats.streak >= 7) && (
        <div style={{
          background: 'var(--gradient-primary)',
          color: 'white',
          borderRadius: '8px',
          padding: '1rem',
          marginTop: '1rem',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <Award size={20} />
            <span style={{
              fontSize: '1rem',
              fontWeight: 600,
              fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              Celebration Time!
            </span>
          </div>
          <div style={{
            fontSize: '0.875rem',
            opacity: 0.9,
            fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            {familyMembers
              .filter(m => m.stats.completionRate === 100)
              .map(m => m.name)
              .join(', ')}{' '}
            reached 100% completion!
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyAnalyticsWidget;
