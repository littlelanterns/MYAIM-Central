# MyAIM-Central Implementation Roadmap
## Archives Enhancements, Library Admin System, and LiLa Optimizer

**Last Updated**: 2025-10-19
**Status**: Planning Phase

---

## 🎯 Project Overview

This implementation roadmap covers three major feature expansions for MyAIM-Central:

1. **Archives System Visual Enhancements** - Color pickers and cover photos for folder personalization
2. **Library Admin System** - Multi-tier content management with protected tool wrapping
3. **LiLa Optimizer** - AI-powered prompt optimization with context learning

### Implementation Strategy

**Phase 1 (Archives)** → Foundation for context storage
**Phase 2 (Library)** → Content delivery system
**Phase 3 (LiLa Foundation)** → Intelligence layer that uses Archives + Library
**Phase 4 (LiLa Advanced)** → Full context learning and personalization

Each phase builds on the previous, creating a cohesive intelligent platform for moms.

---

## 📊 Phase Overview & Dependencies

```
PHASE 1: Archives Visual Enhancements
├── No dependencies (can start immediately)
├── Provides: Color picker, cover photo upload
└── Unlocks: Phase 3 (LiLa needs context storage working)

PHASE 2: Library Admin System
├── No dependencies (independent of other phases)
├── Provides: Multi-tier access, protected tools
└── Unlocks: Content publishing, tool wrapping

PHASE 3: LiLa Optimizer - Foundation
├── Depends on: Phase 1 (needs Archives context)
├── Provides: AI optimization, context recognition
└── Unlocks: Phase 4 (advanced learning features)

PHASE 4: LiLa Optimizer - Advanced
├── Depends on: Phase 3 (needs core LiLa working)
├── Provides: Interview system, prompt library, patterns
└── Unlocks: Full intelligent assistant experience
```

---

## 📋 PHASE 1: Archives Visual Enhancements

### Dependencies
- **None** - Can start immediately
- Uses existing `archive_folders` table
- Uses existing color palette from `src/styles/colors.js`

### Purpose
- Provides immediate visual value to users
- No complex AI integration required
- Establishes storage patterns LiLa will use later
- Quick wins to build momentum

### Milestone 1.1: Color Picker System

**Components to Create**:
```
├── src/components/archives/ColorPickerModal.tsx (new)
├── src/components/archives/FolderDetailView.tsx (update)
├── src/components/archives/FolderCard.tsx (update)
└── src/lib/archivesService.ts (update)
```

**Tasks**:
- [ ] Create ColorPickerModal component
  - Search functionality for colors
  - Family filter tabs (orange, red, yellow, green, teal, blue, purple, brown, pink)
  - Grid display with color swatches
  - Selected state with checkmark
  - Import familyMemberColors from colors.js

- [ ] Update FolderDetailView
  - Add Palette button in header
  - Open ColorPickerModal on click
  - Update folder color immediately on selection
  - Use color for gradient background when no photo

- [ ] Update FolderCard
  - Display gradient using folder.color_hex
  - Add adjustColor helper function for gradients
  - Show icon over gradient when no cover photo

- [ ] Add archivesService function
  - `updateFolderColor(folderId, colorHex)`

**Completion Criteria**:
- [ ] Color picker displays all 100+ colors from colors.js
- [ ] Search filters colors correctly
- [ ] Family tabs filter by color family
- [ ] Selecting color updates folder immediately
- [ ] Gradient background uses selected color
- [ ] Color persists after page refresh
- [ ] Mobile responsive

---

### Milestone 1.2: Cover Photo Upload System

**Components to Create**:
```
├── src/components/archives/CoverPhotoUpload.tsx (new)
├── src/components/archives/FolderDetailView.tsx (update)
└── src/components/archives/FolderCard.tsx (update)
```

