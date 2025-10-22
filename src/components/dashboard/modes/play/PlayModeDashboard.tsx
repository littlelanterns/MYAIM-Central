/**
 * PlayModeDashboard Component
 * Dashboard for young children (ages 3-7)
 * Features: Large buttons, visual rewards, simple interactions
 */

import React, { useState } from 'react';
import { TemplateLayout, WidgetCard } from './PlayModeLayout';
import { PlayModeTaskWidget, Task } from './PlayModeTaskWidget';
import { PlayModeRewardWidget, RewardProgress, GamificationTheme } from './PlayModeRewardWidget';
import { PlayModeCalendarWidget, SimpleActivity, TimeOfDay } from './PlayModeCalendarWidget';
import { PlayModeVictoryRecorder } from './PlayModeVictoryRecorder';
import './PlayModeDashboard.css';

interface PlayModeDashboardProps {
  familyMemberId: string;
}

const PlayModeDashboard: React.FC<PlayModeDashboardProps> = ({ familyMemberId }) => {
  // Demo data - in real implementation, fetch from Supabase
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Brush Your Teeth',
      emoji: '🦷',
      completed: false,
      points: 10
    },
    {
      id: '2',
      title: 'Make Your Bed',
      emoji: '🛏️',
      completed: false,
      points: 10
    },
    {
      id: '3',
      title: 'Put Away Toys',
      emoji: '🧸',
      completed: false,
      points: 5
    }
  ]);

  const [rewardProgress] = useState<RewardProgress>({
    theme: 'flower-garden',
    level: 3,
    points: 45,
    pointsToNextLevel: 100,
    items: ['flower1', 'flower2', 'flower3', 'flower4', 'flower5'],
    achievements: ['First Flower!', '5 Tasks Completed', 'Super Helper']
  });

  const [activities] = useState<SimpleActivity[]>([
    {
      id: '1',
      emoji: '☀️',
      title: 'Wake Up',
      timeOfDay: 'morning',
      completed: true
    },
    {
      id: '2',
      emoji: '🍳',
      title: 'Breakfast',
      timeOfDay: 'morning'
    },
    {
      id: '3',
      emoji: '🎨',
      title: 'Art Time',
      timeOfDay: 'afternoon'
    },
    {
      id: '4',
      emoji: '🍕',
      title: 'Dinner',
      timeOfDay: 'evening'
    },
    {
      id: '5',
      emoji: '📖',
      title: 'Bedtime Story',
      timeOfDay: 'bedtime'
    }
  ]);

  const [todaysStars, setTodaysStars] = useState(12);

  const handleTaskComplete = (taskId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, completed: true }
          : task
      )
    );

    // Add stars for completed task
    const task = tasks.find(t => t.id === taskId);
    const points = task?.points || 0;
    if (points > 0) {
      setTodaysStars(prev => prev + points);
    }
  };

  const handleAddVictory = () => {
    setTodaysStars(prev => prev + 1);
  };

  const handleCelebrate = () => {
    console.log('Celebrating!', todaysStars, 'stars');
    // In real implementation, trigger AI celebration voice
  };

  // Determine current time of day (simplified)
  const getCurrentTimeOfDay = (): TimeOfDay => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 20) return 'evening';
    return 'bedtime';
  };

  return (
    <div className="play-mode-dashboard theme-transition">
      {/* Header */}
      <header className="play-header">
        <div className="play-header-content">
          <h1 className="play-title">🎮 My Fun Dashboard</h1>
          <p className="play-subtitle">Let's do great things today!</p>
        </div>
      </header>

      {/* Main Layout */}
      <div className="play-dashboard-content">
        <TemplateLayout
          template="full"
          widgets={{
            task: (
              <WidgetCard title="My Tasks" icon="📝" className="task-widget-card">
                <PlayModeTaskWidget
                  tasks={tasks}
                  onTaskComplete={handleTaskComplete}
                  maxDisplay={3}
                />
              </WidgetCard>
            ),
            reward: (
              <WidgetCard title="My Garden" icon="🌸" className="reward-widget-card">
                <PlayModeRewardWidget progress={rewardProgress} />
              </WidgetCard>
            ),
            calendar: (
              <WidgetCard title="Today" icon="📅" className="calendar-widget-card">
                <PlayModeCalendarWidget
                  activities={activities}
                  currentTime={getCurrentTimeOfDay()}
                />
              </WidgetCard>
            ),
            victory: (
              <WidgetCard title="My Stars" icon="⭐" className="victory-widget-card">
                <PlayModeVictoryRecorder
                  familyMemberId={familyMemberId}
                  todaysStars={todaysStars}
                  onAddVictory={handleAddVictory}
                  onCelebrate={handleCelebrate}
                />
              </WidgetCard>
            )
          }}
        />
      </div>
    </div>
  );
};

export default PlayModeDashboard;
