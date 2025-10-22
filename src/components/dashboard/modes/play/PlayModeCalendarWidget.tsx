/**
 * PlayModeCalendarWidget Component
 * Simple, visual calendar for young children
 * Features: Time-of-day activities, visual icons, simple language
 */

import React from 'react';
import { Sun, Cloud, Moon, Star } from 'lucide-react';
import './PlayModeCalendarWidget.css';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'bedtime';

export interface SimpleActivity {
  id: string;
  emoji: string;
  title: string;
  timeOfDay: TimeOfDay;
  completed?: boolean;
}

interface PlayModeCalendarWidgetProps {
  activities: SimpleActivity[];
  currentTime?: TimeOfDay;
}

export const PlayModeCalendarWidget: React.FC<PlayModeCalendarWidgetProps> = ({
  activities,
  currentTime = 'morning'
}) => {
  const timeSlots: TimeOfDay[] = ['morning', 'afternoon', 'evening', 'bedtime'];

  const getActivitiesForTime = (time: TimeOfDay) => {
    return activities.filter(a => a.timeOfDay === time);
  };

  const getTimeIcon = (time: TimeOfDay) => {
    switch (time) {
      case 'morning':
        return <Sun size={28} />;
      case 'afternoon':
        return <Cloud size={28} />;
      case 'evening':
        return <Moon size={28} />;
      case 'bedtime':
        return <Star size={28} />;
    }
  };

  const getTimeLabel = (time: TimeOfDay) => {
    switch (time) {
      case 'morning':
        return 'Morning';
      case 'afternoon':
        return 'After Lunch';
      case 'evening':
        return 'Evening';
      case 'bedtime':
        return 'Bedtime';
    }
  };

  const getTimeEmoji = (time: TimeOfDay) => {
    switch (time) {
      case 'morning':
        return '🌅';
      case 'afternoon':
        return '☀️';
      case 'evening':
        return '🌆';
      case 'bedtime':
        return '🌙';
    }
  };

  return (
    <div className="play-calendar-widget">
      <div className="calendar-header">
        <h3 className="calendar-title">📅 Today's Fun!</h3>
      </div>

      <div className="time-slots">
        {timeSlots.map(time => {
          const timeActivities = getActivitiesForTime(time);
          const isCurrent = time === currentTime;

          return (
            <div
              key={time}
              className={`time-slot ${isCurrent ? 'current' : ''} ${timeActivities.length === 0 ? 'empty' : ''}`}
            >
              <div className="time-header">
                <div className="time-icon">
                  {getTimeEmoji(time)}
                </div>
                <div className="time-label">{getTimeLabel(time)}</div>
              </div>

              {timeActivities.length > 0 ? (
                <div className="time-activities">
                  {timeActivities.map(activity => (
                    <div
                      key={activity.id}
                      className={`simple-activity ${activity.completed ? 'completed' : ''}`}
                    >
                      <span className="activity-emoji">{activity.emoji}</span>
                      <span className="activity-title">{activity.title}</span>
                      {activity.completed && (
                        <span className="activity-check">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="time-empty">Free time!</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Compact version for smaller spaces
interface CompactCalendarProps {
  activities: SimpleActivity[];
  currentTime?: TimeOfDay;
}

export const CompactCalendar: React.FC<CompactCalendarProps> = ({
  activities,
  currentTime = 'morning'
}) => {
  const currentActivities = activities.filter(a => a.timeOfDay === currentTime && !a.completed);
  const nextActivity = currentActivities[0];

  if (!nextActivity) {
    return (
      <div className="compact-calendar">
        <div className="compact-empty">
          <div className="compact-empty-icon">🎉</div>
          <div className="compact-empty-text">All done for now!</div>
        </div>
      </div>
    );
  }

  return (
    <div className="compact-calendar">
      <div className="compact-header">Next Up:</div>
      <div className="compact-activity">
        <div className="compact-activity-emoji">{nextActivity.emoji}</div>
        <div className="compact-activity-title">{nextActivity.title}</div>
      </div>
    </div>
  );
};
