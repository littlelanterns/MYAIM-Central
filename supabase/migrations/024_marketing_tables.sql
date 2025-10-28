-- ============================================
-- PART 1: Add Founding Family to families table
-- ============================================

ALTER TABLE families ADD COLUMN IF NOT EXISTS is_founding_family boolean DEFAULT false;
ALTER TABLE families ADD COLUMN IF NOT EXISTS founding_family_rate decimal(10,2);
ALTER TABLE families ADD COLUMN IF NOT EXISTS founding_family_joined_at timestamp;
ALTER TABLE families ADD COLUMN IF NOT EXISTS membership_status text DEFAULT 'active';

COMMENT ON COLUMN families.is_founding_family IS 'First 100 paid subscribers with special locked pricing';
COMMENT ON COLUMN families.founding_family_rate IS 'Locked subscription rate (never increases while active)';
COMMENT ON COLUMN families.membership_status IS 'active, cancelled, paused - affects price lock';

-- Founding Family Rates (locked forever):
-- Essential: $7.99 (vs $9.99 regular) - 20% off
-- Enhanced: $13.99 (vs $16.99 regular) - 18% off
-- Full Magic: $21.99 (vs $24.99 regular) - 12% off
-- Creator: $34.99 (vs $39.99 regular) - 12.5% off

-- ============================================
-- PART 2: Create articles table (NOT blog_posts)
-- ============================================

CREATE TABLE articles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  content text NOT NULL,
  featured_image_url text,
  category text NOT NULL,
  author_id uuid REFERENCES auth.users(id),
  published_at timestamp,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  view_count integer DEFAULT 0,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);

COMMENT ON TABLE articles IS 'Blog posts/articles for marketing site - called "Strategies & Snippets"';

-- ============================================
-- PART 3: Create testimonials table
-- ============================================

CREATE TABLE testimonials (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url text NOT NULL,
  testimonial_text text NOT NULL,
  display_title text NOT NULL,
  name text NOT NULL,
  family_description text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  display_order integer,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE INDEX idx_testimonials_status ON testimonials(status);
CREATE INDEX idx_testimonials_display_order ON testimonials(display_order);

COMMENT ON TABLE testimonials IS 'Customer testimonials for marketing site polaroid carousel';

-- ============================================
-- PART 4: Create article_comments table
-- ============================================

CREATE TABLE article_comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  parent_comment_id uuid REFERENCES article_comments(id),
  content text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'spam', 'deleted')),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE INDEX idx_article_comments_article_id ON article_comments(article_id);
CREATE INDEX idx_article_comments_status ON article_comments(status);
CREATE INDEX idx_article_comments_parent ON article_comments(parent_comment_id);

COMMENT ON TABLE article_comments IS 'Facebook-style threaded comments on articles';

-- ============================================
-- PART 5: Create article_reactions table
-- ============================================

CREATE TABLE article_reactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  reaction_type text NOT NULL CHECK (reaction_type IN ('heart', 'lightbulb', 'target')),
  created_at timestamp DEFAULT now(),
  UNIQUE(article_id, user_id, reaction_type)
);

CREATE INDEX idx_article_reactions_article_id ON article_reactions(article_id);
CREATE INDEX idx_article_reactions_user_id ON article_reactions(user_id);

COMMENT ON TABLE article_reactions IS 'Heart, lightbulb, target reactions on articles';

-- ============================================
-- PART 6: Enable RLS (Row Level Security)
-- ============================================

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_reactions ENABLE ROW LEVEL SECURITY;

-- Articles: Public can read published, authenticated users can read all
CREATE POLICY "Public can read published articles"
  ON articles FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users can read all articles"
  ON articles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Testimonials: Public can read active
CREATE POLICY "Public can read active testimonials"
  ON testimonials FOR SELECT
  USING (status = 'active');

-- Comments: Public can read approved, users can create, admins can moderate
CREATE POLICY "Public can read approved comments"
  ON article_comments FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Authenticated users can create comments"
  ON article_comments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Reactions: Users can add their own
CREATE POLICY "Users can manage own reactions"
  ON article_reactions
  USING (auth.uid() = user_id);

-- ============================================
-- PART 7: Create update trigger
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
