# MyAIM-Central Database Schema Reference

**Last Updated:** October 19, 2025

## Core Tables

### Authentication & Family Management

#### `families`
- Primary family unit table
- Links to auth.users via `auth_user_id`
- Contains subscription tier, context settings, connected platforms
- **Theme storage:** Uses `family_members.theme_preference` for individual themes

#### `family_members`
- Individual family member profiles
- Links to `families` and `auth.users`
- **Key fields for Command Center:**
  - `theme_preference` (text, default: 'classic') - stores user's theme choice
  - `dashboard_type` - adult/teen/child
  - `permissions` (jsonb) - access controls
  - `auth_user_id` (uuid) - links to Supabase auth

#### `user_preferences`
**EXISTS** - Generic key-value preference storage
- `user_id` (text)
- `preference_type` (text)
- `preference_value` (jsonb)
- Can be used for any user preference storage

---

### Library System

#### `library_items`
- AI tools, tutorials, workflows, prompt packs
- Supports 10+ tool types (Custom GPTs, Gemini Gems, Opal Apps, etc.)
- Multi-tier access control via `allowed_tiers` array
- Session tracking and usage limits
- Seasonal/gift tagging system

#### `library_categories`
- Predefined categories for organizing library content

#### `user_library_bookmarks`
- User's saved/favorited library items

#### `user_library_progress`
- Tracks completion status and time spent

#### `user_library_first_visits`
- Tracks when user first sees each item (for smart NEW badges)

#### `user_library_visits`
- Tracks all library visits for analytics

#### `tool_sessions`
- Active tool usage sessions
- Tracks timeout, usage counts, timestamps

---

### Best Intentions System

#### `best_intentions`
- Family goals and values
- Category-based organization
- Privacy levels (private/parents_only/family)
- AI reference tracking

#### `intention_categories`
- Organized categories for intentions
- System defaults + custom categories

#### `intention_progress`
- Journal entries and progress notes for intentions

#### `intention_opportunities`
- AI-suggested opportunities to reference intentions

---

### Context & AI Integration

#### `context_categories`
- Personality, child profiles, parenting philosophy, etc.
- Privacy levels and relevance tracking

#### `context_items`
- Individual context entries within categories
- RAG-powered content with embeddings

#### `context_effectiveness`
- Tracks how useful each context category is

#### `personas`
- AI persona templates (e.g., "Meal Planning Mom")

#### `mini_personas`
- Specialized sub-personas for specific tasks

#### `prompt_templates`
- LiLa optimization templates

---

### Task & Reward System

#### `tasks`
- Family task management
- QR code support, approval workflows
- AI-powered subtask generation

#### `task_templates`
- Reusable task templates

#### `family_rewards`
- Reward catalog (stars, points, money, privileges)

#### `reward_transactions`
- Transaction log for earning/spending

#### `member_reward_balances`
- Current balances per member per reward type

---

### Analytics & Tracking

#### `user_activity_log`
- Page visits and actions
- Session tracking

#### `feedback_submissions`
- Beta user feedback
- Issue tracking with priority/status

#### `beta_users`
- Beta tester management
- Setup completion, session tracking

---

## Missing Tables (Needed for Spec)

### `quick_action_usage`
**NOT IN SCHEMA** - Needs to be created for usage tracking

Proposed schema:
```sql
CREATE TABLE public.quick_action_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id),
  action_name TEXT NOT NULL,
  click_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_member_id, action_name)
);
```

---

## Key Insights for Command Center

### Theme Storage Options

**Option 1: family_members.theme_preference (RECOMMENDED)**
- ✅ Already exists
- ✅ Simple, direct
- ✅ One query to get user theme
- ✅ No extra tables

**Option 2: user_preferences table**
- ✅ Already exists
- ✅ More flexible (generic storage)
- ⚠️ Requires JSON parsing
- ⚠️ Extra complexity

**Recommendation:** Use `family_members.theme_preference` - simpler and already working

### Quick Action Tracking

**Current State:**
- ❌ No `quick_action_usage` table
- ❌ No click tracking
- ❌ No auto-sorting by frequency

**Needed:**
- Create `quick_action_usage` table
- Add Supabase insert/update on click
- Implement sort logic in QuickActions component

---

## RLS Policies

All tables use Row Level Security based on:
- `auth.uid()` - Current authenticated user
- `family_id` - Family membership
- `auth_user_id` - Direct user link (replaced old `wordpress_user_id`)

---

## Key Relationships

```
auth.users
  └── families (auth_user_id)
       └── family_members
            ├── tasks (assignee, created_by)
            ├── best_intentions (created_by)
            ├── context_items (family_id)
            └── user_library_bookmarks (user_id)
```

---

## Database Views

### `beta_user_overview`
Admin dashboard view of beta users with activity metrics

### `feedback_dashboard`
Admin view of feedback submissions with context

---

## Migration History

- ✅ Auth migration: wordpress_user_id → auth_user_id
- ✅ Beta system enhancements
- ✅ Best Intentions RLS and functions
- ✅ Library system upgrades
- ✅ Intention categories
- ⏳ Quick action usage tracking (pending)

---

## Connection Strings

**Tables requiring family_id:**
- families, family_members, tasks, best_intentions, context_categories, library_items, mindsweep_items, conversation_sessions

**Tables requiring user_id/auth_user_id:**
- family_members, beta_users, staff_permissions, user_activity_log, feedback_submissions

**Tables requiring both:**
- context_items, task_completions, lila_conversations

---

This schema supports the full MyAIM-Central ecosystem including Command Center, Library, Best Intentions, Archives, and AI integration.
