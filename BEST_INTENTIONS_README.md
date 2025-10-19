# Best Intentions System - Complete Documentation

**The Heart of MyAIM: Guiding What Matters Most**
**Last Updated:** 2025-10-18
**Version:** 2.0 (Production Ready)

---

## Table of Contents

1. [What Are Best Intentions?](#what-are-best-intentions)
2. [Feature Overview](#feature-overview)
3. [User Journey](#user-journey)
4. [System Architecture](#system-architecture)
5. [Database Schema](#database-schema)
6. [Components Breakdown](#components-breakdown)
7. [API Functions](#api-functions)
8. [Categories System](#categories-system)
9. [Privacy System](#privacy-system)
10. [AI Integration](#ai-integration)
11. [RLS Security](#rls-security)
12. [Admin Features](#admin-features)
13. [Usage Examples](#usage-examples)
14. [Testing Guide](#testing-guide)
15. [Roadmap](#roadmap)

---

## What Are Best Intentions?

### The Philosophy

**Best Intentions** are the priorities and goals you want to keep front of mind. They help LiLa™ understand what you're working toward – whether it's personal growth, relationships, household harmony, or the life you're building – so every interaction supports your journey.

### Why They Matter

Unlike traditional goal-setting apps that focus on metrics and checkboxes, Best Intentions focus on:

- **Context over completion** - What matters most, not just what's done
- **Journey over destination** - Current state → desired state, with the "why" clearly defined
- **Family alignment** - Shared values and individual growth coexist
- **AI-powered guidance** - LiLa™ uses your intentions to provide timely, relevant support

### The Four Pillars

Every Best Intention falls into one of four core categories:

1. **Family Relationships** 👨‍👩‍👧‍👦
   - Connection, communication, bonding
   - Parent-child relationships
   - Sibling harmony
   - Extended family connections

2. **Personal Growth** 🌱
   - Skills, habits, self-improvement
   - Education and learning
   - Health and wellness
   - Character development

3. **Household Culture** 🏡
   - Traditions, values, environment
   - Family routines and rituals
   - Home atmosphere
   - Cultural identity

4. **Spiritual Development** ❤️
   - Faith, meaning, inner growth
   - Values and ethics
   - Mindfulness and reflection
   - Life purpose

---

## Feature Overview

### Core Features

**✅ Intention Creation**
- Quick Add: Simple form for direct entry
- Brain Dump Coach: AI-assisted conversational creation
- Category-based organization
- Privacy-level selection

**✅ Intention Management**
- View all family intentions
- Filter by category
- Update status (active, in progress, achieved, paused, archived)
- Edit intention details
- Soft delete (archive) intentions

**✅ Category System**
- 4 system default categories
- Unlimited custom categories per family
- Future: Guiding Value categories from Inner Oracle assessments
- Color coding and icons
- Intention counts per category

**✅ Privacy Levels**
- **Family**: Everyone can see (parents + kids)
- **Parents Only**: Mom, Dad, guardians only
- **Private**: Only you (+ Mom always has access)

**✅ Status Tracking**
- Active - Currently working on
- In Progress - Making progress
- Achieved - Goal reached
- Paused - Temporarily on hold
- Archived - No longer active

**✅ Priority Levels**
- High - Urgent, top priority
- Medium - Important, steady progress
- Low - Nice to have, when time allows

---

## User Journey

### 1. First Time Experience

**Entry Point:** Click "Best Intentions" from Quick Actions or LiLa panel

**Landing View:**
```
┌─────────────────────────────────────────┐
│         Best Intentions                 │
│  Your compass for what matters most     │
├─────────────────────────────────────────┤
│                                         │
│  What are Best Intentions?              │
│  [Explanation text...]                  │
│                                         │
│  ┌─────────────┐  ┌─────────────┐     │
│  │ 👁️ View &   │  │ ➕ Create   │     │
│  │   Manage    │  │   New       │     │
│  └─────────────┘  └─────────────┘     │
│                                         │
│  Categories:                            │
│  👨‍👩‍👧‍👦 Family  🌱 Personal  🏡 Household  ❤️ Spiritual │
└─────────────────────────────────────────┘
```

### 2. Creating an Intention

**Step 1: Privacy Selection**
```
Who can see this intention?

┌──────────┐  ┌──────────┐  ┌──────────┐
│ Family   │  │ Parents  │  │ Private  │
│ Everyone │  │ Only     │  │ You+Mom  │
└──────────┘  └──────────┘  └──────────┘
   [Selected]
```

**Step 2: Creation Method**
```
How would you like to create it?

┌──────────────────┐  ┌──────────────────┐
│ Quick Add        │  │ Brain Dump       │
│ Simple form for  │  │ Talk it through  │
│ direct entry     │  │ with AI coach    │
└──────────────────┘  └──────────────────┘
```

**Step 3a: Quick Add Form**
```
Create New Intention

Category: [Family Relationships ▼]

Title:
[Be more present during family dinners]

Current State:
[We eat together but I'm often distracted by phone]

Desired State:
[Full attention on family, phones away, meaningful conversation]

Why It Matters:
[Kids are growing fast - don't want to miss these moments]

Priority: ○ High  ● Medium  ○ Low

[Cancel]  [Save Intention]
```

**Step 3b: Brain Dump Coach (AI-Assisted)**
```
┌─────────────────────────────────────────┐
│ LiLa™: Hi! I'm here to help organize   │
│ your thoughts. Tell me what's on your  │
│ mind about this intention...           │
│                                         │
│ User: I feel like I'm not present      │
│ during family dinners. Phone is always │
│ buzzing, work stuff in my head...      │
│                                         │
│ LiLa™: I hear you. Let's break this    │
│ down. What does "present" look like?   │
│                                         │
│ [Conversation continues...]            │
│                                         │
│ [Use SmartNotepad →]  [Save as Quick Add] │
└─────────────────────────────────────────┘
```

### 3. Viewing Intentions

**View Mode:**
```
┌──────────────┬──────────────────────────┐
│ Categories   │ All Family Intentions    │
├──────────────┤                          │
│ All (5)      │ ┌─────────────────────┐ │
│              │ │ 📌 High Priority     │ │
│ System       │ │ Be more present...  │ │
│ 👨‍👩‍👧‍👦 Family (3)│ │ Status: Active      │ │
│ 🌱 Personal(2│ │ Privacy: Family     │ │
│ 🏡 Culture (0│ │ Created by: Mom     │ │
│ ❤️ Spiritual(0│ └─────────────────────┘ │
│              │                          │
│ Custom       │ ┌─────────────────────┐ │
│ 📚 Homeschool│ │ 📌 Medium Priority  │ │
│              │ │ Practice patience.. │ │
│ [+ Add Custom│ │ Status: In Progress │ │
└──────────────┴──────────────────────────┘
```

### 4. Editing/Managing Intentions

**Intention Card Actions:**
- Click title to expand/collapse details
- Edit button (if you created it)
- Delete button (if you created it)
- Status dropdown (anyone can update)
- View who created it and when

---

## System Architecture

### Component Hierarchy

```
BestIntentionsModal (Main Container)
├── Landing View
│   ├── Info Section
│   ├── View & Manage Card
│   ├── Create New Card
│   └── Category Overview Grid
│
├── View Mode
│   ├── CategoryFilter (Sidebar)
│   │   ├── System Categories
│   │   ├── Custom Categories
│   │   └── Add Custom Button → AddCategoryModal
│   │
│   └── Intentions Display Area
│       ├── IntentionCard (foreach intention)
│       │   ├── Title & Description
│       │   ├── Current → Desired States
│       │   ├── Why It Matters
│       │   ├── Status Selector
│       │   ├── Priority Badge
│       │   ├── Privacy Badge
│       │   └── Action Buttons (Edit/Delete)
│       │
│       └── Empty State (if no intentions)
│
└── Create Mode
    ├── Privacy Selector
    │   ├── Family Option
    │   ├── Parents Only Option
    │   └── Private Option
    │
    └── Creation Method Selector
        ├── Quick Add → QuickAddForm
        │   ├── Category Selector
        │   ├── Title Input
        │   ├── Current State Textarea
        │   ├── Desired State Textarea
        │   ├── Why It Matters Textarea
        │   ├── Priority Selector
        │   └── Save Button
        │
        └── Brain Dump → BrainDumpCoach
            ├── AI Chat Interface
            ├── SmartNotepad Integration
            └── Convert to Quick Add
```

### Data Flow

```
User Interaction
      ↓
BestIntentionsModal (State Management)
      ↓
API Layer (src/lib/intentions.js)
      ↓
Supabase Client
      ↓
PostgreSQL Database + RLS Policies
      ↓
Data Returned
      ↓
Component Re-render
```

---

## Database Schema

### Table: `best_intentions`

**Purpose:** Store all family intentions

```sql
CREATE TABLE best_intentions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES family_members(id),
  category_id UUID NOT NULL REFERENCES intention_categories(id),

  -- Core Fields
  title TEXT NOT NULL,
  current_state TEXT NOT NULL,
  desired_state TEXT NOT NULL,
  why_it_matters TEXT NOT NULL,

  -- Metadata
  priority TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('high', 'medium', 'low')),

  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'in_progress', 'achieved', 'paused', 'archived')),

  privacy_level TEXT NOT NULL DEFAULT 'family'
    CHECK (privacy_level IN ('private', 'parents_only', 'family')),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Soft Delete
  is_active BOOLEAN NOT NULL DEFAULT true
);
```

**Indexes:**
```sql
CREATE INDEX idx_best_intentions_family_id ON best_intentions(family_id);
CREATE INDEX idx_best_intentions_created_by ON best_intentions(created_by);
CREATE INDEX idx_best_intentions_category_id ON best_intentions(category_id);
CREATE INDEX idx_best_intentions_status ON best_intentions(status);
CREATE INDEX idx_best_intentions_is_active ON best_intentions(is_active);
```

---

### Table: `intention_categories`

**Purpose:** System default and custom categories

```sql
CREATE TABLE intention_categories (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Key (NULL for system defaults)
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,

  -- Core Fields
  category_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📋',
  color_hex TEXT DEFAULT '#68a395',

  -- Metadata
  category_type TEXT NOT NULL DEFAULT 'custom'
    CHECK (category_type IN ('system_default', 'custom', 'guiding_value')),

  -- For Future: Inner Oracle Integration
  source_type TEXT,  -- 'inner_oracle', 'user_created', etc.
  source_id UUID,    -- Reference to assessment ID

  -- Display
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(family_id, category_name)
);
```

**System Default Categories:**
```sql
INSERT INTO intention_categories
(category_name, display_name, description, icon, color_hex, category_type, sort_order)
VALUES
('family_relationships', 'Family Relationships',
 'Intentions focused on strengthening family bonds and connections',
 '👨‍👩‍👧‍👦', '#68a395', 'system_default', 1),

('personal_growth', 'Personal Growth',
 'Individual development, learning, and self-improvement goals',
 '🌱', '#d6a461', 'system_default', 2),

('household_culture', 'Household Culture',
 'Creating positive family environment, traditions, and values',
 '🏡', '#b99c34', 'system_default', 3),

('spiritual_development', 'Spiritual Development',
 'Faith, meaning, purpose, and inner growth',
 '❤️', '#d69a84', 'system_default', 4);
```

---

## Components Breakdown

### 1. BestIntentionsModal

**Location:** `src/components/BestIntentions/BestIntentionsModal.tsx`

**Purpose:** Main container managing all views and state

**State:**
```typescript
viewMode: 'landing' | 'view' | 'create'
selectedPrivacy: 'private' | 'parents_only' | 'family'
intentions: Intention[]
selectedCategoryId: string | null
loading: boolean
error: string | null
showBrainDump: boolean
showQuickAdd: boolean
showAddCategoryModal: boolean
```

**Key Methods:**
```typescript
loadIntentions() // Fetch intentions from database
handleStatusChange(intentionId, status) // Update status
handleDeleteIntention(intentionId) // Soft delete
handleEditIntention(intention) // Edit existing (future)
```

**Props:**
```typescript
interface BestIntentionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Usage:**
```javascript
<BestIntentionsModal
  isOpen={showBestIntentions}
  onClose={() => setShowBestIntentions(false)}
/>
```

---

### 2. QuickAddForm

**Location:** `src/components/BestIntentions/QuickAddForm.tsx`

**Purpose:** Simple form for quick intention entry

**Features:**
- Category dropdown (system + custom)
- Title input (required)
- Current state textarea (required)
- Desired state textarea (required)
- Why it matters textarea (required)
- Priority selector (high/medium/low)
- Form validation
- Direct save to database

**Props:**
```typescript
interface QuickAddFormProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  selectedPrivacy: PrivacyLevel;
  familyId: string;
  onSuccess?: () => void;
}
```

**Usage:**
```javascript
<QuickAddForm
  isOpen={showQuickAdd}
  onClose={() => setShowQuickAdd(false)}
  onBack={() => setShowQuickAdd(false)}
  selectedPrivacy="family"
  familyId={user.familyId}
  onSuccess={() => {
    loadIntentions(); // Refresh list
  }}
/>
```

---

### 3. BrainDumpCoach

**Location:** `src/components/BestIntentions/BrainDumpCoach.tsx`

**Purpose:** AI-assisted conversational intention creation

**Features:**
- Chat-based interface with LiLa™
- SmartNotepad integration for organizing thoughts
- Conversational guidance to clarify:
  - What you're working toward
  - Current state
  - Desired future state
  - Why it matters
- Convert conversation to structured Quick Add form

**Conversation Flow:**
```
1. LiLa: "Tell me what's on your mind..."
2. User: [Brain dump their thoughts]
3. LiLa: "I hear you. Let's break this down..."
4. [Series of clarifying questions]
5. LiLa: "Here's what I'm hearing. Does this capture it?"
6. User: "Yes!"
7. → Auto-populate Quick Add form
```

**Props:**
```typescript
interface BrainDumpCoachProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  selectedPrivacy: PrivacyLevel;
}
```

---

### 4. CategoryFilter

**Location:** `src/components/BestIntentions/CategoryFilter.tsx`

**Purpose:** Sidebar for filtering intentions by category

**Features:**
- "All Categories" option
- System default categories (4)
- Custom family categories
- Intention count badges (optional)
- "Add Custom Category" button
- Color-coded icons
- Active category highlighting

**Props:**
```typescript
interface CategoryFilterProps {
  familyId: string;
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  onAddCustom?: () => void;
  showCounts?: boolean;
}
```

**Visual Structure:**
```
┌─────────────────┐
│ All Categories  │ (5)
├─────────────────┤
│ System          │
│ 👨‍👩‍👧‍👦 Family      │ (3) ←
│ 🌱 Personal     │ (2)
│ 🏡 Culture      │ (0)
│ ❤️ Spiritual    │ (0)
├─────────────────┤
│ Custom          │
│ 📚 Homeschool   │ (1)
│ 🏋️ Fitness      │ (2)
│                 │
│ [+ Add Custom]  │
└─────────────────┘
```

---

### 5. IntentionCard

**Location:** `src/components/BestIntentions/IntentionCard.tsx`

**Purpose:** Display individual intention with all details

**Features:**
- Expandable/collapsible
- Priority badge (high/medium/low)
- Privacy badge (family/parents/private)
- Status dropdown
- Edit button (if user is creator)
- Delete button (if user is creator)
- Created by & created at
- Color-coded category icon

**Props:**
```typescript
interface IntentionCardProps {
  intention: Intention;
  onEdit?: (intention: Intention) => void;
  onDelete?: (intentionId: string) => void;
  onStatusChange?: (intentionId: string, status: string) => void;
  currentUserId?: string;
  isCompact?: boolean;
}
```

**Visual Structure:**
```
┌─────────────────────────────────────┐
│ 📌 HIGH    👨‍👩‍👧‍👦 Family Relationships │
│                                     │
│ Be more present during dinners      │
│                                     │
│ Current: Often distracted by phone  │
│ Desired: Full attention on family   │
│                                     │
│ Why: Kids growing fast - don't miss│
│      these precious moments         │
│                                     │
│ Status: [Active ▼] 🔒 Family       │
│ Created by Mom • 2 days ago         │
│                                     │
│ [Edit] [Delete]                     │
└─────────────────────────────────────┘
```

---

### 6. AddCategoryModal

**Location:** `src/components/BestIntentions/AddCategoryModal.tsx`

**Purpose:** Create custom categories for your family

**Features:**
- Display name input
- Description textarea
- Icon selector (emoji picker)
- Color picker
- Unique name validation
- Preview of category card

**Props:**
```typescript
interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryAdded: (newCategory: Category) => void;
}
```

**Usage:**
```javascript
<AddCategoryModal
  isOpen={showAddCategory}
  onClose={() => setShowAddCategory(false)}
  onCategoryAdded={(newCategory) => {
    console.log('New category:', newCategory);
    // Refresh category list
  }}
/>
```

---

## API Functions

**Location:** `src/lib/intentions.js`

### 1. getFamilyIntentions(familyId)

**Purpose:** Get all active intentions for a family

**Returns:** `Intention[]` with joined category data

**Example:**
```javascript
const intentions = await getFamilyIntentions(user.familyId);
// [
//   {
//     id: 'uuid',
//     title: 'Be more present during dinners',
//     current_state: 'Often distracted...',
//     desired_state: 'Full attention...',
//     why_it_matters: 'Kids growing fast...',
//     priority: 'high',
//     status: 'active',
//     privacy_level: 'family',
//     intention_categories: {
//       display_name: 'Family Relationships',
//       icon: '👨‍👩‍👧‍👦',
//       color_hex: '#68a395'
//     }
//   }
// ]
```

---

### 2. getIntentionsByCategory(familyId, categoryId)

**Purpose:** Get intentions filtered by category

**Returns:** `Intention[]`

**Example:**
```javascript
const familyIntentions = await getIntentionsByCategory(
  user.familyId,
  'family-relationships-category-id'
);
```

---

### 3. createIntention(intentionData)

**Purpose:** Create new intention

**Params:**
```javascript
{
  family_id: string;
  created_by: string; // family_member.id
  title: string;
  current_state: string;
  desired_state: string;
  why_it_matters: string;
  category_id: string;
  priority: 'high' | 'medium' | 'low';
  privacy_level: 'private' | 'parents_only' | 'family';
}
```

**Returns:** `Intention` with joined category data

**Example:**
```javascript
const newIntention = await createIntention({
  family_id: user.familyId,
  created_by: user.familyMemberId,
  title: 'Practice patience with toddler',
  current_state: 'Often get frustrated and raise my voice',
  desired_state: 'Stay calm, use gentle guidance',
  why_it_matters: 'Want to model emotional regulation',
  category_id: personalGrowthCategoryId,
  priority: 'high',
  privacy_level: 'private'
});
```

---

### 4. updateIntention(intentionId, updates)

**Purpose:** Update intention fields

**Example:**
```javascript
const updated = await updateIntention(intentionId, {
  title: 'New title',
  current_state: 'Updated current state',
  priority: 'medium'
});
```

---

### 5. deleteIntention(intentionId)

**Purpose:** Soft delete (archive) intention

**Returns:** `true` on success

**Example:**
```javascript
await deleteIntention(intentionId);
// Sets is_active = false
```

---

### 6. updateIntentionStatus(intentionId, status)

**Purpose:** Update just the status field

**Status Options:**
- `active` - Currently working on
- `in_progress` - Making progress
- `achieved` - Goal reached
- `paused` - Temporarily on hold
- `archived` - No longer active

**Example:**
```javascript
await updateIntentionStatus(intentionId, 'achieved');
```

---

### 7. getIntentionStats(familyId)

**Purpose:** Get statistics for dashboard widgets

**Returns:**
```javascript
{
  total: 5,
  byStatus: {
    active: 3,
    in_progress: 1,
    achieved: 1
  },
  byPriority: {
    high: 2,
    medium: 2,
    low: 1
  },
  byCategory: {
    'category-id-1': 3,
    'category-id-2': 2
  }
}
```

---

## Categories System

**Location:** `src/lib/categories.js`

### 1. getFamilyCategories(familyId)

**Purpose:** Get system defaults + custom categories for a family

**Features:**
- Uses RPC function `get_family_categories` (optimized query)
- Fallback to direct query if RPC doesn't exist
- Mock data fallback for development

**Returns:** `Category[]`

**Example:**
```javascript
const categories = await getFamilyCategories(user.familyId);
// [
//   {
//     id: 'uuid',
//     category_name: 'family_relationships',
//     display_name: 'Family Relationships',
//     description: 'Strengthen family bonds...',
//     icon: '👨‍👩‍👧‍👦',
//     color_hex: '#68a395',
//     category_type: 'system_default',
//     sort_order: 1
//   },
//   {
//     id: 'uuid',
//     category_name: 'homeschool',
//     display_name: 'Homeschool',
//     icon: '📚',
//     color_hex: '#4a90e2',
//     category_type: 'custom',
//     family_id: 'family-uuid'
//   }
// ]
```

---

### 2. createCustomCategory(familyId, categoryData)

**Purpose:** Create family-specific custom category

**Params:**
```javascript
{
  display_name: string; // e.g., "Homeschool"
  description?: string;
  icon?: string; // emoji, default '📋'
  color_hex?: string; // default '#68a395'
  sort_order?: number;
}
```

**Auto-generates:** `category_name` from `display_name`
- Lowercase
- Remove special characters
- Replace spaces with underscores
- Max 50 characters

**Example:**
```javascript
const newCategory = await createCustomCategory(user.familyId, {
  display_name: 'Homeschool Goals',
  description: 'Intentions for our homeschool journey',
  icon: '📚',
  color_hex: '#4a90e2'
});
// category_name auto-generated: 'homeschool_goals'
```

---

### 3. createGuidingValueCategory(familyId, guidingValue, assessmentId)

**Purpose:** Create category from Inner Oracle guiding value (future feature)

**Example:**
```javascript
// When user completes Inner Oracle assessment
const guidingValues = ['Connection', 'Growth', 'Peace'];

for (const value of guidingValues) {
  await createGuidingValueCategory(
    user.familyId,
    value,
    assessmentId
  );
}

// Creates categories:
// - Connection (⭐, guiding_value type)
// - Growth (⭐, guiding_value type)
// - Peace (⭐, guiding_value type)
```

---

### 4. getCategoryCounts(familyId)

**Purpose:** Get intention counts per category

**Returns:**
```javascript
{
  'category-id-1': 5,
  'category-id-2': 3,
  'category-id-3': 0
}
```

**Usage:** Display counts in CategoryFilter sidebar

---

## Privacy System

### Privacy Levels Explained

#### 1. Family (Default)

**Who Can See:**
- All family members (parents + children)
- Anyone in the `family_members` table

**When to Use:**
- Shared family goals (e.g., "Have family dinners 5x/week")
- Values you want kids to know (e.g., "Practice gratitude daily")
- Household culture intentions (e.g., "Create weekly family game night")

**RLS Policy:**
```sql
-- Anyone in the family can read
EXISTS (
  SELECT 1 FROM family_members fm
  WHERE fm.family_id = best_intentions.family_id
  AND fm.auth_user_id = auth.uid()
)
```

---

#### 2. Parents Only

**Who Can See:**
- Family members with role = 'primary_parent' OR 'parent'
- Mom, Dad, guardians only

**When to Use:**
- Parenting goals (e.g., "Be more patient with tantrums")
- Relationship intentions (e.g., "Weekly date nights")
- Adult personal growth (e.g., "Read parenting book monthly")

**RLS Policy:**
```sql
-- Only parents can read
EXISTS (
  SELECT 1 FROM family_members fm
  WHERE fm.family_id = best_intentions.family_id
  AND fm.auth_user_id = auth.uid()
  AND fm.role IN ('primary_parent', 'parent')
)
```

---

#### 3. Private

**Who Can See:**
- Only the person who created it
- **Exception:** Mom (primary_parent) can ALWAYS see all intentions

**When to Use:**
- Personal struggles (e.g., "Overcome anxiety about work")
- Individual growth (e.g., "Stop comparing myself to others")
- Sensitive topics (e.g., "Heal from past trauma")

**RLS Policy:**
```sql
-- Creator can always read
best_intentions.created_by = (
  SELECT id FROM family_members
  WHERE auth_user_id = auth.uid()
)

OR

-- Primary parent can always read (Mom override)
EXISTS (
  SELECT 1 FROM family_members fm
  WHERE fm.family_id = best_intentions.family_id
  AND fm.auth_user_id = auth.uid()
  AND fm.role = 'primary_parent'
)
```

**Why Mom Can See Everything:**
- Safety and oversight
- Support children's emotional health
- Respond to concerning intentions
- Provide appropriate guidance

---

## AI Integration

### LiLa™ Context Usage

Best Intentions provide crucial context for LiLa™ to give personalized, relevant guidance.

#### When LiLa™ Accesses Intentions

**1. Chat Interactions**
```
User: "I'm feeling overwhelmed today"

LiLa™ checks:
- User's active intentions
- High priority intentions
- Recent status changes

LiLa™ Response:
"I see you're working on 'Practice self-care daily'
and 'Set boundaries at work'. Would it help to talk
through what's overwhelming you right now?"
```

**2. Task Suggestions**
```
LiLa™ sees intention:
"Practice gratitude with kids"

LiLa™ suggests:
"Would you like me to create a 'Gratitude Jar' task
for the family? This aligns with your intention to
practice gratitude with the kids."
```

**3. Opportunity Recognition**
```
LiLa™ sees intention:
"Strengthen relationship with teenage son"

User creates task:
"Take Alex to basketball game"

LiLa™ comments:
"This is a great step toward your intention!
One-on-one time can really strengthen your connection."
```

---

### Brain Dump Coach AI

**Conversation Patterns:**

**Opening:**
```
"Hi! I'm here to help you organize your thoughts
into a clear intention. Tell me what's on your mind..."
```

**Clarifying Questions:**
```
- "What does [their goal] look like for you?"
- "How would you know you're making progress?"
- "Why does this matter to you right now?"
- "What's one small step toward this?"
```

**Summarizing:**
```
"Let me make sure I understand...

Current State: [summary]
Desired State: [summary]
Why It Matters: [summary]

Does this capture what you're aiming for?"
```

**Conversion:**
```
"Great! I'll help you create this as an intention.
Let me pre-fill the form for you..."

→ Opens Quick Add with fields populated
```

---

## RLS Security

### Row Level Security Policies

**All tables have RLS ENABLED:**
```sql
ALTER TABLE best_intentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE intention_categories ENABLE ROW LEVEL SECURITY;
```

---

### best_intentions Policies

#### Policy 1: Family members can read based on privacy level

```sql
CREATE POLICY "Family members can read based on privacy"
ON best_intentions FOR SELECT
TO authenticated
USING (
  -- Family privacy: Anyone in family can read
  (privacy_level = 'family' AND EXISTS (
    SELECT 1 FROM family_members fm
    WHERE fm.family_id = best_intentions.family_id
    AND fm.auth_user_id = auth.uid()
  ))

  OR

  -- Parents only: Only parents can read
  (privacy_level = 'parents_only' AND EXISTS (
    SELECT 1 FROM family_members fm
    WHERE fm.family_id = best_intentions.family_id
    AND fm.auth_user_id = auth.uid()
    AND fm.role IN ('primary_parent', 'parent')
  ))

  OR

  -- Private: Only creator can read
  (privacy_level = 'private' AND best_intentions.created_by = (
    SELECT id FROM family_members
    WHERE auth_user_id = auth.uid()
  ))

  OR

  -- Mom override: Primary parent can always read
  EXISTS (
    SELECT 1 FROM family_members fm
    WHERE fm.family_id = best_intentions.family_id
    AND fm.auth_user_id = auth.uid()
    AND fm.role = 'primary_parent'
  )
);
```

---

#### Policy 2: Family members can create intentions

```sql
CREATE POLICY "Family members can create intentions"
ON best_intentions FOR INSERT
TO authenticated
WITH CHECK (
  -- Must be creating for their own family
  EXISTS (
    SELECT 1 FROM family_members fm
    WHERE fm.family_id = best_intentions.family_id
    AND fm.auth_user_id = auth.uid()
  )

  AND

  -- created_by must be their own family_member record
  best_intentions.created_by = (
    SELECT id FROM family_members
    WHERE auth_user_id = auth.uid()
  )
);
```

---

#### Policy 3: Only creator can update/delete

```sql
CREATE POLICY "Creator can update own intentions"
ON best_intentions FOR UPDATE
TO authenticated
USING (
  best_intentions.created_by = (
    SELECT id FROM family_members
    WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "Creator can delete own intentions"
ON best_intentions FOR DELETE
TO authenticated
USING (
  best_intentions.created_by = (
    SELECT id FROM family_members
    WHERE auth_user_id = auth.uid()
  )
);
```

---

#### Policy 4: Anyone in family can update status

```sql
CREATE POLICY "Family can update intention status"
ON best_intentions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM family_members fm
    WHERE fm.family_id = best_intentions.family_id
    AND fm.auth_user_id = auth.uid()
  )
)
WITH CHECK (
  -- Only status field can be updated by non-creators
  -- (This is enforced in the application layer)
  true
);
```

---

### intention_categories Policies

#### Policy 1: Everyone can read system defaults

```sql
CREATE POLICY "Anyone can read system categories"
ON intention_categories FOR SELECT
TO authenticated
USING (
  family_id IS NULL
  AND category_type = 'system_default'
);
```

---

#### Policy 2: Family members can read own custom categories

```sql
CREATE POLICY "Family can read own custom categories"
ON intention_categories FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM family_members fm
    WHERE fm.family_id = intention_categories.family_id
    AND fm.auth_user_id = auth.uid()
  )
);
```

---

#### Policy 3: Family members can create custom categories

```sql
CREATE POLICY "Family can create custom categories"
ON intention_categories FOR INSERT
TO authenticated
WITH CHECK (
  -- Must be creating for their own family
  EXISTS (
    SELECT 1 FROM family_members fm
    WHERE fm.family_id = intention_categories.family_id
    AND fm.auth_user_id = auth.uid()
  )

  AND

  -- Must be custom type
  category_type = 'custom'
);
```

---

## Admin Features

### Category Management

**System Admin Tasks:**

1. **Add System Default Category**
```sql
INSERT INTO intention_categories
(category_name, display_name, description, icon, color_hex, category_type, sort_order)
VALUES
('new_category', 'New Category', 'Description...', '📋', '#68a395', 'system_default', 5);
```

2. **Update System Category**
```sql
UPDATE intention_categories
SET display_name = 'Updated Name',
    description = 'Updated description',
    icon = '🆕'
WHERE category_name = 'system_category_name'
AND family_id IS NULL;
```

3. **Archive System Category**
```sql
UPDATE intention_categories
SET is_active = false
WHERE id = 'category-uuid';
```

---

### Moderation Features (Future)

**Planned for v2.1:**

- Flag inappropriate intentions
- Admin review queue
- Auto-moderation for concerning content
- Privacy violation detection
- Age-appropriate content filtering

---

## Usage Examples

### Example 1: Mom Creates Family Intention

```javascript
import { useAuthContext } from './components/auth/shared/AuthContext';
import { createIntention } from './lib/intentions';

const CreateFamilyIntention = () => {
  const { state } = useAuthContext();

  const createFamilyDinnerIntention = async () => {
    const intention = await createIntention({
      family_id: state.user.familyId,
      created_by: state.user.familyMemberId,
      title: 'Have family dinners together 5x per week',
      current_state: 'We eat together maybe 2-3 times per week, often rushed',
      desired_state: 'Sitting down together 5 nights, phones away, real conversations',
      why_it_matters: 'Kids are growing up fast. These moments matter. Want to build strong connections.',
      category_id: familyRelationshipsCategoryId,
      priority: 'high',
      privacy_level: 'family' // Everyone can see
    });

    console.log('Created:', intention);
  };

  return (
    <button onClick={createFamilyDinnerIntention}>
      Create Family Dinner Intention
    </button>
  );
};
```

---

### Example 2: Teen Creates Private Intention

```javascript
const TeenPrivateIntention = () => {
  const { state } = useAuthContext();

  const createPrivateGoal = async () => {
    const intention = await createIntention({
      family_id: state.user.familyId,
      created_by: state.user.familyMemberId,
      title: 'Feel more confident talking to people at church',
      current_state: 'Get really anxious, avoid eye contact, stay quiet',
      desired_state: 'Can smile, say hi, have short conversations without panicking',
      why_it_matters: 'Tired of feeling left out. Want to make friends.',
      category_id: personalGrowthCategoryId,
      priority: 'medium',
      privacy_level: 'private' // Only teen + mom can see
    });

    console.log('Created private intention:', intention);
  };

  return <button onClick={createPrivateGoal}>Create Private Goal</button>;
};
```

---

### Example 3: Filter Intentions by Category

```javascript
const IntentionsView = () => {
  const [intentions, setIntentions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { state } = useAuthContext();

  const loadIntentions = async () => {
    const data = selectedCategory
      ? await getIntentionsByCategory(state.user.familyId, selectedCategory)
      : await getFamilyIntentions(state.user.familyId);

    setIntentions(data);
  };

  useEffect(() => {
    loadIntentions();
  }, [selectedCategory]);

  return (
    <div>
      <CategoryFilter
        familyId={state.user.familyId}
        selectedCategoryId={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {intentions.map(intention => (
        <IntentionCard
          key={intention.id}
          intention={intention}
          currentUserId={state.user.id}
        />
      ))}
    </div>
  );
};
```

---

### Example 4: Update Intention Status

```javascript
const IntentionStatusUpdater = ({ intentionId }) => {
  const updateStatus = async (newStatus) => {
    await updateIntentionStatus(intentionId, newStatus);
    console.log(`Status updated to: ${newStatus}`);
  };

  return (
    <select onChange={(e) => updateStatus(e.target.value)}>
      <option value="active">Active</option>
      <option value="in_progress">In Progress</option>
      <option value="achieved">Achieved</option>
      <option value="paused">Paused</option>
      <option value="archived">Archived</option>
    </select>
  );
};
```

---

### Example 5: Create Custom Category

```javascript
const CreateHomeschoolCategory = () => {
  const { state } = useAuthContext();

  const createCategory = async () => {
    const category = await createCustomCategory(state.user.familyId, {
      display_name: 'Homeschool Goals',
      description: 'Intentions for our homeschool journey',
      icon: '📚',
      color_hex: '#4a90e2'
    });

    console.log('New category:', category);
    // {
    //   id: 'uuid',
    //   category_name: 'homeschool_goals', // auto-generated
    //   display_name: 'Homeschool Goals',
    //   icon: '📚',
    //   color_hex: '#4a90e2',
    //   category_type: 'custom'
    // }
  };

  return <button onClick={createCategory}>Create Homeschool Category</button>;
};
```

---

## Testing Guide

### Manual Testing Checklist

#### Test 1: Create Intention (Quick Add)
- [ ] Open Best Intentions modal
- [ ] Click "Create New"
- [ ] Select privacy level (Family)
- [ ] Click "Quick Add"
- [ ] Fill all fields
- [ ] Click "Save Intention"
- [ ] Verify intention appears in "View & Manage"
- [ ] Check database: `SELECT * FROM best_intentions ORDER BY created_at DESC LIMIT 1;`

#### Test 2: Create Intention (Brain Dump)
- [ ] Open Best Intentions modal
- [ ] Click "Create New"
- [ ] Select privacy level (Private)
- [ ] Click "Brain Dump"
- [ ] Have conversation with LiLa™
- [ ] Verify SmartNotepad integration
- [ ] Convert to Quick Add
- [ ] Save intention
- [ ] Verify in database

#### Test 3: Filter by Category
- [ ] Open Best Intentions "View & Manage"
- [ ] Click "All Categories" - see all intentions
- [ ] Click "Family Relationships" - see only family intentions
- [ ] Click "Personal Growth" - see only personal intentions
- [ ] Verify counts are accurate

#### Test 4: Update Status
- [ ] Open existing intention
- [ ] Change status from "Active" to "In Progress"
- [ ] Refresh page
- [ ] Verify status persisted
- [ ] Check database: `SELECT status FROM best_intentions WHERE id = 'uuid';`

#### Test 5: Delete Intention
- [ ] Open intention you created
- [ ] Click "Delete"
- [ ] Confirm deletion
- [ ] Verify intention disappears from list
- [ ] Check database: `SELECT is_active FROM best_intentions WHERE id = 'uuid';`
- [ ] Should be `false` (soft delete)

#### Test 6: Privacy Levels
- [ ] Create intention with privacy = "private" as Teen
- [ ] Log in as Mom (primary_parent)
- [ ] Verify Mom can see Teen's private intention
- [ ] Log in as younger sibling
- [ ] Verify sibling CANNOT see Teen's private intention

#### Test 7: Custom Category
- [ ] Click "Add Custom Category"
- [ ] Enter display name "Homeschool"
- [ ] Add description
- [ ] Choose icon and color
- [ ] Save category
- [ ] Verify appears in category filter
- [ ] Create intention using new category
- [ ] Verify intention shows with custom category

---

### Database Testing

**Test RLS Policies:**

```sql
-- Test 1: User can read their family's intentions
SET request.jwt.claims.sub = 'user-auth-uuid';

SELECT * FROM best_intentions
WHERE family_id = 'family-uuid';
-- Should return intentions based on privacy level

-- Test 2: User CANNOT read other family's intentions
SELECT * FROM best_intentions
WHERE family_id = 'different-family-uuid';
-- Should return 0 rows

-- Test 3: User can create intention
INSERT INTO best_intentions
(family_id, created_by, title, current_state, desired_state, why_it_matters, category_id)
VALUES
('their-family-uuid', 'their-member-uuid', 'Test', 'Current', 'Desired', 'Why', 'category-uuid');
-- Should succeed

-- Test 4: User CANNOT create intention for other family
INSERT INTO best_intentions
(family_id, created_by, title, current_state, desired_state, why_it_matters, category_id)
VALUES
('other-family-uuid', 'their-member-uuid', 'Test', 'Current', 'Desired', 'Why', 'category-uuid');
-- Should fail with RLS violation
```

---

## Roadmap

### Phase 1: ✅ Complete (Current)

- [x] Core CRUD operations
- [x] Category system (system + custom)
- [x] Privacy levels (family, parents, private)
- [x] Priority levels
- [x] Status tracking
- [x] Quick Add form
- [x] Brain Dump Coach integration
- [x] RLS security policies
- [x] Category filtering
- [x] Intention cards with actions
- [x] Soft delete (archive)

### Phase 2: 🚧 In Progress

- [ ] Edit intention functionality
- [ ] Intention history/changelog
- [ ] Search and advanced filtering
- [ ] Sort options (date, priority, status)
- [ ] Export intentions to PDF/CSV
- [ ] Print-friendly view

### Phase 3: 📅 Planned (Q2 2025)

- [ ] Inner Oracle integration
  - [ ] Auto-create categories from guiding values
  - [ ] Link intentions to guiding values
  - [ ] Values alignment scoring
- [ ] Progress tracking
  - [ ] Milestones within intentions
  - [ ] Visual progress indicators
  - [ ] Reflection prompts
- [ ] Family dashboard widget
  - [ ] Show active intentions
  - [ ] Quick status updates
  - [ ] Priority highlights

### Phase 4: 🔮 Future

- [ ] Intention templates
  - [ ] Pre-made intentions for common goals
  - [ ] Community-shared templates
  - [ ] Age-appropriate templates
- [ ] Collaborative intentions
  - [ ] Multiple creators
  - [ ] Shared accountability
  - [ ] Family voting/consensus
- [ ] AI-powered insights
  - [ ] Pattern recognition
  - [ ] Suggestion engine
  - [ ] Success predictors
  - [ ] Obstacle anticipation
- [ ] Gamification
  - [ ] Badges for milestones
  - [ ] Streak tracking
  - [ ] Family celebrations
- [ ] Integration with other systems
  - [ ] Link intentions to tasks
  - [ ] Calendar integration
  - [ ] Victory Recorder connections
  - [ ] Archives system linking

---

## Troubleshooting

### Common Issues

**Issue 1: "Cannot read intentions"**
```
Error: 403 Forbidden
```
**Solution:** Check RLS policies are deployed
```sql
SELECT * FROM pg_policies WHERE tablename = 'best_intentions';
```

---

**Issue 2: "Category not found"**
```
Error: Category ID does not exist
```
**Solution:** Verify system categories are seeded
```sql
SELECT * FROM intention_categories WHERE family_id IS NULL;
-- Should return 4 system categories
```

---

**Issue 3: "Cannot create custom category"**
```
Error: Unique constraint violation
```
**Solution:** Category name already exists
```javascript
// Check uniqueness first
const isUnique = await isCategoryNameUnique(familyId, 'Homeschool');
```

---

**Issue 4: "Privacy level not enforced"**
```
Teen can see parent's private intention
```
**Solution:** RLS policy issue - redeploy policies
```sql
-- Check which policies are active
SELECT * FROM pg_policies
WHERE tablename = 'best_intentions'
AND policyname LIKE '%privacy%';
```

---

## Best Practices

### For Developers

1. **Always use API functions** - Don't query Supabase directly
2. **Check auth state** - Verify user is authenticated before API calls
3. **Handle loading states** - Show spinners during async operations
4. **Display errors gracefully** - User-friendly error messages
5. **Validate inputs** - Client-side validation before API calls
6. **Use TypeScript** - Type safety for intention data structures
7. **Test RLS policies** - Don't assume security - verify it

### For Users

1. **Be specific in intentions** - "Practice patience with toddler tantrums" not "Be better parent"
2. **Focus on process not outcome** - "Read to kids 15min daily" not "Raise smart kids"
3. **Keep why meaningful** - The "why" drives motivation
4. **Update status regularly** - Keeps intentions relevant
5. **Use privacy wisely** - Share family goals, keep personal struggles private
6. **Review monthly** - Archive achieved, update stalled
7. **Start small** - 3-5 active intentions, not 20

---

**Created:** Claude Code
**For:** MyAIM-Central Best Intentions System
**Version:** 2.0 (Production Ready)
