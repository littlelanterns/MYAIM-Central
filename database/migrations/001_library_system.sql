-- AIMfM Library System Migration
-- This creates all tables needed for the Netflix-style tutorial library

-- Subscription tiers reference table
CREATE TABLE IF NOT EXISTS subscription_tiers (
  tier_name TEXT PRIMARY KEY, -- 'essential', 'enhanced', 'full_magic', 'creator'
  display_name TEXT NOT NULL, -- 'Essential', 'Enhanced', 'Full Magic', 'Creator'
  tier_level INTEGER NOT NULL, -- 1, 2, 3, 4 (for access comparison)
  monthly_price DECIMAL(5,2), -- 9.99, 16.99, 24.99, 39.99
  description TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Insert subscription tier data
INSERT INTO subscription_tiers (tier_name, display_name, tier_level, monthly_price, description) VALUES 
('essential', 'Essential', 1, 9.99, 'Basic AIMfM features for everyday family AI use'),
('enhanced', 'Enhanced', 2, 16.99, 'Enhanced AI interactions with more context and personalization'),
('full_magic', 'Full Magic', 3, 24.99, 'Complete AIMfM experience with advanced features'),
('creator', 'Creator', 4, 39.99, 'Everything plus creator tools and exclusive content')
ON CONFLICT (tier_name) DO NOTHING;

-- Main library items table
CREATE TABLE IF NOT EXISTS library_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  short_description TEXT, -- For card previews (max 150 chars)
  category TEXT NOT NULL, -- User-created categories
  subcategory TEXT, -- More specific grouping
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_time_minutes INTEGER, -- Time to complete
  content_type TEXT NOT NULL DEFAULT 'tutorial' CHECK (content_type IN ('tutorial', 'tool-collection', 'workflow', 'prompt-pack')),
  
  -- Subscription Access Control
  required_tier TEXT NOT NULL DEFAULT 'essential' REFERENCES subscription_tiers(tier_name),
  
  -- Gamma Page Integration
  gamma_page_url TEXT NOT NULL, -- Direct link to Gamma page (hidden from users)
  thumbnail_url TEXT, -- Custom uploaded thumbnail
  preview_image_url TEXT, -- Larger preview image for modals
  
  -- Content Metadata
  tags TEXT[], -- Searchable hashtags from admin form
  prerequisites TEXT[], -- What users should know first
  learning_outcomes TEXT[], -- What they'll learn
  tools_mentioned TEXT[], -- ChatGPT, Claude, n8n, etc.
  
  -- Display & Sorting
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT true, -- Mark as new for 30 days
  sort_order INTEGER DEFAULT 0, -- Manual ordering within categories
  view_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.0, -- For future rating system
  
  -- Admin Fields
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  created_by UUID, -- Link to admin user
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived'))
);

-- Auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_library_items_updated_at 
  BEFORE UPDATE ON library_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- User bookmarks table
CREATE TABLE IF NOT EXISTS user_library_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- Link to your existing user system
  library_item_id UUID REFERENCES library_items(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, library_item_id)
);

-- User progress tracking table
CREATE TABLE IF NOT EXISTS user_library_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  library_item_id UUID REFERENCES library_items(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed')),
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  last_accessed TIMESTAMP DEFAULT now(),
  time_spent_minutes INTEGER DEFAULT 0,
  notes TEXT, -- User's personal notes
  completed_at TIMESTAMP, -- When they finished the tutorial
  UNIQUE(user_id, library_item_id)
);

-- Categories table for better organization
CREATE TABLE IF NOT EXISTS library_categories (
  id TEXT PRIMARY KEY, -- 'ai-basics', 'chatgpt', etc.
  display_name TEXT NOT NULL, -- 'AI Basics for Moms'
  description TEXT,
  icon_name TEXT, -- For UI icons
  color_hex TEXT, -- Category brand colors (#68a395, #d6a461, etc.)
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- Insert default categories
INSERT INTO library_categories (id, display_name, description, color_hex, sort_order) VALUES 
('ai-basics', 'AI Basics for Moms', 'Getting started with AI - overcoming fears and building confidence', '#68a395', 1),
('chatgpt-mastery', 'ChatGPT Mastery', 'Advanced prompting techniques and ChatGPT features for families', '#d6a461', 2),
('claude-for-families', 'Claude for Families', 'Family-specific use cases and Claude integration tips', '#d4e3d9', 3),
('automation-magic', 'Automation Magic', 'n8n workflows and productivity automation for busy parents', '#fff4ec', 4),
('just-for-fun', 'Just for Fun', 'Creative AI projects and fun family activities', '#68a395', 5)
ON CONFLICT (id) DO NOTHING;

-- Tutorial ratings table (for future enhancement)
CREATE TABLE IF NOT EXISTS library_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  library_item_id UUID REFERENCES library_items(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, library_item_id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_library_items_category ON library_items(category);
CREATE INDEX IF NOT EXISTS idx_library_items_featured ON library_items(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_library_items_status ON library_items(status);
CREATE INDEX IF NOT EXISTS idx_library_items_tier ON library_items(required_tier);
CREATE INDEX IF NOT EXISTS idx_library_items_tags ON library_items USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user ON user_library_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_library_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_library_progress(status);

-- RLS (Row Level Security) policies
ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_library_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_library_progress ENABLE ROW LEVEL SECURITY;

-- Allow all users to read published library items
CREATE POLICY "Allow read access to published library items" ON library_items
  FOR SELECT USING (status = 'published');

-- Allow users to manage their own bookmarks
CREATE POLICY "Users can manage their own bookmarks" ON user_library_bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- Allow users to manage their own progress
CREATE POLICY "Users can manage their own progress" ON user_library_progress  
  FOR ALL USING (auth.uid() = user_id);

-- Admin policies (you'll need to adjust based on your admin system)
-- CREATE POLICY "Admins can manage library items" ON library_items
--   FOR ALL USING (auth.jwt() ->> 'role' = 'admin');