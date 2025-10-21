# AIM Documentation

Welcome to the AI Magic for Moms (AIM) documentation! This comprehensive guide will help you understand the system, find existing components, and build new features without recreating what already exists.

---

## 📚 Documentation Index

### 1. [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)
**Start here for the big picture!**

Covers:
- Complete system overview
- Technology stack
- Core systems (Auth, Archives, Best Intentions, Library, etc.)
- Database schema
- Integration points
- Routing structure
- Feature access by subscription tier

**Best for**: Understanding how everything fits together, onboarding new developers, planning new features

---

### 2. [COMPONENT_INVENTORY.md](./COMPONENT_INVENTORY.md)
**Reference when building features!**

Complete catalog of 40+ components with:
- Purpose & description
- Props & interfaces
- Usage examples
- File locations
- Status (complete, in development, planned)

**Best for**: Before creating a new component, check here to see if something similar already exists

---

### 3. [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
**Copy-paste code snippets!**

Practical guide with:
- Common patterns (auth, database, modals, etc.)
- Code snippets & templates
- Error handling patterns
- Common gotchas & solutions
- Debugging tips

**Best for**: Day-to-day development, solving common problems quickly

---

## 🚀 Quick Start Guide

### I want to...

**...understand the overall system**
→ Read [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)

**...find an existing component to use**
→ Search [COMPONENT_INVENTORY.md](./COMPONENT_INVENTORY.md)

