# Play Mode Dashboard 🎮

**For young children ages 3-7**

## Overview

Play Mode is a simplified, highly visual dashboard designed specifically for pre-readers and early elementary-aged children. Every element is designed with large touch targets, simple language, emojis for visual recognition, and celebratory animations to make task completion fun and engaging.

## Key Features

### 1. **Big Task Buttons** 📝
- Minimum 200px height buttons
- Large emoji or image icons (120px)
- Simple, clear text (minimum 2rem font)
- Pulsing animation when incomplete
- Confetti celebration on completion
- Immediate visual feedback

### 2. **Visual Reward System** 🌸
Choose from 4 gamification themes:
- **Flower Garden**: Grow flowers by completing tasks
- **Pet Collection**: Collect and care for virtual pets
- **Ocean Aquarium**: Fill an aquarium with sea creatures
- **Dragon Academy**: Level up your dragon companion

### 3. **Simple Calendar** 📅
- Time-based activity display (Morning, After Lunch, Evening, Bedtime)
- Large emoji icons for each activity
- Visual indicators for current time
- Completion checkmarks

### 4. **Victory Recorder** ⭐
- Big star counter showing today's achievements
- "I Did Something Great!" button for manual entries
- "Celebrate Me!" button triggering full celebration
- Visual star collection display
- Quick-pick victory options with emojis

## Theme System

**CRITICAL**: All colors use CSS variables from `src/styles/colors.js`

### Supported Themes
Play Mode works with ALL 26+ themes, including child-friendly options:
- Bright Sunshine ☀️
- Ocean Waves 🌊
- Forest Adventure 🌲
- Pretty Flowers 🌸
- Sweet Treats 🍬
- Fire Blaze 🔥
- Dragon Power 🐲
- And 19+ more!

### CSS Variable Usage
```css
/* Always use these variables */
background: var(--gradient-primary);
color: var(--text-color);
border: 2px solid var(--accent-color);
```

**Never hard-code colors!** The system automatically adapts when parents switch themes.

## File Structure

```
src/components/dashboard/modes/play/
├── PlayModeDashboard.tsx           # Main container
├── PlayModeDashboard.css           # Main styles (theme-aware)
├── PlayModeLayout.tsx              # Grid layout system
├── PlayModeLayout.css              # Layout styles
├── PlayModeTaskWidget.tsx          # Big task buttons
├── PlayModeTaskWidget.css          # Task button styles
├── PlayModeRewardWidget.tsx        # Gamification visuals
├── PlayModeRewardWidget.css        # Reward widget styles
├── PlayModeCalendarWidget.tsx      # Simple calendar
├── PlayModeCalendarWidget.css      # Calendar styles
├── PlayModeVictoryRecorder.tsx     # Victory tracking
├── PlayModeVictoryRecorder.css     # Victory recorder styles
├── PlayModeAnimations.tsx          # Reusable animations
├── PlayModeAnimations.css          # Animation styles
└── README.md                       # This file
```

## Component API

### PlayModeDashboard
```tsx
interface PlayModeDashboardProps {
  familyMemberId: string;
}
```

Main dashboard container that orchestrates all widgets.

### PlayModeTaskWidget
```tsx
interface Task {
  id: string;
  title: string;
  emoji?: string;
  imageUrl?: string;
  completed: boolean;
  points?: number;
}

interface PlayModeTaskWidgetProps {
  tasks: Task[];
  onTaskComplete: (taskId: string) => void;
  maxDisplay?: number;
}
```

### PlayModeRewardWidget
```tsx
type GamificationTheme = 'flower-garden' | 'pet-collection' | 'ocean-aquarium' | 'dragon-academy';

interface RewardProgress {
  theme: GamificationTheme;
  level: number;
  points: number;
  pointsToNextLevel: number;
  items: string[];
  achievements: string[];
}
```

### PlayModeCalendarWidget
```tsx
type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'bedtime';

interface SimpleActivity {
  id: string;
  emoji: string;
  title: string;
  timeOfDay: TimeOfDay;
  completed?: boolean;
}
```

### PlayModeVictoryRecorder
```tsx
interface PlayModeVictoryRecorderProps {
  familyMemberId: string;
  todaysStars?: number;
  onAddVictory?: () => void;
  onCelebrate?: () => void;
}
```

