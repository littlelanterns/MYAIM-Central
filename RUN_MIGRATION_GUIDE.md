# How to Run the Database Migration

## Method 1: Supabase Dashboard (Recommended - No CLI needed)

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Sign in to your account
3. Select your project

### Step 2: Open SQL Editor
1. Click **SQL Editor** in the left sidebar
2. Click **New Query** button

### Step 3: Run the Migration
1. Open this file: `database/migrations/001_login_system_tables.sql`
2. Copy ALL the contents (Ctrl+A, Ctrl+C)
3. Paste into the SQL Editor (Ctrl+V)
4. Click **Run** button (or press F5)

### Step 4: Verify Success
You should see success messages and the final notice:
```
==============================================
Login System Migration Complete!
Version: 1.0
Date: [timestamp]
==============================================
```

**That's it!** Your database is now ready for the 4-login-page system.

---

## Method 2: Supabase CLI (Optional - For advanced users)

If you want the CLI for future use, here's how to install it:

### Install via Scoop (Windows Package Manager)

**Step 1: Install Scoop** (if you don't have it)
```powershell
# Run in PowerShell (as Administrator)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
```

**Step 2: Install Supabase CLI**
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Step 3: Link to Your Project**
```bash
# In your project directory
supabase link --project-ref your-project-ref

# Run migration
supabase db push
```

---

## Method 3: Manual Binary Download

1. Download the latest Windows binary: https://github.com/supabase/cli/releases
2. Extract the `.exe` file
3. Add to your PATH or run directly

---

## Troubleshooting

### "Permission denied" error
- Run PowerShell as Administrator

### "Project not found" error
- Make sure you're logged in: `supabase login`
- Check your project ref in Supabase Dashboard → Settings → General

### Migration fails
- Check if tables already exist
- Review error messages
- Contact: tenisewertman@gmail.com

---

## Next Steps After Migration

1. ✅ Set `family_login_name` for existing families
2. ✅ Hash existing PINs (if any)
3. ✅ Test all 4 login pages
4. ✅ Grant admin permissions to staff

See `LOGIN_SYSTEM_IMPLEMENTATION.md` for full details.
