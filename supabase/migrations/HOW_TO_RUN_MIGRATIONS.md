# How to Run Database Migrations

This guide explains how to run SQL migrations for your Supabase database.

## Quick Start

### Option 1: Run via Supabase Dashboard (Easiest)

1. Go to your Supabase project: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of the migration file you want to run
6. Click **Run** (or press `Ctrl+Enter`)
7. Check the output panel for success messages

### Option 2: Run via Supabase CLI (Recommended for Multiple Migrations)

1. Install Supabase CLI if you haven't already:
   ```bash
   npm install -g supabase
   ```

2. Link your project (first time only):
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Run all pending migrations:
   ```bash
   supabase db push
   ```

   Or run a specific migration:
   ```bash
   supabase db push --include-all
   ```

### Option 3: Run Manually via SQL File

1. Open the migration file in a text editor
2. Copy all the SQL code
3. Go to Supabase Dashboard → SQL Editor
4. Paste the code and click Run

## Current Migration: 021_user_preferences.sql

This migration adds user preference columns needed for:
- Theme selection persistence
- Calendar week start preference (Sunday vs Monday)
- Quick action usage tracking (optional)

**What it does:**
- Adds `theme_preference` column to `family_members` table
- Adds `week_start_preference` column to `family_members` table
- Creates indexes for performance
- Creates `quick_action_usage` table (optional, for auto-sorting)
- Safe to run multiple times (checks if columns exist first)

**To run this migration:**

1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `021_user_preferences.sql`
3. Paste and click Run
4. You should see success messages like:
   ```
   Added theme_preference column to family_members
   Added week_start_preference column to family_members
   Migration 021_user_preferences.sql completed successfully!
   ```

## Verifying the Migration

After running, you can verify the columns were added:

```sql
-- Check family_members table structure
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'family_members'
  AND column_name IN ('theme_preference', 'week_start_preference');
```

Expected output:
| column_name | data_type | character_maximum_length |
|-------------|-----------|--------------------------|
| theme_preference | character varying | 50 |
| week_start_preference | character varying | 10 |

## Troubleshooting

### "permission denied for table family_members"
- Make sure you're logged into the correct Supabase project
- Try running with admin privileges in SQL Editor

### "column already exists"
- This is fine! The migration is idempotent (safe to run multiple times)
- It will skip columns that already exist

### "syntax error at or near..."
- Make sure you copied the entire migration file
- Check for any text corruption during copy/paste
- Try copying again directly from the file

## Migration Order

Migrations should be run in order by their number prefix:
1. 017_smart_migration_existing_schema.sql
2. 018_play_mode_dashboard.sql
3. 019_tracker_widget_system.sql
4. 020_seed_tracker_templates.sql
5. **021_user_preferences.sql** ← New migration

If you're unsure which migrations have been run, you can check:
```sql
SELECT * FROM supabase_migrations.schema_migrations
ORDER BY version DESC;
```

## Need Help?

If you encounter issues:
1. Check the Supabase Dashboard → SQL Editor → History to see what ran
2. Look at the error message in the output panel
3. Try running each section of the migration separately
4. Contact support with the specific error message

## Rollback (If Needed)

To rollback this migration:
```sql
-- Remove added columns
ALTER TABLE family_members DROP COLUMN IF EXISTS theme_preference;
ALTER TABLE family_members DROP COLUMN IF EXISTS week_start_preference;

-- Remove quick action usage table (if you want to remove it)
DROP TABLE IF EXISTS quick_action_usage;
```

**Note:** Only rollback if absolutely necessary, as it will delete user data in those columns!