## Animations

All animations are theme-aware and use CSS variables:

- **Confetti**: Multi-colored particles using primary, secondary, and accent colors
- **Star Burst**: Radiating stars with theme-colored glow
- **Balloon Celebration**: Floating balloons and party emojis
- **Pulse Animation**: Gentle pulsing for incomplete tasks
- **Sparkle Effect**: Twinkling stars at specific positions

### Using Animations
```tsx
import { Confetti, StarBurst, BalloonCelebration } from './PlayModeAnimations';

<Confetti isActive={celebrating} onComplete={() => setCelebrating(false)} />
```

## Accessibility Features

### Touch Targets
- Minimum 60px button height
- Most interactive elements are 80px+
- Large spacing between elements (20-30px)

### Visual Design
- High contrast mode support
- Reduced motion support
- Large, readable fonts (18px+)
- Clear visual hierarchy

### Keyboard & Screen Reader
- Proper focus states (4px outline)
- Semantic HTML structure
- ARIA labels where needed
- Logical tab order

## Responsive Design

### Desktop (1024px+)
- 2-column grid layout
- Maximum width: 1400px
- Large widget cards

### Tablet (768px - 1024px)
- Single column layout
- Slightly smaller text and icons
- Maintained touch target sizes

### Mobile (< 768px)
- Simplified single-column layout
- Optimized font sizes
- Maintained usability for small screens

## Integration with Database

### Required Tables
```sql
-- Dashboard configurations
dashboard_configs (
  id,
  family_member_id,
  dashboard_mode,
  gamification_system,
  selected_theme,
  widget_layout,
  created_at,
  updated_at
)

-- Gamification progress
gamification_progress (
  id,
  family_member_id,
  theme,
  level,
  points,
  items,
  achievements,
  created_at,
  updated_at
)
```

### Fetching Data
```tsx
// Get dashboard config
const { data: config } = await supabase
  .from('dashboard_configs')
  .select('*')
  .eq('family_member_id', memberId)
  .eq('dashboard_mode', 'play')
  .single();

// Get gamification progress
const { data: progress } = await supabase
  .from('gamification_progress')
  .select('*')
  .eq('family_member_id', memberId)
  .single();
```

## Design Principles

### 1. **Simplicity First**
- Minimal text, maximum visuals
- One clear action per screen element
- No complex navigation

### 2. **Immediate Feedback**
- Every tap shows instant response
- Celebrations are quick and enthusiastic
- Progress is always visible

### 3. **Encouragement Over Perfection**
- No negative feedback
- Every action earns stars
- Celebration for all achievements

### 4. **Parent-Controlled Settings**
- Children cannot access settings
- Parents choose themes and gamification
- Safe, age-appropriate content only

## Best Practices

### ✅ DO:
- Use emojis liberally in UI
- Keep text to 1-3 words
- Provide immediate visual feedback
- Use large, colorful buttons
- Celebrate every success
- Use CSS variables for ALL colors

### ❌ DON'T:
- Hard-code any colors
- Use complex language
- Create small touch targets
- Hide important information
- Use subtle visual cues
- Assume reading ability

## Testing Checklist

- [ ] All colors use CSS variables
- [ ] Theme switching works smoothly
- [ ] Scrollbars match current theme
- [ ] Touch targets are 60px+ minimum
- [ ] Animations work on all browsers
- [ ] Reduced motion is respected
- [ ] High contrast mode supported
- [ ] Works on tablet and phone
- [ ] Confetti appears on task completion
- [ ] Victory modal opens correctly
- [ ] Star counter updates in real-time
- [ ] Calendar shows current time correctly

## Future Enhancements

1. **Sound Effects** (with parent control)
2. **Custom Avatar Creation**
3. **Printable Reward Charts**
4. **Sibling Collaboration Tasks**
5. **Photo Upload for Custom Tasks**
6. **Voice-Activated Task Completion** (accessibility)
7. **Weekly/Monthly Progress Summaries**
8. **Special Holiday Themes & Animations**

## Support

For questions or issues:
- Review the main design guide: `/docs/play-mode-design-guide.md`
- Check theme system: `src/styles/colors.js`
- Verify CSS variables: `src/styles/global.css`

---

**Built with love for the youngest members of the family! 🎉**
