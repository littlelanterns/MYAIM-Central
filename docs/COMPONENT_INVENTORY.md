# Component Inventory

Complete list of all components in the AIM system with their purpose, props, and usage.

---

## Global Components

### ComingSoonModal
**File**: `src/components/global/ComingSoonModal.jsx`

**Purpose**: Display "coming soon" message for features in development

**Props**:
```javascript
{
  isOpen: boolean,          // Show/hide modal
  onClose: () => void,      // Close handler
  featureName: string,      // Name of feature (default: "This Feature")
  message: string           // Custom message (default provided)
}
```

**Usage**:
```jsx
<ComingSoonModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  featureName="Inner Oracle"
  message="Your intuition's best friend..."
/>
```

**Styling**: ComingSoonModal.css with animations

---

### GlobalHeader
**File**: `src/components/global/GlobalHeader.js`

**Purpose**: Top navigation bar

**Features**:
- Logo
- Navigation links
- User menu
- Mobile responsive

---

### QuickActions
**File**: `src/components/global/QuickActions.js`

**Purpose**: Quick action buttons (context-aware)

**Features**:
- Best Intentions shortcut
- Context-sensitive actions

---

## Auth Components

### NormalMomLogin
**File**: `src/pages/NormalMomLogin.tsx`

**Route**: `/login`

**Purpose**: Primary login for moms

**Features**:
- Email/password auth
- Remember me
- Forgot password link

---

### AdminLogin
**File**: `src/pages/AdminLogin.tsx`

**Route**: `/admin`

**Purpose**: Admin-only login

**Features**:
- Admin credentials
- Admin dashboard access

---

### FamilyMemberLogin
**File**: `src/pages/FamilyMemberLogin.tsx`

**Route**: `/dashboard`

**Purpose**: Teen/child login

**Features**:
- Simplified interface
- Age-appropriate dashboard redirect

---

### AuthContext
**File**: `src/components/auth/shared/AuthContext.tsx`

**Hook**: `useAuthContext()`

**State**:
```typescript
{
  user: {
    familyId: string,
    familyMemberId: string,
    name: string,
    role: 'admin' | 'parent' | 'teen' | 'child',
    subscriptionTier: 'FREE' | 'PLUS' | 'PREMIUM'
  },
  isAuthenticated: boolean,
  isLoading: boolean
}
```

**Functions**:
- `login(credentials)`
- `logout()`
- `updateUser(userData)`

---

## Archives Components

### Archives (Main Page)
**File**: `src/pages/Archives.tsx`

**Route**: `/family-archive` or `/archives`

**Purpose**: Archives landing page with master folders

**State Management**:
- Loads master folders on mount
- Loading states
- Error handling

**Features**:
- Master folder grid
- Create custom folder button
- Responsive grid layout

---

### FolderCard
**File**: `src/components/archives/FolderCard.tsx`

**Purpose**: Display individual folder with cover photo

**Props**:
```typescript
{
  folder: {
    id: string,
    name: string,
    description: string,
    cover_photo_url?: string,
    item_count?: number,
    is_master_folder: boolean
  },
  onClick: () => void
}
```

**Features**:
- Cover photo display
- Folder name & description
- Item count badge
- Click to open

---

### FolderDetailView
**File**: `src/components/archives/FolderDetailView.tsx`

**Purpose**: Drill-down view showing subfolders and context items

**Props**:
```typescript
{
  folderId: string,
  folderName: string,
  onBack: () => void
}
```

**Features**:
- Subfolder grid
- Context items list
- Create subfolder button
- Add context item button
- Back navigation

---

### SubfolderGrid
**File**: `src/components/archives/SubfolderGrid.tsx`

**Purpose**: Display subfolders within a folder

**Props**:
```typescript
{
  folderId: string,
  onSubfolderClick: (subfolderId: string) => void
}
```

---

### ContextItemRow
**File**: `src/components/archives/ContextItemRow.tsx`

**Purpose**: Display individual context item

