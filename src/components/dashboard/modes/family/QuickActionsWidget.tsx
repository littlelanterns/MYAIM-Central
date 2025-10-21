/**
 * QuickActionsWidget Component
 * Frequent family actions and shortcuts
 * NO EMOJIS - CSS VARIABLES ONLY - THEME AWARE
 */

import React from 'react';
import {
  Plus,
  Calendar,
  CheckSquare,
  Users,
  Star,
  Archive,
  MessageSquare
} from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
}

interface QuickActionsWidgetProps {
  onAddTask: () => void;
  onScheduleEvent: () => void;
  onAssignChores: () => void;
  onAddFamilyMember: () => void;
  onRecordVictory: () => void;
  onOpenArchives: () => void;
  onFamilyChat: () => void;
}

const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({
  onAddTask,
  onScheduleEvent,
  onAssignChores,
  onAddFamilyMember,
  onRecordVictory,
  onOpenArchives,
  onFamilyChat
}) => {
  const quickActions: QuickAction[] = [
    {
      id: 'add-task',
      label: 'Create Task',
      icon: <Plus size={18} />,
      onClick: onAddTask
    },
    {
      id: 'schedule-event',
      label: 'Schedule Event',
      icon: <Calendar size={18} />,
      onClick: onScheduleEvent
    },
    {
      id: 'assign-chores',
      label: 'Assign Chores',
      icon: <CheckSquare size={18} />,
      onClick: onAssignChores
    },
    {
      id: 'add-member',
      label: 'Add Member',
      icon: <Users size={18} />,
      onClick: onAddFamilyMember
    },
    {
      id: 'record-victory',
      label: 'Record Victory',
      icon: <Star size={18} />,
      onClick: onRecordVictory
    },
    {
      id: 'open-archives',
      label: 'View Archives',
      icon: <Archive size={18} />,
      onClick: onOpenArchives
    },
    {
      id: 'family-chat',
      label: 'Family Chat',
      icon: <MessageSquare size={18} />,
      onClick: onFamilyChat
    }
  ];

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
        Quick Actions
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '0.75rem'
      }}>
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            style={{
              background: 'var(--background-color)',
              border: '1px solid var(--accent-color)',
              borderRadius: '8px',
              padding: '1rem 0.75rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              color: 'var(--text-color)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'var(--primary-color)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = 'var(--primary-color)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'var(--background-color)';
              e.currentTarget.style.color = 'var(--text-color)';
              e.currentTarget.style.borderColor = 'var(--accent-color)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {action.icon}
            </div>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              textAlign: 'center'
            }}>
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsWidget;
