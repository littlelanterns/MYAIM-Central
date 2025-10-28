import { supabase } from './supabase';

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  category: string;
  author_id: string | null;
  published_at: string | null;
  status: 'draft' | 'published' | 'archived';
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface ArticleReaction {
  id: string;
  article_id: string;
  user_id: string;
  reaction_type: 'heart' | 'lightbulb' | 'target';
  created_at: string;
}

export interface ArticleComment {
  id: string;
  article_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  status: 'pending' | 'approved' | 'spam' | 'deleted';
  created_at: string;
  updated_at: string;
  // For nested comments
  replies?: ArticleComment[];
  user?: {
    email: string;
    user_metadata?: {
      family_name?: string;
    };
  };
}

export interface ArticleReactionCounts {
  heart: number;
  lightbulb: number;
  target: number;
}

// Fetch all published articles with optional filtering
export async function getPublishedArticles(
  category?: string,
  sortBy: 'published_at' | 'view_count' = 'published_at'
): Promise<Article[]> {
  let query = supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order(sortBy, { ascending: false });

  if (category && category !== 'All') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching articles:', error);
    return [];
  }

  return data || [];
}

// Fetch a single article by slug
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    console.error('Error fetching article:', error);
    return null;
  }

  // Increment view count
  if (data) {
    await supabase
      .from('articles')
      .update({ view_count: data.view_count + 1 })
      .eq('id', data.id);
  }

  return data;
}

// Get reaction counts for an article
export async function getArticleReactionCounts(articleId: string): Promise<ArticleReactionCounts> {
  const { data, error } = await supabase
    .from('article_reactions')
    .select('reaction_type')
    .eq('article_id', articleId);

  if (error) {
    console.error('Error fetching reactions:', error);
    return { heart: 0, lightbulb: 0, target: 0 };
  }

  const counts = { heart: 0, lightbulb: 0, target: 0 };
  data?.forEach((reaction: any) => {
    counts[reaction.reaction_type as keyof ArticleReactionCounts]++;
  });

  return counts;
}

// Check if user has reacted with specific type
export async function getUserReaction(
  articleId: string,
  userId: string,
  reactionType: 'heart' | 'lightbulb' | 'target'
): Promise<boolean> {
  const { data, error } = await supabase
    .from('article_reactions')
    .select('id')
    .eq('article_id', articleId)
    .eq('user_id', userId)
    .eq('reaction_type', reactionType)
    .single();

  return !error && !!data;
}

// Toggle a reaction (add or remove)
export async function toggleReaction(
  articleId: string,
  userId: string,
  reactionType: 'heart' | 'lightbulb' | 'target'
): Promise<{ success: boolean; added: boolean }> {
  // Check if reaction exists
  const { data: existing } = await supabase
    .from('article_reactions')
    .select('id')
    .eq('article_id', articleId)
    .eq('user_id', userId)
    .eq('reaction_type', reactionType)
    .single();

  if (existing) {
    // Remove reaction
    const { error } = await supabase
      .from('article_reactions')
      .delete()
      .eq('id', existing.id);

    return { success: !error, added: false };
  } else {
    // Add reaction
    const { error } = await supabase
      .from('article_reactions')
      .insert({
        article_id: articleId,
        user_id: userId,
        reaction_type: reactionType
      });

    return { success: !error, added: true };
  }
}

// Get comments for an article (approved only, with threading)
export async function getArticleComments(articleId: string): Promise<ArticleComment[]> {
  const { data, error } = await supabase
    .from('article_comments')
    .select(`
      *,
      user:user_id (
        email,
        user_metadata
      )
    `)
    .eq('article_id', articleId)
    .eq('status', 'approved')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }

  // Build threaded structure
  const comments = data || [];
  const topLevel: ArticleComment[] = [];
  const commentMap = new Map<string, ArticleComment>();

  // First pass: create map
  comments.forEach((comment: any) => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Second pass: build tree
  comments.forEach((comment: any) => {
    const commentWithReplies = commentMap.get(comment.id)!;
    if (comment.parent_comment_id) {
      const parent = commentMap.get(comment.parent_comment_id);
      if (parent) {
        parent.replies?.push(commentWithReplies);
      }
    } else {
      topLevel.push(commentWithReplies);
    }
  });

  return topLevel;
}

// Add a comment
export async function addComment(
  articleId: string,
  userId: string,
  content: string,
  parentCommentId?: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('article_comments')
    .insert({
      article_id: articleId,
      user_id: userId,
      content,
      parent_comment_id: parentCommentId || null,
      status: 'pending' // Comments start as pending moderation
    });

  if (error) {
    console.error('Error adding comment:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Calculate read time based on word count
export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
