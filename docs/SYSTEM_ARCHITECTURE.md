# AIM System Architecture

## Overview
AI Magic for Moms (AIM) is a family productivity platform featuring LiLa™ AI assistants.

## Technology Stack
- **Frontend**: React 19 + TypeScript/JSX
- **Routing**: React Router DOM v7
- **Database**: Supabase (PostgreSQL)
- **Styling**: CSS-in-JS (inline styles) + global.css
- **Icons**: lucide-react
- **Build**: Create React App

---

## Application Structure

```
MyAIM_Central/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── auth/           # Authentication components
│   │   ├── Admin/          # Admin interfaces
│   │   ├── archives/       # Archives system components
│   │   ├── BestIntentions/ # Best Intentions feature
│   │   ├── Library/        # Library components
│   │   ├── promptLibrary/  # Prompt Library (new)
│   │   └── global/         # Global reusable components
│   ├── contexts/           # React Context providers
│   ├── hooks/              # Custom React hooks
│   ├── layouts/            # Layout wrappers
│   ├── lib/                # Business logic & services
│   ├── pages/              # Route pages
│   ├── styles/             # Global CSS
│   └── types/              # TypeScript definitions
├── supabase/
│   └── migrations/         # Database migrations
└── public/                 # Static assets
```

---

## Core Systems

### 1. Authentication System
**Location**: `src/components/auth/`

**Entry Points** (3 login flows):
- `/login` - Normal Mom Login (NormalMomLogin.tsx)
- `/admin` - Admin Login (AdminLogin.tsx)
- `/dashboard` - Family Member Login (FamilyMemberLogin.tsx)

**Context**: AuthContext.tsx
- Manages user state, family ID, role
- Provides login/logout functions
- Persists auth in localStorage

**Subscription Tiers**:
- FREE (limited features)
- PLUS ($9/mo)
- PREMIUM ($19/mo)

### 2. Modal System
**Location**: `src/contexts/ModalContext.tsx`

**Provider**: ModalProvider
- Manages draggable modals
- Stack-based z-index management
- Three sizes: small, medium, large

**Hook**: `useModal()`
```javascript
const { open, close } = useModal();
open('Title', <Content />, 'medium');
```

**Draggable**: Uses react-draggable

### 3. Feedback System
**Location**: `src/contexts/FeedbackContext.jsx`

**Provider**: FeedbackProvider
- Toast notifications
- Success/error messages
- Auto-dismiss

**Hook**: `useFeedback()`

### 4. Archives System
**Location**: `src/components/archives/`, `src/pages/Archives.tsx`

**Database Tables**:
- `master_folders` - Top-level folders (Family Members, Projects, etc.)
- `archives_folders` - User-created custom folders
- `archives_subfolders` - Nested organization
- `archives_context_items` - Individual context pieces

**Components**:
- `Archives.tsx` - Main page with master folder grid
- `FolderCard.tsx` - Master folder display
- `FolderDetailView.tsx` - Drill-down into folder
- `SubfolderGrid.tsx` - Subfolder organization
- `ContextItemRow.tsx` - Individual context items
- `CreateCustomFolderModal.tsx` - Create new folders
- `CreateSubfolderModal.tsx` - Create subfolders
- `CoverPhotoUpload.tsx` - Cover photo management
- `LilaInterviewModal.tsx` - AI-assisted context collection

**Service**: `lib/archivesService.ts`
- `getMasterFolders()` - Fetch system folders
- `getUserFolders()` - Get user custom folders
- `createFolder()`, `updateFolder()`, `deleteFolder()`
- `getSubfolders()`, `createSubfolder()`
- `getContextItems()`, `createContextItem()`

**Purpose**: Store family context (member info, projects, recipes, etc.) for AI personalization

### 5. Best Intentions System
**Location**: `src/components/BestIntentions/`

**Main Modal**: `BestIntentionsModal.tsx`
- 3 view modes: landing, view, create
- Privacy levels: private, parents_only, family

**Create Modes**:
1. **Brain Dump Coach** (`BrainDumpCoach.tsx`)
   - Conversational AI interface
   - Extracts intentions from free-form text
   - Uses OpenRouter API

