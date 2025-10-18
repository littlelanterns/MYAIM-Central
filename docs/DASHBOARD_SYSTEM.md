# Dashboard Widget System

## 🎨 PURPOSE

The Dashboard is mom's **personalized command center** - a Pinterest-meets-workspace where she arranges her most-used tools, info, and quick actions exactly how she wants them.

**Key Innovation:** Drag-and-drop customization + direct tool access without visiting Library.

---

## 🏗️ WIDGET ARCHITECTURE

### Three Widget Types

**1. Tool Widgets** (from Library)
- Full-functioning tools
- Added from Library via "Add to Dashboard"
- Retain all functionality
- Can be configured/customized

**2. Info Widgets** (Display Data)
- Best Intentions summary
- Upcoming tasks
- Family calendar
- Recent Archive updates
- Quick stats

**3. Quick Action Widgets**
- Add new intention
- Mind Sweep capture
- Export context
- Open Multi-AI Panel
- One-click shortcuts

---

## 🎨 LAYOUT SYSTEM

### Pinterest-Style Masonry Grid

```
┌─────────────────────────────────────────────┐
│  Dashboard                          [⚙️Edit] │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │ Meal    │  │ Best    │  │ Quick   │   │
│  │ Planner │  │ Intent  │  │ Add     │   │
│  │         │  │         │  │         │   │
│  │ [Try]   │  │ 4 active│  │ [+]     │   │
│  └─────────┘  └─────────┘  └─────────┘   │
│                                             │
│  ┌──────────────┐  ┌─────────┐            │
│  │ Task Breaker │  │ Family  │            │
│  │              │  │ Calendar│            │
│  │ Break down   │  │         │            │
│  │ overwhelm    │  │ Today:  │            │
│  │              │  │ • Piano │            │
│  │ [Start]      │  │ • Soccer│            │
│  └──────────────┘  └─────────┘            │
│                                             │
│  ┌─────────┐  ┌──────────────┐  ┌─────┐  │
│  │ Recent  │  │ Mind Sweep   │  │Stats│  │
│  │ Updates │  │              │  │     │  │
│  │         │  │ Quick capture│  │ 12  │  │
│  │ Jake's  │  │ [+ Add note] │  │tools│  │
│  │ context │  │              │  │used │  │
│  │ updated │  └──────────────┘  └─────┘  │
│  └─────────┘                               │
│                                             │
│  [+ Add Widget]                             │
└─────────────────────────────────────────────┘
```

### Grid Behavior

**Auto-Arrange Mode** (Default)
- Widgets flow naturally
- Fills spaces efficiently
- Adjusts on window resize
- Mobile-friendly stacking

**Manual Mode** (Drag & Drop)
- Click "Edit" to enable
- Drag widgets anywhere
- Snap to grid
- Save custom layout

---

## 📦 WIDGET COMPONENTS

### Base Widget Structure

```typescript
interface Widget {
  id: string;
  type: 'tool' | 'info' | 'quick_action';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  config: WidgetConfig;
  toolId?: string; // If tool widget
}

interface WidgetConfig {
  refreshInterval?: number;
  showTitle?: boolean;
  customSettings?: any;
}
```

### Widget Sizes

```
Small (1x1):    Medium (2x1):      Large (2x2):
┌─────┐         ┌──────────┐       ┌──────────┐
│     │         │          │       │          │
│     │         │          │       │          │
└─────┘         └──────────┘       │          │
                                   │          │
                                   └──────────┘
```

---

## 🛠️ TOOL WIDGETS (FROM LIBRARY)

### Example: Meal Planner Widget

```
┌─────────────────────────┐
│  🍳 Meal Planner        │
│  ━━━━━━━━━━━━━━━━━━━━━ │
│                         │
│  This Week:             │
│  Mon: Spaghetti         │
│  Tue: Tacos             │
│  Wed: Chicken & Rice    │
│  ...                    │
│                         │
│  [Plan New Week]        │
│  [Shopping List]        │
│                         │
│  ⚙️ [Settings] [×]      │
└─────────────────────────┘
```

### Example: Task Breaker Widget

```
┌─────────────────────────┐
│  📝 Task Breaker        │
│  ━━━━━━━━━━━━━━━━━━━━━ │
│                         │
│  Feeling overwhelmed?   │
│  Break it down:         │
│                         │
│  [Enter big task...]    │
│                         │
│  [Break It Down]        │
│                         │
│  Recent:                │
│  • "Clean house" → 8    │
│    steps                │
│                         │
│  ⚙️ [Settings] [×]      │
└─────────────────────────┘
```

