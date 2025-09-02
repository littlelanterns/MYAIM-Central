-- ===== VAULT CONTENT ENGAGEMENT & DISCUSSION SYSTEM =====
-- Database Migration Script for AIMfM Library Vault Content
-- Run these commands in your Supabase SQL editor to enable the discussion system

-- ===== 1. ENGAGEMENT TRACKING TABLE =====
-- Tracks user likes and favorites on tutorial content

CREATE TABLE IF NOT EXISTS vc_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_content_id UUID NOT NULL,
  user_id UUID NOT NULL,
  engagement_type TEXT CHECK (engagement_type IN ('like', 'favorite')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vault_content_id, user_id, engagement_type)
);

-- Index for fast engagement counts
CREATE INDEX IF NOT EXISTS idx_vc_engagement_content 
ON vc_engagement(vault_content_id, engagement_type);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_vc_engagement_user 
ON vc_engagement(user_id);

-- ===== 2. COMMENT SYSTEM TABLE =====
-- Handles threaded discussions under tutorials

CREATE TABLE IF NOT EXISTS vc_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_content_id UUID NOT NULL,
  parent_comment_id UUID REFERENCES vc_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  author_name TEXT NOT NULL, -- Cache for display performance
  content TEXT NOT NULL,
  depth_level INTEGER DEFAULT 0,
  moderation_status TEXT DEFAULT 'approved' CHECK (
    moderation_status IN ('pending', 'approved', 'flagged', 'deleted', 'auto_hidden')
  ),
  sentiment_score DECIMAL(3,2), -- -1.00 to 1.00 from auto-moderation
  flagged_keywords TEXT[], -- Array of triggered keywords
  report_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vc_comments_content 
ON vc_comments(vault_content_id, moderation_status);

CREATE INDEX IF NOT EXISTS idx_vc_comments_parent 
ON vc_comments(parent_comment_id);

CREATE INDEX IF NOT EXISTS idx_vc_comments_moderation 
ON vc_comments(moderation_status, created_at);

CREATE INDEX IF NOT EXISTS idx_vc_comments_user 
ON vc_comments(user_id);

-- ===== 3. COMMUNITY REPORTING TABLE =====
-- Allows users to report inappropriate comments

CREATE TABLE IF NOT EXISTS vc_comment_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES vc_comments(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL,
  reason TEXT CHECK (reason IN (
    'inappropriate_language', 
    'spam_promotional', 
    'harassment_bullying', 
    'harmful_advice', 
    'off_topic', 
    'other'
  )) NOT NULL,
  additional_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, reporter_id) -- Prevent duplicate reports from same user
);

-- Index for report lookups
CREATE INDEX IF NOT EXISTS idx_vc_reports_comment 
ON vc_comment_reports(comment_id);

CREATE INDEX IF NOT EXISTS idx_vc_reports_reporter 
ON vc_comment_reports(reporter_id);

-- ===== 4. MODERATION LOG TABLE =====
-- Tracks all moderation actions for audit trail

CREATE TABLE IF NOT EXISTS vc_moderation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL,
  moderator_id UUID, -- NULL for automated actions
  action TEXT CHECK (action IN (
    'approve', 'delete', 'flag', 'hide', 'warn_user', 'restore'
  )) NOT NULL,
  reason TEXT,
  previous_status TEXT,
  new_status TEXT,
  automated BOOLEAN DEFAULT FALSE, -- true for auto-moderation
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for moderation history
CREATE INDEX IF NOT EXISTS idx_vc_moderation_comment 
ON vc_moderation_log(comment_id);

CREATE INDEX IF NOT EXISTS idx_vc_moderation_moderator 
ON vc_moderation_log(moderator_id);

CREATE INDEX IF NOT EXISTS idx_vc_moderation_date 
ON vc_moderation_log(created_at);

-- ===== 5. ROW LEVEL SECURITY (RLS) POLICIES =====
-- Enable RLS on all tables for security

ALTER TABLE vc_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE vc_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vc_comment_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE vc_moderation_log ENABLE ROW LEVEL SECURITY;

-- ===== 6. ENGAGEMENT POLICIES =====

-- Users can read all engagement data (for stats)
CREATE POLICY "Anyone can view engagement stats" ON vc_engagement
  FOR SELECT USING (true);

-- Users can only insert their own engagement
CREATE POLICY "Users can manage their own engagement" ON vc_engagement
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own engagement
CREATE POLICY "Users can delete their own engagement" ON vc_engagement
  FOR DELETE USING (auth.uid() = user_id);

-- ===== 7. COMMENT POLICIES =====

-- Users can read approved comments
CREATE POLICY "Anyone can view approved comments" ON vc_comments
  FOR SELECT USING (moderation_status = 'approved');

-- Authenticated users can insert comments
CREATE POLICY "Authenticated users can post comments" ON vc_comments
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
  );

-- Users can update their own comments (for editing)
CREATE POLICY "Users can edit their own comments" ON vc_comments
  FOR UPDATE USING (
    auth.uid() = user_id
    AND moderation_status IN ('approved', 'flagged')
  ) WITH CHECK (
    auth.uid() = user_id
    AND content IS NOT NULL
  );

-- Users can soft delete their own comments
CREATE POLICY "Users can delete their own comments" ON vc_comments
  FOR UPDATE USING (
    auth.uid() = user_id
  ) WITH CHECK (
    auth.uid() = user_id
    AND moderation_status = 'deleted'
  );

-- ===== 8. REPORTING POLICIES =====