2. **Quick Add** (`QuickAddForm.tsx`)
   - Structured form
   - Category selection
   - Priority setting

**Components**:
- `CategoryFilter.tsx` - Filter by category
- `CategorySelector.tsx` - Select/create categories
- `IntentionCard.tsx` - Display intention
- `AddCategoryModal.tsx` - Custom categories

**Database Tables**:
- `intention_categories` - Categories (default + custom)
- `best_intentions` - User intentions
- `quick_action_usage` - Tracks usage

**Service**: `lib/bestIntentionsService.ts`

**Purpose**: Track what truly matters (deeper connections, spiritual moments, relationships)

### 6. Library System
**Location**: `src/pages/Library.jsx`, `src/components/Library/`

**Admin Interface**: `LibraryAdmin.jsx`
- CRUD for library items
- Tags, categories, tool types
- "Optimize with LiLa" toggle

**New Feature**: **Optimize with LiLa Button**
- Component: `OptimizeWithLiLaButton.jsx`
- Service: `lib/lilaContextService.js`
- Gathers family context from Archives
- Personalizes tools with LiLa

**Database Table**: `library_items`
- Tutorials, prompts, AI tools
- Filterable by tags, categories
- enable_lila_optimization flag

**Purpose**: AI learning resources for moms

### 7. Prompt Library (NEW - In Development)
**Location**: `src/pages/PromptLibrary.tsx`, `src/components/promptLibrary/`

**Service**: `lib/promptLibraryService.ts`

**Planned Features**:
- Save favorite prompts
- Search & filter
- Category organization
- Personal prompt library (localStorage initially)

**Purpose**: Mom-tested AI prompts

### 8. Command Center
**Location**: `src/pages/CommandCenter.tsx`

**Navigation Hub** - Cards linking to:
- Dashboard
- Library
- Archives
- Best Intentions
- Inner Oracle (coming soon)
- MindSweep (coming soon)

**Coming Soon Modal**: Reusable component for future features

---

## Global Components

### ComingSoonModal
**Location**: `src/components/global/ComingSoonModal.jsx`

**Usage**:
```jsx
<ComingSoonModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  featureName="Feature Name"
  message="Custom message..."
/>
```

**Features**:
- Auto-dismiss on click
- Theme-consistent styling
- Animated entrance

**CSS**: `ComingSoonModal.css`

---

## Routing Structure

**App.jsx** defines all routes:

### Login Routes (no MainLayout)
- `/login` - NormalMomLogin
- `/admin` - AdminLogin
- `/dashboard` - FamilyMemberLogin
- `/beta/login` - BetaLogin
- `/beta/family-setup` - ForcedFamilySetup

### Standalone Dashboards (no MainLayout)
- `/teen-dashboard` - TeenDashboard
- `/child-dashboard` - ChildDashboard

### Main App Routes (with MainLayout)
- `/` - CommandCenter (index)
- `/command-center` - CommandCenter
- `/family-dashboard` - FamilyDashboard
- `/family-archive` - Archives
- `/archives` - Archives
- `/prompt-library` - PromptLibrary
- `/your-archives` - YourArchivesPage
- `/library` - Library
- `/library/admin` - LibraryAdmin
- `/beta/admin` - BetaAdmin
- `/aim-admin` - AimAdminDashboard
- `/family-setup` - FamilySetupInterface
- `/inner-oracle` - InnerOracle (coming soon page)
- `/mindsweep` - MindSweep (coming soon page)

**MainLayout.tsx**:
- Wraps most routes
- Provides GlobalHeader, QuickActions, Footer
- Manages global layout

---

## Services & Business Logic

### lib/intentions.js
- `getFamilyIntentions(familyId)`
- `getIntentionsByCategory(familyId, categoryId)`
- `createIntention(data)`
- `updateIntentionStatus(id, status)`
- `deleteIntention(id)`

### lib/archivesService.ts
- All Archives CRUD operations
- Master folders, custom folders, subfolders, context items

### lib/bestIntentionsService.ts
- Best Intentions specific operations
- Category management

