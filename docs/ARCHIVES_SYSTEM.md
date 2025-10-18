# Archives & Context System

## 📖 PURPOSE

The Archives system is MyAIM-Central's **context management engine** - where families organize, store, and control what information AI uses about them.

### Key Innovation
- Checkbox-controlled context that's portable to ANY AI platform
- **Fully customizable Bublup-style folders** - create ANY folder structure
- **Auto-generated overview cards** for any folder content
- **Cross-device file access** - photos/files available on phone & computer

---

## 🏗️ SYSTEM ARCHITECTURE

### Folder Structure (User-Created)

```
📁 Archives (Root)
  │
  ├─ 📁 Mom (Sarah) [Custom folder cover photo]
  │   ├─ 🗂️ AUTO-GENERATED OVERVIEW CARD
  │   ├─ 📄 Personality.md
  │   ├─ 📄 Interests.md
  │   └─ 📷 Photos (family_photos/)
  │
  ├─ 📁 Best Intentions [Custom cover]
  │   ├─ 🗂️ AUTO-GENERATED OVERVIEW CARD
  │   └─ [Intentions created by user]
  │
  ├─ 📁 Family Recipes [Custom cover]
  │   ├─ 🗂️ AUTO-GENERATED OVERVIEW CARD
  │   ├─ 📄 Grandma_Cookies.md
  │   ├─ 📄 Sunday_Pot_Roast.md
  │   └─ 📷 Recipe photos
  │
  ├─ 📁 Jake's Soccer [Custom cover]
  │   ├─ 🗂️ AUTO-GENERATED OVERVIEW CARD
  │   ├─ 📄 Practice_Schedule.md
  │   ├─ 📄 Team_Roster.md
  │   └─ 📷 Game photos
  │
  └─ 📁 [ANY OTHER FOLDER USER CREATES]
      ├─ 🗂️ AUTO-GENERATED OVERVIEW CARD
      └─ [User adds whatever content they want]
```

**KEY PRINCIPLE:** Users create folders for ANYTHING. System automatically generates overview cards showing all content with checkboxes.

---

## 🗂️ THE AUTO-GENERATED OVERVIEW CARD

### What It Does
Automatically creates a "baseball card" summary of ANY folder's contents.

### Visual Design

```
┌──────────────────────────────────────────┐
│  [Custom Folder Cover Photo]             │
│  📁 Jake's Soccer                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                          │
│  Context Items:                          │
│  ☑️ Practice Schedule    Used 12x       │
│  ☑️ Team Roster          Used 8x        │
│  ☐ Game Photos           Never used     │
│  ☑️ Coach Contact        Used 5x        │
│                                          │
│  Last updated: 3 days ago                │
│  Total items: 4                          │
│                                          │
│  [Edit Folder] [Export] [Settings] [×]  │
└──────────────────────────────────────────┘
```

### Auto-Generation Logic

```typescript
// When user adds content to folder:
const generateOverviewCard = async (folderId: string) => {
  // 1. Scan all files in folder
  const files = await getFolderContents(folderId);

  // 2. Create checkbox entry for each file
  const checkboxItems = files.map(file => ({
    filename: file.name,
    isActive: false, // Default unchecked
    usageCount: 0,
    lastUsed: null
  }));

  // 3. Save to overview_cards table
  await supabase
    .from('folder_overview_cards')
    .upsert({
      folder_id: folderId,
      items: checkboxItems,
      updated_at: new Date()
    });
};
```

---

## 📷 FOLDER COVER PHOTOS

### Feature
- User can upload photo as folder "cover"
- Displays at top of overview card
- Stored in Supabase Storage
- Accessible across all devices

### Upload UI

```
┌────────────────────────────────┐
│  📁 Create New Folder          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  Folder Name:                  │
│  [Jake's Soccer Team]          │
│                                │
│  Cover Photo (optional):       │
│  ┌──────────────────────┐     │
│  │   [Upload Image]     │     │
│  │   or drag & drop     │     │
│  └──────────────────────┘     │
│                                │
│  [Create Folder]               │
└────────────────────────────────┘
```

### Storage Implementation

```typescript
// Upload cover photo to Supabase Storage
const uploadFolderCover = async (file: File, folderId: string) => {
  const filePath = `folder-covers/${folderId}/${file.name}`;

  const { data, error } = await supabase.storage
    .from('user-files')
    .upload(filePath, file);

  if (!error) {
    // Save reference in folder metadata
    await supabase
      .from('archive_folders')
      .update({
        cover_photo_url: data.path
      })
      .eq('id', folderId);
  }
};
```

---

## 💾 FILE STORAGE SYSTEM

### Cross-Device Access

**Storage Location:** Supabase Storage (cloud-based)

**Benefits:**
- ✅ Accessible from phone
- ✅ Accessible from computer
- ✅ Automatic sync
- ✅ Offline caching (for performance)
- ✅ No manual file management

**Implementation:**

```typescript
// Files stored in Supabase Storage buckets:
user-files/
  ├─ {user_id}/
      ├─ folder-covers/
      │   └─ {folder_id}/
      │       └─ cover-photo.jpg
      ├─ context-files/
      │   └─ {folder_id}/
      │       ├─ personality.md
      │       └─ interests.md
      └─ uploads/
          └─ {folder_id}/
              └─ any-file.pdf
```

**Access Pattern:**

```typescript
// Retrieve file (works on mobile & desktop)
const getFile = async (filePath: string) => {
  // Check cache first
  const cached = await getCachedFile(filePath);
  if (cached) return cached;

  // Download from Supabase
  const { data } = await supabase.storage
    .from('user-files')
    .download(filePath);

  // Cache for offline access
  await cacheFile(filePath, data);

  return data;
};
```

---

## 🎨 FOLDER CREATION FLOW