### Tool Widget Features

- **Full functionality** - Not just preview
- **Quick access** - No need to visit Library
- **Persistent state** - Remembers settings
- **Configurable** - User can customize
- **Removable** - Easy to delete

---

## 📊 INFO WIDGETS

### Example: Best Intentions Widget

```
┌─────────────────────────┐
│  🎯 Best Intentions     │
│  ━━━━━━━━━━━━━━━━━━━━━ │
│                         │
│  Active: 4              │
│                         │
│  ☑️ Sibling comm.       │
│  ☑️ Morning routine     │
│  ☑️ Healthy eating      │
│  ☑️ Screen time         │
│                         │
│  [View All] [+ Add]     │
│                         │
│  ⚙️ [Settings] [×]      │
└─────────────────────────┘
```

### Example: Family Calendar Widget

```
┌─────────────────────────┐
│  📅 Today                │
│  ━━━━━━━━━━━━━━━━━━━━━ │
│                         │
│  3:00 PM - Piano        │
│  (Jake)                 │
│                         │
│  5:30 PM - Soccer       │
│  (Sally)                │
│                         │
│  7:00 PM - Dinner       │
│  (Family)               │
│                         │
│  [Full Calendar]        │
│                         │
│  ⚙️ [Settings] [×]      │
└─────────────────────────┘
```

### Example: Context Updates Widget

```
┌─────────────────────────┐
│  📁 Recent Updates      │
│  ━━━━━━━━━━━━━━━━━━━━━ │
│                         │
│  Jake's interests       │
│  Updated 2 hours ago    │
│                         │
│  Best Intentions        │
│  New: "Family dinners"  │
│  Added yesterday        │
│                         │
│  [View Archives]        │
│                         │
│  ⚙️ [Settings] [×]      │
└─────────────────────────┘
```

---

## ⚡ QUICK ACTION WIDGETS

### Example: Mind Sweep Capture

```
┌─────────────────────────┐
│  💭 Mind Sweep          │
│  ━━━━━━━━━━━━━━━━━━━━━ │
│                         │
│  Quick capture:         │
│                         │
│  [Type or speak...]     │
│                         │
│  🎤 Voice  📷 Photo     │
│                         │
│  [Capture]              │
│                         │
│  Recent: 3 items        │
│                         │
│  ⚙️ [Settings] [×]      │
└─────────────────────────┘
```

### Example: Quick Add Intention

```
┌─────────────────────────┐
│  🎯 Quick Add           │
│  ━━━━━━━━━━━━━━━━━━━━━ │
│                         │
│  Add new intention:     │
│                         │
│  [What matters?...]     │
│                         │
│  [+ Add Now]            │
│                         │
│  Or:                    │
│  [Guided Setup]         │
│  [Brain Dump]           │
│                         │
│  ⚙️ [Settings] [×]      │
└─────────────────────────┘
```

---

## 🎨 CUSTOMIZATION & SETTINGS

### Widget Settings Panel

```
┌─────────────────────────────────┐
│  Widget Settings: Meal Planner  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                 │
│  Display:                       │
│  ☑️ Show title                  │
│  ☑️ Show this week's meals      │
│  ☐ Show shopping list preview   │
│                                 │
│  Size:                          │
│  ○ Small  ● Medium  ○ Large     │
│                                 │
│  Refresh:                       │
│  Updates: [Weekly ▼]            │
│                                 │
│  [Save] [Cancel]                │
└─────────────────────────────────┘
```

### Dashboard Edit Mode

```
[Edit Mode Active]

┌─────────────────────────────────┐
│  Drag widgets to rearrange      │
│                                 │
│  ┌─────────┐ ← Drag handles     │
│  │  [⠿]    │                    │
│  │ Widget  │                    │
│  │         │                    │
│  │ [×] [⚙️]│ ← Delete/Settings  │
│  └─────────┘                    │
│                                 │
│  [Done Editing] [Reset Layout]  │
└─────────────────────────────────┘
```

---

## 🗄️ DATABASE SCHEMA

