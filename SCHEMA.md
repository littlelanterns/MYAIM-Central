# MyAIM Central Database Schema

**Last Updated**: 2026-01-21

This document describes all database tables in the MyAIM Central application. For TypeScript types, see `src/types/database.ts`.

---

## Core Tables

### `families`
The main account table. Each family is one subscription/account.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `family_name` | text | Display name (e.g., "The Smith Family") |
| `family_login_name` | text | **UNIQUE** - Used for family member PIN login (e.g., "smithfamily") |
| `auth_user_id` | uuid | Links to Supabase `auth.users` for the primary parent |
| `subscription_tier` | text | Current plan: 'basic', 'essential', 'enhanced', 'premium' |
| `is_founding_family` | boolean | Beta founding family (gets permanent discount) |
| `founding_family_joined_at` | timestamp | When they became a founding family |
| `membership_status` | text | 'active', 'inactive', 'cancelled' |

### `family_members`
Individual people within a family.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `family_id` | uuid | FK → families.id |
| `name` | text | **Required** - Person's name |
| `role` | text | **Required** - 'primary_organizer', 'parent', 'child', 'teen', 'extended_family' |
| `auth_user_id` | uuid | Only set for the primary parent (links to Supabase auth) |
| `pin` | text | 4-digit PIN for family member login |
| `is_primary_parent` | boolean | Whether this is the main account holder |
| `display_title` | text | How they appear (Mom, Dad, etc.) |
| `dashboard_mode` | text | 'independent', 'family', 'child' |
| `age` | integer | Age (used for dashboard/content selection) |
| `birthday` | date | For birthday reminders |

---

## Task System

### `tasks`
Active tasks assigned to family members.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `family_id` | uuid | FK → families.id |
| `task_name` | text | **Required** - What needs to be done |
| `assignee` | uuid[] | **Required** - Array of family_member IDs |
| `status` | text | 'pending', 'in_progress', 'completed', 'skipped' |
| `due_date` | timestamp | When it's due |
| `created_by` | uuid | FK → family_members.id |
| `approved_by` | uuid | FK → family_members.id (if approval required) |
| `points_value` | integer | Points earned for completion |
| `priority` | text | 'low', 'medium', 'high', 'urgent' |

### `task_templates`
Reusable task definitions for recurring tasks.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `family_id` | uuid | FK → families.id |
| `template_name` | text | Internal name |
| `task_name` | text | What shows to users |
| `frequency` | text | 'one-time', 'daily', 'weekly', 'monthly' |
| `default_assignee` | uuid[] | Default people to assign |

### `task_completions`
History of completed tasks.

| Column | Type | Description |
|--------|------|-------------|
| `task_id` | uuid | FK → tasks.id |
| `completed_by` | uuid | FK → family_members.id |
| `completion_method` | text | 'manual', 'qr_code', 'photo' |

### `task_subtasks`
Checklist items within a task.

### `task_rewards`
Reward configuration for specific tasks.

---

## Calendar & Events

### `calendar_events`
Family calendar events.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `family_id` | uuid | FK → families.id |
| `title` | text | **Required** - Event name |
| `start_time` | timestamp | **Required** |
| `end_time` | timestamp | **Required** |
| `event_type` | text | 'event', 'appointment', 'reminder', 'birthday' |
| `is_recurring` | boolean | Whether it repeats |
| `created_by` | uuid | FK → family_members.id |

### `event_attendees`
Which family members are involved in an event.

---

## Rewards System

### `family_rewards`
Rewards that can be earned/redeemed.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `family_id` | uuid | FK → families.id |
| `title` | text | Reward name |
| `cost` | integer | Points needed to redeem |
| `reward_type` | text | 'stars', 'dollars', 'custom' |

### `family_reward_types`
Custom reward currencies a family uses (stars, dollars, etc.).

### `member_reward_balances`
Current balance for each member per reward type.

### `reward_transactions`
History of points earned/spent.

### `reward_redemptions`
When someone redeems a reward.

---

## Goals & Intentions

