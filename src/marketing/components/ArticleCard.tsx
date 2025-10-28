import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Lightbulb, Target, Clock } from 'lucide-react';
import { Article, ArticleReactionCounts, calculateReadTime, formatDate } from '../../lib/articlesService';

interface ArticleCardProps {
  article: Article;
  reactionCounts?: ArticleReactionCounts;
  index?: number;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, reactionCounts, index = 0 }) => {
  const readTime = calculateReadTime(article.content);
  const displayDate = article.published_at ? formatDate(article.published_at) : '';

  // Category colors
  const categoryColors: Record<string, string> = {
    'AI for Moms': 'var(--primary-color)',
    'Family Life': 'var(--accent-color)',
    'Product Updates': 'var(--secondary-color)',
    'Success Stories': '#FFD700',
    'Quick Wins': '#4ECDC4',
    'What\'s New in AI': '#9B59B6'
  };

  const categoryColor = categoryColors[article.category] || 'var(--primary-color)';

  return (
    <Link
      to={`/articles/${article.slug}`}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
        marginBottom: '2rem'
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          border: '1px solid rgba(0,0,0,0.06)',
          transform: 'translateY(0)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        }}
      >
        {/* Featured Image */}
        {article.featured_image_url && (
          <div
            style={{
              width: '100%',
              height: '240px',
              overflow: 'hidden',
              position: 'relative',
              background: '#f0f0f0'
            }}
          >
            <img
              src={article.featured_image_url}
              alt={article.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.3s ease'
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.style.background = `linear-gradient(135deg, ${categoryColor}15, ${categoryColor}40)`;
                }
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            />

            {/* Category Tag - Modern pill style */}
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                color: categoryColor,
                padding: '0.5rem 1rem',
                borderRadius: '24px',
                fontSize: '0.75rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              {article.category}
            </div>
          </div>
        )}

        {/* Card Content */}
        <div style={{ padding: '1.5rem' }}>
          {/* Title */}
          <h3
            style={{
              fontSize: '1.15rem',
              fontWeight: '600',
              color: '#1a1a1a',
              marginBottom: '0.75rem',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {article.title}
          </h3>

          {/* Excerpt */}
          {article.excerpt && (
            <p
              style={{
                fontSize: '0.95rem',
                color: '#666',
                marginBottom: '1rem',
                lineHeight: 1.6,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {article.excerpt}
            </p>
          )}

          {/* Meta Row - Clean Instagram style */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
              color: '#999',
              paddingTop: '1rem',
              borderTop: '1px solid #f0f0f0'
            }}
          >
            {/* Date and Read Time */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span>{displayDate}</span>
              <span>•</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={14} />
                <span>{readTime} min read</span>
              </div>
            </div>

            {/* Reactions Preview - Minimal icons */}
            {reactionCounts && (reactionCounts.heart > 0 || reactionCounts.lightbulb > 0 || reactionCounts.target > 0) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {reactionCounts.heart > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#e74c3c' }}>
                    <Heart size={14} fill="currentColor" />
                    <span style={{ fontSize: '0.8rem' }}>{reactionCounts.heart}</span>
                  </div>
                )}
                {reactionCounts.lightbulb > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f39c12' }}>
                    <Lightbulb size={14} fill="currentColor" />
                    <span style={{ fontSize: '0.8rem' }}>{reactionCounts.lightbulb}</span>
                  </div>
                )}
                {reactionCounts.target > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#3498db' }}>
                    <Target size={14} fill="currentColor" />
                    <span style={{ fontSize: '0.8rem' }}>{reactionCounts.target}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
