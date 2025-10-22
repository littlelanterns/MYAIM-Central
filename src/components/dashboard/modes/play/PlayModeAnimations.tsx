/**
 * PlayModeAnimations Component
 * Theme-aware animations for Play Mode dashboard
 * Features: Confetti, stars, celebration effects using CSS variables
 */

import React, { useEffect, useState } from 'react';
import './PlayModeAnimations.css';

interface ConfettiParticle {
  id: string;
  left: number;
  delay: number;
  duration: number;
  rotation: number;
  color: string;
}

interface ConfettiProps {
  isActive: boolean;
  onComplete?: () => void;
  duration?: number;
}

export const Confetti: React.FC<ConfettiProps> = ({
  isActive,
  onComplete,
  duration = 3000
}) => {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    if (isActive) {
      // Generate confetti particles
      const newParticles: ConfettiParticle[] = Array.from({ length: 50 }, (_, i) => ({
        id: `confetti-${i}-${Date.now()}`,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 1,
        rotation: Math.random() * 360,
        // Use theme color classes that will be styled with CSS variables
        color: ['primary', 'secondary', 'accent'][Math.floor(Math.random() * 3)]
      }));

      setParticles(newParticles);

      // Clear particles and call onComplete after duration
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isActive, duration, onComplete]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div className="confetti-container">
      {particles.map(particle => (
        <div
          key={particle.id}
          className={`confetti-particle confetti-${particle.color}`}
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            transform: `rotate(${particle.rotation}deg)`
          }}
        />
      ))}
    </div>
  );
};

interface StarBurstProps {
  isActive: boolean;
  onComplete?: () => void;
}

export const StarBurst: React.FC<StarBurstProps> = ({ isActive, onComplete }) => {
  useEffect(() => {
    if (isActive && onComplete) {
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div className="star-burst-container">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="star-burst-particle"
          style={{
            transform: `rotate(${i * 45}deg)`
          }}
        >
          ⭐
        </div>
      ))}
    </div>
  );
};

interface PulseAnimationProps {
  children: React.ReactNode;
  isActive: boolean;
  className?: string;
}

export const PulseAnimation: React.FC<PulseAnimationProps> = ({
  children,
  isActive,
  className = ''
}) => {
  return (
    <div className={`pulse-wrapper ${isActive ? 'pulse-active' : ''} ${className}`}>
      {children}
    </div>
  );
};

interface BalloonProps {
  emoji: string;
  delay?: number;
}

const Balloon: React.FC<BalloonProps> = ({ emoji, delay = 0 }) => {
  return (
    <div
      className="balloon"
      style={{
        left: `${20 + Math.random() * 60}%`,
        animationDelay: `${delay}s`
      }}
    >
      {emoji}
    </div>
  );
};

interface BalloonCelebrationProps {
  isActive: boolean;
  onComplete?: () => void;
}

export const BalloonCelebration: React.FC<BalloonCelebrationProps> = ({
  isActive,
  onComplete
}) => {
  useEffect(() => {
    if (isActive && onComplete) {
      const timer = setTimeout(onComplete, 4000);
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive) return null;

  const balloonEmojis = ['🎈', '🎉', '🎊', '⭐', '✨', '🌟'];

  return (
    <div className="balloon-celebration-container">
      {balloonEmojis.map((emoji, i) => (
        <Balloon key={i} emoji={emoji} delay={i * 0.2} />
      ))}
    </div>
  );
};

interface SparkleEffectProps {
  isActive: boolean;
  x?: number;
  y?: number;
}

export const SparkleEffect: React.FC<SparkleEffectProps> = ({
  isActive,
  x = 50,
  y = 50
}) => {
  if (!isActive) return null;

  return (
    <div
      className="sparkle-effect"
      style={{
        left: `${x}%`,
        top: `${y}%`
      }}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="sparkle-particle"
          style={{
            transform: `rotate(${i * 30}deg)`
          }}
        >
          ✨
        </div>
      ))}
    </div>
  );
};

// Celebration orchestrator for Play Mode
interface CelebrationProps {
  isActive: boolean;
  type?: 'confetti' | 'stars' | 'balloons' | 'all';
  onComplete?: () => void;
}

export const Celebration: React.FC<CelebrationProps> = ({
  isActive,
  type = 'all',
  onComplete
}) => {
  return (
    <>
      {(type === 'confetti' || type === 'all') && (
        <Confetti isActive={isActive} onComplete={type === 'confetti' ? onComplete : undefined} />
      )}
      {(type === 'stars' || type === 'all') && (
        <StarBurst isActive={isActive} onComplete={type === 'stars' ? onComplete : undefined} />
      )}
      {(type === 'balloons' || type === 'all') && (
        <BalloonCelebration isActive={isActive} onComplete={type === 'balloons' || type === 'all' ? onComplete : undefined} />
      )}
    </>
  );
};