**...create a new modal**
→ Check [QUICK_REFERENCE.md > Modal System](./QUICK_REFERENCE.md#modal-system)

**...query the database**
→ Check [QUICK_REFERENCE.md > Database Operations](./QUICK_REFERENCE.md#database-operations)

**...add a new page/route**
→ Check [SYSTEM_ARCHITECTURE.md > Routing Structure](./SYSTEM_ARCHITECTURE.md#routing-structure)

**...work with Archives**
→ Check [COMPONENT_INVENTORY.md > Archives Components](./COMPONENT_INVENTORY.md#archives-components)

**...work with Best Intentions**
→ Check [COMPONENT_INVENTORY.md > Best Intentions Components](./COMPONENT_INVENTORY.md#best-intentions-components)

**...understand authentication**
→ Check [SYSTEM_ARCHITECTURE.md > Authentication System](./SYSTEM_ARCHITECTURE.md#1-authentication-system)

---

## 🗺️ System Overview (TL;DR)

### What is AIM?
AI Magic for Moms - A family productivity platform featuring LiLa™ AI assistants.

### Tech Stack
- React 19 + TypeScript/JSX
- React Router DOM v7
- Supabase (PostgreSQL)
- CSS-in-JS (inline styles)

### Core Features
1. **Archives** - Store family context (members, projects, recipes) for AI personalization
2. **Best Intentions** - Track what truly matters (relationships, spiritual moments, priorities)
3. **Library** - AI learning resources for moms (tools, tutorials, prompts)
4. **Prompt Library** - Save & share mom-tested AI prompts
5. **Command Center** - Main navigation hub
6. **Family Dashboard** - Task management & coordination

### Subscription Tiers
- **FREE** - Basic features
- **PLUS ($9/mo)** - Full Archives, Best Intentions, Prompt Library
- **PREMIUM ($19/mo)** - Everything + Brain Dump Coach, advanced AI

---

## 📂 Project Structure

```
MyAIM_Central/
├── docs/                    ← YOU ARE HERE
│   ├── README.md           ← This file
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── COMPONENT_INVENTORY.md
│   └── QUICK_REFERENCE.md
├── src/
│   ├── components/         ← Reusable UI components
│   ├── contexts/           ← React Context providers
│   ├── lib/                ← Business logic & services
│   ├── pages/              ← Route pages
│   └── styles/             ← Global CSS
├── supabase/
│   └── migrations/         ← Database migrations
└── public/                 ← Static assets
```

---

## 🎯 Development Workflow

### Before Creating a New Component:

1. **Check if it already exists**
   - Search [COMPONENT_INVENTORY.md](./COMPONENT_INVENTORY.md)
   - Use Ctrl+F to search by name/purpose

2. **Check if a similar pattern exists**
   - Look in [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
   - See if existing components can be reused

3. **Understand integration points**
   - Read [SYSTEM_ARCHITECTURE.md > Integration Points](./SYSTEM_ARCHITECTURE.md#integration-points)
   - Check database schema if data is involved

4. **Create the component**
   - Follow patterns from [QUICK_REFERENCE.md > Component Template](./QUICK_REFERENCE.md#full-component-template-typescript)
   - Use appropriate file extension (.tsx for TypeScript, .jsx for JavaScript)

5. **Update documentation**
   - Add component to [COMPONENT_INVENTORY.md](./COMPONENT_INVENTORY.md)
   - Update integration points if needed

---

## 🔧 Common Tasks

### Adding a New Page

1. Create page component in `src/pages/`
2. Add route in `src/App.jsx`
3. Add to [COMPONENT_INVENTORY.md](./COMPONENT_INVENTORY.md)
4. Update routing documentation in [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md#routing-structure)

### Creating a New Database Table

1. Write migration in `supabase/migrations/`
2. Add RLS policies
3. Create service functions in `src/lib/`
4. Update [SYSTEM_ARCHITECTURE.md > Database Schema](./SYSTEM_ARCHITECTURE.md#database-schema-supabase)
5. Update relevant component inventory entries

### Adding a New Context Provider

1. Create provider in `src/contexts/`
2. Add to `src/App.jsx` provider stack
3. Create custom hook (e.g., `useMyContext()`)
4. Document in [COMPONENT_INVENTORY.md > Context Providers](./COMPONENT_INVENTORY.md#context-providers)
5. Add usage example to [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

---

## 🐛 Debugging

### Common Issues

**Nothing shows up**
→ Check Supabase RLS policies

**Can't access user data**
→ Verify AuthContext is available (check provider stack in App.jsx)

**Modal won't open**
→ Check ModalProvider is in context stack

**Database query fails**
→ Check Supabase Dashboard logs

**State not updating**
→ Remember state updates are async - see [QUICK_REFERENCE.md > Common Gotchas](./QUICK_REFERENCE.md#5-state-not-updating)

---

## 📊 System Status

### ✅ Complete Features
- Authentication (3-tier login system)
- Archives system (master folders, custom folders, context items)
- Best Intentions (Brain Dump Coach, Quick Add, categories)
- Library (CRUD, admin interface, tags, categories)
- Command Center navigation
- Modal system (draggable, stacked z-index)
- Feedback/toast system
- Coming Soon modals

### 🚧 In Development
- **Optimize with LiLa** - Personalize library tools with family context
- **Prompt Library** - Save/share mom-tested prompts
- **LiLa Interview Modal** - 5-question setup for family members

### 📋 Planned
- **Inner Oracle** - Intuition/reflection tool
- **MindSweep** - Brain dump organization
- Enhanced dashboards (Family, Teen, Child)

### ⚠️ Known Issues
- Supabase us-east-1 region outages affecting testing
- Family member cards display bug (Supabase-dependent)
- Migration 009 pending application

---

## 🎨 Design Patterns

### 1. Service Layer Pattern
Business logic separated from UI:
```
Component → Service → Supabase
```

### 2. Context Provider Pattern
Global state management:
```jsx
<AuthProvider>
  <ModalProvider>
    <FeedbackProvider>
      <App />
    </FeedbackProvider>
  </ModalProvider>
</AuthProvider>
```

### 3. Modal Pattern
Draggable, stacked modals:
```typescript
const { open } = useModal();
open('Title', <Content />, 'medium');
```

---

## 📖 Learning Path

**If you're new to the project:**

1. Read [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) - Understand the big picture (20 min)
2. Skim [COMPONENT_INVENTORY.md](./COMPONENT_INVENTORY.md) - See what's available (15 min)
3. Bookmark [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Use as daily reference
4. Explore the codebase - Start with `src/App.jsx` and follow the routing
5. Try a small task - Fix a bug or add a minor feature

**If you're building a feature:**

1. Check [COMPONENT_INVENTORY.md](./COMPONENT_INVENTORY.md) - Does it exist?
2. Check [SYSTEM_ARCHITECTURE.md > Integration Points](./SYSTEM_ARCHITECTURE.md#integration-points) - How does it connect?
3. Use [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Copy-paste patterns
4. Build the feature
5. Update documentation

---

## 🤝 Contributing

When you add a new feature:

1. **Update COMPONENT_INVENTORY.md** if you created new components
2. **Update SYSTEM_ARCHITECTURE.md** if you changed system structure or integrations
3. **Add code snippets to QUICK_REFERENCE.md** if you created reusable patterns
4. **Keep docs in sync** - Documentation is only useful if it's accurate!

---

## 📞 Getting Help

### Documentation not clear?
- Open an issue or ask a team member
- Update the docs to clarify for future developers

### Found a bug?
- Check [QUICK_REFERENCE.md > Common Gotchas](./QUICK_REFERENCE.md#common-gotchas)
- Check Supabase logs
- Use React DevTools

### Need to understand a component?
- Check [COMPONENT_INVENTORY.md](./COMPONENT_INVENTORY.md)
- Read the component source code
- Look for similar components in the inventory

---

## 🎯 Documentation Philosophy

**Goals:**
- ✅ Prevent recreating existing components
- ✅ Show how systems integrate
- ✅ Provide practical code examples
- ✅ Help developers find what they need quickly

**NOT goals:**
- ❌ Replace reading the source code
- ❌ Document every single implementation detail
- ❌ Prescribe rigid rules that slow development

**When to update docs:**
- New major feature added
- Significant refactor changes structure
- Common pattern emerges that should be documented
- You found the docs confusing and want to clarify

---

## 🔄 Version History

- **2025-10-20** - Initial comprehensive documentation created
  - SYSTEM_ARCHITECTURE.md
  - COMPONENT_INVENTORY.md
  - QUICK_REFERENCE.md

---

## 📝 Notes

- **This documentation is living** - Update it as the system evolves
- **Use it as a reference** - Not a step-by-step tutorial
- **Keep it practical** - Real code examples > lengthy explanations
- **Maintain accuracy** - Out-of-date docs are worse than no docs

---

**Welcome to the AIM project! Happy coding! 🚀**

---

**Last Updated**: 2025-10-20
**Project Version**: 0.1.0
**Documentation Version**: 1.0.0