### `best_intentions`
Family goals and intentions for AI context.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `family_id` | uuid | FK → families.id |
| `title` | text | **Required** - The intention |
| `current_state` | text | Where you are now |
| `desired_state` | text | Where you want to be |
| `why_it_matters` | text | Motivation |
| `use_as_context` | boolean | Include in AI prompts |

### `intention_categories`
Categories for organizing intentions.

### `intention_progress`
Journal entries tracking progress on intentions.

---

## Archive System

### `archive_folders`
Folders for organizing family context/information.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `family_id` | uuid | FK → families.id |
| `folder_name` | text | **Required** |
| `folder_type` | text | **Required** - Category type |
| `member_id` | uuid | If folder is for a specific person |

### `archive_context_items`
Individual pieces of context within folders.

---

## Gamification

### `gamification_progress`
Tracks level, points, streaks for each family member.

### `achievements`
Badges/achievements earned.

### `victories`
Celebration moments (with optional voice messages).

### `victory_celebrations`
Generated celebration content.

---

## Dashboard & UI

### `dashboard_configs`
Saved dashboard layouts per family member.

### `widget_permissions`
Who can see which widgets.

---

## Play Mode (Kids)

### `play_mode_activities`
Custom activities for kids' dashboards.

### `daily_activity_completions`
Tracking daily activity completion.

---

## AI & Context (LiLa)

### `lila_conversations`
History of AI-optimized prompts.

### `lila_context_suggestions`
AI-suggested context items for review.

### `lila_api_usage`
API usage tracking for cost management.

### `context_categories`
Categories for organizing context.

### `context_items`
Individual context pieces.

---

## Content & Library

### `library_items`
Tutorials, tools, and resources.

### `library_categories`
Categories for library content.

### `articles`
Blog/help articles.

### `testimonials`
Customer testimonials for marketing.

---

## User Management

### `beta_users`
Beta testing participants and their status.

### `staff_permissions`
Admin/staff access controls.

### `feedback_submissions`
Bug reports and feature requests.

### `user_activity_log`
Page visits and actions for analytics.

---

## Views (Read-Only)

These are database views, not tables:

- `active_admins` - Currently active admin users
- `active_beta_testers` - Active beta users with details
- `beta_user_overview` - Summary of beta user activity
- `feedback_dashboard` - Feedback with user details

---

## Subscription

### `subscription_tiers`
Available subscription plans and pricing.

| tier_name | display_name | tier_level |
|-----------|--------------|------------|
| basic | Basic | 0 |
| essential | Essential | 1 |
| enhanced | Enhanced | 2 |
| premium | Premium | 3 |

---

## Table Relationships Diagram

```
families (root)
├── family_members
│   ├── tasks (assignee, created_by, approved_by)
│   ├── calendar_events (created_by)
│   ├── event_attendees
│   ├── gamification_progress
│   ├── achievements
│   ├── victories
│   ├── dashboard_configs
│   ├── member_reward_balances
│   └── reward_transactions
├── tasks
│   ├── task_completions
│   ├── task_subtasks
│   └── task_rewards
├── calendar_events
│   └── event_attendees
├── best_intentions
│   └── intention_progress
├── archive_folders
│   └── archive_context_items
├── family_rewards
│   └── reward_redemptions
└── context_categories
    └── context_items
```

---

## Migration History

| # | File | Description |
|---|------|-------------|
| 025 | `025_remove_wordpress_dependency.sql` | Added founding family columns, auth_user_id, family_login_name |
| 026 | `026_fix_auth_user_fk.sql` | Removed FK constraints to auth.users (caused signup issues) |

---

## Notes for Developers

1. **Never create FK constraints to `auth.users`** - They cause issues during the signup flow because of how Supabase handles auth transactions.

2. **Required fields** - Always check `is_nullable: NO` columns in the schema. Key ones:
   - `family_members.name` and `family_members.role`
   - `tasks.task_name` and `tasks.assignee`

3. **UUIDs** - All primary keys are UUIDs generated by `uuid_generate_v4()` or `gen_random_uuid()`.

4. **Timestamps** - Mix of `timestamp with time zone` and `timestamp without time zone`. Newer tables tend to use `with time zone`.
