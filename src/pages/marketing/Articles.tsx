import React, { useState, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import ArticleCard from '../../marketing/components/ArticleCard';
import {
  getPublishedArticles,
  getArticleReactionCounts,
  Article,
  ArticleReactionCounts
} from '../../lib/articlesService';

const Articles: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [reactionCounts, setReactionCounts] = useState<Map<string, ArticleReactionCounts>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'published_at' | 'view_count'>('published_at');

  const categories = [
    'All',
    'AI for Moms',
    'Family Life',
    'Product Updates',
    'Success Stories',
    'Quick Wins',
    'What\'s New in AI'
  ];

  useEffect(() => {
    loadArticles();
  }, [selectedCategory, sortBy]);

  const loadArticles = async () => {
    setLoading(true);
    const data = await getPublishedArticles(
      selectedCategory === 'All' ? undefined : selectedCategory,
      sortBy
    );
    setArticles(data);

    // Load reaction counts for all articles
    const counts = new Map<string, ArticleReactionCounts>();
    await Promise.all(
      data.map(async (article) => {
        const count = await getArticleReactionCounts(article.id);
        counts.set(article.id, count);
      })
    );
    setReactionCounts(counts);

    setLoading(false);
  };

  return (
    <div style={{ width: '100%', background: '#fafafa', minHeight: '100vh' }}>
      {/* Header Section - Clean modern style */}
      <section
        style={{
          background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
          padding: '5rem 2rem 4rem',
          textAlign: 'center'
        }}
      >
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
              color: 'white',
              marginBottom: '1rem',
              fontWeight: '700',
              letterSpacing: '-0.02em'
            }}
          >
            Strategies & Snippets
          </h1>
          <p
            style={{
              fontSize: '1.2rem',
              color: 'rgba(255,255,255,0.9)',
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            Real talk, real strategies, real results
          </p>
        </div>
      </section>

      {/* Filters & Sort Section - Clean modern style */}
      <section
        style={{
          background: 'white',
          padding: '1.5rem 2rem',
          borderBottom: '1px solid #e0e0e0',
          position: 'sticky',
          top: '70px',
          zIndex: 100,
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Category Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  border: 'none',
                  borderRadius: '24px',
                  background: selectedCategory === cat ? 'var(--primary-color)' : '#f5f5f5',
                  color: selectedCategory === cat ? 'white' : '#666',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== cat) {
                    e.currentTarget.style.background = '#e8e8e8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== cat) {
                    e.currentTarget.style.background = '#f5f5f5';
                  }
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Dropdown - Minimal */}
          <div style={{ position: 'relative' }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'published_at' | 'view_count')}
              style={{
                padding: '0.5rem 2rem 0.5rem 1rem',
                fontSize: '0.9rem',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                background: 'white',
                color: '#666',
                cursor: 'pointer',
                appearance: 'none'
              }}
            >
              <option value="published_at">Latest</option>
              <option value="view_count">Popular</option>
            </select>
            <ChevronDown
              size={16}
              style={{
                position: 'absolute',
                right: '0.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: '#999'
              }}
            />
          </div>
        </div>
      </section>

      {/* Articles Masonry Grid */}
      <section
        style={{
          padding: '3rem 2rem',
          maxWidth: '1400px',
          margin: '0 auto',
          minHeight: '60vh'
        }}
      >
        {loading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem',
              color: 'var(--secondary-text-color)'
            }}
          >
            Loading articles...
          </div>
        ) : articles.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem',
              color: 'var(--secondary-text-color)'
            }}
          >
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-color)' }}>
              No articles yet
            </h3>
            <p>Check back soon for strategies, snippets, and mom magic!</p>
          </div>
        ) : (
          <div
            className="masonry-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '2rem',
              gridAutoRows: '10px' // For masonry effect
            }}
          >
            {articles.map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                reactionCounts={reactionCounts.get(article.id)}
                index={index}
              />
            ))}
          </div>
        )}
      </section>

      {/* CSS for Responsive Masonry Grid */}
      <style>{`
        /* Desktop: 3 columns */
        .masonry-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        /* Tablet: 2 columns */
        @media (max-width: 1024px) {
          .masonry-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }
        }

        /* Phone: 1 column */
        @media (max-width: 640px) {
          .masonry-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        /* Show desktop decorations only on large screens */
        @media (min-width: 1200px) {
          .desktop-decoration {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Articles;
