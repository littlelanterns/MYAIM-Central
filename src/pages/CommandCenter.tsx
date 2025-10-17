// src/pages/CommandCenter.tsx - Updated with new draggable modal system
import React, { FC, CSSProperties, useState } from 'react';
import { Link } from 'react-router-dom';
import { useModal } from '../hooks/useModal';
import BestIntentionsModal from '../components/BestIntentions/BestIntentionsModal';

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

// Updated data for command center cards
const commandCenterActions: CommandCenterAction[] = [
  {
    type: 'page',
    path: '/family-dashboard',
    title: 'DASHBOARD',
    subtitle: 'Family Dashboard',
    description: 'Complete family overview with task creation, progress tracking, victory celebrations, and AI-powered insights.'
  },
  {
    type: 'modal',
    actionId: 'best_intentions',
    title: 'BEST INTENTIONS',
    subtitle: 'Best Intentions',
    description: 'Your compass for what matters most. Keep priorities and goals front of mind so LiLa™ supports your journey.'
  },
  {
    type: 'page',
    path: '/family-archive',
    title: 'ARCHIVE',
    subtitle: 'Your Archives',
    description: 'Your digital filing system for family members, context, and memories. Beautiful organization that replaces notebooks.'
  },
  {
    type: 'modal',
    actionId: 'inner_oracle',
    title: 'INNER ORACLE',
    subtitle: 'Inner Oracle (Coming Soon)',
    description: 'Connect with your intuition and inner wisdom through guided reflection and mindful decision-making tools. Currently in development.'
  },
  {
    type: 'page',
    path: '/library',
    title: 'LIBRARY',
    subtitle: 'AI Learning Library',
    description: 'Vault-style browsing for AI prompts, tutorials, and learning resources. Discover and optimize content with LiLa™.'
  }
];

const CommandCenter: FC = () => {
  const { open } = useModal();
  const [bestIntentionsOpen, setBestIntentionsOpen] = useState(false);

  const handleCardClick = (action: CommandCenterAction): void => {
    if (action.type === 'modal') {
      if (action.actionId === 'best_intentions') {
        setBestIntentionsOpen(true);
      } else if (action.actionId === 'inner_oracle') {
        open('Inner Oracle', (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(104, 163, 149, 0.1), rgba(255, 244, 236, 0.8))',
            borderRadius: '12px',
            margin: '20px'
          }}>
            <h2 style={{ 
              fontSize: '2rem', 
              color: 'var(--primary-color, #68a395)', 
              marginBottom: '24px',
              fontFamily: "'The Seasons', 'Playfair Display', serif"
            }}>
              ✨ Coming Soon ✨
            </h2>
            <p style={{ 
              fontSize: '1.2rem', 
              marginBottom: '20px', 
              color: 'var(--text-color, #5a4033)',
              fontWeight: '500'
            }}>
              Inner Oracle
            </p>
            <p style={{ 
              fontSize: '1rem', 
              color: 'var(--text-color, #5a4033)', 
              opacity: 0.8,
              lineHeight: '1.6',
              maxWidth: '400px',
              margin: '0 auto'
            }}>
              Connect with your intuition and inner wisdom through guided reflection tools, meditation prompts, and mindful decision-making aids.
            </p>
            <div style={{
              marginTop: '30px',
              padding: '16px',
              background: 'rgba(104, 163, 149, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(104, 163, 149, 0.2)'
            }}>
              <p style={{ 
                fontSize: '0.9rem', 
                color: 'var(--text-color, #5a4033)', 
                opacity: 0.7,
                margin: 0
              }}>
                This feature is currently in development and will be available in a future update.
              </p>
            </div>
          </div>
        ), 'medium');
      }
    }
  };

  // Theme-compatible styled components
  const styles: Record<string, CSSProperties> = {
    commandCenter: {
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    pageTitle: {
      textAlign: 'center',
      color: 'var(--primary-color, #68a395)',
      marginBottom: '2rem',
      fontFamily: "'The Seasons', 'Playfair Display', serif",
      fontSize: '2.5rem',
      fontWeight: '600',
      textShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      marginBottom: '2rem'
    },
    card: {
      background: 'var(--gradient-background, linear-gradient(135deg, var(--background-color, #fff4ec) 0%, var(--accent-color, #d4e3d9) 100%))',
      border: '1px solid var(--accent-color, #d4e3d9)',
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
      color: 'var(--primary-color, #68a395)',
      fontSize: '0.8rem',
      letterSpacing: '1px',
      margin: '0 0 0.25rem 0',
      fontWeight: '600',
      textTransform: 'uppercase' as const
    },
    cardSubtitle: {
      fontSize: '1.5rem',
      margin: '0 0 1rem 0',
      color: 'var(--text-color, #333)',
      fontFamily: "'The Seasons', 'Playfair Display', serif",
      fontWeight: '600'
    },
    cardDescription: {
      fontSize: '0.9rem',
      lineHeight: '1.6',
      color: 'var(--text-color, #5a4033)',
      opacity: '0.8',
      margin: '0'
    }
  };

  const handleMouseOver = (e: React.MouseEvent<HTMLElement>): void => {
    const target = e.currentTarget as HTMLElement;
    target.style.transform = 'translateY(-8px) scale(1.02)';
    target.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
    target.style.background = 'var(--gradient-primary, linear-gradient(135deg, var(--primary-color, #68a395), var(--secondary-color, #d6a461)))';
    // Change text color on hover
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
    target.style.background = 'var(--gradient-background, linear-gradient(135deg, var(--background-color, #fff4ec) 0%, var(--accent-color, #d4e3d9) 100%))';
    // Reset text colors
    const title = target.querySelector('h2') as HTMLElement;
    const subtitle = target.querySelector('h3') as HTMLElement;
    const description = target.querySelector('p') as HTMLElement;
    if (title) title.style.color = 'var(--primary-color, #68a395)';
    if (subtitle) subtitle.style.color = 'var(--text-color, #333)';
    if (description) description.style.color = 'var(--text-color, #5a4033)';
  };

  return (
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
  );
};

export default CommandCenter;