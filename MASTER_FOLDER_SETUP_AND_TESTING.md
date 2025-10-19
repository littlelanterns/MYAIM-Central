# Master Folder System - Setup & Testing Guide

**Date:** October 19, 2025
**Status:** Ready for Testing
**Migration Required:** Yes (007_master_folder_system.sql)

---

## 🎯 What's Been Implemented

### **Master Folder Hierarchy**
```
📁 Family Archives
│
├─── 👨‍👩‍👧‍👦 FAMILY (Essential Tier)
│    └─ Auto-populated with family member subfolders
│
├─── 🎯 BEST INTENTIONS (Enhanced Tier)
│    └─ Auto-syncs with Best Intentions system
│
├─── 👵 EXTENDED FAMILY (Magic Tier)
│    └─ Grandparents, aunts, uncles, cousins
│
└─── 📂 PERSONAL PROJECTS (Magic Tier)
     └─ Mom's custom project folders
```

### **Key Features**
✅ Accordion UI with expand/collapse
✅ Tier-based access control with locked states
✅ Drag-and-drop folder reordering
✅ Smart sorting (manual priority → most recent)
✅ Best Intentions auto-sync to archives
✅ Icon & color selection for custom folders

---

## 📋 STEP 1: Run Migration 007

### **Option A: Supabase SQL Editor (Recommended)**

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project
   - Click "SQL Editor" in left sidebar

2. **Copy Migration SQL**
   - Open: `supabase/migrations/007_master_folder_system.sql`
   - Copy entire contents

3. **Run Migration**
   - Paste into SQL Editor
   - Click "Run" button
   - Wait for "Success" confirmation

4. **Verify Tables**
   ```sql
   -- Check that is_master column was added
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'archive_folders'
   AND column_name = 'is_master';

   -- Should return: is_master | boolean
   ```

### **Option B: Supabase CLI**

```bash
# Navigate to project root
cd C:\Users\tenis\OneDrive\Desktop\AIM-Ecosystem\MyAIM_Central

# Push migration to Supabase
npx supabase db push

# Or if you have migrations in order:
npx supabase migration up
```

### **Migration Effects**

The migration will:
- ✅ Add `is_master BOOLEAN` column to `archive_folders`
- ✅ Update folder_type constraint with new master types
- ✅ Create 4 master folders for ALL existing families
- ✅ Update existing family member folders to nest under Family master
- ✅ Update triggers for auto-creation of master folders
- ✅ Add index for `is_master = TRUE`

---

## 📋 STEP 2: Verify Migration Success

### **Check 1: Master Folders Created**
```sql
SELECT
  folder_name,
  folder_type,
  is_master,
  required_tier,
  sort_order
FROM archive_folders
WHERE is_master = TRUE
ORDER BY sort_order;
```

**Expected Result:**
| folder_name | folder_type | is_master | required_tier | sort_order |
|-------------|-------------|-----------|---------------|------------|
| Family | master_family | true | essential | 1 |
| Best Intentions | master_best_intentions | true | enhanced | 2 |
| Extended Family | master_extended_family | true | magic | 3 |
| Personal Projects | master_personal | true | magic | 4 |

### **Check 2: Family Members Nested**
```sql
SELECT
  folder_name,
  folder_type,
  parent_folder_id IS NOT NULL as has_parent,
  member_id IS NOT NULL as is_member_folder
FROM archive_folders
WHERE folder_type = 'family_member'
LIMIT 5;
```

**Expected Result:**
- All family_member folders should have `has_parent = true`

---

## 📋 STEP 3: Testing Checklist

### **Test 1: View Master Folders** ✅

1. Navigate to `/family-archive` or `/your-archives`
2. **Expected:**
   - See 4 master folder cards in accordion layout
   - Family folder expanded by default
   - Locked icon on Enhanced/Magic tier folders (if Essential user)
   - Item count badges showing number of subfolders

**Screenshot what you see!**

---

### **Test 2: Expand/Collapse** ✅