**Props**:
```typescript
{
  item: {
    id: string,
    title: string,
    content: string,
    category: string,
    created_at: string
  },
  onEdit: (item) => void,
  onDelete: (id) => void
}
```

---

### CreateCustomFolderModal
**File**: `src/components/archives/CreateCustomFolderModal.tsx`

**Purpose**: Modal to create new custom folder

**Props**:
```typescript
{
  isOpen: boolean,
  onClose: () => void,
  onSuccess: (folder) => void
}
```

**Form Fields**:
- Folder name (required)
- Description
- Cover photo upload

---

### CreateSubfolderModal
**File**: `src/components/archives/CreateSubfolderModal.tsx`

**Purpose**: Modal to create subfolder within folder

**Props**:
```typescript
{
  isOpen: boolean,
  onClose: () => void,
  parentFolderId: string,
  onSuccess: (subfolder) => void
}
```

---

### CoverPhotoUpload
**File**: `src/components/archives/CoverPhotoUpload.tsx`

**Purpose**: Upload/manage folder cover photos

**Props**:
```typescript
{
  currentPhotoUrl?: string,
  onUpload: (url: string) => void,
  onRemove: () => void
}
```

**Features**:
- Image preview
- Upload to Supabase Storage
- Remove photo
- File type validation

---

### LilaInterviewModal
**File**: `src/components/archives/LilaInterviewModal.tsx`

**Purpose**: AI-assisted context collection for family members

**Props**:
```typescript
{
  isOpen: boolean,
  onClose: () => void,
  familyMemberId: string,
  onComplete: (contextData) => void
}
```

**Features**:
- 5-question interview
- AI-powered conversation
- Context extraction
- Saves to Archives

---

## Best Intentions Components

### BestIntentionsModal
**File**: `src/components/BestIntentions/BestIntentionsModal.tsx`

**Purpose**: Main modal for Best Intentions feature

**Props**:
```typescript
{
  isOpen: boolean,
  onClose: () => void
}
```

**View Modes**:
1. **Landing** - Choose Brain Dump or Quick Add
2. **View** - See existing intentions with filters
3. **Create** - Create new intention

**State**:
- viewMode: 'landing' | 'view' | 'create'
- selectedPrivacy: 'private' | 'parents_only' | 'family'

---

### BrainDumpCoach
**File**: `src/components/BestIntentions/BrainDumpCoach.tsx`

**Purpose**: Conversational AI to extract intentions

**Props**:
```typescript
{
  isOpen: boolean,
  onClose: () => void,
  onBack: () => void,
  selectedPrivacy: 'private' | 'parents_only' | 'family'
}
```

**Steps**:
1. **Initial** - Brain dump textarea
2. **Conversation** - AI chat to refine
3. **Complete** - Intention created

**Features**:
- OpenRouter AI integration
- Real-time intention preview
- Multi-turn conversation
- Intention extraction

---

### QuickAddForm
**File**: `src/components/BestIntentions/QuickAddForm.tsx`

**Purpose**: Structured form to create intention

**Props**:
```typescript
{
  isOpen: boolean,
  onClose: () => void,
  onBack: () => void,
  selectedPrivacy: 'private' | 'parents_only' | 'family',
  familyId: string,
  onSuccess?: () => void
}
```

**Form Fields**:
- Title (required)
- Category
- Priority (high/medium/low)
- Current state (optional)
- Desired state (optional)
- Why it matters (optional)

---

### CategoryFilter
**File**: `src/components/BestIntentions/CategoryFilter.tsx`

**Purpose**: Filter intentions by category

**Props**:
```typescript
{
  categories: Category[],
  selectedCategoryId: string | null,
  onCategorySelect: (id: string | null) => void
}
```

---

### CategorySelector
**File**: `src/components/BestIntentions/CategorySelector.tsx`

**Purpose**: Dropdown to select category