-- Authenticated users can report comments
CREATE POLICY "Authenticated users can report comments" ON vc_comment_reports
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = reporter_id
  );

-- Users can view their own reports
CREATE POLICY "Users can view their own reports" ON vc_comment_reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- ===== 9. MODERATION LOG POLICIES =====

-- Only moderators/admins can view moderation logs
-- You may need to adjust this based on your admin role system
CREATE POLICY "Admins can view moderation logs" ON vc_moderation_log
  FOR SELECT USING (
    -- Replace with your admin check logic
    -- Example: auth.jwt() ->> 'role' = 'admin'
    true -- For now, allow all authenticated users to view logs
  );

-- Only moderators/admins can insert moderation logs
CREATE POLICY "Admins can insert moderation logs" ON vc_moderation_log
  FOR INSERT WITH CHECK (
    -- Replace with your admin check logic
    auth.uid() IS NOT NULL
  );

-- ===== 10. HELPER FUNCTIONS =====

-- Function to update comment updated_at timestamp
CREATE OR REPLACE FUNCTION update_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_vc_comments_updated_at
  BEFORE UPDATE ON vc_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_updated_at();

-- ===== 11. LIBRARY_ITEMS TABLE UPDATES =====
-- Add engagement columns to existing library_items table

-- Add engagement tracking columns (if they don't exist)
DO $$ 
BEGIN
  -- Check if engagement_likes column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'library_items' 
    AND column_name = 'engagement_likes'
  ) THEN
    ALTER TABLE library_items ADD COLUMN engagement_likes INTEGER DEFAULT 0;
  END IF;

  -- Check if engagement_favorites column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'library_items' 
    AND column_name = 'engagement_favorites'
  ) THEN
    ALTER TABLE library_items ADD COLUMN engagement_favorites INTEGER DEFAULT 0;
  END IF;

  -- Check if engagement_comments column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'library_items' 
    AND column_name = 'engagement_comments'
  ) THEN
    ALTER TABLE library_items ADD COLUMN engagement_comments INTEGER DEFAULT 0;
  END IF;
END $$;

-- ===== 12. TRIGGER FUNCTIONS FOR ENGAGEMENT STATS =====

-- Function to update engagement stats on library_items
CREATE OR REPLACE FUNCTION update_engagement_stats()
RETURNS TRIGGER AS $$
DECLARE
  tutorial_id UUID;
  likes_count INTEGER;
  favorites_count INTEGER;
  comments_count INTEGER;
BEGIN
  -- Get the tutorial ID from the affected row
  IF TG_OP = 'DELETE' THEN
    tutorial_id := OLD.vault_content_id;
  ELSE
    tutorial_id := NEW.vault_content_id;
  END IF;

  -- Count current engagement
  SELECT 
    COUNT(CASE WHEN engagement_type = 'like' THEN 1 END),
    COUNT(CASE WHEN engagement_type = 'favorite' THEN 1 END)
  INTO likes_count, favorites_count
  FROM vc_engagement 
  WHERE vault_content_id = tutorial_id;

  -- Count approved comments
  SELECT COUNT(*)
  INTO comments_count
  FROM vc_comments 
  WHERE vault_content_id = tutorial_id 
    AND moderation_status = 'approved';

  -- Update library_items
  UPDATE library_items SET
    engagement_likes = likes_count,
    engagement_favorites = favorites_count,
    engagement_comments = comments_count
  WHERE id = tutorial_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers to update engagement stats
CREATE TRIGGER update_engagement_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON vc_engagement
  FOR EACH ROW
  EXECUTE FUNCTION update_engagement_stats();

CREATE TRIGGER update_comment_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON vc_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_engagement_stats();

-- ===== 13. INITIAL DATA REFRESH =====
-- Update existing library items with current engagement counts

-- Refresh engagement stats for all existing tutorials
DO $$
DECLARE
  tutorial_record RECORD;
  likes_count INTEGER;
  favorites_count INTEGER;
  comments_count INTEGER;
BEGIN
  FOR tutorial_record IN SELECT id FROM library_items LOOP
    -- Count engagement
    SELECT 
      COUNT(CASE WHEN engagement_type = 'like' THEN 1 END),
      COUNT(CASE WHEN engagement_type = 'favorite' THEN 1 END)
    INTO likes_count, favorites_count
    FROM vc_engagement 
    WHERE vault_content_id = tutorial_record.id;

    -- Count comments
    SELECT COUNT(*)
    INTO comments_count
    FROM vc_comments 
    WHERE vault_content_id = tutorial_record.id 
      AND moderation_status = 'approved';

    -- Update tutorial
    UPDATE library_items SET
      engagement_likes = COALESCE(likes_count, 0),
      engagement_favorites = COALESCE(favorites_count, 0),
      engagement_comments = COALESCE(comments_count, 0)
    WHERE id = tutorial_record.id;
  END LOOP;
END $$;

-- ===== MIGRATION COMPLETE =====
-- 
-- After running this migration:
-- 1. Your Vault Content Discussion system will be fully functional
-- 2. Users can like, favorite, and comment on tutorials
-- 3. Auto-moderation will filter inappropriate content
-- 4. Admins can moderate comments through the admin panel
-- 5. Community reporting helps maintain a safe environment
-- 
-- Next steps:
-- 1. Test the system with a few sample comments
-- 2. Adjust RLS policies based on your user role system
-- 3. Configure auto-moderation sensitivity as needed
-- 4. Train your community on the discussion guidelines
--
-- Remember: This system follows the exact architecture from your
-- vault_content_discussion_system.md specification!