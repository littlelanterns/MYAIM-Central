import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Lightbulb, Target, Clock, ArrowLeft, Send } from 'lucide-react';
import {
  getArticleBySlug,
  getArticleReactionCounts,
  getArticleComments,
  toggleReaction,
  addComment,
  Article,
  ArticleReactionCounts,
  ArticleComment,
  calculateReadTime,
  formatDate
} from '../../lib/articlesService';
import { PaperClip, Thumbtack, CrayonStar, NotebookSpiral } from '../../marketing/components/RealisticElements';
import { supabase } from '../../lib/supabase';

const ArticleDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [article, setArticle] = useState<Article | null>(null);
  const [reactionCounts, setReactionCounts] = useState<ArticleReactionCounts>({ heart: 0, lightbulb: 0, target: 0 });
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadArticle();
    checkAuth();
  }, [slug]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const loadArticle = async () => {
    if (!slug) return;

    setLoading(true);
    const data = await getArticleBySlug(slug);

    if (!data) {
      setLoading(false);
      return;
    }

    setArticle(data);

    // Load reactions
    const counts = await getArticleReactionCounts(data.id);
    setReactionCounts(counts);

    // Load comments
    const commentsData = await getArticleComments(data.id);
    setComments(commentsData);

    setLoading(false);
  };

  const handleReaction = async (type: 'heart' | 'lightbulb' | 'target') => {
    if (!user || !article) {
      alert('Please log in to react to articles');
      return;
    }

    const result = await toggleReaction(article.id, user.id, type);

    if (result.success) {
      // Update local state
      const newCounts = { ...reactionCounts };
      if (result.added) {
        newCounts[type]++;
        setUserReactions(new Set(userReactions).add(type));
      } else {
        newCounts[type]--;
        const newUserReactions = new Set(userReactions);
        newUserReactions.delete(type);
        setUserReactions(newUserReactions);
      }
      setReactionCounts(newCounts);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !article) {
      alert('Please log in to comment');
      return;
    }

    if (!commentText.trim()) return;

    const result = await addComment(article.id, user.id, commentText, replyingTo || undefined);

    if (result.success) {
      setCommentText('');
      setReplyingTo(null);
      alert('Comment submitted for moderation. It will appear after approval.');
      // Reload comments
      const commentsData = await getArticleComments(article.id);
      setComments(commentsData);
    } else {
      alert('Error submitting comment: ' + result.error);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--secondary-text-color)'
      }}>
        Loading article...
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem'
      }}>
        <h2 style={{ color: 'var(--text-color)' }}>Article not found</h2>
        <button
          onClick={() => navigate('/articles')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          Back to Articles
        </button>
      </div>
    );
  }

  const readTime = calculateReadTime(article.content);
  const displayDate = article.published_at ? formatDate(article.published_at) : '';

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* Decorative elements */}
      <div style={{
        position: 'absolute',
        top: '100px',
        right: '5%',
        display: 'none'
      }} className="desktop-decoration">
        <PaperClip rotation={25} color="#C0C0C0" />
      </div>
      <div style={{
        position: 'absolute',
        top: '300px',
        left: '3%',
        display: 'none'
      }} className="desktop-decoration">
        <CrayonStar rotation={-15} color="var(--accent-color)" />
      </div>

      <article style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/articles')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--primary-color)',
            cursor: 'pointer',
            fontSize: '1rem',
            marginBottom: '2rem',
            padding: '0.5rem 0'
          }}
        >
          <ArrowLeft size={20} />
          Back to Articles
        </button>

        {/* Hero Section */}
        {article.featured_image_url && (
          <div
            style={{
              width: '100%',
              height: '400px',
              borderRadius: '16px',
              overflow: 'hidden',
              marginBottom: '2rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              position: 'relative'
            }}
          >
            {/* Decorative thumbtack */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10
            }}>
              <Thumbtack rotation={5} color="var(--primary-color)" />
            </div>

            <img
              src={article.featured_image_url}
              alt={article.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        )}

        {/* Article Header */}
        <header style={{ marginBottom: '3rem' }}>
          {/* Category Tag */}
          <div
            style={{
              display: 'inline-block',
              background: 'var(--primary-color)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '1.5rem'
            }}
          >
            {article.category}
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 'bold',
              color: 'var(--text-color)',
              marginBottom: '1.5rem',
              lineHeight: 1.2
            }}
          >
            {article.title}
          </h1>

          {/* Meta Info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
              color: 'var(--secondary-text-color)',
              fontSize: '0.95rem',
              paddingBottom: '1.5rem',
              borderBottom: '2px solid var(--accent-color)'
            }}
          >
            <span>{displayDate}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} />
              <span>{readTime} min read</span>
            </div>
            <span>{article.view_count} views</span>
          </div>
        </header>

        {/* Article Content */}
        <div
          style={{
            fontSize: '1.1rem',
            lineHeight: 1.8,
            color: 'var(--text-color)',
            marginBottom: '3rem'
          }}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Reactions Bar */}
        <div
          style={{
            background: 'var(--accent-color)',
            padding: '2rem',
            borderRadius: '16px',
            marginBottom: '3rem'
          }}
        >
          <h3
            style={{
              fontSize: '1.3rem',
              fontWeight: 'bold',
              color: 'var(--text-color)',
              marginBottom: '1.5rem'
            }}
          >
            How did this article help you?
          </h3>
          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              flexWrap: 'wrap'
            }}
          >
            {/* Heart Reaction */}
            <button
              onClick={() => handleReaction('heart')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1rem 1.5rem',
                background: userReactions.has('heart') ? 'var(--primary-color)' : 'white',
                color: userReactions.has('heart') ? 'white' : 'var(--text-color)',
                border: '2px solid var(--primary-color)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '1rem'
              }}
            >
              <Heart size={28} fill={userReactions.has('heart') ? 'currentColor' : 'none'} />
              <span style={{ fontWeight: 'bold' }}>{reactionCounts.heart}</span>
              <span style={{ fontSize: '0.85rem' }}>Love it</span>
            </button>

            {/* Lightbulb Reaction */}
            <button
              onClick={() => handleReaction('lightbulb')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1rem 1.5rem',
                background: userReactions.has('lightbulb') ? 'var(--primary-color)' : 'white',
                color: userReactions.has('lightbulb') ? 'white' : 'var(--text-color)',
                border: '2px solid var(--primary-color)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '1rem'
              }}
            >
              <Lightbulb size={28} fill={userReactions.has('lightbulb') ? 'currentColor' : 'none'} />
              <span style={{ fontWeight: 'bold' }}>{reactionCounts.lightbulb}</span>
              <span style={{ fontSize: '0.85rem' }}>Mind blown</span>
            </button>

            {/* Target Reaction */}
            <button
              onClick={() => handleReaction('target')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1rem 1.5rem',
                background: userReactions.has('target') ? 'var(--primary-color)' : 'white',
                color: userReactions.has('target') ? 'white' : 'var(--text-color)',
                border: '2px solid var(--primary-color)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '1rem'
              }}
            >
              <Target size={28} fill={userReactions.has('target') ? 'currentColor' : 'none'} />
              <span style={{ fontWeight: 'bold' }}>{reactionCounts.target}</span>
              <span style={{ fontSize: '0.85rem' }}>Will try</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div style={{ marginBottom: '3rem' }}>
          <h3
            style={{
              fontSize: '1.8rem',
              fontWeight: 'bold',
              color: 'var(--text-color)',
              marginBottom: '1.5rem'
            }}
          >
            Comments ({comments.length})
          </h3>

          {/* Add Comment Form */}
          {user ? (
            <div
              style={{
                background: 'var(--accent-color)',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '2rem'
              }}
            >
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '1rem',
                  fontSize: '1rem',
                  border: '2px solid var(--primary-color)',
                  borderRadius: '8px',
                  background: 'white',
                  color: 'var(--text-color)',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
              <button
                onClick={handleSubmitComment}
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem 1.5rem',
                  background: 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Send size={18} />
                Submit Comment
              </button>
              <p style={{
                marginTop: '0.75rem',
                fontSize: '0.85rem',
                color: 'var(--secondary-text-color)'
              }}>
                Comments are moderated and will appear after approval.
              </p>
            </div>
          ) : (
            <div
              style={{
                background: 'var(--accent-color)',
                padding: '1.5rem',
                borderRadius: '12px',
                textAlign: 'center',
                marginBottom: '2rem'
              }}
            >
              <p style={{ color: 'var(--text-color)' }}>
                Please <a href="/login" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>log in</a> to comment.
              </p>
            </div>
          )}

          {/* Display Comments */}
          {comments.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--secondary-text-color)', padding: '2rem' }}>
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} level={0} />
              ))}
            </div>
          )}
        </div>
      </article>

      {/* Desktop decoration styles */}
      <style>{`
        @media (min-width: 1200px) {
          .desktop-decoration {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

// Comment component with threading
const CommentItem: React.FC<{ comment: ArticleComment; level: number }> = ({ comment, level }) => {
  const displayName = comment.user?.user_metadata?.family_name || comment.user?.email || 'Anonymous';

  return (
    <div
      style={{
        marginLeft: level > 0 ? '2rem' : '0',
        paddingLeft: level > 0 ? '1.5rem' : '0',
        borderLeft: level > 0 ? '3px solid var(--accent-color)' : 'none'
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '1.25rem',
          borderRadius: '12px',
          border: '1px solid var(--accent-color)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.75rem'
          }}
        >
          <span
            style={{
              fontWeight: 'bold',
              color: 'var(--text-color)'
            }}
          >
            {displayName}
          </span>
          <span
            style={{
              fontSize: '0.85rem',
              color: 'var(--secondary-text-color)'
            }}
          >
            {formatDate(comment.created_at)}
          </span>
        </div>
        <p
          style={{
            color: 'var(--text-color)',
            lineHeight: 1.6
          }}
        >
          {comment.content}
        </p>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ArticleDetail;
