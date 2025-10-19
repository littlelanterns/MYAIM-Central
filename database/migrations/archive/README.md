# Migration Archive

This folder contains previous versions of migrations that had errors or were superseded.

## Files in Archive

### `001_login_system_tables_v1.0.0_broken.sql`
**Date:** 2025-10-18
**Status:** ❌ BROKEN
**Issue:** Index creation attempted before table creation completed. Caused "column beta_code does not exist" error.

### `001_login_system_tables_v1.0.1_broken.sql`
**Date:** 2025-10-18
**Status:** ❌ BROKEN
**Issue:** Used `CREATE TABLE IF NOT EXISTS` which skipped partially-created tables from v1.0.0, still caused "column beta_code does not exist" error.

## Working Version

The working migration is now:
- **`../001_login_system_tables.sql`** (v1.0.2 - CLEAN)
- Successfully drops and recreates tables to ensure clean state
- Safe to run multiple times
- ✅ Tested and working

## Why These Failed

1. **First attempt (v1.0.0):** Created index before table definition was complete
2. **Second attempt (v1.0.1):** Partial table from first run existed, so `IF NOT EXISTS` skipped recreating it, but the table was incomplete (missing `beta_code` column)
3. **Final success (v1.0.2):** Explicitly drops tables first, then recreates from scratch

## Lesson Learned

When creating tables with indexes in PostgreSQL:
- Always `DROP TABLE IF EXISTS` first if you want a clean slate
- Be careful with `CREATE TABLE IF NOT EXISTS` after failed migrations
- Create indexes AFTER the full table definition, not inline

---

**Archive Date:** 2025-10-18
**Archived By:** Claude Code