**Database/Storage Setup**:
```sql
-- Create Supabase Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('archive-covers', 'archive-covers', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage
CREATE POLICY "Users can upload cover photos for their family folders"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'archive-covers'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view cover photos for their family folders"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'archive-covers'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete cover photos for their family folders"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'archive-covers'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Tasks**:
- [ ] Create Supabase Storage bucket
  - Run SQL to create 'archive-covers' bucket
  - Set public read access
  - Create RLS policies for insert/select/delete

- [ ] Create CoverPhotoUpload component
  - File selection with validation (type, size < 5MB)
  - Preview before upload
  - Upload to Supabase Storage
  - Update folder with photo URL
  - Remove photo functionality

- [ ] Update FolderDetailView
  - Add Upload button in header
  - Click cover area to open upload modal
  - Display photo or gradient fallback
  - Hover overlay with "Change Cover Photo"

- [ ] Update FolderCard
  - Display cover photo if exists
  - Show gradient with icon if no photo

**Completion Criteria**:
- [ ] Photo upload accepts valid images
- [ ] Rejects invalid files (non-images, > 5MB)
- [ ] Preview shows before upload
- [ ] Photo uploads to Supabase Storage
- [ ] Photo displays on folder card and detail view
- [ ] Remove photo works correctly
- [ ] Storage RLS policies prevent unauthorized access
- [ ] Mobile responsive

---

### Phase 1 Complete When:
✅ Users can select custom colors for any folder
✅ Users can upload cover photos to any folder
✅ Gradients display when no photo is set
✅ All changes persist to database
✅ No errors in console
✅ Works on mobile and desktop
✅ **Ready to move to Phase 2 (independent) or Phase 3 (depends on this)**

---

## 📋 PHASE 2: Library Admin System Enhancements

### Dependencies
- **None** - Independent of other phases
- Uses existing `library_items` table
- Uses existing `LibraryAdmin.jsx` component

### Purpose
- Enables content delivery before LiLa needs it
- Establishes access control patterns for premium features
- Allows admin to start publishing valuable content immediately
- No AI complexity yet

### Current State
```
Existing:
├── library_items table (Supabase)
├── LibraryAdmin.jsx component
├── subscription_tier column (single value)
└── Basic content CRUD

Needed:
├── Multi-tier access (checkbox selection)
├── Custom AI App content type
├── Protected tool wrapping (iframe + proxy)
├── Session management
└── Usage tracking
```

---

### Milestone 2.1: Multi-Tier Access Control

**Database Migration**:
```sql
-- Add multi-tier support to library_items
ALTER TABLE library_items
ADD COLUMN IF NOT EXISTS allowed_tiers JSONB DEFAULT '[]';

-- Migrate existing data
UPDATE library_items
SET allowed_tiers = jsonb_build_array(subscription_tier)
WHERE allowed_tiers = '[]';

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_library_items_allowed_tiers
ON library_items USING GIN (allowed_tiers);
```

**Tasks**:
- [ ] Run database migration
  - Add allowed_tiers column (JSONB)
  - Migrate existing subscription_tier data
  - Keep old column for backwards compatibility

- [ ] Update LibraryAdmin interface
  - Replace single dropdown with checkboxes
  - Free Tier, Essential, Enhanced, Full Magic, Creator, Everyone (public)
  - Handle tier toggle logic
  - Update save function to store array

- [ ] Update Library browse page
  - Check user's tier against allowed_tiers array
  - Show lock icon for inaccessible content
  - Display upgrade prompt when locked item clicked

**Completion Criteria**:
- [ ] Admin can select multiple tiers per content item
- [ ] Users only see content for their tier
- [ ] Lock icons display on restricted content
- [ ] Upgrade prompts show correct tier information
- [ ] Existing content still works after migration

---

### Milestone 2.2: Custom AI App Content Type

**Database Schema**:
```sql
-- Expand library_items for Custom AI Apps
ALTER TABLE library_items
ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'tutorial',
ADD COLUMN IF NOT EXISTS app_type TEXT,
ADD COLUMN IF NOT EXISTS external_url TEXT,
ADD COLUMN IF NOT EXISTS embedding_method TEXT DEFAULT 'iframe',
ADD COLUMN IF NOT EXISTS session_timeout_minutes INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS max_uses_per_day INTEGER DEFAULT 0;

-- Create usage tracking table
CREATE TABLE IF NOT EXISTS tool_usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id UUID REFERENCES library_items(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tool_id, date)
);

