# Library System Setup Instructions

## Step 1: Database Setup in Supabase

1. **Go to your Supabase Dashboard**: https://app.supabase.com
2. **Select your AIMfM project**
3. **Click "SQL Editor" in the left sidebar**
4. **Create a new query and paste this SQL:**

```sql
-- Create subscription tiers table
CREATE TABLE IF NOT EXISTS subscription_tiers (
  tier_name TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  tier_level INTEGER NOT NULL,
  monthly_price DECIMAL(5,2),
  description TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Insert your subscription tiers
INSERT INTO subscription_tiers (tier_name, display_name, tier_level, monthly_price, description) VALUES 
('essential', 'Essential', 1, 9.99, 'Basic AIMfM features for everyday family AI use'),
('enhanced', 'Enhanced', 2, 16.99, 'Enhanced AI interactions with more context and personalization'),
('full_magic', 'Full Magic', 3, 24.99, 'Complete AIMfM experience with advanced features'),
('creator', 'Creator', 4, 39.99, 'Everything plus creator tools and exclusive content')
ON CONFLICT (tier_name) DO NOTHING;

-- Create main library items table
CREATE TABLE IF NOT EXISTS library_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  category TEXT NOT NULL,
  difficulty_level TEXT DEFAULT 'beginner',
  estimated_time_minutes INTEGER,
  content_type TEXT NOT NULL DEFAULT 'tutorial',
  required_tier TEXT NOT NULL DEFAULT 'essential',
  gamma_page_url TEXT NOT NULL,
  thumbnail_url TEXT,
  preview_image_url TEXT,
  tags TEXT[],
  prerequisites TEXT[],
  learning_outcomes TEXT[],
  tools_mentioned TEXT[],
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  status TEXT DEFAULT 'published'
);

-- Create user bookmarks table
CREATE TABLE IF NOT EXISTS user_library_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  library_item_id UUID REFERENCES library_items(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, library_item_id)
);

-- Create user progress table
CREATE TABLE IF NOT EXISTS user_library_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  library_item_id UUID REFERENCES library_items(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not-started',
  progress_percent INTEGER DEFAULT 0,
  last_accessed TIMESTAMP DEFAULT now(),
  time_spent_minutes INTEGER DEFAULT 0,
  notes TEXT,
  completed_at TIMESTAMP,
  UNIQUE(user_id, library_item_id)
);

-- Enable Row Level Security
ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_library_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_library_progress ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read published library items
CREATE POLICY "Allow read access to published library items" ON library_items
  FOR SELECT USING (status = 'published');

-- Allow users to manage their own bookmarks and progress
CREATE POLICY "Users can manage their own bookmarks" ON user_library_bookmarks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own progress" ON user_library_progress  
  FOR ALL USING (auth.uid() = user_id);
```

5. **Click "RUN" to execute the query**

## Step 2: Enable AIM-Admin Access

To see the "AIM-Admin" button, open your browser's **Developer Console** (F12) and run:

```javascript
localStorage.setItem('aim_admin_access', 'true');
```

Then refresh the page. You'll see the "AIM-Admin" button in your Quick Actions.

Later, you can update the `isAimAdmin()` function in `src/components/global/QuickActions.js` to check:

- Your specific email address
- A user role in your database
- Or any other method you prefer

## Step 3: Test It Out

1. **Click "AIM-Admin" in your Quick Actions**
2. **Try adding a test tutorial:**
   - Title: "Test Tutorial"
   - Category: "test" 
   - Gamma URL: Any URL (like your main site)
   - Choose any subscription tier

## Notes:

- **These tables are SEPARATE** from your family admin system
- **No conflicts** with existing family/parent functionality  
- **You control** who can access `/library/admin`
- **Users can only see** the public library at `/library`

## What This Creates:

- `subscription_tiers` - Your pricing tiers
- `library_items` - All tutorials/content
- `user_library_bookmarks` - User favorites
- `user_library_progress` - Learning progress tracking

This is completely separate from your family management system!