1. Click on Family master folder header
2. **Expected:**
   - Arrow rotates 90 degrees
   - Subfolders slide into view
   - Background changes to gray (#fafafa)

3. Click again
4. **Expected:**
   - Arrow rotates back
   - Subfolders collapse

---

### **Test 3: View Family Member Subfolders** ✅

1. Expand Family master folder
2. **Expected:**
   - See cards for each family member
   - Each card shows:
     - Member name
     - Icon (👦👩👨👴 based on role)
     - Completeness percentage badge
     - Context preview (or "Complete LiLa interview")
     - Active context count

---

### **Test 4: Drag & Drop Reordering** ✅

1. Expand Personal Projects or Family folder
2. Click and hold on a folder card
3. Drag to a new position
4. **Expected:**
   - Dragged card shows opacity: 50%
   - Other cards shift to make space
   - Drop card in new position

5. Refresh page
6. **Expected:**
   - New order persists!

**Default behavior:** Most recently edited folder appears at top

---

### **Test 5: Create Custom Folder** ✅

1. Expand Personal Projects master folder
2. Click the "+ Add New" dashed card
3. **Expected:**
   - Modal opens with "Create New Folder" title
   - Shows:
     - Folder name input
     - Description textarea
     - 14 icon options (📁📂📚✏️💼🏠🎨🎯💡🔬🎭🌱📖🏫)
     - 10 color swatches

4. Enter:
   - Name: "Homeschool Planning"
   - Description: "Curriculum and lesson plans"
   - Icon: 📚
   - Color: Blue (#2196F3)

5. Click "Create Folder"
6. **Expected:**
   - Modal closes
   - New folder appears in grid
   - Folder uses selected icon and color

---

### **Test 6: Extended Family Folder** ✅

1. Expand Extended Family master folder
2. Click "+ Add New"
3. **Expected:**
   - Modal title: "Add Extended Family Member"
   - Icon options are PEOPLE emojis (👨👩👴👵👦👧👶)
   - No color selection (uses default)

4. Create: "Grandma Joan" with 👵 icon
5. **Expected:**
   - Folder created under Extended Family master

---

### **Test 7: Best Intentions Auto-Sync** ✅

1. Navigate to Best Intentions (if you have the modal)
2. Create a new Best Intention:
   - Title: "Family Game Night Weekly"
   - Current State: "We play games sporadically"
   - Desired State: "Weekly family game night on Fridays"
   - Why It Matters: "Build stronger family bonds"
   - Category: Family Relationships

3. Save intention

4. Go back to Archives page
5. Expand "Best Intentions" master folder
6. **Expected:**
   - New folder appears: "Family Game Night Weekly"
   - Description matches "Why It Matters"
   - Icon is 🎯

7. Click the folder to view details
8. **Expected:**
   - Context items show:
     - current_state
     - desired_state
     - why_it_matters
     - category

---

### **Test 8: Folder Detail View** ✅

1. Click any folder card
2. **Expected:**
   - Full-screen modal opens
   - Shows:
     - Cover photo area (with upload overlay on hover)
     - Folder name (editable with pencil icon)
     - Context items list
     - Close button (top-right X)

3. For family member folders:
   - Should see "✨ Complete LiLa Interview" button
   - Context fields: personality, interests, learning_style, challenges, strengths

---

### **Test 9: Tier Restrictions** ✅

**If you have ESSENTIAL tier:**
1. Best Intentions folder should show:
   - Lock icon 🔒
   - "Enhanced Tier" badge
   - Gray/locked appearance
   - Cannot click to expand

2. Extended Family and Personal Projects should show:
   - Lock icon 🔒
   - "Magic Tier" badge
   - Upgrade prompt

**Change your tier to test:**
```sql
UPDATE families
SET subscription_tier = 'magic'
WHERE id = 'your-family-id';
```

Then refresh Archives page - all folders should unlock!

---

### **Test 10: Update Intention → Sync to Archives** ✅

1. Edit an existing Best Intention
2. Change the title or "why it matters"
3. Save changes

4. Go to Archives → Best Intentions folder
5. **Expected:**
   - Folder name updated
   - Description updated
   - Context items reflect new values

---

## 🐛 Troubleshooting

### **Problem: Master folders not showing**

**Solution:**
```sql
-- Check if migration ran
SELECT COUNT(*) FROM archive_folders WHERE is_master = TRUE;
-- Should return: 4 (or 4 * number of families)

-- If 0, manually run the DO block from migration 007
-- (lines 230-348)
```

### **Problem: Family member folders not nesting**

**Solution:**
```sql
-- Check parent_folder_id
SELECT
  f.folder_name,
  f.parent_folder_id,
  p.folder_name as parent_name
FROM archive_folders f
LEFT JOIN archive_folders p ON f.parent_folder_id = p.id
WHERE f.folder_type = 'family_member';

-- If parent_folder_id is NULL, run:
UPDATE archive_folders child
SET parent_folder_id = (
  SELECT id FROM archive_folders parent
  WHERE parent.family_id = child.family_id
  AND parent.folder_type = 'master_family'
  LIMIT 1
)
WHERE child.folder_type = 'family_member'
AND child.parent_folder_id IS NULL;
```

### **Problem: Drag & drop not working**

**Check:**
- Browser console for errors
- Make sure you're dragging folder cards (not the + Add New card)
- Subfolders must be in same master folder (can't drag between masters)

### **Problem: Best Intentions not syncing**

**Check:**
1. Migration 007 ran successfully
2. best_intention_item folder type exists in constraints
3. Console for sync errors

```sql
-- Manually sync all intentions
-- (Run in JS console on Archives page)
import { bestIntentionsService } from './lib/bestIntentionsService';
await bestIntentionsService.syncAllBestIntentionsToArchive();
```

---

## 📊 Success Criteria

### **Visual Checks**
- [ ] 4 master folders visible in accordion layout
- [ ] Family folder auto-expands on load
- [ ] Locked folders show lock icon and tier badge
- [ ] Item count badges display correctly
- [ ] Expand/collapse animation smooth

### **Functionality Checks**
- [ ] Can create custom folders in Personal/Extended
- [ ] Drag & drop reordering works
- [ ] New order persists after refresh
- [ ] Best Intentions auto-sync to archive folders
- [ ] Folder detail modal opens on click
- [ ] Icon/color selection saves correctly

### **Data Integrity Checks**
```sql
-- All master folders present
SELECT family_id, COUNT(*) as master_count
FROM archive_folders
WHERE is_master = TRUE
GROUP BY family_id;
-- Should show: 4 per family

-- All family members have parents
SELECT COUNT(*)
FROM archive_folders
WHERE folder_type = 'family_member'
AND parent_folder_id IS NULL;
-- Should return: 0

-- Best Intentions have archive folders
SELECT
  bi.title,
  af.folder_name,
  af.folder_type
FROM best_intentions bi
LEFT JOIN archive_folders af
  ON af.folder_name = bi.title
  AND af.folder_type = 'best_intention_item'
WHERE bi.is_active = TRUE;
-- All intentions should have matching archive folders
```

---

## 🎉 Post-Testing

### **If Everything Works:**

1. **Commit Changes**
   ```bash
   git add src/components/archives/SubfolderGrid.tsx
   git add src/components/archives/CreateSubfolderModal.tsx
   git add src/pages/Archives.tsx
   git add src/lib/archivesService.ts
   git add src/lib/bestIntentionsService.ts
   git add src/lib/intentions.js
   git add supabase/migrations/007_master_folder_system.sql

   git commit -m "Master Folder System: Hierarchical archives with drag-and-drop and auto-sync

   - Add accordion master folder UI (Family, Best Intentions, Extended, Personal)
   - Implement drag-and-drop folder reordering with persistence
   - Add tier-based access control with locked states
   - Create Best Intentions → Archives auto-sync integration
   - Update folder types and database schema
   - Add CreateSubfolderModal with icon/color selection

   Migration 007 adds hierarchical master folders and updates existing data.

   🤖 Generated with Claude Code"
   ```

2. **Document Features**
   - Add screenshots to README
   - Update user guide with drag & drop instructions
   - Document tier unlock requirements

### **If Issues Found:**

1. **Document the issue** in GitHub Issues or a new file
2. **Screenshot the problem**
3. **Check browser console** for errors
4. **Check Supabase logs** for database errors
5. **Ask for help!** Share error messages

---

## 📞 Need Help?

### **Common Questions**

**Q: Can I change the default folder order?**
A: Yes! Just drag folders to rearrange. The system uses `sort_order` for manual arrangement, and `updated_at` for automatic sorting.

**Q: Can users delete master folders?**
A: No, master folders (is_master = TRUE) cannot be deleted. They're system folders.

**Q: What happens if I delete a Best Intention?**
A: The archive folder remains (as a record), but you could add logic to soft-delete it too.

**Q: Can I add more master folders?**
A: Yes! Add them in the migration and update the UI. Consider tier restrictions.

---

## 🚀 Next Steps (Optional Enhancements)

### **Future Improvements:**
1. **Touch-friendly drag & drop** - Add mobile touch support
2. **Keyboard navigation** - Arrow keys to navigate folders
3. **Bulk operations** - Select multiple folders to move/delete
4. **Folder search** - Filter/search folders by name
5. **Archive analytics** - Show completeness stats on master folder cards
6. **Export/import** - Backup/restore archive structure

---

**Ready to test?** Start with Step 1 (migration) and work through the checklist! 🎯