```sql
CREATE TABLE user_dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,

  -- Widget type
  widget_type TEXT NOT NULL,
    -- 'library_tool', 'best_intentions', 'calendar', 'mind_sweep', etc.

  -- If tool widget
  tool_id UUID REFERENCES library_items(id),

  -- Layout
  position_x INTEGER NOT NULL,
  position_y INTEGER NOT NULL,
  width INTEGER DEFAULT 1, -- Grid units
  height INTEGER DEFAULT 1, -- Grid units
  size TEXT DEFAULT 'medium', -- 'small', 'medium', 'large'

  -- Configuration
  widget_config JSONB DEFAULT '{}',
    -- { showTitle: true, refreshInterval: 3600, customSettings: {...} }

  -- State
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_dashboard_widgets_user ON user_dashboard_widgets(user_id);
CREATE INDEX idx_dashboard_widgets_visible ON user_dashboard_widgets(is_visible);

-- Dashboard layouts (for saving multiple layouts)
CREATE TABLE user_dashboard_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  layout_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  layout_data JSONB NOT NULL, -- Complete widget configuration
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, layout_name)
);
```

---

## 🔄 ADD TO DASHBOARD FLOW

### From Library to Dashboard

```typescript
// In Library Tool Card
const handleAddToDashboard = async (toolId: string) => {
  // 1. Check if already on dashboard
  const { data: existing } = await supabase
    .from('user_dashboard_widgets')
    .select('id')
    .eq('user_id', user.id)
    .eq('tool_id', toolId)
    .single();

  if (existing) {
    toast.info('Already on your dashboard!');
    navigate('/dashboard');
    return;
  }

  // 2. Calculate next available position
  const nextPosition = await calculateNextPosition(user.id);

  // 3. Insert widget
  const { error } = await supabase
    .from('user_dashboard_widgets')
    .insert({
      user_id: user.id,
      widget_type: 'library_tool',
      tool_id: toolId,
      position_x: nextPosition.x,
      position_y: nextPosition.y,
      width: 1,
      height: 1,
      size: 'medium',
      widget_config: {
        showTitle: true,
        refreshInterval: 3600
      }
    });

  if (!error) {
    toast.success('✨ Added to Dashboard!');
    navigate('/dashboard');
  }
};
```

---

## 📱 RESPONSIVE DESIGN

### Desktop (> 1024px)
- 4-column grid
- Drag & drop enabled
- All widgets visible

### Tablet (768px - 1024px)
- 3-column grid
- Simplified drag & drop
- Widgets adapt size

### Mobile (< 768px)
- Single column stack
- Swipe to reorder
- Collapsible widgets
- Priority widgets first

---

## 🎯 DEFAULT DASHBOARD (NEW USERS)

### Pre-populated Widgets

```
New user's dashboard includes:

1. Welcome Widget (info)
   "Welcome to MyAIM-Central! Here's how to get started..."

2. Best Intentions Widget (info)
   Shows empty state with [+ Add Your First Intention]

3. Quick Add Widget (quick_action)
   Easy access to create intention

4. Library Shortcut Widget (quick_action)
   [Browse Tools] button

5. Mind Sweep Widget (quick_action)
   Quick capture area
```

**After First Tool Added:**
- Welcome widget auto-hides
- Tool widget appears
- Suggestions widget appears: "Try these next..."

---

## 🚀 ADVANCED FEATURES (FUTURE)

### Phase 1: Smart Suggestions
```
🤖 Suggested Widget:
"Based on your usage, you might like adding
the Meal Planner to your dashboard"

[Add] [Dismiss]
```

### Phase 2: Multiple Layouts
```
Layout Switcher:
┌─────────────────────────┐
│ Morning Routine Layout  │
│ Work Day Layout         │
│ Evening Layout          │
│ Weekend Layout          │
│ [+ New Layout]          │
└─────────────────────────┘
```

### Phase 3: Shared Layouts
```
"Sarah shared her dashboard layout with you"
[Preview] [Use This Layout] [Dismiss]
```

### Phase 4: Widget Marketplace
```
Download community-created widgets:
• Chore chart widget
• Allowance tracker
• Reading log
```

---

## ✅ SUCCESS CRITERIA

**User Experience:**
- [ ] Intuitive drag & drop
- [ ] Fast loading (< 1 second)
- [ ] Widgets feel "alive" (updates, animations)
- [ ] Easy to customize
- [ ] Mobile works great

**Technical:**
- [ ] No layout bugs
- [ ] State persists correctly
- [ ] Real-time updates work
- [ ] Performance with 20+ widgets
- [ ] Works offline (cached)

**Engagement:**
- [ ] Users add 3+ widgets on average
- [ ] Daily dashboard visits
- [ ] Widget customization rate > 40%
- [ ] Tools used directly from dashboard

---

The Dashboard is where MyAIM-Central becomes **YOUR** workspace - personalized, powerful, and always ready to help! 🎨✨