### lib/promptLibraryService.ts (NEW)
- Prompt CRUD (to be implemented)

### lib/lilaContextService.js (NEW)
- `getFamilyContextForOptimization()` - Gathers all family data
- `formatMemberContext()` - Organizes by category
- `buildContextSummary()` - Natural language summary
- `getMemberContextByName()` - Specific member context

### lib/aiServices.js
- `processBrainDumpConversation()` - Brain Dump Coach AI
- OpenRouter API integration

---

## Database Schema (Supabase)

### Core Tables

**users**
- Standard Supabase auth

**families**
- id, name, created_at
- Links to family_members

**family_members**
- id, family_id, auth_user_id, name, role, subscription_tier
- Roles: admin, parent, teen, child

**library_items**
- All library content
- Fields: title, description, tool_type, tags, enable_lila_optimization

**master_folders** (Archives)
- System-defined folders (Family Members, Projects, etc.)

**archives_folders** (Archives)
- User-created custom folders

**archives_subfolders** (Archives)
- Nested folder organization

**archives_context_items** (Archives)
- Individual context pieces

**intention_categories**
- Default + custom categories

**best_intentions**
- User intentions with privacy levels

**quick_action_usage**
- Analytics for feature usage

### Migrations
Located in `supabase/migrations/`

Recent key migrations:
- `001_beta_system_enhancements.sql` - Beta testing infrastructure
- `002_best_intentions_rls_and_functions.sql` - Best Intentions system
- `003_seed_default_intention_categories.sql` - Default categories
- `006_family_archives_system.sql` - Archives tables
- `007_master_folder_system.sql` - Master folders
- `008_standardize_subscription_tiers.sql` - Subscription tiers
- `009_public_read_access_for_development.sql` - Dev access (pending)

---

## Integration Points

### Archives ↔ LiLa Optimization
**Flow**:
1. User clicks "Optimize with LiLa" on library tool
2. `lilaContextService.getFamilyContextForOptimization()` called
3. Gathers data from Archives (family members, context items)
4. Formats into natural language summary
5. Passes to LiLa with tool details
6. LiLa personalizes tool with family context

**Files**:
- `lib/lilaContextService.js`
- `components/Library/OptimizeWithLiLaButton.jsx`

### Best Intentions ↔ Archives
**Integration**: Best Intentions uses family_id from AuthContext, same as Archives

**Use Case**: Intentions stored per family, can reference Archive context

### Auth ↔ All Systems
**Flow**:
1. AuthContext provides:
   - `user.familyId`
   - `user.familyMemberId`
   - `user.role`
   - `user.subscriptionTier`
2. All features check tier for access
3. All data scoped to family_id

---

## Feature Access by Tier

### FREE Tier
- Command Center
- Basic Library access
- View Archives (limited)
- View Best Intentions (limited)

### PLUS Tier ($9/mo)
- Full Archives
- Full Best Intentions
- Prompt Library
- LiLa Optimization

### PREMIUM Tier ($19/mo)
- Everything in PLUS
- Brain Dump Coach
- Priority features
- Advanced AI features

---

## Key Design Patterns

### 1. Context Providers
All providers wrap App in App.jsx:
```jsx
<AuthProvider>
  <ModalProvider>
    <FeedbackProvider>
      <Router>
        <App />
      </Router>
    </FeedbackProvider>
  </ModalProvider>
</AuthProvider>
```

### 2. Modal Pattern
```javascript
const { open, close } = useModal();
open('Modal Title', <ComponentContent />, 'medium');
```

### 3. Service Layer
Business logic separated from UI:
- Components call services
- Services handle Supabase queries
- Services return processed data

### 4. Type Safety
Mix of TypeScript (.tsx) and JavaScript (.jsx):
- New complex components: TypeScript
- Simple/legacy components: JavaScript

---

## Current Development State

### ✅ Completed Features
- Authentication system (3-tier)
- Archives system (master folders, custom folders, context items)
- Best Intentions (Brain Dump Coach, Quick Add, categories)
- Library (CRUD, admin interface)
- Command Center navigation
- Coming Soon modals for future features
- Modal system (draggable, stacked)
- Feedback/toast system

