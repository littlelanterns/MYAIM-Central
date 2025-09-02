-- Library System Updates - Run this in Supabase SQL Editor
-- This ensures your subscription tiers match the code expectations

-- 1. Update subscription tiers to match the library system
-- Delete existing tiers first (if any conflicts)
DELETE FROM subscription_tiers WHERE tier_name IN ('essential', 'enhanced', 'full_magic', 'creator');

-- Insert the correct subscription tiers for library system
INSERT INTO subscription_tiers (tier_name, display_name, tier_level, monthly_price, description) VALUES 
('essential', 'Essential', 1, 9.99, 'Basic AIMfM features for everyday family AI use'),
('enhanced', 'Enhanced', 2, 16.99, 'Enhanced AI interactions with more context and personalization'),
('full_magic', 'Full Magic', 3, 24.99, 'Complete AIMfM experience with advanced features'),
('creator', 'Creator', 4, 39.99, 'Everything plus creator tools and exclusive content')
ON CONFLICT (tier_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  tier_level = EXCLUDED.tier_level,
  monthly_price = EXCLUDED.monthly_price,
  description = EXCLUDED.description;

-- 2. Ensure proper constraints exist on library_items
-- This should already exist but let's make sure
DO $$ 
BEGIN
    -- Add foreign key constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'library_items_required_tier_fkey' 
        AND table_name = 'library_items'
    ) THEN
        ALTER TABLE library_items 
        ADD CONSTRAINT library_items_required_tier_fkey 
        FOREIGN KEY (required_tier) REFERENCES subscription_tiers(tier_name);
    END IF;
END $$;

-- 3. Add some sample categories if none exist
INSERT INTO library_categories (id, display_name, description, sort_order) VALUES 
('ai-basics', 'AI Basics', 'Fundamental AI concepts and tools', 10),
('automation', 'Automation', 'Workflow automation and productivity', 20),
('content-creation', 'Content Creation', 'AI-powered content and media creation', 30),
('productivity', 'Productivity', 'AI tools for enhanced productivity', 40),
('advanced-techniques', 'Advanced Techniques', 'Advanced AI usage and techniques', 50)
ON CONFLICT (id) DO NOTHING;

-- 4. Enable RLS (Row Level Security) if not already enabled
ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_library_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_library_progress ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies if they don't exist
DO $$
BEGIN
    -- Policy for reading published library items
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'library_items' 
        AND policyname = 'Allow read access to published library items'
    ) THEN
        CREATE POLICY "Allow read access to published library items" ON library_items
            FOR SELECT USING (status = 'published');
    END IF;
    
    -- Policy for user bookmarks
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_library_bookmarks' 
        AND policyname = 'Users can manage their own bookmarks'
    ) THEN
        CREATE POLICY "Users can manage their own bookmarks" ON user_library_bookmarks
            FOR ALL USING (auth.uid() = user_id);
    END IF;
    
    -- Policy for user progress
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_library_progress' 
        AND policyname = 'Users can manage their own progress'
    ) THEN
        CREATE POLICY "Users can manage their own progress" ON user_library_progress  
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;