**Props**:
```typescript
{
  selectedCategoryId: string | null,
  onCategoryChange: (id: string | null) => void,
  familyId: string,
  isRequired?: boolean,
  showAddCustom?: boolean,
  onAddCustom?: () => void
}
```

---

### IntentionCard
**File**: `src/components/BestIntentions/IntentionCard.tsx`

**Purpose**: Display individual intention

**Props**:
```typescript
{
  intention: {
    id: string,
    title: string,
    current_state: string,
    desired_state: string,
    why_it_matters: string,
    category_name: string,
    priority: 'high' | 'medium' | 'low',
    privacy_level: 'private' | 'parents_only' | 'family',
    status: 'active' | 'completed' | 'archived'
  },
  onStatusChange: (id: string, status: string) => void,
  onDelete: (id: string) => void
}
```

---

### AddCategoryModal
**File**: `src/components/BestIntentions/AddCategoryModal.tsx`

**Purpose**: Create custom intention category

**Props**:
```typescript
{
  isOpen: boolean,
  onClose: () => void,
  familyId: string,
  onSuccess: (category) => void
}
```

---

## Library Components

### Library (Main Page)
**File**: `src/pages/Library.jsx`

**Route**: `/library`

**Purpose**: Browse AI tools, tutorials, and prompts

**Features**:
- Grid/list view
- Filter by category, tags, tool type
- Search functionality
- "Optimize with LiLa" button (if enabled)

---

### LibraryAdmin
**File**: `src/components/Admin/LibraryAdmin.jsx`

**Route**: `/library/admin`

**Purpose**: Admin interface to manage library items

**Features**:
- CRUD operations
- Image upload
- Tag management
- "Enable LiLa Optimization" toggle
- Custom LiLa optimization prompt

**Form Sections**:
1. Basic Information (title, description, short description)
2. Media (cover image, screenshots)
3. Content Details (tool type, URL, tags)
4. Categorization (categories, difficulty level)
5. LiLa Optimization (toggle, custom prompt)

---

### OptimizeWithLiLaButton
**File**: `src/components/Library/OptimizeWithLiLaButton.jsx`

**Purpose**: Button to personalize library tool with family context

**Props**:
```typescript
{
  libraryItem: {
    id: string,
    title: string,
    description: string,
    tool_type: string,
    tool_url: string,
    lila_optimization_prompt?: string
  },
  customPrompt?: string,
  className?: string
}
```

**Flow**:
1. Click button
2. Gathers family context from Archives
3. Builds optimization payload
4. Stores in sessionStorage
5. Navigates to `/lila?optimize=true`

**Styling**: OptimizeWithLiLaButton.css (purple gradient)

---

## Prompt Library Components (NEW - In Development)

### PromptLibrary
**File**: `src/pages/PromptLibrary.tsx`

**Route**: `/prompt-library`

**Purpose**: Browse and save mom-tested prompts

**Planned Features**:
- Prompt grid/list
- Search & filter
- Favorite/save prompts
- Category organization
- Personal library

**Status**: 🚧 In development

---

## Page Components

### CommandCenter
**File**: `src/pages/CommandCenter.tsx`

**Route**: `/` or `/command-center`

**Purpose**: Main navigation hub

**Cards**:
1. Dashboard
2. Library
3. Archives
4. Best Intentions
5. Inner Oracle (coming soon)
6. MindSweep (coming soon)

**Card Data Structure**:
```typescript
{
  type: 'page' | 'modal',
  path?: string,           // if type === 'page'
  actionId?: string,       // if type === 'modal'
  title: string,          // UPPERCASE display
  subtitle: string,       // Display name
  description: string     // Card description
}
```

---

### InnerOracle
**File**: `src/pages/InnerOracle.jsx`

**Route**: `/inner-oracle`

**Purpose**: Coming soon page for Inner Oracle feature

**Features**:
- Blank placeholder
- ComingSoonModal auto-displays
- Can be dismissed to see page underneath

---

### MindSweep
**File**: `src/pages/MindSweep.jsx`

**Route**: `/mindsweep`

