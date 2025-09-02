import React from 'react';

// Auto-moderation rules based on your specification
const MODERATION_RULES = {
  inappropriate: {
    keywords: ['stupid', 'dumb', 'idiot', 'hate', 'awful', 'terrible', 'sucks', 'horrible'],
    severity: 'medium',
    action: 'flag_for_review'
  },
  
  toxic_parenting: {
    patterns: [
      /bad mom/i, 
      /terrible parent/i, 
      /you're wrong/i, 
      /awful advice/i,
      /worst parent/i,
      /bad mother/i,
      /terrible father/i
    ],
    severity: 'high',
    action: 'auto_hide'
  },
  
  spam: {
    keywords: ['click here', 'buy now', 'amazing offer', 'limited time', 'visit my website', 'check out my', 'free trial'],
    patterns: [/https?:\/\/[^\s]+/g], // URLs
    severity: 'high',
    action: 'auto_hide'
  },
  
  harmful_advice: {
    patterns: [
      /ignore your doctor/i, 
      /don't vaccinate/i, 
      /dangerous when/i,
      /skip medication/i,
      /don't trust doctors/i
    ],
    severity: 'critical',
    action: 'immediate_hide'
  },

  profanity: {
    keywords: ['damn', 'hell', 'crap', 'stupid', 'shut up'],
    severity: 'low',
    action: 'flag_for_review'
  }
};

