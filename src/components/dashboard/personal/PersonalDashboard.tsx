/**
 * PersonalDashboard Component
 * Mom's personal dashboard - completely private sanctuary
 * NO EMOJIS - CSS VARIABLES ONLY - THEME AWARE
 */

import React, { useState } from 'react';
import { Plus, Lock } from 'lucide-react';
import { usePersonalDashboard } from '../../../hooks/dashboard/usePersonalDashboard';
import { useAuthContext } from '../../auth/shared/AuthContext';
import PersonalWidgetContainer from './PersonalWidgetContainer';
import { WidgetType, WidgetPosition, AVAILABLE_WIDGETS } from '../../../types/dashboard.types';
import PersonalBestIntentions from './widgets/PersonalBestIntentions';
import PersonalTasks from './widgets/PersonalTasks';
import PersonalCalendar from './widgets/PersonalCalendar';
import PersonalNotes from './widgets/PersonalNotes';
import MindSweepCapture from './widgets/MindSweepCapture';
import GiftPlanning from './widgets/GiftPlanning';
import PersonalVictoryRecorder from './widgets/PersonalVictoryRecorder';

const PersonalDashboard: React.FC = () => {
  const { state } = useAuthContext();
  const { config, loading, error, addWidget, removeWidget, updateWidgetPosition, refresh } =
    usePersonalDashboard(state.user?.id ? String(state.user.id) : null);

  const [showAddWidget, setShowAddWidget] = useState(false);

  if (loading) {
    return (
      <div style={{
        background: 'var(--gradient-primary)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div>Loading your personal space...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: 'var(--gradient-primary)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          background: 'var(--background-color)',
          padding: '2rem',
          borderRadius: '16px',
          textAlign: 'center',
          maxWidth: '400px',
          border: `1px solid var(--accent-color)`
        }}>
          <h3 style={{ color: 'var(--text-color)', marginBottom: '1rem' }}>Error loading dashboard</h3>
          <p style={{ color: 'var(--text-color)', opacity: 0.7, marginBottom: '1.5rem' }}>{error}</p>
          <button
            onClick={refresh}
            style={{
              background: 'var(--gradient-primary)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const handleAddWidget = async (widgetType: WidgetType) => {
    if (!config) return;

    const position: WidgetPosition = {
      x: 0,
      y: config.widgets.length * 2,
      w: 2,
      h: 2
    };

    const success = await addWidget(widgetType, position);
    if (success) {
      setShowAddWidget(false);
    }
  };

  const renderWidgetContent = (widget: any) => {
    const widgetProps = { familyMemberId: String(state.user?.id || '') };

    switch (widget.widget_type) {
      case 'best_intentions':
        return <PersonalBestIntentions {...widgetProps} />;
      case 'tasks':
        return <PersonalTasks {...widgetProps} />;
      case 'calendar':
        return <PersonalCalendar {...widgetProps} />;
      case 'archives':
        return <PersonalNotes {...widgetProps} />;
      case 'victory_recorder':
        return <PersonalVictoryRecorder {...widgetProps} />;
      default:
        return null;
    }
  };

  const personalWidgets = AVAILABLE_WIDGETS.filter(w =>
    ['best_intentions', 'tasks', 'calendar', 'archives', 'victory_recorder'].includes(w.type)
  );

  return (
    <div style={{
      background: 'var(--gradient-primary)',
      minHeight: '100vh',
      color: 'var(--text-color)',
      fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      padding: 0
    }}>
      <div style={{
        padding: '1.5rem',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '1.5rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: `1px solid var(--accent-color)`
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h1 style={{
                margin: '0 0 0.5rem 0',
                fontSize: '2rem',
                fontWeight: 600,
                color: 'var(--primary-color)',
                fontFamily: '"The Seasons", "Playfair Display", serif'
              }}>
                My Personal Dashboard
              </h1>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.95rem',
                color: 'var(--text-color)',
                opacity: 0.7,
                fontStyle: 'italic'
              }}>
                <Lock size={14} />
                <span>Private - Hidden from Family</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowAddWidget(!showAddWidget)}
                style={{
                  background: 'var(--gradient-primary)',
                  color: 'white',
                  border: 'none',
                  padding: '0.875rem 1.75rem',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Plus size={18} />
                {showAddWidget ? 'Close' : 'Add Widget'}
              </button>
            </div>
          </div>
        </div>

        {/* Widget Selector */}
        {showAddWidget && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '1.5rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: `1px solid var(--accent-color)`
          }}>
            <h3 style={{
              margin: '0 0 1.5rem 0',
              color: 'var(--primary-color)',
              fontSize: '1.5rem',
              fontWeight: 600
            }}>
              Add a Widget
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {/* Add custom personal widgets */}
              <div
                onClick={() => handleAddWidget('best_intentions' as WidgetType)}
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: `2px solid var(--accent-color)`,
                  borderRadius: '16px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
              >
                <h4 style={{
                  margin: '0 0 0.5rem 0',
                  color: 'var(--text-color)',
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}>
                  Mind Sweep
                </h4>
                <p style={{
                  margin: 0,
                  color: 'var(--text-color)',
                  opacity: 0.7,
                  fontSize: '0.9rem'
                }}>
                  Quick brain dump capture
                </p>
              </div>

              <div
                onClick={() => handleAddWidget('tasks' as WidgetType)}
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: `2px solid var(--accent-color)`,
                  borderRadius: '16px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
              >
                <h4 style={{
                  margin: '0 0 0.5rem 0',
                  color: 'var(--text-color)',
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}>
                  Gift Planning
                </h4>
                <p style={{
                  margin: 0,
                  color: 'var(--text-color)',
                  opacity: 0.7,
                  fontSize: '0.9rem'
                }}>
                  Completely private gift tracking
                </p>
              </div>

              {personalWidgets.map((widget) => (
                <div
                  key={widget.type}
                  onClick={() => handleAddWidget(widget.type)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    border: `2px solid var(--accent-color)`,
                    borderRadius: '16px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                >
                  <h4 style={{
                    margin: '0 0 0.5rem 0',
                    color: 'var(--text-color)',
                    fontSize: '1.1rem',
                    fontWeight: 600
                  }}>
                    {widget.title}
                  </h4>
                  <p style={{
                    margin: 0,
                    color: 'var(--text-color)',
                    opacity: 0.7,
                    fontSize: '0.9rem'
                  }}>
                    {widget.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Widgets Grid */}
        {config && config.widgets.length === 0 ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '4rem 2rem',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: `2px dashed var(--primary-color)`
          }}>
            <h3 style={{
              color: 'var(--primary-color)',
              fontSize: '1.75rem',
              margin: '0 0 1rem 0',
              fontFamily: '"The Seasons", "Playfair Display", serif'
            }}>
              Your Personal Sanctuary
            </h3>
            <p style={{
              color: 'var(--text-color)',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.7',
              fontSize: '1.05rem'
            }}>
              Add widgets for your eyes only - gift planning, personal goals, private notes, and more.
              This is your space for personal growth and reflection.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem'
          }}>
            {config?.widgets.map((widget) => (
              <PersonalWidgetContainer
                key={widget.id}
                widget={widget}
                onRemove={() => removeWidget(widget.id)}
                onMove={(newPosition) => updateWidgetPosition(widget.id, newPosition)}
              >
                {renderWidgetContent(widget)}
              </PersonalWidgetContainer>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalDashboard;