**Purpose**: Coming soon page for MindSweep feature

**Features**:
- Blank placeholder
- ComingSoonModal auto-displays
- Can be dismissed to see page underneath

---

### FamilyDashboard
**File**: `src/pages/FamilyDashboard.tsx`

**Route**: `/family-dashboard`

**Purpose**: Family task management and coordination

**Status**: Basic implementation

---

### TeenDashboard
**File**: `src/pages/TeenDashboard.tsx`

**Route**: `/teen-dashboard`

**Purpose**: Age-appropriate dashboard for teens

**Status**: Basic implementation

---

### ChildDashboard
**File**: `src/pages/ChildDashboard.tsx`

**Route**: `/child-dashboard`

**Purpose**: Simplified dashboard for children

**Status**: Basic implementation

---

## Admin Components

### BetaAdmin
**File**: `src/components/Admin/BetaAdmin.jsx`

**Route**: `/beta/admin`

**Purpose**: Manage beta testing system

**Features**:
- Beta user management
- Access code generation
- Usage analytics

---

### AimAdminDashboard
**File**: `src/components/Admin/AimAdminDashboard.jsx`

**Route**: `/aim-admin`

**Purpose**: Overall system administration

**Features**:
- User management
- Family management
- System analytics
- Database maintenance

---

## Layout Components

### MainLayout
**File**: `src/layouts/MainLayout.tsx`

**Purpose**: Wrapper for main app routes

**Features**:
- GlobalHeader at top
- QuickActions sidebar (optional)
- Footer at bottom
- Outlet for child routes

**Usage**:
```jsx
<Route path="/" element={<MainLayout />}>
  <Route index element={<CommandCenter />} />
  <Route path="library" element={<Library />} />
  {/* ... more routes */}
</Route>
```

---

## Context Providers

### AuthProvider
**File**: `src/components/auth/shared/AuthContext.tsx`

**Provides**:
- Current user state
- Authentication functions
- Subscription tier access

**Hook**: `useAuthContext()`

---

### ModalProvider
**File**: `src/contexts/ModalContext.tsx`

**Provides**:
- Modal stack management
- Open/close functions
- Draggable modal system

**Hook**: `useModal()`

---

### FeedbackProvider
**File**: `src/contexts/FeedbackContext.jsx`

**Provides**:
- Toast notifications
- Success/error messages

**Hook**: `useFeedback()`

---

## Utility Components

### Toaster
(Part of feedback system)

**Purpose**: Display toast notifications

---

## Component Status Legend

- ✅ **Complete** - Fully implemented and tested
- 🚧 **In Development** - Partially complete
- 📋 **Planned** - Design complete, not yet built
- 🔧 **Needs Refactor** - Working but needs improvement

---

## Component Status Summary

### ✅ Complete
- ComingSoonModal
- All Auth components
- All Archives components
- All Best Intentions components
- Library & LibraryAdmin
- OptimizeWithLiLaButton
- CommandCenter
- MainLayout
- All Context Providers

### 🚧 In Development
- PromptLibrary
- LilaInterviewModal (planned for Archives)
- Family/Teen/ChildDashboard (basic versions exist)

### 📋 Planned
- InnerOracle (actual feature)
- MindSweep (actual feature)
- Personal Prompt Library features

---

## Component Creation Checklist

When creating a new component:

1. [ ] Choose file extension (.tsx for TypeScript, .jsx for JavaScript)
2. [ ] Define PropTypes or TypeScript interface
3. [ ] Add JSDoc comments
4. [ ] Implement component logic
5. [ ] Add styling (CSS file or inline styles)
6. [ ] Add to this inventory
7. [ ] Update SYSTEM_ARCHITECTURE.md if it's a major feature
8. [ ] Test across subscription tiers
9. [ ] Verify mobile responsiveness
10. [ ] Check accessibility (keyboard nav, screen readers)

---

**Last Updated**: 2025-10-20
**Components**: 40+
**Maintained By**: Development Team