CREATE INDEX idx_tool_usage_user_date ON tool_usage_tracking(user_id, date);
CREATE INDEX idx_tool_usage_tool ON tool_usage_tracking(tool_id);
```

**Tasks**:
- [ ] Run database migration
  - Add new columns for Custom AI Apps
  - Create usage_tracking table for daily limits

- [ ] Update LibraryAdmin form
  - Add "Custom AI App" content type option
  - Show app type selector (GPT/Gem/Opal)
  - External URL input (kept private)
  - Embedding method selector
  - Session timeout input
  - Max uses per day input

- [ ] Create protected tool wrapper component
  - Generate temporary session token
  - Render iframe with obfuscated URL
  - Display session timer
  - Track usage count

**Completion Criteria**:
- [ ] Admin can add Custom GPT/Gem/Opal App
- [ ] External URL is never visible to users
- [ ] Session tokens expire correctly
- [ ] Daily usage limits enforced
- [ ] Tools work in iframe without errors

---

### Milestone 2.3: Session Management & Usage Tracking

**Components to Create**:
```
├── src/components/library/ProtectedToolWrapper.tsx (new)
├── src/components/library/SessionTimer.tsx (new)
└── src/lib/sessionManagementService.ts (new)
```

**Tasks**:
- [ ] Create session token system
  - Generate unique tokens per user/tool
  - Time-limited (configurable per tool)
  - Validate on each interaction

- [ ] Build usage tracking
  - Increment counter on tool open
  - Check daily limit before allowing access
  - Reset counters at midnight
  - Display "X of Y uses today"

- [ ] Create ProtectedToolWrapper component
  - Check subscription tier
  - Check usage limit
  - Generate session token
  - Render iframe with token
  - Display session timer
  - Handle expiration gracefully

**Completion Criteria**:
- [ ] Session tokens work correctly
- [ ] Tokens expire at configured time
- [ ] Usage limits prevent overuse
- [ ] Counters reset daily
- [ ] Unauthorized users blocked
- [ ] Expired sessions show friendly message

---

### Phase 2 Complete When:
✅ Admin can select multiple tiers per content
✅ Admin can add protected Custom AI Apps
✅ Users see only content for their tier
✅ Custom AI Apps load in protected iframes
✅ Session management prevents URL sharing
✅ Usage tracking enforces daily limits
✅ **Ready to publish content to users**

---

## 📋 PHASE 3: LiLa Optimizer - Foundation

### Dependencies
- **REQUIRES: Phase 1 Complete** - LiLa needs Archives working for context storage
- Uses OpenRouter API (new external dependency)
- Builds on existing family_members and archive_context_items tables

### Purpose
- This is the intelligence layer that makes everything valuable
- Provides immediate value: better AI prompts
- Learns from conversations to build context over time
- 80% JavaScript (fast/free) + 20% AI (smart/paid) strategy

### Architecture
```
LiLa Optimizer Flow:
1. Mom types prompt → LiLa detects family members
2. Retrieve context from Archives (Phase 1 structure)
3. Optimize prompt (80% JavaScript, 20% OpenRouter)
4. Display optimized prompt + actions
5. Learn new context → Suggest saving to Archives
6. Save to Personal Prompt Library
```

---

### Milestone 3.1: OpenRouter Integration

**Environment Setup**:
```bash
# Add to .env.local
OPENROUTER_API_KEY=your_key_here
OPENROUTER_DEFAULT_MODEL=anthropic/claude-3.5-sonnet
OPENROUTER_FALLBACK_MODEL=openai/gpt-4-turbo
OPENROUTER_MAX_COST_PER_FAMILY_PER_MONTH=1.00
```

**Services to Create**:
```
├── src/lib/openRouterService.ts (new)
├── src/lib/lilaOptimizerService.ts (new)
└── src/config/openRouterConfig.ts (new)
```

**Tasks**:
- [ ] Set up OpenRouter account
  - Get API key
  - Add to environment variables
  - Configure billing limits ($5/month max for testing)

- [ ] Create openRouterService
  - API call wrapper
  - Error handling with fallbacks
  - Token counting
  - Cost tracking

- [ ] Create optimization prompt templates
  - System prompt for optimization
  - Platform-specific variations (ChatGPT/Claude/Gemini)
  - Context injection patterns

**Completion Criteria**:
- [ ] API calls work correctly
- [ ] Error handling gracefully degrades to JavaScript
- [ ] Token usage is tracked
- [ ] Responses return in < 3 seconds average
- [ ] Fallback to cheaper model works if primary fails

---

### Milestone 3.2: Family Member Recognition System

**Services to Create**:
```
└── src/lib/familyRecognitionService.ts (new)
```

**Database Functions**:
```sql
-- Get member by name or nickname
CREATE OR REPLACE FUNCTION get_member_by_name(
  p_family_id UUID,
  p_name TEXT
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  nicknames TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT fm.id, fm.name, fm.nicknames
  FROM family_members fm
  WHERE fm.family_id = p_family_id
    AND (
      LOWER(fm.name) = LOWER(p_name)
      OR p_name = ANY(SELECT LOWER(unnest(fm.nicknames)))
    );
END;
$$ LANGUAGE plpgsql;
```

**Tasks**:
- [ ] Create recognition patterns
  - Regex for name detection in prompts
  - Nickname mapping (Gid → Gideon, Zy → Mosiah)
  - Handle multiple members in one prompt

- [ ] Build context retrieval
  - Query family_members table
  - Get all context items where use_for_context = true
  - Include family root folder context (inheritance)
  - Format context string for AI

- [ ] Test with real family data
  - "Help Gid with homework" → finds Gideon
  - "Meal for Zy and Jake" → finds both members
  - Retrieves all relevant context

**Completion Criteria**:
- [ ] Names detected correctly in prompts (95%+ accuracy)
- [ ] Nicknames map to full names
- [ ] Context retrieved with inheritance working
- [ ] Multiple members handled in single prompt
- [ ] Context formatted cleanly for AI consumption

---

### Milestone 3.3: Prompt Optimization Engine

**Components to Create**:
```
├── src/components/lila/LilaOptimizerWindow.tsx (new)
├── src/components/lila/OptimizedPromptDisplay.tsx (new)
├── src/components/lila/PlatformSelector.tsx (new)
└── src/lib/promptOptimizationService.ts (new)
```

**Optimization Logic**:
```javascript
// Decision tree for JavaScript vs AI
function shouldUseAI(prompt, context) {
  // JavaScript handles (80% target):
  // - Homework help (standard template)
  // - Meal planning (context injection)
  // - Schedule-based (simple formatting)

  // AI handles (20% target):
  // - Emotional/behavioral issues
  // - Novel situations
  // - Multi-factor complexity
  // - Creative/nuanced requests

  const complexity = calculateComplexity(prompt);
  return complexity > COMPLEXITY_THRESHOLD;
}
```

**Tasks**:
- [ ] Build decision tree for optimization method
  - Simple requests → JavaScript templates
  - Complex/emotional → OpenRouter AI
  - Pattern matching for common scenarios

- [ ] Create JavaScript optimization templates
  - Homework help template
  - Meal planning template
  - Behavior management template
  - Creative project template

- [ ] Implement AI optimization
  - Build system prompt for LiLa
  - Inject context dynamically
  - Platform-specific formatting
  - Return copy-paste ready prompt

- [ ] Create UI components
  - Chat window for LiLa interaction
  - Platform selector (ChatGPT/Claude/Gemini/Generic)
  - Optimized prompt display
  - Action buttons (Copy/Save/Edit)

**Completion Criteria**:
- [ ] 80%+ requests use JavaScript (cost savings confirmed)
- [ ] Complex requests use AI correctly
- [ ] Optimized prompts measurably better than originals
- [ ] Platform-specific formatting works for each platform
- [ ] Copy to clipboard works on all major browsers
- [ ] Average response time < 3 seconds

---

### Milestone 3.4: Context Learning & Suggestions

**Database Schema**:
```sql
-- Create suggestions table
CREATE TABLE IF NOT EXISTS lila_context_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_folder_id UUID REFERENCES archive_folders(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  suggested_value TEXT NOT NULL,
  reasoning TEXT,
  confidence DECIMAL(3,2) DEFAULT 0.0,
  status TEXT DEFAULT 'pending', -- pending, accepted, rejected, modified
  source_conversation_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_context_suggestions_status ON lila_context_suggestions(status);
CREATE INDEX idx_context_suggestions_family ON lila_context_suggestions(family_id);
```

**Components to Create**:
```
├── src/components/lila/ContextSuggestionCard.tsx (new)
├── src/components/lila/SuggestionReviewPanel.tsx (new)
└── src/components/lila/BestIntentionSuggestion.tsx (new)
```

**Detection Patterns**:
```javascript
// Food preferences
/(loves|hates|dislikes|allergic to|doesn't like) ([a-z ]+)/gi

// Schedule information
/(practice|class|lesson|appointment) (on )?(monday|tuesday|...) at (\d+)/gi

// Personality traits
/(is|being|acts|seems) (shy|outgoing|creative|sensitive|...)/gi

// Challenges
/(struggling with|hard time with|difficulty|challenge|problem) ([a-z ]+)/gi
```

**Tasks**:
- [ ] Create detection patterns
  - Food preferences patterns
  - Schedule patterns
  - Personality trait patterns
  - Challenge/struggle patterns

- [ ] Build suggestion generation
  - Parse prompt for new information
  - Check if already in database
  - Determine target folder (which member)
  - Determine context field
  - Calculate confidence score (0.0 - 1.0)
  - Generate reasoning ("why this matters")

- [ ] Create suggestion UI
  - Display suggestions after optimization
  - Show target folder and field
  - Explain reasoning clearly
  - Checkbox to select/deselect
  - Edit before accepting
  - Batch accept multiple suggestions

- [ ] Implement Best Intention detection
  - Detect goal language ("we're working on...")
  - Extract current vs desired state
  - Pre-fill Best Intention form
  - Suggest creating new intention

**Completion Criteria**:
- [ ] New information detected with 85%+ accuracy
- [ ] Not suggested if already in database (no duplicates)
- [ ] Confidence scores correlate with accuracy
- [ ] Reasoning is helpful and clear to users
- [ ] Accepting suggestions saves correctly to Archives
- [ ] Best Intention detection triggers appropriately
- [ ] Users can edit suggestions before accepting

---

### Phase 3 Complete When:
✅ OpenRouter API integrated and working
✅ Family members recognized by name and nickname
✅ Context retrieved from Archives correctly
✅ 80%+ optimizations use JavaScript (cost controlled)
✅ Optimized prompts are demonstrably better
✅ Context suggestions generated accurately
✅ Suggestions save to Archives when accepted
✅ Cost per family < $1.50/month average
✅ **Ready to move to Phase 4 (advanced features)**

---

## 📋 PHASE 4: LiLa Optimizer - Advanced Features

### Dependencies
- **REQUIRES: Phase 3 Complete** - Needs core LiLa working
- Builds on suggestion system from Phase 3
- Uses OpenRouter for interview answer extraction

### Purpose
- Makes context building effortless through conversation
- Provides reusable prompt library
- Learns patterns over time for proactive suggestions
- Completes the intelligent assistant experience

---

### Milestone 4.1: Interview System

**Components to Create**:
```
├── src/components/lila/LilaInterviewModal.tsx (new)
├── src/components/lila/InterviewQuestion.tsx (new)
└── src/components/lila/InterviewProgress.tsx (new)
```

**Interview Questions (Family Member)**:
1. "Tell me about {name}! What's their personality like?"
2. "What does {name} love to do? What are their interests?"
3. "How does {name} learn best?"
4. "What challenges does {name} face?"
5. "What are {name}'s superpowers and strengths?"

**Interview Questions (Family Root)**:
1. "What are your family's religious or spiritual values?"
2. "What's your parenting philosophy?"
3. "Are there any dietary restrictions for your family?"
4. "How does your family communicate and make decisions?"
5. "What traditions or routines are important to your family?"

**Tasks**:
- [ ] Create interview modal
  - 5-question flow for members
  - 5-question flow for family
  - Progress indicator (1 of 5, 2 of 5...)
  - Free-form text input per question
  - Save for later functionality
  - Skip question option

- [ ] Build answer extraction
  - Send answer to OpenRouter
  - Extract structured data from free-form text
  - Format for database storage
  - Save to archive_context_items
  - Mark as added_by='interview'
  - Set use_for_context=true by default

- [ ] Trigger interview automatically
  - When new member added
  - When existing folder is incomplete
  - From "Complete Profile" button

- [ ] Update folder completeness
  - Calculate percentage based on filled fields
  - Display on folder card
  - Show which fields are missing

**Completion Criteria**:
- [ ] Interview opens for incomplete profiles
- [ ] Progress saves if user exits early
- [ ] Answers extract to structured data accurately
- [ ] Context saved to correct folders
- [ ] Completeness percentage updates correctly
- [ ] Interview can be resumed from where user left off
- [ ] User completion rate > 70% (most users finish)

---

### Milestone 4.2: Personal Prompt Library

**Database Schema**:
```sql
CREATE TABLE IF NOT EXISTS personal_prompt_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,

  prompt_title TEXT NOT NULL,
  prompt_description TEXT,

  original_request TEXT NOT NULL,
  optimized_prompt TEXT NOT NULL,

  category TEXT,
  tags TEXT[] DEFAULT '{}',
  target_platform TEXT,

  context_snapshot JSONB DEFAULT '{}',
  folders_used TEXT[] DEFAULT '{}',

  is_favorite BOOLEAN DEFAULT false,
  times_used INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

CREATE INDEX idx_prompt_library_user ON personal_prompt_library(user_id);
CREATE INDEX idx_prompt_library_category ON personal_prompt_library(category);
CREATE INDEX idx_prompt_library_favorite ON personal_prompt_library(is_favorite);
CREATE INDEX idx_prompt_library_tags ON personal_prompt_library USING GIN (tags);
```

**Components to Create**:
```
├── src/pages/PromptLibrary.tsx (new)
├── src/components/promptLibrary/PromptCard.tsx (update from existing)
├── src/components/promptLibrary/SavePromptModal.tsx (new)
└── src/components/promptLibrary/PromptDetailView.tsx (new)
```

**Tasks**:
- [ ] Run database migration
  - Create personal_prompt_library table
  - Add indexes for performance

- [ ] Build save prompt workflow
  - "Save to Library" button after optimization
  - Modal to add title/description
  - Auto-suggest category from content
  - Auto-generate tags from context used
  - Preview optimized prompt
  - Save with context snapshot

- [ ] Create library browse UI
  - Pinterest-style card grid
  - Filter by category
  - Filter by tag
  - Search by keyword
  - Favorites section
  - Sort by: recent, most used, alphabetical

- [ ] Implement prompt reuse
  - Click card to view full prompt
  - Copy to clipboard with one click
  - Edit and re-optimize
  - Track usage count
  - Mark as favorite

**Completion Criteria**:
- [ ] Prompts save with all metadata correctly
- [ ] Categories auto-suggest accurately
- [ ] Tags are relevant and useful
- [ ] Library UI is intuitive and fast
- [ ] Search and filter work smoothly
- [ ] Copy to clipboard works reliably
- [ ] Usage tracking increments correctly
- [ ] Users save 40%+ of optimized prompts

---

### Milestone 4.3: Pattern Recognition & Proactive Suggestions

**Database Schema**:
```sql
-- Conversation history for pattern detection
CREATE TABLE lila_conversation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  original_prompt TEXT NOT NULL,
  optimized_prompt TEXT,
  mentioned_members TEXT[] DEFAULT '{}',
  context_used JSONB DEFAULT '{}',
  optimization_method TEXT, -- 'javascript' or 'ai'
  platform_target TEXT,
  suggestions_generated INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversation_history_user ON lila_conversation_history(user_id);
CREATE INDEX idx_conversation_history_created ON lila_conversation_history(created_at DESC);
```

**Services to Create**:
```
└── src/lib/patternRecognitionService.ts (new)
```

**Tasks**:
- [ ] Build pattern detection
  - Track keywords across conversations
  - Detect 3+ mentions of same topic within time window
  - Identify recurring schedule patterns
  - Notice repeated food preferences

- [ ] Create proactive suggestion system
  - "I noticed you've mentioned X three times..."
  - Suggest saving as permanent context
  - Explain benefits of saving
  - One-click accept

- [ ] Implement smart reminders
  - "You mentioned Tuesday is always rushed"
  - Automatically factor into future suggestions
  - Learn user's patterns over time

**Completion Criteria**:
- [ ] Patterns detected accurately (no false positives)
- [ ] Suggestions are relevant, not annoying
- [ ] Acceptance rate > 60%
- [ ] Suggestions improve prompt quality over time
- [ ] Users feel LiLa "gets smarter" over time

---

### Phase 4 Complete When:
✅ Interview system guides new users through setup
✅ Interview completion rate > 70%
✅ Personal Prompt Library saves and organizes prompts
✅ Users save 40%+ of optimized prompts
✅ Pattern recognition suggests context proactively
✅ Pattern suggestions have 60%+ acceptance rate
✅ LiLa feels intelligent and helpful, not pushy
✅ Users report LiLa "understands their family"
✅ **Full LiLa Optimizer system is production-ready**

---

## 🗄️ Complete Database Schema Reference

### New Tables (All Phases)

```sql
-- Phase 3: Context suggestions from LiLa
CREATE TABLE lila_context_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_folder_id UUID REFERENCES archive_folders(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  suggested_value TEXT NOT NULL,
  reasoning TEXT,
  confidence DECIMAL(3,2) DEFAULT 0.0,
  status TEXT DEFAULT 'pending',
  source_conversation_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Phase 4: Personal prompt library
CREATE TABLE personal_prompt_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  prompt_title TEXT NOT NULL,
  prompt_description TEXT,
  original_request TEXT NOT NULL,
  optimized_prompt TEXT NOT NULL,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  target_platform TEXT,
  context_snapshot JSONB DEFAULT '{}',
  folders_used TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  times_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- Phase 2: Tool usage tracking
CREATE TABLE tool_usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id UUID REFERENCES library_items(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tool_id, date)
);

-- Phase 4: Conversation history for pattern detection
CREATE TABLE lila_conversation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  original_prompt TEXT NOT NULL,
  optimized_prompt TEXT,
  mentioned_members TEXT[] DEFAULT '{}',
  context_used JSONB DEFAULT '{}',
  optimization_method TEXT,
  platform_target TEXT,
  suggestions_generated INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Column Updates to Existing Tables

```sql
-- Phase 2: library_items (multi-tier + custom apps)
ALTER TABLE library_items
ADD COLUMN IF NOT EXISTS allowed_tiers JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'tutorial',
ADD COLUMN IF NOT EXISTS app_type TEXT,
ADD COLUMN IF NOT EXISTS external_url TEXT,
ADD COLUMN IF NOT EXISTS embedding_method TEXT DEFAULT 'iframe',
ADD COLUMN IF NOT EXISTS session_timeout_minutes INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS max_uses_per_day INTEGER DEFAULT 0;

-- Phase 1: archive_folders (already has these from previous work)
-- color_hex (already exists)
-- cover_photo_url (already exists)
-- No changes needed
```

---

## 📦 Dependencies & Environment

### NPM Dependencies
```json
{
  "dependencies": {
    "@supabase/storage-js": "^2.5.1",
    "lucide-react": "^0.263.1"
  }
}
```

**Note**: OpenRouter uses standard fetch API, no special library needed.

### Environment Variables
```bash
# OpenRouter AI Integration (Phase 3+)
OPENROUTER_API_KEY=sk-or-v1-xxxxx
OPENROUTER_DEFAULT_MODEL=anthropic/claude-3.5-sonnet
OPENROUTER_FALLBACK_MODEL=openai/gpt-4-turbo
OPENROUTER_MAX_COST_PER_FAMILY_PER_MONTH=1.00

# Feature Flags
ENABLE_LILA_OPTIMIZER=true
ENABLE_PROTECTED_TOOLS=true
ENABLE_PATTERN_RECOGNITION=true

# Cost Tracking
OPENROUTER_COST_ALERT_THRESHOLD=0.80
```

---

## ✅ Success Metrics by Phase

### Phase 1 Success Metrics
- [ ] 80%+ users personalize at least one folder
- [ ] 50%+ users upload cover photos
- [ ] Zero storage access errors
- [ ] Mobile usage matches desktop

### Phase 2 Success Metrics
- [ ] Admin can publish content to all tier combinations
- [ ] Protected tools prevent URL exposure (100% secure)
- [ ] Session management prevents abuse
- [ ] Zero unauthorized access incidents

### Phase 3 Success Metrics
- [ ] 80%+ optimizations use JavaScript (cost target met)
- [ ] Context suggestion acceptance rate > 60%
- [ ] Average optimization time < 3 seconds
- [ ] Cost per family per month < $1.50
- [ ] Optimized prompts rated better by users

### Phase 4 Success Metrics
- [ ] 70%+ new users complete interview
- [ ] 40%+ users save prompts to library
- [ ] Pattern detection generates useful suggestions
- [ ] Pattern acceptance rate > 60%
- [ ] Users report LiLa "understands their family"
- [ ] Return usage rate (users come back to LiLa)

---

## 🚨 Risk Mitigation

### Technical Risks
| Risk | Mitigation |
|------|-----------|
| OpenRouter API downtime | Fallback to JavaScript optimization |
| Cost overruns | Hard caps per family, usage monitoring, alerts |
| Storage quota exceeded | Monitor usage, implement compression |
| Performance degradation | Optimize queries, implement caching, lazy loading |

### User Experience Risks
| Risk | Mitigation |
|------|-----------|
| Overwhelming suggestions | Limit to 3 suggestions at a time, batch accept |
| Inaccurate context | Confidence thresholds, always ask permission |
| Privacy concerns | Clear explanations, use_for_context toggles |
| Feature complexity | Progressive disclosure, gentle onboarding |

### Business Risks
| Risk | Mitigation |
|------|-----------|
| Low adoption | In-app tutorials, examples, success stories |
| High costs | Usage caps, tier-based limits, cost alerts |
| Support burden | Comprehensive documentation, in-app help |

---

## 💰 Cost Estimates

### OpenRouter AI Costs (Phase 3+)
- **Target**: < $1.50 per family per month
- **Strategy**: 80% JavaScript (free), 20% AI ($0.03-0.08 per call)
- **Estimated usage**: 20-30 optimizations per family per month
- **Monthly cost per family**: $0.60 - $2.40
- **Mitigation**: Usage caps, cost alerts, fallback to JavaScript

### Supabase Storage Costs (Phase 1)
- **Cover photos**: ~5MB average per folder
- **Estimated**: 10 folders per family = 50MB
- **Cost**: Included in free tier (1GB)
- **Scaling**: $0.021 per GB after free tier

### Infrastructure
- **No additional infrastructure needed**
- Uses existing Supabase database
- OpenRouter handles AI compute
- No additional hosting costs

---

## 📝 Implementation Best Practices

### Development Workflow
1. **Create feature branch** for each milestone
2. **Implement and test** milestone in isolation
3. **Run all completion criteria** checks
4. **Commit with descriptive message** referencing milestone
5. **Merge to main** only when milestone fully complete
6. **Update this roadmap** with completion date

### Code Quality Standards
- TypeScript for all new components
- Comprehensive error handling
- Loading states for all async operations
- Mobile-first responsive design
- Accessibility (ARIA labels, keyboard navigation)

### Testing Requirements
- [ ] Manual testing on Chrome, Safari, Firefox
- [ ] Mobile testing on iOS and Android
- [ ] Test with real user data (not just test accounts)
- [ ] Performance testing (page load, API response times)
- [ ] Cost tracking during development

### Documentation Requirements
- JSDoc comments for all services
- README in each new directory explaining purpose
- Update component documentation as you go
- Keep this roadmap updated with progress

---

## 🎯 Milestone Tracking

### Phase 1: Archives Visual Enhancements
- [ ] Milestone 1.1: Color Picker System - **Not Started**
- [ ] Milestone 1.2: Cover Photo Upload - **Not Started**
- [ ] **Phase 1 Complete** - **Not Started**

### Phase 2: Library Admin System
- [ ] Milestone 2.1: Multi-Tier Access Control - **Not Started**
- [ ] Milestone 2.2: Custom AI App Content Type - **Not Started**
- [ ] Milestone 2.3: Session Management - **Not Started**
- [ ] **Phase 2 Complete** - **Not Started**

### Phase 3: LiLa Optimizer Foundation
- [ ] Milestone 3.1: OpenRouter Integration - **Not Started**
- [ ] Milestone 3.2: Family Member Recognition - **Not Started**
- [ ] Milestone 3.3: Prompt Optimization Engine - **Not Started**
- [ ] Milestone 3.4: Context Learning & Suggestions - **Not Started**
- [ ] **Phase 3 Complete** - **Not Started**

### Phase 4: LiLa Optimizer Advanced
- [ ] Milestone 4.1: Interview System - **Not Started**
- [ ] Milestone 4.2: Personal Prompt Library - **Not Started**
- [ ] Milestone 4.3: Pattern Recognition - **Not Started**
- [ ] **Phase 4 Complete** - **Not Started**

---

## 🔄 Next Actions

**Ready to Start**:
1. ✅ Review this roadmap
2. ⬜ Begin Milestone 1.1: ColorPickerModal component
3. ⬜ Create database migration file for Phase 1
4. ⬜ Update milestone tracking as work progresses

**Before Starting Phase 3** (LiLa):
1. ⬜ Set up OpenRouter account
2. ⬜ Test API integration in development
3. ⬜ Establish cost tracking system
4. ⬜ Ensure Phase 1 (Archives) is complete

---

## 📚 Reference Documents

**Source Specifications**:
- `color_picker_addition.md` - Archives visual enhancements detail
- `library-admin-system.md` - Library admin and protected tools
- `lila_optimizer_requirements.md` - LiLa core requirements
- `lila_context_flow.md` - Context learning flow diagrams

**Existing Codebase**:
- `src/styles/colors.js` - Color palette (100+ colors)
- `src/lib/archivesService.ts` - Archives data layer
- `src/components/archives/` - Existing archive components
- `src/pages/PromptLibrary.tsx` - Existing prompt library page
- `src/components/promptLibrary/` - Existing prompt library components
- `src/components/Admin/LibraryAdmin.jsx` - Library admin console

---

**Document Version**: 1.0
**Last Updated**: 2025-10-19
**Status**: Planning Complete - Ready to Begin Phase 1
