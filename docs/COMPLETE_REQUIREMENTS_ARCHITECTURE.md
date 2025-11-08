# MyAIM-Central: Complete Requirements & Architecture
## Organized by Logical Development Order

**Document Purpose:** Complete blueprint for MyAIM-Central development. Every feature, integration point, and data flow documented for systematic implementation.

**Date Created:** October 27, 2025
**Version:** 1.0

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Current State Assessment](#2-current-state-assessment)
3. [Core Architecture](#3-core-architecture)
4. [Development Phases (Logical Order)](#4-development-phases-logical-order)
5. [Detailed Feature Specifications](#5-detailed-feature-specifications)
6. [Database Schema & Relationships](#6-database-schema-relationships)
7. [Integration Architecture](#7-integration-architecture)
8. [User Journey Maps](#8-user-journey-maps)

---

## 1. System Overview

### 1.1 Platform Mission

MyAIM-Central is a **Family-Aware AI Infrastructure** platform that enables mothers to effectively leverage AI technology across multiple platforms while maintaining family context and values.

### 1.2 Core Value Proposition

**The Problem:**
- AI platforms are too generic (don't understand family context)
- Platform lock-in (users stuck with one AI)
- Technical barriers (non-tech users struggle with prompts)

**The Solution:**
- **Portable Context:** Build family context once, use everywhere
- **Platform Agnostic:** Works with ChatGPT, Claude, Midjourney, etc.
- **AI Literacy:** Education + tools to empower, not replace, mom's wisdom

### 1.3 The Three Pillars

**Pillar 1: Library Vault (Education Hub)**
- Netflix-style browsing of tutorials, tools, templates
- AI literacy education
- Ready-to-use prompt tools
- "Add to Dashboard" for instant access

**Pillar 2: Archives System (Context Engine)**
- Flexible folder organization (Bublup-style)
- Family member profiles with context
- Checkbox-controlled privacy ("what AI knows")
- Auto-generated overview cards
- Cross-device file access

**Pillar 3: LiLa Optimizer (AI Enhancement)**
- Context-aware prompt optimization
- Platform-specific formatting
- Best Intentions integration
- Reads active Archives context

### 1.4 Tech Stack

**Frontend:**
- React 18 + TypeScript
- React Router for navigation
- CSS Variables for theming (20+ themes)
- Mobile-first responsive design

**Backend:**
- Supabase (PostgreSQL + Auth + Storage + Real-time)
- Row Level Security (RLS) for data isolation
- Vercel for hosting/deployment
- GitHub for version control

**Development:**
- VS Code with Claude Code integration
- Local development with hot reload
- Git workflow: edit locally → push → auto-deploy

**Future Integrations:**
- n8n for workflow automation
- OpenRouter API for LiLa AI processing
- Google Drive (potential integration)

---

## 2. Current State Assessment

### 2.1 Already Implemented (Exists in Code, Untested)

✅ **Authentication System**
- Mom login (email/password via Supabase Auth)
- Family member login (3-field: Family Name + Member Name + PIN)
- Database schema for auth linking

✅ **Database Schema (Comprehensive)**
- 50+ tables with proper relationships
- `families`, `family_members`, `tasks`, `rewards`
- `archive_folders`, `family_context`, `folder_overview_cards`
- `best_intentions`, `intention_categories`, `intention_progress`
- RLS policies for data security

✅ **Dashboard Components**
- Independent Mode (teens)
- Guided Mode (elementary)
- Play Mode (young children)
- Theme system with CSS variables

✅ **Task System Structure**
- Task types: task, opportunity, routine
- Assignment logic
- Subtasks support
- Completion tracking framework

✅ **Archives Framework**
- Folder creation structure
- Context file storage
- Overview card concept

✅ **Best Intentions Structure**
- Database tables complete
- Category system (4 system defaults)
- Privacy levels (family, parents only, private)
- Status tracking (active, in progress, achieved, paused, archived)

✅ **Theme System**
- 20+ themes with full CSS variable support
- Theme selector in global header
- Consistent color families across themes

✅ **Settings Framework**
- Settings icon placeholder in global header
- Permission system tables exist

### 2.2 Partially Built (Needs Completion)

⚠️ **Family Setup Walkthrough**
- Structure exists but needs:
  - Guided UI with hover tooltips
  - Default permission settings
  - "Out of Nest" family member option
  - AI bulk-add functionality
  - Visual walkthrough flow

⚠️ **Manage Family Members**
- Can create members, but missing:
  - "Create Family Member Logins" button
  - PIN generation interface
  - Granular permission controls UI
  - Role assignment interface

⚠️ **Archives System**
- Folder structure exists, needs:
  - Auto-generation of overview cards
  - Conversational context modal
  - "Tell me about [Name]" functionality
  - Context from use (monthly aggregation)
  - Report generation

⚠️ **Victory Recorder**
- Concept documented, needs:
  - UI for recording victories
  - Dashboard completion tracking
  - Monthly aggregation system
  - Context update integration

⚠️ **Best Intentions**
- Tables exist, needs:
  - Complete CRUD UI
  - Archive integration
  - LiLa context reading
  - Family member personal intentions

### 2.3 Not Built Yet

❌ **LiLa Optimizer**
- No OpenRouter integration
- No API endpoint
- No context reading logic
- No platform-specific formatting

❌ **n8n Workflows**
- No automations configured
- No background processing

❌ **Monthly Aggregations**
- No Victory Recorder aggregation
- No context update from use
- No automated reports

❌ **Website/Landing Pages**
- Rough draft in-app
- Needs polishing

❌ **Library Vault Full Implementation**
- Database schema exists
- Netflix-style UI needs building
- Content management needs completion

---

## 3. Core Architecture

### 3.1 Database Relationships

```
auth.users (Supabase Auth)
  ↓ auth_user_id
families
  ↓ family_id
family_members
  ↓ id (member_id)
  ├→ tasks (assignee references member_id)
  ├→ best_intentions (created_by references member_id)
  ├→ archive_folders (linked_member_id references member_id)
  └→ victory_recorder (member_id references member_id)

families
  ↓ family_id
  ├→ best_intentions
  ├→ archive_folders
  └→ family_context
```

### 3.2 Authentication Flow

**Mom/Primary Account:**
```
1. Visit myaimcentral.com/login
2. Enter email + password
3. Supabase Auth validates
4. Query family_members for auth_user_id match
5. Load: family_id, member_id, role, permissions
6. Redirect to Command Center
```

**Family Member:**
```
1. Click "Log in as Family Member"
2. Enter Family Login Name → validates family exists
3. Type family member name (exact match required)
4. Enter 4-digit PIN
5. Validate PIN hash against family_members table
6. Load member context + permissions
7. Redirect to personalized dashboard (age-appropriate theme)
```

### 3.3 Permission System Architecture

**Permission Levels:**
- **Mom (Primary):** Full access to everything
- **Dad/Partner:** View dashboards, limited task creation, no LiLa/Library
- **Teens (13-17):** Independent dashboard, personal Best Intentions, own content only
- **Elementary (8-12):** Guided dashboard, restricted features
- **Young (3-7):** Play dashboard, minimal features

**Granular Permission Controls (Future):**
- Feature level: "Can access Library Vault" (yes/no)
- Action level: "Can add content" vs "View only"
- Content level: "Can view all Archives" vs "Own content only"
- Task types: "Can create opportunities" vs "Cannot create requirements"

---

## 4. Development Phases (Logical Order)

### Phase 1: Foundation (Core User Experience)

**Goal:** Get users logging in, creating families, and using dashboards

**Priority 1.1: Authentication & Family Setup**
- Fix/test Mom login flow
- Fix/test Family Member login flow
- Build forced family setup walkthrough
- Implement hover tooltips/guidance
- Build "Out of Nest" family member option
- Create AI bulk-add family functionality

**Priority 1.2: Manage Family Members**
- Build Settings modal (accessible from global header)
- Create "Manage Family Members" section
- Add "Create Family Member Logins" button
- Build PIN generation UI
- Implement default permissions (simple)
- Test family member creation → login flow

**Priority 1.3: Dashboard Core Functionality**
- Task creation interface (all types: task, opportunity, routine)
- Task assignment logic (single, multiple, rotating, collaborative)
- Task display on dashboards (age-appropriate)
- Task completion marking
- Subtask toggling
- Basic completion tracking

**Priority 1.4: List Creation**
- Simple list interface
- Add/edit/delete list items
- Assign lists to family members
- Display lists on dashboards

**Success Criteria:**
- ✅ Users can create account → set up family → create logins → kids can log in
- ✅ Mom can create tasks → assign to kids → kids see tasks → mark complete
- ✅ Mom can create lists and assign them

---

### Phase 2: Task & Reward System

**Goal:** Complete task lifecycle with rewards and motivation

**Priority 2.1: Task Types & Schedules**
- Routine creation (recurring tasks)
- Reassignable chores
- Schedule templates
- Opportunity system (opt-in tasks)
- Task approval workflow (if required)

**Priority 2.2: Rewards System**
- Reward configuration per task
- Point system
- Star system
- Custom rewards
- Reward transactions tracking
- Allowance tracking

**Priority 2.3: Victory Recorder Foundation**
- Manual victory entry interface
- Auto-capture from task completion
- Victory display on dashboards
- Date-based victory viewing

**Success Criteria:**
- ✅ Mom can create recurring routines
- ✅ Tasks automatically reward upon completion
- ✅ Kids can see point/star balances
- ✅ Victories are being recorded

---

### Phase 3: Archives & Context Management

**Goal:** Build portable, controllable family context system

**Priority 3.1: Archives Folder System**
- Custom folder creation ("Create any folder you want")
- Folder cover photo uploads (Supabase Storage)
- Nested folder support
- Link folders to family members
- Visual organization (Pinterest-style)

**Priority 3.2: Context Files**
- Create context files (markdown with frontmatter)
- Upload documents/photos
- Manual context entry
- Edit/delete context

**Priority 3.3: Auto-Generated Overview Cards**
- Scan folder contents
- Generate checkbox list of all files
- Track usage count per item
- "Last used" timestamp
- Toggle checkboxes (active/inactive for AI)

**Priority 3.4: Conversational Context Modal**
- "Tell me about [Family Member]" button
- Pre-written questions based on dashboard level
- Free-write brain dump option
- AI organization of brain dumps (future LiLa integration)

**Priority 3.5: Context Export**
- Scan all folders for active items (✅ checked)
- Combine into single export file
- Format options: Markdown, Plain Text, JSON
- Copy to clipboard
- Download file

**Success Criteria:**
- ✅ Mom can create any folder structure she wants
- ✅ Auto-generated overview cards show all content with checkboxes
- ✅ Mom can toggle what AI "knows" via checkboxes
- ✅ Export functionality produces clean context file

---

### Phase 4: Best Intentions System

**Goal:** Integrate family values and goals into AI interactions

**Priority 4.1: Best Intentions CRUD**
- Create intentions (Quick Add form)
- Create intentions (Brain Dump conversational)
- View all intentions (filtered by category)
- Edit intentions
- Update status (active, in progress, achieved, paused, archived)
- Delete/archive intentions

**Priority 4.2: Family Member Personal Intentions**
- Kids/Dad can create personal intentions
- Personal intentions visible to Mom
- Restricted editing (own intentions only)
- Privacy controls (family, parents only, private)

**Priority 4.3: Best Intentions in Archives**
- Best Intentions folder in Archives
- Link to intention categories
- Overview card showing active intentions
- Toggle intentions for AI context

**Priority 4.4: Category Management**
- 4 system default categories
- Create custom categories
- Edit category properties (name, icon, color)
- Delete custom categories
- Intention count per category

**Success Criteria:**
- ✅ Mom can capture family goals/values easily
- ✅ Kids can add personal goals (Mom can view)
- ✅ Intentions are organized and manageable
- ✅ Intentions stored in Archives with checkbox control

---

### Phase 5: Victory Recorder Integration

**Goal:** Automate context updates from family activity

**Priority 5.1: Victory Recording Enhancement**
- Enhanced manual victory entry (categories, tags)
- Photo/video attachment to victories
- Celebration animations (age-appropriate)
- Victory streaks tracking

**Priority 5.2: Monthly Aggregation System**
- Runs on 1st of billing cycle
- Scans all Victory Recorder data from past month
- Scans dashboard completion data
- Groups by family member

**Priority 5.3: Context from Use**
- "Add Context from Use" button in Archives
- LiLa analyzes aggregated data
- Suggests context additions with checkboxes:
  - "Works well for this child"
  - "Accomplishments this month"
  - "Growth areas observed"
  - "New interests emerged"
- Mom selects which to add
- Updates Context Overview automatically

**Priority 5.4: Report Generation**
- "Generate Report" button with dropdown
- Pre-set report types:
  - Monthly Homeschool Report
  - IEP Progress Report
  - Chore Completion Summary
  - Academic Progress Report
- Custom report option:
  - Upload template (docx/pdf)
  - "Use Once" or "Save to Use Again"
  - LiLa fills with Victory Recorder data
- Export reports (PDF/docx)

**Success Criteria:**
- ✅ Victories automatically feed into family member context
- ✅ Monthly "Add Context from Use" suggests relevant updates
- ✅ Mom can generate various reports from Victory data
- ✅ Custom templates work with Victory data

---

### Phase 6: LiLa Optimizer Integration

**Goal:** Context-aware AI prompt optimization

**Priority 6.1: LiLa API Foundation**
- Create Vercel serverless function `/api/lila`
- OpenRouter API integration
- Basic prompt enhancement (no context yet)
- Error handling and logging

**Priority 6.2: Context Reading**
- Read Archives active items (✅ checked only)
- Read active Best Intentions
- Read family member profiles (linked folders)
- Combine into structured context object

**Priority 6.3: Prompt Optimization**
- Analyze user's simple request
- Determine relevant context (what's useful?)
- Incorporate Best Intentions where relevant
- Format for target AI platform (ChatGPT, Claude, etc.)
- Return optimized prompt

**Priority 6.4: LiLa UI Integration**
- LiLa panel/modal in app
- Simple input: "Help me with..."
- Context preview: "Using context from..."
- Platform selector dropdown
- Copy optimized prompt
- "Send to platform" (opens AI in new tab)

**Priority 6.5: LiLa Learning**
- Track which context was used
- Increment usage_count in context files
- Update last_used_at timestamps
- (Future: Learn which context is most valuable)

**Success Criteria:**
- ✅ Mom enters simple request, gets optimized prompt
- ✅ LiLa includes relevant family context automatically
- ✅ Best Intentions are woven into prompts appropriately
- ✅ Usage tracking helps surface most valuable context

---

### Phase 7: Advanced Permissions & Settings

**Goal:** Granular control over family member access

**Priority 7.1: Granular Permission UI**
- Settings → Manage Family Members → [Select Member]
- Permission categories:
  - Features (Library, Archives, LiLa, Inner Oracle, MindSweep)
  - Task Actions (Create types, Edit, Delete, Approve)
  - Content Access (View all, Own only, None)
  - Dashboard Widgets (Which widgets visible)
- Save custom permission sets

**Priority 7.2: Permission Enforcement**
- Frontend: Hide/disable features based on permissions
- Backend: RLS policies enforce database-level
- API: Check permissions before operations
- Dashboard: Only show permitted widgets

**Priority 7.3: Default Permission Templates**
- Age-based defaults:
  - Young Child (3-7): Play dashboard only
  - Elementary (8-12): Guided dashboard, restricted features
  - Teen (13-17): Independent dashboard, personal intentions
  - Adult/Partner: View dashboards, limited task creation
- Role-based defaults:
  - Mom: Full access
  - Dad: Customizable (default: view + limited tasks)
  - Grandparent: View-only (if added as "Out of Nest")

**Success Criteria:**
- ✅ Mom has fine-grained control over every family member's access
- ✅ Dad can't create requirement tasks but can create opportunities
- ✅ Kids only see their own content in Archives
- ✅ Permissions are enforced at database level (can't bypass)

---

### Phase 8: n8n Workflow Automation

**Goal:** Background processing and scheduled tasks

**Priority 8.1: n8n Setup & Integration**
- Install n8n Atom extension in VS Code
- Connect n8n to Supabase
- Set up webhook endpoints
- Test basic workflow

**Priority 8.2: Monthly Aggregation Workflow**
- Trigger: 1st of month (billing cycle)
- Scan Victory Recorder for each family member
- Scan task completion data
- Compile monthly statistics
- Store aggregated data for reporting
- Trigger "Add Context from Use" notification to Mom

**Priority 8.3: Report Generation Workflow**
- Trigger: Mom clicks "Generate Report"
- Gather Victory Recorder data by date range
- Apply report template
- Fill with family member data
- Generate PDF/docx
- Return download link

**Priority 8.4: Context Update Workflow**
- Trigger: Mom approves context additions
- Update family_context table
- Regenerate overview cards
- Update context_last_modified timestamps

**Priority 8.5: Notification Workflows** (Future)
- Email reminders for incomplete tasks
- Weekly family summary emails
- Celebration emails for milestones
- "You haven't used X intention lately" nudges

**Success Criteria:**
- ✅ Monthly aggregation runs automatically
- ✅ Report generation happens in background (Mom doesn't wait)
- ✅ Context updates are processed seamlessly
- ✅ n8n visible to Claude Code for troubleshooting

---

### Phase 9: Library Vault Polish

**Goal:** Beautiful, discoverable educational content

**Priority 9.1: Library UI Enhancement**
- Netflix-style horizontal scrolling
- Category filtering (Emotional, Decision-Making, Meal Planning, etc.)
- Thumbnail images for each tool/tutorial
- Hover previews
- Search functionality

**Priority 9.2: Content Management**
- AIM-Admin interface for adding content
- Upload thumbnails
- Embed Gamma tutorials
- Link to external tools (Custom GPTs, Gemini Gems)
- Tag with subscription tiers

**Priority 9.3: User Interaction**
- Bookmark favorite tools
- Track tutorial progress
- "Add to Dashboard" quick actions
- Usage analytics

**Priority 9.4: Content Creation** (Ongoing)
- 75 tools across 5 categories (from your spec)
- Tutorial content for each
- Sample prompts
- Use case examples

**Success Criteria:**
- ✅ Beautiful, browsable library
- ✅ Easy content discovery
- ✅ Users can quickly access favorite tools
- ✅ Integration with LiLa for tool-based prompts

---

### Phase 10: Website & Marketing Integration

**Goal:** Professional public presence separate from app

**Priority 10.1: Landing Pages** (In-App Initially)
- Home/hero section
- Feature highlights
- Pricing tiers
- Testimonials
- FAQ
- Sign up CTA

**Priority 10.2: WordPress Sites** (Separate Marketing)
- aimagicformoms.com (mom-focused marketing)
- aimagicforfamilies.com (broader family marketing)
- Blog content
- SEO optimization
- Email capture

**Priority 10.3: Branding Consistency**
- App remains gender-neutral ("MyAIM-Central")
- Marketing sites target specific audiences
- Consistent color palette across all properties
- Brand voice guides

**Success Criteria:**
- ✅ Clear marketing presence
- ✅ Conversion funnel from marketing → app signup
- ✅ Professional appearance builds trust

---

## 5. Detailed Feature Specifications

### 5.1 Family Setup Walkthrough

**Entry Point:** New user creates account → Auto-redirect to Family Setup

**Step 1: Welcome Screen**
```
┌────────────────────────────────────────┐
│  ✓ Welcome to MyAIM-Central!           │
│                                        │
│  Let's set up your family so we can    │
│  personalize everything for you.       │
│                                        │
│  This will take about 5 minutes.       │
│                                        │
│  [Let's Go!]                           │
└────────────────────────────────────────┘
```

**Step 2: Family Name & Login**
```
┌────────────────────────────────────────┐
│  Create Your Family Profile            │
│  ─────────────────────────             │
│                                        │
│  Family Last Name                      │
│  [____________________] ℹ️              │
│  (Hover: Used for family member logins)│
│                                        │
│  Family Login Name                     │
│  [____________________] ℹ️              │
│  (Hover: Unique name kids use to log in)│
│  Example: "SmithFamily" or "TeamAwesome"│
│                                        │
│  [Next]                                │
└────────────────────────────────────────┘
```

**Step 3: Add Family Members**
```
┌────────────────────────────────────────┐
│  Who's in your family?                 │
│  ─────────────────────                 │
│                                        │
│  Choose method:                        │
│  ○ Add one at a time                   │
│  ● Quick add with AI                   │
│                                        │
│  [Text box for AI bulk add]            │
│  "I have Sarah (me), Mike (husband),   │
│  Jake (10), Sally (7), and Grandma     │
│  lives nearby but doesn't need a       │
│  dashboard"                            │
│                                        │
│  [Process with AI]                     │
└────────────────────────────────────────┘
```

**AI Bulk Add Result:**
```
┌────────────────────────────────────────┐
│  Here's what I found:                  │
│  ─────────────────────                 │
│                                        │
│  ✓ Sarah (You) - Primary Parent        │
│  ✓ Mike - Partner                      │
│  ✓ Jake - Child (age 10)               │
│  ✓ Sally - Child (age 7)               │
│  ✓ Grandma - Out of Nest               │
│                                        │
│  [Edit] [Add More] [Continue]          │
└────────────────────────────────────────┘
```

**Step 4: Individual Member Details** (For each member)
```
┌────────────────────────────────────────┐
│  Tell us about Jake                    │
│  ─────────────────────                 │
│                                        │
│  Full Name: Jake Smith                 │
│  Nickname: [____] ℹ️                    │
│  Birthday: [MM/DD/YYYY]                │
│  Dashboard Level:                      │
│    ○ Play (ages 3-7)                   │
│    ● Guided (ages 8-12)                │
│    ○ Independent (ages 13-17)          │
│                                        │
│  Special Needs/Considerations:         │
│  [__________________________]          │
│  (Optional)                            │
│                                        │
│  [Back] [Next]                         │
└────────────────────────────────────────┘
```

**Step 5: Default Permissions Preview**
```
┌────────────────────────────────────────┐
│  Permission Defaults Set! ℹ️            │
│  ─────────────────────                 │
│                                        │
│  We've set popular permissions based   │
│  on roles and ages.                    │
│                                        │
│  Jake (Guided Mode):                   │
│  ✓ Own dashboard                       │
│  ✓ Personal Best Intentions            │
│  ✗ Archives (view only own content)    │
│  ✗ Library Vault                       │
│  ✗ LiLa Optimizer                      │
│                                        │
│  You can customize these anytime in    │
│  Settings > Manage Family Members      │
│                                        │
│  [Review All] [Looks Good]             │
└────────────────────────────────────────┘
```

**Step 6: Setup Complete**
```
┌────────────────────────────────────────┐
│  🎉 You're all set!                    │
│                                        │
│  Your family is ready to go.           │
│                                        │
│  Next steps:                           │
│  • Create family member logins         │
│    (Settings > Manage Family)          │
│  • Set up Best Intentions              │
│  • Start assigning tasks               │
│                                        │
│  [Go to Command Center]                │
└────────────────────────────────────────┘
```

**Database Updates During Setup:**
- Creates `families` record
- Creates `family_members` records (one per person)
- Sets `is_primary_parent: true` for Mom
- Sets dashboard_enabled based on role/age
- Generates default permissions based on dashboard level
- Links primary parent's `auth_user_id` to `family_members.auth_user_id`

---

### 5.4 Archives Context Overview Cards

**Auto-Generation Logic:**

**Trigger Points:**
- When folder is first created
- When new file is added to folder
- When file is deleted from folder
- Manual "Regenerate" button

**Generation Process:**
```typescript
async function generateOverviewCard(folderId: string) {
  // 1. Query all files in folder
  const files = await supabase
    .from('family_context')
    .select('*')
    .eq('folder_id', folderId);

  // 2. Create checkbox items
  const items = files.map(file => ({
    id: file.id,
    filename: file.file_name,
    isActive: file.is_active,
    usageCount: file.usage_count || 0,
    lastUsed: file.last_used_at || null,
    category: file.context_type || 'general'
  }));

  // 3. Upsert overview card
  await supabase
    .from('folder_overview_cards')
    .upsert({
      folder_id: folderId,
      items: items,
      last_regenerated: new Date().toISOString()
    });
}
```

**Visual Display:**
```
┌────────────────────────────────────────┐
│  [Folder Cover Photo]                  │
│  📁 Jake (age 10)                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                        │
│  Context Items:                        │
│  ☑️ Learning Style        Used 24x     │
│  ☑️ Interests             Used 18x     │
│  ☐ Medical Info           Never used   │
│  ☑️ School Schedule        Used 12x     │
│  ☑️ Strengths             Used 9x      │
│  ☐ Behavior Challenges    Never used   │
│                                        │
│  Last updated: 2 days ago              │
│  Total items: 6                        │
│                                        │
│  [Edit] [Add Context] [Settings]       │
└────────────────────────────────────────┘
```

**Checkbox Interaction:**
- Click checkbox → Toggle `family_context.is_active`
- When active (✅): LiLa can read this context
- When inactive (☐): LiLa ignores this context

---

## Summary

This document provides a complete blueprint for MyAIM-Central development organized by logical phases rather than calendar timelines.

**For Claude Code:**
- Reference this document for implementation details
- Follow logical phase order
- Check existing code before building new
- Maintain consistent naming and patterns
- Prioritize mobile-first responsive design
- Test authentication flows thoroughly
- Ensure RLS policies prevent data leaks

**For Tenise:**
- Use phases to guide development priority
- Focus on one complete phase before moving to next
- Test with your own family first
- Iterate based on real-world usage
- Remember: milestone-based, not calendar-based!

---

**Document Version:** 1.0
**Last Updated:** October 27, 2025
**Status:** Complete - Ready for Implementation
