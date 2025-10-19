import { supabase } from '../lib/supabase';

export const ToolSessionService = {
  /**
   * Create new tool session
   */
  async createSession(userId, libraryItemId, timeoutMinutes = 60) {
    const sessionToken = this.generateToken(userId, libraryItemId);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + timeoutMinutes);

    const { data, error } = await supabase
      .from('tool_sessions')
      .insert({
        user_id: userId,
        library_item_id: libraryItemId,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        last_activity: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Check if session is valid
   */
  async validateSession(sessionToken) {
    const { data, error} = await supabase
      .from('tool_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .is('ended_at', null)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (error || !data) return null;
    return data;
  },

  /**
   * Update session activity (extends timeout)
   */
  async updateActivity(sessionToken, timeoutMinutes = 60) {
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMinutes(expiresAt.getMinutes() + timeoutMinutes);

    const { error } = await supabase
      .from('tool_sessions')
      .update({
        last_activity: now.toISOString(),
        expires_at: expiresAt.toISOString()
      })
      .eq('session_token', sessionToken)
      .is('ended_at', null);

    if (error) throw error;
  },

  /**
   * End session
   */
  async endSession(sessionToken) {
    const { error } = await supabase
      .from('tool_sessions')
      .update({ ended_at: new Date().toISOString() })
      .eq('session_token', sessionToken);

    if (error) throw error;
  },

  /**
   * Check daily usage
   */
  async checkDailyUsage(userId, libraryItemId) {
    const today = new Date().toISOString().split('T')[0];
    const { count, error } = await supabase
      .from('tool_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('library_item_id', libraryItemId)
      .gte('started_at', `${today}T00:00:00`)
      .lte('started_at', `${today}T23:59:59`);

    if (error) throw error;
    return count || 0;
  },

  /**
   * Check monthly usage
   */
  async checkMonthlyUsage(userId, libraryItemId) {
    const firstOfMonth = new Date();
    firstOfMonth.setDate(1);
    firstOfMonth.setHours(0, 0, 0, 0);

    const { count, error } = await supabase
      .from('tool_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('library_item_id', libraryItemId)
      .gte('started_at', firstOfMonth.toISOString());

    if (error) throw error;
    return count || 0;
  },

  /**
   * Check if usage limit is reached
   */
  async checkUsageLimit(userId, libraryItemId, limitType, limitAmount) {
    switch (limitType) {
      case 'daily_uses':
        const dailyCount = await this.checkDailyUsage(userId, libraryItemId);
        return dailyCount >= limitAmount;

      case 'monthly_uses':
        const monthlyCount = await this.checkMonthlyUsage(userId, libraryItemId);
        return monthlyCount >= limitAmount;

      case 'session_time':
        // Session time limits are handled by expires_at in the session record
        return false;

      case 'api_tokens':
        // API token limits would need to be tracked separately per session
        // For now, just allow the session
        return false;

      default:
        return false;
    }
  },

  /**
   * Generate unique session token
   */
  generateToken(userId, libraryItemId) {
    return `${userId}-${libraryItemId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  },

  /**
   * Clean up expired sessions (admin/cron job)
   */
  async cleanupExpiredSessions() {
    const { error } = await supabase
      .from('tool_sessions')
      .update({ ended_at: new Date().toISOString() })
      .is('ended_at', null)
      .lt('expires_at', new Date().toISOString());

    if (error) throw error;
  },

  /**
   * Get active sessions for a user
   */
  async getActiveSessions(userId) {
    const { data, error } = await supabase
      .from('tool_sessions')
      .select('*, library_items(title, tool_type)')
      .eq('user_id', userId)
      .is('ended_at', null)
      .gte('expires_at', new Date().toISOString())
      .order('started_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};
