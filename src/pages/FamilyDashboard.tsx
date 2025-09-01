import React from 'react';
import { Link } from 'react-router-dom';

// Icons
const Users = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const User = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const Baby = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
)

const FamilyDashboard: React.FC = () => {
  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '3rem'
      }}>
        <h1 style={{
          color: 'var(--primary-color, #68a395)',
          marginBottom: '1rem',
          fontFamily: '"The Seasons", "Playfair Display", serif',
          fontSize: '2.5rem',
          fontWeight: '600'
        }}>Family Dashboard</h1>
        <p style={{
          color: 'var(--text-color, #5a4033)',
          fontSize: '1.1rem',
          opacity: '0.8'
        }}>Central hub for all family members and activities</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        {/* Teen Dashboard Card */}
        <Link 
          to="/teen-dashboard" 
          style={{
            textDecoration: 'none',
            color: 'inherit',
            display: 'block'
          }}
        >
          <div style={{
            background: 'var(--gradient-background, linear-gradient(135deg, var(--background-color, #fff4ec) 0%, var(--accent-color, #d4e3d9) 100%))',
            border: '1px solid var(--accent-color, #d4e3d9)',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
          }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                background: 'var(--primary-color, #68a395)',
                color: 'white',
                padding: '0.75rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User />
              </div>
              <div>
                <h3 style={{
                  margin: '0 0 0.25rem 0',
                  color: 'var(--primary-color, #68a395)',
                  fontSize: '1.25rem',
                  fontWeight: '600'
                }}>Teen Dashboard</h3>
                <p style={{
                  margin: '0',
                  color: 'var(--text-color, #5a4033)',
                  fontSize: '0.9rem',
                  opacity: '0.7'
                }}>Ages 13-18</p>
              </div>
            </div>
            <p style={{
              color: 'var(--text-color, #5a4033)',
              lineHeight: '1.6',
              margin: '0',
              fontSize: '0.95rem'
            }}>
              Advanced task management, personal goals, theme customization, and independence-focused features for teenagers.
            </p>
            <div style={{
              marginTop: '1.5rem',
              padding: '0.75rem 1rem',
              background: 'rgba(255,255,255,0.5)',
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: 'var(--text-color, #5a4033)',
              fontStyle: 'italic'
            }}>
              ✨ Temporary access - Click to explore the teen interface
            </div>
          </div>
        </Link>

        {/* Child Dashboard Card */}
        <Link 
          to="/child-dashboard" 
          style={{
            textDecoration: 'none',
            color: 'inherit',
            display: 'block'
          }}
        >
          <div style={{
            background: 'var(--gradient-background, linear-gradient(135deg, var(--background-color, #fff4ec) 0%, var(--accent-color, #d4e3d9) 100%))',
            border: '1px solid var(--accent-color, #d4e3d9)',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
          }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                background: 'var(--secondary-color, #d6a461)',
                color: 'white',
                padding: '0.75rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Baby />
              </div>
              <div>
                <h3 style={{
                  margin: '0 0 0.25rem 0',
                  color: 'var(--primary-color, #68a395)',
                  fontSize: '1.25rem',
                  fontWeight: '600'
                }}>Child Dashboard</h3>
                <p style={{
                  margin: '0',
                  color: 'var(--text-color, #5a4033)',
                  fontSize: '0.9rem',
                  opacity: '0.7'
                }}>Ages 5-12</p>
              </div>
            </div>
            <p style={{
              color: 'var(--text-color, #5a4033)',
              lineHeight: '1.6',
              margin: '0',
              fontSize: '0.95rem'
            }}>
              Fun, gamified interface with visual tasks, animations, and age-appropriate activities for younger children.
            </p>
            <div style={{
              marginTop: '1.5rem',
              padding: '0.75rem 1rem',
              background: 'rgba(255,255,255,0.5)',
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: 'var(--text-color, #5a4033)',
              fontStyle: 'italic'
            }}>
              🎈 Coming soon - Basic placeholder interface available
            </div>
          </div>
        </Link>

        {/* Family Overview Card - Placeholder */}
        <div style={{
          background: 'var(--gradient-background, linear-gradient(135deg, var(--background-color, #fff4ec) 0%, var(--accent-color, #d4e3d9) 100%))',
          border: '1px solid var(--accent-color, #d4e3d9)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              background: 'var(--accent-color, #d4e3d9)',
              color: 'var(--text-color, #5a4033)',
              padding: '0.75rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users />
            </div>
            <div>
              <h3 style={{
                margin: '0 0 0.25rem 0',
                color: 'var(--primary-color, #68a395)',
                fontSize: '1.25rem',
                fontWeight: '600'
              }}>Family Overview</h3>
              <p style={{
                margin: '0',
                color: 'var(--text-color, #5a4033)',
                fontSize: '0.9rem',
                opacity: '0.7'
              }}>All Members</p>
            </div>
          </div>
          <p style={{
            color: 'var(--text-color, #5a4033)',
            lineHeight: '1.6',
            margin: '0 0 1.5rem 0',
            fontSize: '0.95rem'
          }}>
            Comprehensive family management, task assignment, progress tracking, and celebration features for parents.
          </p>
          <div style={{
            padding: '0.75rem 1rem',
            background: 'rgba(255,255,255,0.5)',
            borderRadius: '8px',
            fontSize: '0.85rem',
            color: 'var(--text-color, #5a4033)',
            fontStyle: 'italic'
          }}>
            🛠️ In development - Full family management coming soon
          </div>
        </div>
      </div>

      <div style={{
        textAlign: 'center',
        padding: '2rem',
        background: 'var(--gradient-background, linear-gradient(135deg, var(--background-color, #fff4ec) 0%, var(--accent-color, #d4e3d9) 100%))',
        borderRadius: '12px',
        border: '1px solid var(--accent-color, #d4e3d9)'
      }}>
        <p style={{
          color: 'var(--text-color, #5a4033)',
          margin: '0',
          fontSize: '0.9rem',
          opacity: '0.8'
        }}>
          📝 <strong>Note:</strong> These are temporary navigation buttons for development. In the final version, 
          family members will have individual accounts accessible through a family member selector.
        </p>
      </div>
    </div>
  );
};

export default FamilyDashboard;