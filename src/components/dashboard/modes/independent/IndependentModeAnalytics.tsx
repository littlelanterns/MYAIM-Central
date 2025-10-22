/**
 * IndependentModeAnalytics Component
 * Analytics and insights dashboard for teens
 * Features: Task completion stats, victory tracking, productivity insights
 * All colors via CSS variables for theme compatibility
 */

import React, { useState, useMemo } from 'react';
import '../independent/IndependentMode.css';

interface AnalyticsProps {
  familyMemberId: string;
  viewMode?: 'self' | 'parent';
}

interface TaskStats {
  completedToday: number;
  completedThisWeek: number;
  completedThisMonth: number;
  totalTasks: number;
  completionRate: number;
  averageCompletionTime: number; // in hours
  onTimeRate: number;
}

interface VictoryStats {
  totalVictories: number;
  victoriesThisWeek: number;
  victoriesThisMonth: number;
  longestStreak: number;
  currentStreak: number;
  categoryCounts: Record<string, number>;
}

interface ProductivityData {
  date: string;
  tasksCompleted: number;
  victoriesRecorded: number;
  timeSpent: number; // in minutes
}

interface GoalProgress {
  goalId: string;
  goalName: string;
  progress: number; // 0-100
  target: number;
  current: number;
  unit: string;
  deadline?: string;
  category: string;
}

type TimeRange = 'week' | 'month' | 'quarter' | 'year';
type ChartView = 'tasks' | 'victories' | 'productivity';

