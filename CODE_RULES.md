# Code Rules for AIM Family Management System

## Icon Usage Policy

**STRICT RULE: Icons are ONLY allowed in the Children Dashboard**

### ✅ **Allowed Icon Usage:**
- **Children Dashboard Only** (`src/pages/ChildDashboard.tsx` and related child components)
- Icons should be age-appropriate and engaging for children
- Use colorful, fun icons that help children navigate easily

### ❌ **Prohibited Icon Usage:**
- **All other components and pages** (Parent interfaces, Teen Dashboard, Command Center, etc.)
- **Adult-facing interfaces** should use text-based navigation and labels
- **Professional/mature interfaces** should maintain clean, text-focused design

### **Enforcement Guidelines:**

#### 1. **Import Restrictions**
```typescript
// ❌ FORBIDDEN in non-children components
import { Icon, Heart, Plus, Star } from 'lucide-react';

// ✅ ALLOWED only in ChildDashboard and child-specific components
import { Star, Heart, Smile } from 'lucide-react'; // Only in children components
```

#### 2. **Component-Specific Rules**

**Children Dashboard (`ChildDashboard.tsx`):**
```typescript
// ✅ ALLOWED - Children need visual cues
<Star size={24} color="#FFD700" />
<Heart size={20} color="#FF6B6B" />
```

**All Other Components:**
```typescript
// ❌ FORBIDDEN - Use text instead
<Plus size={16} /> // Remove this

// ✅ CORRECT - Use text labels
<span>Add</span>
<button>Create New</button>
```

#### 3. **Existing Code Cleanup Required**

**Files that need icon removal:**
- `src/components/BestIntentions/AddCategoryModal.tsx` - Remove all lucide-react icons
- `src/components/BestIntentions/CategoryFilter.tsx` - Remove icons, use text
- `src/components/BestIntentions/BestIntentionsModal.tsx` - Remove icons
- `src/components/BestIntentions/QuickAddForm.tsx` - Remove icons
- `src/pages/CommandCenter.tsx` - Remove icons from cards
- `src/layouts/MainLayout.tsx` - Remove icons from headers
- All other adult-facing components

#### 4. **Replacement Patterns**

**Instead of icons, use:**
```typescript
// ❌ OLD (with icons)
<Plus size={16} /> Add Category
<Heart size={20} /> Best Intentions
<Filter size={18} /> Filter

// ✅ NEW (text-only)
+ Add Category
• Best Intentions  
◦ Filter Options
```

**Button text patterns:**
```typescript
// ❌ OLD
<Plus size={16} />

// ✅ NEW
+ Add
⊕ Create
→ Continue
← Back
× Close
```

#### 5. **CSS Alternatives**

**Use Unicode symbols and CSS styling:**
```css
.add-button::before {
  content: "⊕";
  margin-right: 6px;
}

.close-button::before {
  content: "×";
  font-size: 1.2em;
}

.filter-button::before {
  content: "◦";
  margin-right: 4px;
}
```

#### 6. **Exception Process**

**To request an icon exception:**
1. Must be for Children Dashboard only
2. Must improve child accessibility/engagement
3. Must be age-appropriate
4. Requires explicit approval in code review

### **Implementation Priority:**

1. **IMMEDIATE:** No new icons in non-children components
2. **HIGH PRIORITY:** Remove icons from AddCategoryModal 
3. **MEDIUM PRIORITY:** Remove icons from CategoryFilter and other Best Intentions components
4. **LOW PRIORITY:** Clean up remaining components

### **Code Review Checklist:**

- [ ] No lucide-react imports in non-children components
- [ ] No icon JSX elements in adult interfaces  
- [ ] Text alternatives provided for all removed icons
- [ ] Children Dashboard maintains appropriate icon usage
- [ ] Unicode symbols used where visual cues needed

### **Rationale:**

- **Professional Appearance:** Adult interfaces should look mature and business-like
- **Performance:** Fewer icon imports reduce bundle size
- **Accessibility:** Text is more screen-reader friendly
- **Design Consistency:** Clean, text-focused design language
- **Child-Specific Engagement:** Icons reserved for where they add most value (children's experience)