### User Journey

```
1. Click "+ New Folder" in Archives
   ↓
2. Enter folder name (anything they want)
   ↓
3. Optionally upload cover photo
   ↓
4. Folder created
   ↓
5. Add files/content to folder
   ↓
6. Overview card AUTO-GENERATES with checkboxes
   ↓
7. User toggles checkboxes for AI context
```

### UI for Adding Content

```
┌────────────────────────────────────┐
│  📁 Jake's Soccer Team             │
│  [Folder Cover Photo]              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                    │
│  Add to this folder:               │
│                                    │
│  [📝 Create Note]                  │
│  [📷 Upload Photo]                 │
│  [📄 Upload Document]              │
│  [🔗 Link from Best Intentions]    │
│  [🔗 Link from another folder]     │
│                                    │
│  Current contents: 0 items         │
└────────────────────────────────────┘
```

---

## 📄 CONTENT FILES

### File Structure

Each file is a **markdown document** with frontmatter:

```markdown
---
title: Jake's Practice Schedule
folder: Jake's Soccer Team
created: 2024-01-15
updated: 2024-03-20
author: Sarah (Mom)
privacy: family
active: true
---

## Practice Days
Monday & Wednesday: 5:30 PM - 7:00 PM
Saturday: 9:00 AM - 11:00 AM

## Location
Riverside Park Soccer Fields
Field 3

## Coach Contact
Coach Martinez: (555) 123-4567
```

---

## 🔄 CONTEXT EXPORT SYSTEM

### Export Includes Active Items Only

When user exports context, system:
1. Scans all folders
2. Finds items with ☑️ checked
3. Combines into single export file
4. Formats for target AI platform

**Export Preview:**

```
┌─────────────────────────────────────────┐
│  📤 Export Context                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                         │
│  Selected Folders:                      │
│  ☑️ Jake (age 10) - 3 active items      │
│  ☑️ Best Intentions - 2 active items    │
│  ☑️ Jake's Soccer - 2 active items      │
│  ☐ Family Recipes - 0 active items      │
│                                         │
│  Total context weight: Medium           │
│                                         │
│  Format:                                │
│  ● Markdown  ○ Plain Text  ○ JSON      │
│                                         │
│  [Download File] [Copy to Clipboard]   │
└─────────────────────────────────────────┘
```

---

## 🗄️ DATABASE SCHEMA

### Tables

```sql
-- Folders (user-created, can be anything)
CREATE TABLE archive_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id),
  folder_name TEXT NOT NULL,
  folder_type TEXT DEFAULT 'custom',
    -- 'family_member', 'best_intentions', 'custom', 'project', etc.
  linked_member_id UUID REFERENCES family_members(id),
    -- If folder represents a person

  -- Visual
  cover_photo_url TEXT, -- Path in Supabase Storage
  icon TEXT DEFAULT '📁',
  color TEXT,

  -- Organization
  parent_folder_id UUID REFERENCES archive_folders(id), -- For nested folders
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Overview cards (auto-generated)
CREATE TABLE folder_overview_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID REFERENCES archive_folders(id),

  -- Auto-generated content summary
  items JSONB NOT NULL,
    -- [{ filename, isActive, usageCount, lastUsed }]

  last_regenerated TIMESTAMP DEFAULT NOW(),

  UNIQUE(folder_id)
);

-- Context files (linked to folders)
CREATE TABLE family_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID REFERENCES archive_folders(id),

  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Path in Supabase Storage
  content_data JSONB NOT NULL,

  -- Checkbox state
  is_active BOOLEAN DEFAULT false,

  -- Tracking
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP,

  privacy_level TEXT DEFAULT 'family',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_context_folder ON family_context(folder_id);
CREATE INDEX idx_context_active ON family_context(is_active);
```

---

## 🎯 KEY FEATURES

### What Changed from Traditional Systems

**1. Folders are USER-CREATED (not pre-defined)**
- Mom can create ANY folder she wants
- System doesn't dictate structure
- Flexibility is key

**2. Overview Cards are AUTO-GENERATED**
- System scans folder contents
- Creates checkbox list automatically
- Updates when content changes

**3. Photo Storage is CLOUD-BASED**
- Supabase Storage (not local-only)
- Accessible across devices
- Automatic syncing

**4. Folder Covers are CUSTOMIZABLE**
- Upload any photo
- Makes folders personal and beautiful
- Visual organization

---

## 🚀 FUTURE ENHANCEMENTS

### Phase 1: Smart Organization
```
🤖 LiLa suggests:
"You mentioned Jake's soccer a lot. Want to create
a folder for it?"

[Yes, Create Folder] [No Thanks]
```

### Phase 2: Folder Templates
```
Quick Start Templates:
• Family Member Profile
• Child Activity (sports, clubs)
• Project Folder
• Recipe Collection
• Blank Custom Folder
```

### Phase 3: Shared Folders
```
"Share this folder with grandma?"
○ View only
○ Can add content
○ Full edit access
```

---

## ✅ SUCCESS CRITERIA

**User Experience:**
- [ ] Can create ANY folder structure they want
- [ ] Overview cards generate automatically
- [ ] Can upload beautiful cover photos
- [ ] Files accessible on phone & computer
- [ ] No technical knowledge required

**Technical:**
- [ ] Supabase Storage integration works
- [ ] Cross-device sync is seamless
- [ ] Offline caching for performance
- [ ] Auto-generation is reliable
- [ ] Export includes correct active items

**Business:**
- [ ] Users create 5+ custom folders on average
- [ ] Photos make Archives feel personal
- [ ] Context export drives AI usage
- [ ] Feature differentiates from competitors

---

This is the **flexible, beautiful, cross-device context system** that makes MyAIM-Central unique! 🗂️✨
