import { supabase } from '../lib/supabase';

/**
 * Library Service - Handles all data operations for the tutorial library
 */
export class LibraryService {
  
  // ===== TUTORIAL OPERATIONS =====
  
  /**
   * Get all published tutorials organized by category
   */
  static async getTutorialsByCategory() {
    try {
      const { data, error } = await supabase
        .from('library_items')
        .select(`
          *,
          library_categories(display_name, color_hex, icon_name, description)
        `)
        .eq('status', 'published')
        .order('category')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group tutorials by category
      const categoriesMap = {};
      data.forEach(tutorial => {
        if (!categoriesMap[tutorial.category]) {
          categoriesMap[tutorial.category] = {
            id: tutorial.category,
            display_name: tutorial.library_categories?.display_name || tutorial.category,
            color_hex: tutorial.library_categories?.color_hex || '#68a395',
            icon_name: tutorial.library_categories?.icon_name,
            description: tutorial.library_categories?.description,
            tutorials: []
          };
        }
        categoriesMap[tutorial.category].tutorials.push(tutorial);
      });

      return Object.values(categoriesMap);
    } catch (error) {
      console.error('Error fetching tutorials by category:', error);
      return [];
    }
  }

  /**
   * Get featured tutorials for hero section
   */
  static async getFeaturedTutorials(limit = 5) {
    try {
      const { data, error } = await supabase
        .from('library_items')
        .select('*')
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching featured tutorials:', error);
      return [];
    }
  }

  /**
   * Search tutorials by title, description, tags, or tools
   */
  static async searchTutorials(query, filters = {}) {
    try {
      let queryBuilder = supabase
        .from('library_items')
        .select('*')
        .eq('status', 'published');

      // Text search across multiple fields
      if (query) {
        queryBuilder = queryBuilder.or(`
          title.ilike.%${query}%,
          description.ilike.%${query}%,
          short_description.ilike.%${query}%,
          tags.cs.{${query}},
          tools_mentioned.cs.{${query}}
        `);
      }

      // Category filter
      if (filters.category) {
        queryBuilder = queryBuilder.eq('category', filters.category);
      }

      // Difficulty filter
      if (filters.difficulty) {
        queryBuilder = queryBuilder.eq('difficulty_level', filters.difficulty);
      }

      // Content type filter
      if (filters.contentType) {
        queryBuilder = queryBuilder.eq('content_type', filters.contentType);
      }

      // Subscription tier filter
      if (filters.maxTier) {
        const { data: tiers } = await supabase
          .from('subscription_tiers')
          .select('tier_name, tier_level')
          .lte('tier_level', filters.maxTier);
        
        const allowedTiers = tiers.map(t => t.tier_name);
        queryBuilder = queryBuilder.in('required_tier', allowedTiers);
      }

      const { data, error } = await queryBuilder
        .order('view_count', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching tutorials:', error);
      return [];
    }
  }

  /**
   * Get a single tutorial by ID
   */
  static async getTutorialById(id) {
    try {
      const { data, error } = await supabase
        .from('library_items')
        .select('*')
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching tutorial:', error);
      return null;
    }
  }

  // ===== USER INTERACTION OPERATIONS =====

  /**
   * Get user's bookmarked tutorials
   */
  static async getUserBookmarks(userId) {
    try {
      const { data, error } = await supabase
        .from('user_library_bookmarks')
        .select(`
          library_item_id,
          created_at,
          library_items(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user bookmarks:', error);
      return [];
    }
  }

  /**
   * Get user's tutorial progress
   */
  static async getUserProgress(userId) {
    try {
      const { data, error } = await supabase
        .from('user_library_progress')
        .select(`
          *,
          library_items(title, thumbnail_url, category)
        `)
        .eq('user_id', userId)
        .order('last_accessed', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return [];
    }
  }

  /**
   * Toggle bookmark for a tutorial
   */
  static async toggleBookmark(userId, tutorialId) {
    try {
      // Check if bookmark exists
      const { data: existing } = await supabase
        .from('user_library_bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('library_item_id', tutorialId)
        .single();

      if (existing) {
        // Remove bookmark
        const { error } = await supabase
          .from('user_library_bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('library_item_id', tutorialId);

        if (error) throw error;
        return { bookmarked: false };
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('user_library_bookmarks')
          .insert({
            user_id: userId,
            library_item_id: tutorialId
          });

        if (error) throw error;
        return { bookmarked: true };
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw error;
    }
  }

  /**
   * Update tutorial progress
   */
  static async updateProgress(userId, tutorialId, progressData) {
    try {
      const updateData = {
        user_id: userId,
        library_item_id: tutorialId,
        last_accessed: new Date().toISOString(),
        ...progressData
      };

      if (progressData.progress_percent === 100) {
        updateData.completed_at = new Date().toISOString();
        updateData.status = 'completed';
      }

      const { data, error } = await supabase
        .from('user_library_progress')
        .upsert(updateData)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  }

  // ===== SUBSCRIPTION ACCESS =====

  /**
   * Check if user has access to a tutorial based on subscription tier
   */
  static async checkTutorialAccess(userId, tutorialId) {
    try {
      // Get tutorial's required tier
      const { data: tutorial } = await supabase
        .from('library_items')
        .select('required_tier')
        .eq('id', tutorialId)
        .single();

      if (!tutorial) return false;

      // Get user's subscription tier
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('subscription_tier')
        .eq('user_id', userId)
        .single();

      return await this.hasSubscriptionAccess(
        userProfile?.subscription_tier || 'free',
        tutorial.required_tier
      );
    } catch (error) {
      console.error('Error checking tutorial access:', error);
      return false;
    }
  }

  /**
   * Check if user tier has access to required tier
   */
  static async hasSubscriptionAccess(userTier, requiredTier) {
    try {
      const { data: tiers } = await supabase
        .from('subscription_tiers')
        .select('tier_name, tier_level');
      
      const userLevel = tiers.find(t => t.tier_name === userTier)?.tier_level || 0;
      const requiredLevel = tiers.find(t => t.tier_name === requiredTier)?.tier_level || 1;
      
      return userLevel >= requiredLevel;
    } catch (error) {
      console.error('Error checking subscription access:', error);
      return false;
    }
  }

  // ===== ANALYTICS =====

  /**
   * Track tutorial view
   */
  static async trackTutorialView(tutorialId) {
    try {
      const { error } = await supabase
        .from('library_items')
        .update({ 
          view_count: supabase.raw('view_count + 1') 
        })
        .eq('id', tutorialId);

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking tutorial view:', error);
    }
  }

  /**
   * Get popular tutorials (most viewed)
   */
  static async getPopularTutorials(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('library_items')
        .select('*')
        .eq('status', 'published')
        .order('view_count', { ascending: false })
        .order('bookmark_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching popular tutorials:', error);
      return [];
    }
  }

  /**
   * Get recently added tutorials
   */
  static async getRecentTutorials(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('library_items')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent tutorials:', error);
      return [];
    }
  }

  // ===== CATEGORIES =====

  /**
   * Get all active categories
   */
  static async getCategories() {
    try {
      const { data, error } = await supabase
        .from('library_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }
}

export default LibraryService;