export const VCAutoModerator = {
  
  // Main moderation function
  async moderateContent(content, userId = null) {
    const moderationResult = {
      approved: false,
      flags: [],
      severity: 'none',
      action: 'approve',
      flaggedKeywords: [],
      sentiment_score: 0,
      confidence: 0
    };

    try {
      // Step 1: Keyword and pattern filtering
      const keywordResult = this.checkKeywords(content);
      if (keywordResult.flagged) {
        moderationResult.flags.push(...keywordResult.flags);
        moderationResult.flaggedKeywords.push(...keywordResult.keywords);
        moderationResult.severity = keywordResult.maxSeverity;
      }

      // Step 2: Basic sentiment analysis (simplified)
      const sentimentResult = this.analyzeSentimentBasic(content);
      moderationResult.sentiment_score = sentimentResult.score;
      moderationResult.confidence = sentimentResult.confidence;

      // Step 3: User history check (if userId provided)
      if (userId) {
        const userHistoryResult = await this.checkUserHistory(userId);
        if (userHistoryResult.isRepeatOffender) {
          moderationResult.flags.push('repeat_offender');
        }
      }

      // Step 4: Determine final action
      moderationResult.action = this.determineFinalAction(moderationResult);
      moderationResult.approved = moderationResult.action === 'approve';

      return moderationResult;

    } catch (error) {
      console.error('Auto-moderation error:', error);
      // Default to manual review on error
      return {
        ...moderationResult,
        action: 'flag_for_review',
        flags: ['moderation_error']
      };
    }
  },

  // Check keywords and patterns
  checkKeywords(content) {
    const result = {
      flagged: false,
      flags: [],
      keywords: [],
      maxSeverity: 'none'
    };

    const lowerContent = content.toLowerCase();

    for (const [ruleType, rule] of Object.entries(MODERATION_RULES)) {
      // Check keywords
      if (rule.keywords) {
        const foundKeywords = rule.keywords.filter(keyword => 
          lowerContent.includes(keyword.toLowerCase())
        );
        
        if (foundKeywords.length > 0) {
          result.flagged = true;
          result.flags.push(`${ruleType}_keywords`);
          result.keywords.push(...foundKeywords);
          result.maxSeverity = this.getHigherSeverity(result.maxSeverity, rule.severity);
        }
      }

      // Check patterns (regex)
      if (rule.patterns) {
        const foundPatterns = rule.patterns.some(pattern => pattern.test(content));
        
        if (foundPatterns) {
          result.flagged = true;
          result.flags.push(`${ruleType}_pattern`);
          result.maxSeverity = this.getHigherSeverity(result.maxSeverity, rule.severity);
        }
      }
    }

    return result;
  },

  // Basic sentiment analysis (simple keyword-based)
  analyzeSentimentBasic(content) {
    const positiveWords = ['great', 'amazing', 'wonderful', 'helpful', 'love', 'excellent', 'fantastic', 'awesome', 'perfect', 'thank you'];
    const negativeWords = ['hate', 'awful', 'terrible', 'horrible', 'stupid', 'worst', 'bad', 'useless', 'waste', 'disappointed'];
    
    const words = content.toLowerCase().split(/\s+/);
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });
    
    const totalSentimentWords = positiveCount + negativeCount;
    let score = 0;
    let confidence = 0;
    
    if (totalSentimentWords > 0) {
      score = (positiveCount - negativeCount) / totalSentimentWords;
      confidence = Math.min(totalSentimentWords / words.length * 4, 1); // Simple confidence calculation
    }
    
    return { score, confidence };
  },

  // Check user moderation history
  async checkUserHistory(userId) {
    try {
      const { supabase } = await import('../../lib/supabase');
      
      // Get recent comments and their moderation status
      const { data: recentComments } = await supabase
        .from('vc_comments')
        .select('moderation_status, created_at')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
        .limit(20);

      if (!recentComments || recentComments.length < 3) {
        return { isRepeatOffender: false, violationRate: 0 };
      }

      const violations = recentComments.filter(comment => 
        ['flagged', 'deleted', 'auto_hidden'].includes(comment.moderation_status)
      ).length;

      const violationRate = violations / recentComments.length;

      return {
        isRepeatOffender: violationRate > 0.3, // More than 30% violations
        violationRate
      };

    } catch (error) {
      console.error('Error checking user history:', error);
      return { isRepeatOffender: false, violationRate: 0 };
    }
  },

  // Determine final moderation action
  determineFinalAction(moderationResult) {
    const { flags, severity, sentiment_score } = moderationResult;

    // Critical issues - immediate hide
    if (flags.some(flag => flag.includes('harmful_advice')) || severity === 'critical') {
      return 'immediate_hide';
    }

    // High severity or toxic content - auto hide
    if (severity === 'high' || flags.some(flag => flag.includes('toxic_parenting'))) {
      return 'auto_hide';
    }

    // Medium severity or multiple flags - flag for review
    if (severity === 'medium' || flags.length > 2) {
      return 'flag_for_review';
    }

    // Very negative sentiment with high confidence - flag for review
    if (sentiment_score < -0.6 && moderationResult.confidence > 0.8) {
      return 'flag_for_review';
    }

    // Repeat offender - flag for review
    if (flags.includes('repeat_offender')) {
      return 'flag_for_review';
    }

    // Default to approve
    return 'approve';
  },

  // Helper function to determine higher severity
  getHigherSeverity(current, newSeverity) {
    const severityLevels = { none: 0, low: 1, medium: 2, high: 3, critical: 4 };
    
    const currentLevel = severityLevels[current] || 0;
    const newLevel = severityLevels[newSeverity] || 0;
    
    const higherLevel = Math.max(currentLevel, newLevel);
    
    return Object.keys(severityLevels).find(key => severityLevels[key] === higherLevel);
  },

  // Log moderation action
  async logModerationAction(commentId, action, reason, automated = true) {
    try {
      const { supabase } = await import('../../lib/supabase');
      
      await supabase
        .from('vc_moderation_log')
        .insert([{
          comment_id: commentId,
          moderator_id: null, // null for automated actions
          action,
          reason,
          automated
        }]);

    } catch (error) {
      console.error('Error logging moderation action:', error);
    }
  },

  // Check community reports and auto-hide if threshold reached
  async checkCommunityReports(commentId) {
    try {
      const { supabase } = await import('../../lib/supabase');
      
      const { count: reportCount } = await supabase
        .from('vc_comment_reports')
        .select('id', { count: 'exact' })
        .eq('comment_id', commentId);
        
      if (reportCount >= 3) {
        // Auto-hide comment
        await supabase
          .from('vc_comments')
          .update({ 
            moderation_status: 'auto_hidden',
            report_count: reportCount
          })
          .eq('id', commentId);
          
        // Log the action
        await this.logModerationAction(commentId, 'hide', 'multiple_community_reports', true);
        
        return { action: 'hidden', reason: 'community_reports' };
      }
      
      return { action: 'no_action' };

    } catch (error) {
      console.error('Error checking community reports:', error);
      return { action: 'no_action' };
    }
  }
};

export default VCAutoModerator;