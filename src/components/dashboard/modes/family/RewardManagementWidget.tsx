/**
 * RewardManagementWidget Component
 * Manage family rewards, points, and allowances
 * NO EMOJIS - CSS VARIABLES ONLY - THEME AWARE
 */

import React, { useState } from 'react';
import { DollarSign, Star, Gift, CheckCircle, XCircle } from 'lucide-react';
import { familyMemberColors } from '../../../../styles/colors';

interface RewardRequest {
  id: string;
  memberId: string;
  memberName: string;
  memberColor?: string;
  rewardType: 'points' | 'money' | 'privilege';
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'denied';
  timestamp: Date;
}

interface FamilyMemberBalance {
  id: string;
  name: string;
  member_color?: string;
  points: number;
  allowance: number;
  privilegesEarned: number;
}

interface RewardManagementWidgetProps {
  memberBalances: FamilyMemberBalance[];
  pendingRequests?: RewardRequest[];
  onApproveRequest?: (requestId: string) => void;
  onDenyRequest?: (requestId: string) => void;
  onAdjustBalance?: (memberId: string, type: 'points' | 'money', amount: number) => void;
}

const RewardManagementWidget: React.FC<RewardManagementWidgetProps> = ({
  memberBalances,
  pendingRequests = [],
  onApproveRequest,
  onDenyRequest,
  onAdjustBalance
}) => {
  const [selectedTab, setSelectedTab] = useState<'balances' | 'requests'>('balances');

  const getMemberColor = (memberColorName?: string) => {
    if (!memberColorName) return familyMemberColors[0].color;
    const colorObj = familyMemberColors.find(c => c.name === memberColorName);
    return colorObj ? colorObj.color : familyMemberColors[0].color;
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'money':
        return <DollarSign size={16} />;
      case 'points':
        return <Star size={16} />;
      case 'privilege':
        return <Gift size={16} />;
      default:
        return <Star size={16} />;
    }
  };

  return (
    <div style={{
      background: 'var(--gradient-background)',
      border: '1px solid var(--accent-color)',
      borderRadius: '12px',
      padding: '1.5rem'
    }}>
      <h3 style={{
        color: 'var(--primary-color)',
        margin: '0 0 1rem 0',
        fontSize: '1.25rem',
        fontWeight: 600,
        fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        Reward Management
      </h3>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem',
        borderBottom: '1px solid var(--accent-color)',
        paddingBottom: '0.5rem'
      }}>
        <button
          onClick={() => setSelectedTab('balances')}
          style={{
            background: selectedTab === 'balances' ? 'var(--primary-color)' : 'transparent',
            color: selectedTab === 'balances' ? 'white' : 'var(--text-color)',
            border: selectedTab === 'balances' ? 'none' : '1px solid var(--accent-color)',
            borderRadius: '6px',
            padding: '0.375rem 0.75rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            if (selectedTab !== 'balances') {
              e.currentTarget.style.background = 'var(--accent-color)';
            }
          }}
          onMouseOut={(e) => {
            if (selectedTab !== 'balances') {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          Balances
        </button>
        <button
          onClick={() => setSelectedTab('requests')}
          style={{
            background: selectedTab === 'requests' ? 'var(--primary-color)' : 'transparent',
            color: selectedTab === 'requests' ? 'white' : 'var(--text-color)',
            border: selectedTab === 'requests' ? 'none' : '1px solid var(--accent-color)',
            borderRadius: '6px',
            padding: '0.375rem 0.75rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            position: 'relative',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            if (selectedTab !== 'requests') {
              e.currentTarget.style.background = 'var(--accent-color)';
            }
          }}
          onMouseOut={(e) => {
            if (selectedTab !== 'requests') {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          Requests
          {pendingRequests.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: 'var(--secondary-color)',
              color: 'white',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '0.7rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600
            }}>
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Balances Tab */}
      {selectedTab === 'balances' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {memberBalances.map(member => (
            <div
              key={member.id}
              style={{
                background: 'var(--background-color)',
                border: `2px solid ${getMemberColor(member.member_color)}`,
                borderRadius: '8px',
                padding: '1rem'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem'
              }}>
                <h4 style={{
                  color: 'var(--text-color)',
                  margin: 0,
                  fontSize: '1rem',
                  fontWeight: 600,
                  fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}>
                  {member.name}
                </h4>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: getMemberColor(member.member_color)
                }} />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem'
              }}>
                {/* Points */}
                <div style={{
                  textAlign: 'center',
                  padding: '0.5rem',
                  background: 'rgba(104, 163, 149, 0.1)',
                  borderRadius: '6px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                    marginBottom: '0.25rem',
                    color: 'var(--primary-color)'
                  }}>
                    <Star size={14} />
                    <span style={{
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}>
                      {member.points}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-color)',
                    opacity: 0.7,
                    fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}>
                    Points
                  </div>
                </div>

                {/* Allowance */}
                <div style={{
                  textAlign: 'center',
                  padding: '0.5rem',
                  background: 'rgba(214, 164, 97, 0.1)',
                  borderRadius: '6px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                    marginBottom: '0.25rem',
                    color: 'var(--secondary-color)'
                  }}>
                    <DollarSign size={14} />
                    <span style={{
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}>
                      {member.allowance}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-color)',
                    opacity: 0.7,
                    fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}>
                    Allowance
                  </div>
                </div>

                {/* Privileges */}
                <div style={{
                  textAlign: 'center',
                  padding: '0.5rem',
                  background: 'rgba(214, 154, 132, 0.1)',
                  borderRadius: '6px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                    marginBottom: '0.25rem',
                    color: 'var(--accent-color)'
                  }}>
                    <Gift size={14} />
                    <span style={{
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}>
                      {member.privilegesEarned}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-color)',
                    opacity: 0.7,
                    fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}>
                    Privileges
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Requests Tab */}
      {selectedTab === 'requests' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          {pendingRequests.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: 'var(--text-color)',
              opacity: 0.6,
              fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              No pending reward requests
            </div>
          ) : (
            pendingRequests.map(request => (
              <div
                key={request.id}
                style={{
                  background: 'var(--background-color)',
                  border: `1px solid var(--accent-color)`,
                  borderRadius: '8px',
                  padding: '1rem'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.25rem'
                    }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: getMemberColor(request.memberColor)
                      }} />
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--text-color)',
                        fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                      }}>
                        {request.memberName}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-color)',
                      marginBottom: '0.25rem',
                      fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}>
                      Requesting: {getRewardIcon(request.rewardType)} {request.amount} {request.rewardType}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-color)',
                      opacity: 0.7,
                      fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}>
                      {request.reason}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginTop: '0.75rem'
                }}>
                  <button
                    onClick={() => onApproveRequest?.(request.id)}
                    style={{
                      flex: 1,
                      background: 'var(--primary-color)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      transition: 'opacity 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    <CheckCircle size={14} />
                    Approve
                  </button>
                  <button
                    onClick={() => onDenyRequest?.(request.id)}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      color: 'var(--text-color)',
                      border: '1px solid var(--accent-color)',
                      borderRadius: '6px',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'var(--accent-color)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <XCircle size={14} />
                    Deny
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RewardManagementWidget;
