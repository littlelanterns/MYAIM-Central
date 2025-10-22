/**
 * TrackerTemplateCard Component
 * Individual tracker template preview card for the gallery
 * Shows preview, name, description, and "Add" button
 * NO EMOJIS - CSS VARIABLES ONLY - THEME AWARE
 */

import React from 'react';
import { Plus, Grid, Circle, Flame, TrendingUp, BarChart, Star, Map, Palette, Heart, BookOpen, Droplets } from 'lucide-react';

interface TrackerTemplate {
  id: string;
  name: string;
  description: string;
  category: 'habit' | 'mood' | 'goal' | 'milestone' | 'kid-gamified';
  type: 'grid' | 'circle' | 'streak' | 'progress-bar' | 'chart' | 'collection' | 'gameboard' | 'coloring';
  visualStyle: 'artistic' | 'modern' | 'kid-friendly' | 'professional';
  previewImage?: string;
  icon: string;
  recommendedFor: ('preschool' | 'elementary' | 'teen' | 'adult')[];
  dashboardModes: ('play' | 'guided' | 'independent' | 'personal')[];
  tags: string[];
}

interface TrackerTemplateCardProps {
  template: TrackerTemplate;
  onAdd: () => void;
}

const TrackerTemplateCard: React.FC<TrackerTemplateCardProps> = ({ template, onAdd }) => {
  // Get icon component based on template type
  const getIcon = () => {
    const iconProps = { size: 40, strokeWidth: 1.5 };

    switch (template.type) {
      case 'grid':
        return <Grid {...iconProps} />;
      case 'circle':
        return <Circle {...iconProps} />;
      case 'streak':
        return <Flame {...iconProps} />;
      case 'progress-bar':
        return template.name.toLowerCase().includes('water') ? <Droplets {...iconProps} /> : <TrendingUp {...iconProps} />;
      case 'chart':
        return <BarChart {...iconProps} />;
      case 'collection':
        return <Star {...iconProps} />;
      case 'gameboard':
        return <Map {...iconProps} />;
      case 'coloring':
        return <Palette {...iconProps} />;
      default:
        return <Heart {...iconProps} />;
    }
  };

  // Get visual style badge color
  const getStyleColor = () => {
    switch (template.visualStyle) {
      case 'artistic':
        return { bg: 'rgba(156, 105, 173, 0.15)', text: '#9c69ad' };
      case 'modern':
        return { bg: 'rgba(52, 152, 219, 0.15)', text: '#3498db' };
      case 'kid-friendly':
        return { bg: 'rgba(241, 196, 15, 0.15)', text: '#f1c40f' };
      case 'professional':
        return { bg: 'rgba(52, 73, 94, 0.15)', text: '#34495e' };
      default:
        return { bg: 'var(--accent-color)', text: 'var(--text-color)' };
    }
  };

  const styleColors = getStyleColor();

  return (
    <div
      style={{
        background: 'var(--background-color)',
        border: '1px solid var(--accent-color)',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
        e.currentTarget.style.borderColor = 'var(--primary-color)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--accent-color)';
      }}
    >
      {/* Preview Area */}
      <div style={{
        background: 'var(--gradient-background)',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '180px',
        borderBottom: '1px solid var(--accent-color)',
        position: 'relative'
      }}>
        {/* Icon Preview */}
        <div style={{
          color: 'var(--primary-color)',
          opacity: 0.7
        }}>
          {getIcon()}
        </div>

        {/* Style Badge */}
        <div style={{
          position: 'absolute',
          top: '0.75rem',
          right: '0.75rem',
          background: styleColors.bg,
          color: styleColors.text,
          padding: '0.25rem 0.75rem',
          borderRadius: '12px',
          fontSize: '0.6875rem',
          fontWeight: 600,
          textTransform: 'capitalize',
          fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          {template.visualStyle.replace('-', ' ')}
        </div>

        {/* Category Badge */}
        <div style={{
          position: 'absolute',
          top: '0.75rem',
          left: '0.75rem',
          background: 'var(--background-color)',
          border: '1px solid var(--accent-color)',
          color: 'var(--text-color)',
          padding: '0.25rem 0.75rem',
          borderRadius: '12px',
          fontSize: '0.6875rem',
          fontWeight: 600,
          textTransform: 'capitalize',
          opacity: 0.8,
          fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          {template.category.replace('-', ' ')}
        </div>
      </div>

      {/* Content */}
      <div style={{
        padding: '1.25rem',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h3 style={{
          margin: '0 0 0.5rem 0',
          fontSize: '1.0625rem',
          fontWeight: 600,
          color: 'var(--text-color)',
          fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          lineHeight: 1.3
        }}>
          {template.name}
        </h3>

        <p style={{
          margin: '0 0 1rem 0',
          fontSize: '0.875rem',
          color: 'var(--text-color)',
          opacity: 0.7,
          fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          lineHeight: 1.5,
          flex: 1
        }}>
          {template.description}
        </p>

        {/* Tags */}
        <div style={{
          display: 'flex',
          gap: '0.375rem',
          flexWrap: 'wrap',
          marginBottom: '1rem'
        }}>
          {template.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              style={{
                background: 'var(--accent-color)',
                color: 'var(--text-color)',
                padding: '0.25rem 0.625rem',
                borderRadius: '6px',
                fontSize: '0.6875rem',
                fontWeight: 500,
                opacity: 0.7,
                fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Add Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          style={{
            width: '100%',
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem',
            cursor: 'pointer',
            fontSize: '0.9375rem',
            fontWeight: 600,
            fontFamily: 'HK Grotesk, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.opacity = '0.9';
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Plus size={18} />
          Add Tracker
        </button>
      </div>
    </div>
  );
};

export default TrackerTemplateCard;