export const IndependentModeAnalytics: React.FC<AnalyticsProps> = ({
  familyMemberId,
  viewMode = 'self'
}) => {
  // State
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [chartView, setChartView] = useState<ChartView>('tasks');
  const [showInsights, setShowInsights] = useState(true);

  // Mock data - in real implementation, fetch from Supabase
  const taskStats: TaskStats = {
    completedToday: 8,
    completedThisWeek: 42,
    completedThisMonth: 156,
    totalTasks: 180,
    completionRate: 86.7,
    averageCompletionTime: 2.5,
    onTimeRate: 92.3
  };

  const victoryStats: VictoryStats = {
    totalVictories: 87,
    victoriesThisWeek: 12,
    victoriesThisMonth: 45,
    longestStreak: 14,
    currentStreak: 7,
    categoryCounts: {
      academic: 28,
      'personal-growth': 22,
      relationships: 15,
      health: 12,
      creative: 10
    }
  };

  // Generate mock productivity data for the selected time range
  const productivityData: ProductivityData[] = useMemo(() => {
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : timeRange === 'quarter' ? 90 : 365;
    const data: ProductivityData[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        tasksCompleted: Math.floor(Math.random() * 12) + 2,
        victoriesRecorded: Math.floor(Math.random() * 4),
        timeSpent: Math.floor(Math.random() * 180) + 30
      });
    }
    return data;
  }, [timeRange]);

  const goalProgress: GoalProgress[] = [
    {
      goalId: '1',
      goalName: 'Read 20 books this year',
      progress: 65,
      target: 20,
      current: 13,
      unit: 'books',
      deadline: '2025-12-31',
      category: 'academic'
    },
    {
      goalId: '2',
      goalName: 'Exercise 4 times per week',
      progress: 80,
      target: 16,
      current: 13,
      unit: 'workouts',
      category: 'health'
    },
    {
      goalId: '3',
      goalName: 'Learn Spanish (30 min/day)',
      progress: 42,
      target: 30,
      current: 12.6,
      unit: 'hours',
      category: 'personal-growth'
    }
  ];

  // Calculate insights
  const insights = useMemo(() => {
    const avgTasksPerDay = (taskStats.completedThisWeek / 7).toFixed(1);
    const avgVictoriesPerWeek = victoryStats.victoriesThisWeek;
    const topCategory = Object.entries(victoryStats.categoryCounts)
      .sort(([, a], [, b]) => b - a)[0];

    return [
      {
        title: 'Strong Momentum',
        description: `You're completing an average of ${avgTasksPerDay} tasks per day. Keep up the great work!`,
        type: 'positive' as const
      },
      {
        title: 'Victory Tracking',
        description: `${avgVictoriesPerWeek} victories recorded this week. Remember to celebrate your wins!`,
        type: 'neutral' as const
      },
      {
        title: 'Top Category',
        description: `Most victories in ${topCategory[0].replace('-', ' ')} (${topCategory[1]} total)`,
        type: 'info' as const
      },
      {
        title: 'On-Time Performance',
        description: `${taskStats.onTimeRate}% of tasks completed on or before deadline`,
        type: 'positive' as const
      }
    ];
  }, [taskStats, victoryStats]);

  // Calculate max value for chart scaling
  const maxChartValue = useMemo(() => {
    if (chartView === 'tasks') {
      return Math.max(...productivityData.map(d => d.tasksCompleted), 10);
    } else if (chartView === 'victories') {
      return Math.max(...productivityData.map(d => d.victoriesRecorded), 5);
    } else {
      return Math.max(...productivityData.map(d => d.timeSpent), 100);
    }
  }, [productivityData, chartView]);

  return (
    <div className="independent-analytics-container">
      {/* Header */}
      <div className="independent-analytics-header">
        <h2 className="independent-analytics-title">Analytics & Insights</h2>
        <div className="independent-analytics-controls">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="independent-select"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 90 Days</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="independent-analytics-stats-grid">
        <div className="independent-stat-card">
          <div className="independent-stat-label">Today</div>
          <div className="independent-stat-value">{taskStats.completedToday}</div>
          <div className="independent-stat-sublabel">tasks completed</div>
        </div>

        <div className="independent-stat-card">
          <div className="independent-stat-label">This Week</div>
          <div className="independent-stat-value">{taskStats.completedThisWeek}</div>
          <div className="independent-stat-sublabel">tasks completed</div>
        </div>

        <div className="independent-stat-card">
          <div className="independent-stat-label">Completion Rate</div>
          <div className="independent-stat-value">{taskStats.completionRate}%</div>
          <div className="independent-stat-sublabel">of all tasks</div>
        </div>

        <div className="independent-stat-card">
          <div className="independent-stat-label">Current Streak</div>
          <div className="independent-stat-value">{victoryStats.currentStreak}</div>
          <div className="independent-stat-sublabel">days with victories</div>
        </div>
      </div>

      {/* Chart */}
      <div className="independent-analytics-chart-container">
        <div className="independent-analytics-chart-header">
          <h3 className="independent-analytics-chart-title">Productivity Over Time</h3>
          <div className="independent-analytics-chart-tabs">
            <button
              className={`independent-tab-button ${chartView === 'tasks' ? 'active' : ''}`}
              onClick={() => setChartView('tasks')}
            >
              Tasks
            </button>
            <button
              className={`independent-tab-button ${chartView === 'victories' ? 'active' : ''}`}
              onClick={() => setChartView('victories')}
            >
              Victories
            </button>
            <button
              className={`independent-tab-button ${chartView === 'productivity' ? 'active' : ''}`}
              onClick={() => setChartView('productivity')}
            >
              Time
            </button>
          </div>
        </div>

        <div className="independent-chart">
          <div className="independent-chart-grid">
            {productivityData.map((data, index) => {
              const value = chartView === 'tasks' ? data.tasksCompleted :
                           chartView === 'victories' ? data.victoriesRecorded :
                           data.timeSpent;
              const height = (value / maxChartValue) * 100;

              return (
                <div key={index} className="independent-chart-bar-wrapper">
                  <div
                    className="independent-chart-bar"
                    style={{ height: `${height}%` }}
                    title={`${new Date(data.date).toLocaleDateString()}: ${value} ${
                      chartView === 'tasks' ? 'tasks' :
                      chartView === 'victories' ? 'victories' :
                      'minutes'
                    }`}
                  >
                    <span className="independent-chart-bar-value">{value}</span>
                  </div>
                  {timeRange === 'week' && (
                    <div className="independent-chart-bar-label">
                      {new Date(data.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Victory Category Breakdown */}
      <div className="independent-analytics-section">
        <h3 className="independent-analytics-section-title">Victory Categories</h3>
        <div className="independent-category-breakdown">
          {Object.entries(victoryStats.categoryCounts).map(([category, count]) => {
            const total = Object.values(victoryStats.categoryCounts).reduce((a, b) => a + b, 0);
            const percentage = (count / total) * 100;

            return (
              <div key={category} className="independent-category-bar-wrapper">
                <div className="independent-category-bar-header">
                  <span className="independent-category-bar-label">
                    {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span className="independent-category-bar-count">{count}</span>
                </div>
                <div className="independent-category-bar-track">
                  <div
                    className="independent-category-bar-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Goal Progress */}
      <div className="independent-analytics-section">
        <h3 className="independent-analytics-section-title">Goal Progress</h3>
        <div className="independent-goal-progress-grid">
          {goalProgress.map(goal => (
            <div key={goal.goalId} className="independent-goal-progress-card">
              <div className="independent-goal-progress-header">
                <h4 className="independent-goal-progress-title">{goal.goalName}</h4>
                <span className="independent-goal-progress-percentage">{goal.progress}%</span>
              </div>
              <div className="independent-goal-progress-bar">
                <div
                  className="independent-goal-progress-fill"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              <div className="independent-goal-progress-details">
                <span>{goal.current} / {goal.target} {goal.unit}</span>
                {goal.deadline && (
                  <span className="independent-goal-deadline">
                    Due: {new Date(goal.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      {showInsights && (
        <div className="independent-analytics-section">
          <div className="independent-analytics-section-header">
            <h3 className="independent-analytics-section-title">Insights</h3>
            <button
              className="independent-text-button"
              onClick={() => setShowInsights(false)}
            >
              Hide
            </button>
          </div>
          <div className="independent-insights-grid">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`independent-insight-card independent-insight-${insight.type}`}
              >
                <h4 className="independent-insight-title">{insight.title}</h4>
                <p className="independent-insight-description">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IndependentModeAnalytics;