### 🚧 In Progress
- Optimize with LiLa button integration
- Prompt Library UI
- LiLa Interview Modal (5 questions for family members)

### 📋 Planned
- Inner Oracle (intuition/reflection tool)
- MindSweep (brain dump organization)
- Family Dashboard enhancements
- Teen Dashboard features
- Child Dashboard features

### ⚠️ Known Issues
- Supabase us-east-1 region experiencing outages (affects testing)
- Family member cards display bug (Supabase-dependent)
- Migration 009 needs to be applied when Supabase returns

---

## Development Workflow

### Running the App
```bash
npm start          # Dev server on port 3000
npm run build      # Production build
npm test           # Run tests
```

### Environment Variables
Located in `.env.development` (not in repo):
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_ANON_KEY
- REACT_APP_OPENROUTER_API_KEY

### Git Status
- **Current Branch**: main
- **Modified Files**: Many components updated with recent features
- **Untracked Files**: New Archives, Prompt Library, Best Intentions components

---

## Component Naming Conventions

### File Extensions
- `.tsx` - TypeScript + React
- `.jsx` - JavaScript + React
- `.ts` - TypeScript utilities
- `.js` - JavaScript utilities

### Component Structure
```
ComponentName/
├── ComponentName.tsx      # Main component
├── ComponentName.css      # Styles (if needed)
├── SubComponent.tsx       # Sub-components
└── index.ts              # Barrel export (optional)
```

### Naming
- PascalCase for components
- camelCase for functions/variables
- SCREAMING_SNAKE_CASE for constants

---

## Styling Approach

### CSS Variables (theme.css or global.css)
```css
:root {
  --primary-color: #68a395;
  --secondary-color: #d6a461;
  --background-color: #fff4ec;
  --accent-color: #d4e3d9;
  --text-color: #5a4033;
  --gradient-primary: linear-gradient(135deg, #68a395, #d6a461);
  --gradient-background: linear-gradient(135deg, #fff4ec, #d4e3d9);
}
```

### Inline Styles with TypeScript
```typescript
const styles: Record<string, CSSProperties> = {
  container: {
    padding: '20px',
    background: 'var(--background-color)',
  }
};
```

### Font Families
- Headings: 'The Seasons', 'Playfair Display', serif
- Body: System fonts

---

## API Integration

### Supabase Client
```javascript
import { supabase } from '../supabaseClient';

// Query
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('family_id', familyId);

// Insert
const { data, error } = await supabase
  .from('table_name')
  .insert([{ ...data }]);
```

### OpenRouter API
Used in Brain Dump Coach:
```javascript
const result = await processBrainDumpConversation(messages);
```

---

## Testing Strategy

### Manual Testing
- Use different family accounts
- Test each subscription tier
- Verify RLS policies in Supabase

### Browser Console
- Check for errors
- Verify API calls
- Monitor state changes

---

## Deployment

**Platform**: (To be determined - likely Vercel/Netlify)

**Environment**: Production vs Development
- Different Supabase projects
- Different API keys
- Different error handling

---

## Future Enhancements

### Technical Debt
- Add unit tests (React Testing Library)
- Add E2E tests (Playwright/Cypress)
- Implement Storybook for component documentation
- Optimize bundle size
- Add error boundaries
- Improve loading states
- Add skeleton screens

### Features on Roadmap
- Mobile responsive design improvements
- PWA capabilities
- Offline mode
- Push notifications
- Calendar integration
- Task management
- Budget tracking
- Meal planning
- Schedule optimization

---

## Resources

### Documentation
- React: https://react.dev
- React Router: https://reactrouter.com
- Supabase: https://supabase.com/docs
- Lucide Icons: https://lucide.dev

### Project Docs
- DATABASE_SCHEMA_REFERENCE.md - Detailed schema
- COMMAND_CENTER_STATE_ASSESSMENT.md - Command Center status
- MASTER_FOLDER_SETUP_AND_TESTING.md - Archives setup

---

**Last Updated**: 2025-10-20
**Version**: 0.1.0
**Maintained By**: Development Team
