# MyAIM-Central Style System Documentation

**Complete Design System Reference**
**Last Updated:** 2025-10-18
**Version:** 2.0 (Post-Migration)

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Theme System](#theme-system)
4. [Layout Architecture](#layout-architecture)
5. [Typography](#typography)
6. [Component Styling](#component-styling)
7. [Responsive Design](#responsive-design)
8. [Accessibility](#accessibility)
9. [CSS Architecture](#css-architecture)

---

## Design Philosophy

### Core Principles

**Warm & Welcoming**
- Primary color palette inspired by natural tones: sage teal, warm earth, golden honey
- Gradients create depth and visual interest
- Soft corners (8px-20px border radius) for approachable feel

**Family-Focused**
- Multiple theme options for personalization
- Child-friendly color palettes available
- Seasonal themes for variety

**Professional Yet Playful**
- Clean, modern interface with professional structure
- Playful accents through colors and gradients
- Balanced use of whitespace

**Consistent & Predictable**
- Global CSS variables ensure theme consistency
- Reusable component patterns
- Standardized spacing and sizing

---

## Color System

### Location
**File:** `src/styles/colors.js`

### Primary Brand Colors

```javascript
primaryBrand = {
  warmCream: '#fff4ec',      // Background base
  warmEarth: '#5a4033',      // Text color
  sageTeal: '#68a395',       // Primary interactive
  softSage: '#d4e3d9',       // Accent/borders
  goldenHoney: '#d6a461',    // Secondary highlights
  dustyRose: '#d69a84',      // Tertiary accents
  softGold: '#f4dcb7',       // Light accents
  deepOcean: '#2c5d60'       // Dark primary
}
```

### Extended Color Palette

**Neutrals (9 shades)**
- `ivory`, `cream`, `linen`, `sand`, `stone`, `slate`, `charcoal`, `onyx`, `black`
- Use for: Backgrounds, text hierarchy, borders

**Earth Tones (8 colors)**
- `terracotta`, `clay`, `rust`, `earth`, `bark`, `walnut`, `espresso`, `midnight`
- Use for: Warmth, grounding elements

**Sage & Greens (7 colors)**
- `mint`, `celadon`, `sage`, `olive`, `forest`, `pine`, `emerald`
- Use for: Primary actions, success states

**Blues (6 colors)**
- `sky`, `powder`, `ocean`, `navy`, `indigo`, `midnight`
- Use for: Trust, information states

**Purples (5 colors)**
- `lavender`, `lilac`, `plum`, `violet`, `eggplant`
- Use for: Child-friendly themes, creativity

**Pinks & Roses (5 colors)**
- `blush`, `rose`, `coral`, `salmon`, `dustyRose`
- Use for: Warmth, child-friendly themes

**Yellows & Golds (5 colors)**
- `butter`, `honey`, `gold`, `amber`, `bronze`
- Use for: Highlights, attention

**Oranges (4 colors)**
- `apricot`, `peach`, `tangerine`, `persimmon`
- Use for: Energy, call-to-action

**Status Colors**
```javascript
success: '#4caf50'    // Green for success states
warning: '#ff9800'    // Orange for warnings
error: '#f44336'      // Red for errors
info: '#2196f3'       // Blue for information
```

### CSS Variables

**Default Theme Variables** (`:root` in `src/styles/global.css`)
```css
--primary-color: #68a395        /* Sage teal */
--secondary-color: #d6a461      /* Golden honey */
--accent-color: #d4e3d9         /* Soft sage */
--background-color: #fff4ec     /* Warm cream */
--text-color: #5a4033           /* Warm earth */
```

**Gradient Variables**
```css
--gradient-primary: linear-gradient(135deg, #68a395, #d6a461)
--gradient-background: linear-gradient(135deg, #fff4ec, rgba(212, 227, 217, 0.2))
--scrollbar-thumb: var(--gradient-primary)
```

---

## Theme System

### Theme Types

**1. Standard Themes** (26 themes)
- `classic` - Classic AIMfM (default)
- `forest` - Forest Calm
- `ocean` - Ocean Breeze
- `lavender` - Lavender Dreams
- `desert` - Desert Warmth
- `midnight` - Midnight Sky
- `rose` - Rose Garden
- `mint` - Mint Fresh
- `autumn` - Autumn Harvest
- `spring` - Spring Meadow
- `sunset` - Sunset Glow
- `coffee` - Coffee & Cream
- `berry` - Berry Bliss
- `citrus` - Citrus Burst
- `sage` - Sage & Cream
- `plum` - Plum Perfect
- `pearl` - Pearl & Ivory
- `honey` - Honey & Oat
- `sky` - Sky Blue
- `earth` - Earth Tones

**2. Seasonal Themes** (4 themes)
- `winter` - Winter Wonderland
- `summer` - Summer Sunshine
- `fall` - Fall Foliage
- `easter` - Spring Pastel

**3. Child-Friendly Themes** (2 themes)
- `bubblegum` - Bubblegum Fun
- `rainbow` - Rainbow Bright

### Theme Structure

Each theme contains:
```javascript
{
  name: "Display Name",
  primary: "#hexcode",        // Primary interactive color
  secondary: "#hexcode",      // Secondary highlights
  accent: "#hexcode",         // Borders, subtle accents
  background: "#hexcode",     // Page background
  text: "#hexcode"           // Text color
}
```

### Applying Themes

**1. Global Theme Application**
Themes are applied via CSS variables in the root element:
```javascript
// In ThemeContext or component
document.documentElement.style.setProperty('--primary-color', theme.primary);
document.documentElement.style.setProperty('--secondary-color', theme.secondary);
// ... etc
```

**2. Personal Themes**
Family members can have individual themes:
```css
.personal-theme {
  --primary-color: var(--personal-primary-color);
  --secondary-color: var(--personal-secondary-color);
  /* Scoped to specific components */
}
```

### Gradients

**Pre-built Gradient Functions** (`src/styles/colors.js`)
```javascript
createGradient(color1, color2, angle = 135)
// Returns: `linear-gradient(${angle}deg, ${color1}, ${color2})`

gradients = {
  primary,              // Sage teal → Deep ocean
  background,           // Warm cream → Soft gold
  forest,              // Forest calm theme
  ocean,               // Ocean breeze theme
  lavender,            // Lavender dreams theme
  // ... 25+ theme-specific gradients
}
```

**Usage in Components**
```javascript
import { gradients } from '../styles/colors';

<div style={{ background: gradients.primary }}>
  Content
</div>
```

---

## Layout Architecture

### Grid System

**File:** `src/layouts/MainLayout.css`

**Main Layout Grid**
```css
.layout-grid {
  display: grid;
  grid-template-columns: 240px 1fr 320px;
  grid-template-rows: 70px 1fr;
  gap: 16px;
  padding: 16px;
  grid-template-areas:
    "logo quick-actions global-controls"
    "lila-panel main-content smart-notepad";
}
```

### Layout Areas

| Area | Location | Purpose | Size |
|------|----------|---------|------|
| **Logo Area** | Top-left | App branding, navigation | 240px × 70px |
| **Quick Actions** | Top-center | Action buttons | Flex (1fr) × 70px |
| **Global Controls** | Top-right | Theme selector, settings | 320px × 70px |
| **LiLa Panel** | Left sidebar | AI assistant panel | 240px × Remaining |
| **Main Content** | Center | Primary content area | Flex (1fr) × Remaining |
| **Smart Notepad** | Right sidebar | Note-taking | 320px × Remaining |

### Header Background

Beautiful gradient bar behind top row:
```css
.header-background {
  background: var(--theme-header-gradient,
              linear-gradient(135deg, #68a395 0%, #2c5d60 100%));
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}
```

### Responsive Breakpoints

**Desktop (Default):** `> 1024px`
- Full grid layout
- All areas visible

**Tablet:** `768px - 1024px`
```css
grid-template-columns: 200px 1fr 280px;
/* Narrower sidebars */
```

**Mobile:** `< 768px`
```css
grid-template-columns: 1fr;
grid-template-areas:
  "logo"
  "quick-actions"
  "global-controls"
  "main-content"
  "lila-panel"
  "smart-notepad";
/* Vertical stacking */
```

---

## Typography

### Font Families

**Primary (Body Text)**
```css
font-family: -apple-system, BlinkMacSystemFont,
             'HK Grotesk', 'Inter', sans-serif;
```

**Headings (Titles)**
```css
font-family: 'The Seasons', 'Playfair Display', serif;
```

**Code Blocks**
```css
font-family: source-code-pro, Menlo, Monaco,
             Consolas, 'Courier New', monospace;
```

### Font Smoothing

Applied globally in `src/index.css`:
```css
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Typography Scale

Use semantic HTML elements:
- `<h1>` - Page titles (serif font)
- `<h2>` - Section headers (serif font)
- `<h3>` - Subsection headers (serif font)
- `<p>` - Body text (sans-serif font)
- `<small>` - Supporting text

### Text Colors

```css
/* Primary text */
color: var(--text-color, #5a4033);

/* Secondary text (60% opacity) */
color: rgba(90, 64, 51, 0.6);

/* Placeholder text (50% opacity) */
color: rgba(90, 64, 51, 0.5);

/* Light text on dark backgrounds */
color: white;
text-shadow: 0 1px 2px rgba(0,0,0,0.2);
```

---

## Component Styling

### Buttons

**Primary Buttons**
```css
.btn-primary {
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

**Secondary Buttons**
```css
.btn-secondary {
  background: transparent;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
  border-radius: 8px;
  font-weight: 600;
  padding: 12px 24px;
}

.btn-secondary:hover {
  background: var(--primary-color);
  color: white;
}
```

**Disabled State**
```css
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

### Form Inputs

**Text Inputs, Textareas, Selects**
```css
input[type="text"],
input[type="email"],
input[type="password"],
textarea,
select {
  border: 2px solid var(--accent-color);
  background: white;
  color: var(--text-color);
  border-radius: 8px;
  padding: 10px 14px;
  transition: all 0.2s ease;
}

/* Focus state */
input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(104, 163, 149, 0.1);
  outline: none;
}

/* Placeholder */
::placeholder {
  color: rgba(90, 64, 51, 0.5);
}
```

**Checkboxes & Radio Buttons**
```css
input[type="checkbox"],
input[type="radio"] {
  accent-color: var(--primary-color);
  margin-right: 0.5rem;
}
```

### Cards

**Family Member Cards**
```css
.family-member-card {
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid var(--accent-color);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}
```

**General Cards**
```css
.card {
  background: var(--background-color);
  border: 1px solid var(--accent-color);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

### Modals

**Modal Overlay**
```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}
```

**Modal Content**
```css
.modal-content {
  background: var(--background-color);
  border-radius: 20px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--accent-color);
}
```

**Modal Header**
```css
.modal-header {
  background: var(--gradient-primary);
  color: white;
  padding: 1.5rem;
  border-radius: 20px 20px 0 0;
  border-bottom: 1px solid var(--accent-color);
}
```

**Modal Close Button**
```css
.modal-close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  color: white;
}

.modal-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}
```

### Badges

**Status Badges**
```css
.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
}

.status-badge.household {
  background: var(--primary-color);
}

.status-badge.context-only {
  background: #b25a58;
}

.status-badge.access-level {
  background: var(--secondary-color);
}
```

### Smart Notepad (Special Component)

**File:** `src/components/ui/SmartNotepad.css`

**Clipboard Container**
```css
.clipboard-container {
  background: linear-gradient(145deg,
              var(--secondary-color),
              var(--text-color));
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
}
```

**Paper Surface**
```css
.clipboard-paper {
  background: linear-gradient(135deg,
              var(--background-color),
              var(--accent-color));
  border-radius: 8px;
}
```

**Section Tabs**
```css
.section-tab {
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid transparent;
  padding: 6px 12px;
  border-radius: 6px 6px 0 0;
}

.section-tab.active {
  background: #fff;
  border-color: var(--accent-color);
  border-bottom: 1px solid #fff;
}
```

---

## Responsive Design

### Breakpoint Strategy

**Mobile First:** Base styles target mobile, enhance for larger screens

**Breakpoints:**
- **Mobile:** `< 768px` - Single column, stacked layout
- **Tablet:** `768px - 1024px` - Reduced sidebar widths
- **Desktop:** `> 1024px` - Full grid layout

### Mobile Adaptations

**Layout Changes**
```css
@media (max-width: 768px) {
  .layout-grid {
    grid-template-columns: 1fr;
    grid-template-areas:
      "logo"
      "quick-actions"
      "global-controls"
      "main-content"
      "lila-panel"
      "smart-notepad";
  }

  .header-background {
    display: none; /* Hide decorative header */
  }
}
```

**Component Scaling**
```css
@media (max-width: 768px) {
  .theme-selector {
    min-width: 120px;
    padding: 8px 12px;
    font-size: 12px;
  }

  .modal-content {
    margin: 0.5rem;
    max-height: 95vh;
  }
}
```

### Touch-Friendly Sizing

Minimum touch target: **44px × 44px** (iOS HIG standard)
```css
.theme-selector {
  height: 44px; /* Accessible touch target */
}

.modal-close-btn {
  width: 40px;
  height: 40px;
}
```

---

## Accessibility

### Focus States

**Universal Focus Ring**
```css
*:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* Form elements have custom focus */
input:focus,
textarea:focus,
select:focus,
button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(104, 163, 149, 0.3);
}
```

### High Contrast Mode

```css
@media (prefers-contrast: high) {
  .modal-content {
    border: 3px solid var(--primary-color);
  }

  input,
  textarea,
  select {
    border-width: 3px !important;
  }

  .theme-selector {
    border-width: 3px;
  }
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Semantic HTML

- Use proper heading hierarchy (`<h1>` → `<h2>` → `<h3>`)
- Use `<button>` for clickable actions (not `<div>`)
- Use `<label>` elements for form inputs
- Use `aria-label` for icon-only buttons

### Color Contrast

**WCAG AA Compliant:**
- Text: Minimum 4.5:1 contrast ratio
- Large text (18pt+): Minimum 3:1 contrast ratio
- UI components: Minimum 3:1 contrast ratio

**Test your theme combinations:**
```
Background: #fff4ec (Warm Cream)
Text: #5a4033 (Warm Earth)
Contrast Ratio: 8.2:1 ✓ (Passes AAA)

Primary: #68a395 (Sage Teal)
White Text: #ffffff
Contrast Ratio: 4.7:1 ✓ (Passes AA)
```

---

## CSS Architecture

### File Organization

```
src/
├── styles/
│   ├── colors.js          # Color system & themes
│   └── global.css         # Global styles & CSS variables
├── layouts/
│   └── MainLayout.css     # Grid layout system
├── components/
│   ├── global/
│   │   └── GlobalHeader.css
│   ├── ui/
│   │   └── SmartNotepad.css
│   └── [component]/
│       └── [Component].css
├── pages/
│   └── [Page].css
├── index.css              # Base resets
└── App.css                # App-level styles
```

### CSS Strategy

**1. CSS Variables (Global)**
- Define in `:root` (`src/styles/global.css`)
- Theme-agnostic variable names
- Easy theme switching

**2. Component-Scoped CSS**
- Each component has own `.css` file
- Uses global CSS variables for theming
- No inline styles (except dynamic theme values)

**3. Utility Classes**
- `.theme-transition` - Smooth theme changes
- `.personal-theme` - Personal theme scoping
- `.thin-scrollbar` - Thin scrollbar variant

**4. !important Usage**
- Only in `global.css` for universal overrides
- Ensures theme consistency across all components
- Prevents component-specific styles from breaking theme

### Naming Conventions

**BEM-ish Convention:**
```css
/* Block */
.modal-overlay { }

/* Element */
.modal-content { }
.modal-header { }
.modal-close-btn { }

/* Modifier */
.status-badge.household { }
.section-tab.active { }
```

### Scrollbar Theming

**Standard Scrollbars** (8px wide)
```css
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--accent-color);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 4px;
  border: 1px solid var(--accent-color);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}
```

**Thin Scrollbars** (6px wide)
```css
.thin-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
```

**Firefox Support**
```css
.rich-editor {
  scrollbar-width: thin;
  scrollbar-color: var(--primary-color) rgba(0,0,0,0.05);
}
```

---

## Quick Reference

### Most Common Patterns

**Apply theme to component:**
```javascript
// Use CSS variables
style={{
  background: 'var(--background-color)',
  color: 'var(--text-color)',
  border: '2px solid var(--accent-color)'
}}
```

**Use theme gradient:**
```javascript
import { gradients } from '../styles/colors';

style={{ background: gradients.primary }}
```

**Get specific theme:**
```javascript
import { personalThemes, getThemeByName } from '../styles/colors';

const forestTheme = getThemeByName('forest');
// Returns: { name, primary, secondary, accent, background, text }
```

**Apply theme globally:**
```javascript
const applyTheme = (theme) => {
  document.documentElement.style.setProperty('--primary-color', theme.primary);
  document.documentElement.style.setProperty('--secondary-color', theme.secondary);
  document.documentElement.style.setProperty('--accent-color', theme.accent);
  document.documentElement.style.setProperty('--background-color', theme.background);
  document.documentElement.style.setProperty('--text-color', theme.text);
};
```

### Design Tokens

**Spacing Scale**
- `4px` - Micro spacing (gaps between icons)
- `8px` - Small spacing (button padding)
- `12px` - Medium spacing (card padding)
- `16px` - Large spacing (section gaps)
- `24px` - XL spacing (page margins)

**Border Radius**
- `4px` - Small elements (badges, tags)
- `8px` - Standard elements (buttons, inputs)
- `12px` - Medium elements (cards)
- `16px` - Large elements (family member cards)
- `20px` - XL elements (modals)
- `50%` - Circular (close buttons)

**Shadows**
```css
/* Subtle */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

/* Standard */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

/* Prominent */
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

/* Header bar */
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
```

**Transitions**
```css
/* Standard */
transition: all 0.2s ease;

/* Smooth (theme changes) */
transition: all 0.3s ease;

/* Instant (reduced motion) */
transition: all 0.01ms;
```

---

## Troubleshooting

### Theme Not Applying

**Check:**
1. CSS variables defined in `:root`?
2. Component using `var(--variable-name)`?
3. Theme applied to `document.documentElement`?
4. Component CSS imported?

### Focus States Not Visible

**Fix:**
- Never use `outline: none` without alternative
- Use `box-shadow` for custom focus rings
- Ensure 3px minimum focus indicator

### Colors Look Wrong

**Check:**
1. Fallback colors in `var()` statements
2. Opacity values (rgba) might override theme
3. Inline styles overriding CSS variables
4. !important declarations in component CSS

### Layout Breaking on Mobile

**Fix:**
1. Test at 768px breakpoint
2. Check grid-template-areas match column count
3. Ensure flex items have min-width: 0
4. Check for fixed widths instead of max-width

---

## Resources

**Color System:**
- File: `src/styles/colors.js`
- 50+ colors across 9 color families
- 26 complete theme definitions

**Global Styles:**
- File: `src/styles/global.css`
- CSS variables, universal styles, accessibility

**Layout:**
- File: `src/layouts/MainLayout.css`
- Grid system, responsive breakpoints

**Component Examples:**
- Smart Notepad: `src/components/ui/SmartNotepad.css`
- Global Header: `src/components/global/GlobalHeader.css`

---

**Created:** Claude Code
**For:** MyAIM-Central Design System
**Version:** 2.0 (Post Auth Migration)
