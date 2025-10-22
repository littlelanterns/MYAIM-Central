// src/pages/CommandCenter.tsx - Updated with new draggable modal system
import React, { FC, CSSProperties, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BestIntentionsModal from '../components/BestIntentions/BestIntentionsModal';
import TrackerGallery from '../components/trackers/gallery/TrackerGallery';

// TypeScript interfaces
interface PageAction {
  type: 'page';
  path: string;
  title: string;
  subtitle: string;
  description: string;
}

interface ModalAction {
  type: 'modal';
  actionId: string;
  title: string;
  subtitle: string;
  description: string;
}

type CommandCenterAction = PageAction | ModalAction;

// Updated data for command center cards - Ordered by priority
const commandCenterActions: CommandCenterAction[] = [
  {
    type: 'page',
    path: '/family-dashboard',
    title: 'DASHBOARD',
    subtitle: 'Family Dashboard',
    description: 'Your family command center where chaos becomes coordination. Create tasks (or opportunities!), track progress, celebrate victories, and keep everyone moving forward together.'
  },
  {
    type: 'page',
    path: '/library',
    title: 'LIBRARY',
    subtitle: 'AI Learning Library',
    description: 'Discover AI tools, prompts, and tutorials built to amplify what you already do amazingly. This isn\'t just about making life easier—it\'s about giving moms a voice in shaping how AI impacts our families, our kids, and our future. Browse, optimize with LiLa™, and master skills that matter.'
  },
  {
    type: 'page',
    path: '/family-archive',
    title: 'ARCHIVE',
    subtitle: 'Your Archives',
    description: 'Your beautiful context vault for all those open tabs in your mom brain. Create folders for anything—family members, projects, recipes, whatever matters. Carry your context with you to any AI tool, and control exactly what AI knows about your family.'
  },
  {
    type: 'modal',
    actionId: 'best_intentions',
    title: 'BEST INTENTIONS',
    subtitle: 'Best Intentions',
    description: 'Keep what truly matters front and center. Capture the priorities that make life meaningful—deeper connections, spiritual moments, the relationships you\'re building—so LiLa™ proactively weaves them into your conversations, decisions, and daily life.'
  },
  {
    type: 'modal',
    actionId: 'inner_oracle',
    title: 'INNER ORACLE',
    subtitle: 'Inner Oracle (Coming Soon)',
    description: 'Your intuition\'s best friend. Guided reflection, mindful decision-making, and deep wisdom discovery. Because sometimes you need to hear what you already know—just said back to you in a way that finally makes sense.'
  },
  {
    type: 'modal',
    actionId: 'mindsweep',
    title: 'MINDSWEEP',
    subtitle: 'MindSweep (Coming Soon)',
    description: 'Brain dump everything—voice memos, photos, random thoughts, that thing you need to remember—and watch it organize itself into family intelligence. Clear your mental clutter and capture ideas before they vanish into the chaos of Tuesday.'
  }
];

const CommandCenter: FC = () => {
  const navigate = useNavigate();
  const [bestIntentionsOpen, setBestIntentionsOpen] = useState(false);

  const handleCardClick = (action: CommandCenterAction): void => {
    if (action.type === 'modal') {
      if (action.actionId === 'best_intentions') {
        setBestIntentionsOpen(true);
      } else if (action.actionId === 'inner_oracle') {
        navigate('/inner-oracle');
      } else if (action.actionId === 'mindsweep') {
        navigate('/mindsweep');
      }
    }
  };

  // Theme-compatible styled components
  const styles: Record<string, CSSProperties> = {
    pageWrapper: {
      background: 'var(--gradient-primary)',
      minHeight: '100vh',
      padding: '20px'
    },
    commandCenter: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    pageTitle: {
      textAlign: 'center',
      color: 'rgba(255,255,255,0.9)',
      marginBottom: '2rem',
      fontFamily: "'The Seasons', 'Playfair Display', serif",
      fontSize: '2.5rem',
      fontWeight: '600',
      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    card: {
      background: 'var(--gradient-background)',
      border: '1px solid var(--accent-color)',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      textDecoration: 'none',
      color: 'inherit',
      display: 'block',
      cursor: 'pointer',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
    },
    cardTitle: {
      color: 'var(--primary-color)',
      fontSize: '0.8rem',
      letterSpacing: '1px',
      margin: '0 0 0.25rem 0',
      fontWeight: '600',
      textTransform: 'uppercase' as const
    },
    cardSubtitle: {
      fontSize: '1.5rem',
      margin: '0 0 1rem 0',
      color: 'var(--text-color)',
      fontFamily: "'The Seasons', 'Playfair Display', serif",
      fontWeight: '600'
    },
    cardDescription: {
      fontSize: '0.9rem',
      lineHeight: '1.6',
      color: 'var(--text-color)',
      opacity: '0.8',
      margin: '0'
    }
  };

  const handleMouseOver = (e: React.MouseEvent<HTMLElement>): void => {
    const target = e.currentTarget as HTMLElement;
    target.style.transform = 'translateY(-8px) scale(1.02)';
    target.style.boxShadow = '0 12px 24px rgba(0,0,0,0.25)';
    target.style.background = 'var(--gradient-primary)';

    // Change text to white on hover
    const title = target.querySelector('h2') as HTMLElement;
    const subtitle = target.querySelector('h3') as HTMLElement;
    const description = target.querySelector('p') as HTMLElement;
    if (title) title.style.color = 'rgba(255,255,255,0.9)';
    if (subtitle) subtitle.style.color = 'white';
    if (description) description.style.color = 'rgba(255,255,255,0.9)';
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLElement>): void => {
    const target = e.currentTarget as HTMLElement;
    target.style.transform = 'translateY(0) scale(1)';
    target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
    target.style.background = 'var(--gradient-background)';

    // Reset text colors
    const title = target.querySelector('h2') as HTMLElement;
    const subtitle = target.querySelector('h3') as HTMLElement;
    const description = target.querySelector('p') as HTMLElement;
    if (title) title.style.color = 'var(--primary-color)';
    if (subtitle) subtitle.style.color = 'var(--text-color)';
    if (description) description.style.color = 'var(--text-color)';
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.commandCenter}>
        <h1 style={styles.pageTitle}>
          Command Center
        </h1>

        <div style={styles.gridContainer}>
        {commandCenterActions.map(action => (
          action.type === 'page' ? (
            <Link 
              to={action.path} 
              key={action.title} 
              style={styles.card}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
            >
              <h2 style={styles.cardTitle}>{action.title}</h2>
              <h3 style={styles.cardSubtitle}>{action.subtitle}</h3>
              <p style={styles.cardDescription}>{action.description}</p>
            </Link>
          ) : (
            <div 
              onClick={() => handleCardClick(action)} 
              key={action.title} 
              style={styles.card}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
            >
              <h2 style={styles.cardTitle}>{action.title}</h2>
              <h3 style={styles.cardSubtitle}>{action.subtitle}</h3>
              <p style={styles.cardDescription}>{action.description}</p>
            </div>
          )
        ))}
      </div>

        <BestIntentionsModal
          isOpen={bestIntentionsOpen}
          onClose={() => setBestIntentionsOpen(false)}
        />
      </div>
    </div>
  );
};

export default CommandCenter;