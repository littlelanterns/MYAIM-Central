/**
 * PlayModeTaskWidget Component
 * Big, simple task completion buttons for young children
 * Features: Large touch targets, visual feedback, celebrations
 */

import React, { useState } from 'react';
import { Check, Star } from 'lucide-react';
import { Confetti, PulseAnimation } from './PlayModeAnimations';
import './PlayModeTaskWidget.css';

export interface Task {
  id: string;
  title: string;
  emoji?: string;
  imageUrl?: string;
  completed: boolean;
  points?: number;
}

interface PlayModeTaskWidgetProps {
  tasks: Task[];
  onTaskComplete: (taskId: string) => void;
  maxDisplay?: number;
}

export const PlayModeTaskWidget: React.FC<PlayModeTaskWidgetProps> = ({
  tasks,
  onTaskComplete,
  maxDisplay = 3
}) => {
  const [celebratingTaskId, setCelebratingTaskId] = useState<string | null>(null);

  const incompleteTasks = tasks.filter(t => !t.completed);
  const displayTasks = incompleteTasks.slice(0, maxDisplay);

  const handleTaskClick = (taskId: string) => {
    setCelebratingTaskId(taskId);
    onTaskComplete(taskId);

    // Clear celebration after animation
    setTimeout(() => {
      setCelebratingTaskId(null);
    }, 3000);
  };

  if (displayTasks.length === 0) {
    return (
      <div className="play-task-widget">
        <div className="play-task-empty">
          <div className="play-task-empty-icon">🎉</div>
          <h3>All Done!</h3>
          <p className="play-task-empty-message">You finished everything! Great job!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="play-task-widget">
      <div className="play-task-list">
        {displayTasks.map(task => (
          <BigTaskButton
            key={task.id}
            task={task}
            onClick={() => handleTaskClick(task.id)}
            isCelebrating={celebratingTaskId === task.id}
          />
        ))}
      </div>

      <Confetti
        isActive={celebratingTaskId !== null}
        onComplete={() => setCelebratingTaskId(null)}
      />
    </div>
  );
};

interface BigTaskButtonProps {
  task: Task;
  onClick: () => void;
  isCelebrating: boolean;
}

const BigTaskButton: React.FC<BigTaskButtonProps> = ({
  task,
  onClick,
  isCelebrating
}) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <PulseAnimation isActive={!task.completed && !isCelebrating}>
      <button
        className={`big-task-button ${isPressed ? 'pressed' : ''} ${isCelebrating ? 'celebrating' : ''}`}
        onClick={onClick}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
      >
        {/* Task Icon/Image */}
        <div className="task-visual">
          {task.imageUrl ? (
            <img
              src={task.imageUrl}
              alt={task.title}
              className="task-image"
            />
          ) : (
            <div className="task-emoji">
              {task.emoji || '✨'}
            </div>
          )}
        </div>

        {/* Task Title */}
        <div className="task-title-container">
          <h3 className="task-title">{task.title}</h3>
          {task.points && (
            <div className="task-points">
              <Star size={24} fill="currentColor" />
              <span>{task.points}</span>
            </div>
          )}
        </div>

        {/* Tap Indicator */}
        <div className="task-tap-hint">
          Tap to complete!
        </div>

        {/* Completed Overlay */}
        {isCelebrating && (
          <div className="task-completed-overlay">
            <div className="task-completed-icon">
              <Check size={80} strokeWidth={4} />
            </div>
            <div className="task-completed-text">Great Job!</div>
          </div>
        )}
      </button>
    </PulseAnimation>
  );
};

// Single Big Task Button (for showcasing one task at a time)
interface SingleTaskButtonProps {
  task: Task | null;
  onComplete: () => void;
  emptyMessage?: string;
}

export const SingleTaskButton: React.FC<SingleTaskButtonProps> = ({
  task,
  onComplete,
  emptyMessage = "No tasks right now! 🎉"
}) => {
  const [isCelebrating, setIsCelebrating] = useState(false);

  const handleClick = () => {
    setIsCelebrating(true);
    onComplete();

    setTimeout(() => {
      setIsCelebrating(false);
    }, 3000);
  };

  if (!task) {
    return (
      <div className="single-task-empty">
        <div className="single-task-empty-icon">🌟</div>
        <p className="single-task-empty-message">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="single-task-container">
      <BigTaskButton
        task={task}
        onClick={handleClick}
        isCelebrating={isCelebrating}
      />

      <Confetti
        isActive={isCelebrating}
        onComplete={() => setIsCelebrating(false)}
      />
    </div>
  );
};
