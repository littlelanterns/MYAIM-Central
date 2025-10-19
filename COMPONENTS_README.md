# MyAIM-Central Components Documentation

**Complete Component Library Reference**
**Last Updated:** 2025-10-18
**Version:** 2.0 (Post-Migration)

---

## Table of Contents

1. [Component Architecture](#component-architecture)
2. [Global Components](#global-components)
3. [UI Components](#ui-components)
4. [Feature Components](#feature-components)
5. [Dashboard Components](#dashboard-components)
6. [Authentication Components](#authentication-components)
7. [Family Management Components](#family-management-components)
8. [Task Management Components](#task-management-components)
9. [Library Components](#library-components)
10. [Context Providers](#context-providers)
11. [Usage Examples](#usage-examples)

---

## Component Architecture

### File Organization

```
src/components/
├── global/              # App-wide components (header, quick actions, AI panel)
├── ui/                  # Reusable UI primitives (modals, buttons, inputs)
├── auth/                # Authentication flows (login, signup, family setup)
├── family/              # Family management (settings, members, permissions)
├── tasks/               # Task management system
├── dashboard/           # Role-based dashboards (mom, teen, child)
│   ├── mom/
│   ├── teen/
│   ├── child/
│   └── shared/
├── Library/             # Tutorial library and Vault-style content
├── Admin/               # Admin interfaces (beta, library, system)
├── BestIntentions/      # Best Intentions system
├── archives/            # Archive system components
├── feedback/            # User feedback components
├── ai/                  # AI-related components
├── context/             # Context management
└── shared/              # Shared utilities and components
```

### Component Naming Conventions

- **PascalCase** for component files: `SmartNotepad.jsx`, `BestIntentionsModal.tsx`
- **PascalCase** for component names in code
- Matching CSS files use **PascalCase**: `SmartNotepad.css`
- Index exports for clean imports: `components/family/index.tsx`

---

## Global Components

### GlobalHeader

**Location:** `src/components/global/GlobalHeader.js`
**CSS:** `src/components/global/GlobalHeader.css`

**Purpose:** Top navigation bar with logo, theme selector, and controls

**Props:** None (self-contained)

**Features:**
- App branding and logo
- Theme selector dropdown (26+ themes)
- Return to dashboard button (when not on dashboard)
- Responsive layout (desktop/tablet/mobile)

**Usage:**
```javascript
import GlobalHeader from './components/global/GlobalHeader';

<GlobalHeader />
```

**Theme Integration:**
- Sits on gradient header background
- Theme selector uses `--primary-color` and `--secondary-color`
- Automatically updates CSS variables on theme change

---

### QuickActions

**Location:** `src/components/global/QuickActions.js`
**CSS:** `src/components/global/QuickActions.css`

**Purpose:** Horizontal scrollable action bar with frequently-used features

**Props:**
- `contextType?: string` - Context for action filtering (default: `'dashboard'`)

**Features:**
- Auto-rearranging based on usage frequency
- Horizontal scroll with arrow buttons
- Add custom actions dynamically
- Usage count badges
- Navigation actions (Command Center, Family Setup, AIM-Admin)
- Modal actions (Task Creator, Meal Planner, Task Breaker, etc.)

**Built-in Actions:**
1. **Command Center** (navigation)
2. **Family Setup** (navigation)
3. **AIM-Admin** (navigation, requires admin flag)
4. **Create Task** (modal - TaskCreationModal)
5. **Me with Manners** (modal placeholder)
6. **Task Breaker** (modal placeholder)
7. **Mediator** (modal placeholder)
8. **Meal Planner** (modal placeholder)
9. **Compliment Generator** (modal placeholder)
10. **Silly Question Generator** (modal placeholder)

**Usage:**
```javascript
import QuickActions from './components/global/QuickActions';

<QuickActions contextType="dashboard" />
```

**Admin Access:**
```javascript
// Set admin flag in localStorage
localStorage.setItem('aim_admin_access', 'true');
```

---

### LiLaPanel

**Location:** `src/components/global/LiLaPanel.js`
**CSS:** `src/components/global/LiLaPanel.css`

**Purpose:** AI assistant panel with 3 LiLa™ characters

**Props:** None (self-contained)

**LiLa Characters:**
1. **LiLa™ Help** - Support & troubleshooting (image: `/Lila-HtH.png`)
2. **LiLa™ Assist** - Feature guidance (image: `/lila-asst.png`)
3. **LiLa™ Optimizer** - Prompt optimization (image: `/lila-opt.png`)

**Features:**
- Desktop: Large static character avatars with speech bubble tooltips
- Mobile: Swipeable carousel with navigation arrows
- Opens character-specific modals (LilaHelp, LilaAssist, LilaOptimizer)
- Image error handling (hides if image not found)

**Usage:**
```javascript
import LiLaPanel from './components/global/LiLaPanel';

<LiLaPanel />
```

**Related Components:**
- `LilaHelp.js` - Support modal
- `LilaAssist.js` - Guide modal
- `LilaOptimizer.js` - Optimizer modal

---

## UI Components

### SmartNotepad

**Location:** `src/components/ui/SmartNotepad.jsx`
**CSS:** `src/components/ui/SmartNotepad.css`

**Purpose:** Rich text notepad with tabs, formatting, and AI integration

**Props:** None (completely self-contained)

**Features:**
- **Multi-tab interface** - Create/delete/rename tabs
- **Rich text editing** - Bold, italic, underline, lists (ordered/unordered)
- **Tab management** - Double-click to rename, X to delete
- **Actions:**
  - Copy text to clipboard
  - Clear page
  - Summarize (creates summary tab)
  - Use as Prompt (placeholder for AI integration)
  - Save As... (download as .txt file)
  - Send to MindSweep (placeholder)

**Design:**
- Clipboard-style visual (wood back, paper front)
- Theme-aware colors (uses CSS variables)
- Custom scrollbars matching app theme
- Label stickers for actions

**State Management:**
```javascript
// Internal state
sections: [{ id, title, content }]
activeSectionId: number
```

**Usage:**
```javascript
import SmartNotepad from './components/ui/SmartNotepad';

<SmartNotepad />
```

**Note:** SmartNotepad is fully self-contained and doesn't require any props or external state management.

---

### Modal

**Location:** `src/components/ui/Modal.tsx`
**Type:** TypeScript

**Purpose:** Reusable modal dialog with portal rendering

**Props:**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge' | 'fullscreen';
  customWidth?: string;
  customHeight?: string;
}
```

**Features:**
- **Portal rendering** - Renders outside main DOM (z-index: 9999)
- **Backdrop blur** - Modern glassmorphism effect
- **Escape key** - Close with ESC
- **Focus management** - Auto-focus on open
- **Accessibility** - ARIA attributes, role="dialog"
- **Theme-compatible scrollbars** - Matches app theme
- **Size presets:**
  - `small`: 400px
  - `medium`: 600px (default)
  - `large`: 800px
  - `xlarge`: 1000px
  - `fullscreen`: 100vw × 100vh

**Usage:**
```javascript
import Modal from './components/ui/Modal';

const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="My Modal"
  size="large"
>
  <div style={{ padding: '24px' }}>
    Modal content here
  </div>
</Modal>
```

**Styling:**
- Uses CSS variables for theming
- Gradient header background
- Custom scrollbars with theme colors
- Responsive padding and sizing

---

### Spinner

**Location:** `src/components/ui/Spinner.tsx`

**Purpose:** Loading indicator

**Props:**
```typescript
interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}
```

**Usage:**
```javascript
import Spinner from './components/ui/Spinner';

<Spinner size="medium" color="var(--primary-color)" />
```

---

## Feature Components

### Best Intentions System

#### BestIntentionsModal

**Location:** `src/components/BestIntentions/BestIntentionsModal.tsx`

**Purpose:** Main modal for Best Intentions feature

**Props:**
```typescript
interface BestIntentionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**View Modes:**
1. **Landing** - Overview with "View & Manage" and "Create New" cards
2. **View** - Display all family intentions with category filter
3. **Create** - Privacy selector + creation method choice

**Features:**
- **Category filtering** - Filter by system/custom categories
- **Privacy levels:**
  - `family` - Everyone can see
  - `parents_only` - Mom, Dad, Guardians
  - `private` - Only you (+ Mom)
- **Creation methods:**
  - Quick Add (simple form)
  - Brain Dump (AI-assisted)
- **CRUD operations:**
  - Create intentions
  - View/filter intentions
  - Update intention status
  - Delete intentions

**Sub-components:**
- `BrainDumpCoach` - AI-guided intention creation
- `QuickAddForm` - Simple form for quick entry
- `CategoryFilter` - Category selection sidebar
- `IntentionCard` - Individual intention display
- `AddCategoryModal` - Create custom categories

**State Management:**
```typescript
viewMode: 'landing' | 'view' | 'create'
selectedPrivacy: 'private' | 'parents_only' | 'family'
intentions: Intention[]
selectedCategoryId: string | null
```

**Usage:**
```javascript
import BestIntentionsModal from './components/BestIntentions/BestIntentionsModal';

const [showBestIntentions, setShowBestIntentions] = useState(false);

<BestIntentionsModal
  isOpen={showBestIntentions}
  onClose={() => setShowBestIntentions(false)}
/>
```

**Database Integration:**
- Uses `lib/intentions.js` for all CRUD operations
- Integrates with `AuthContext` for user/family data
- RLS policies ensure proper access control

---

#### BrainDumpCoach

**Location:** `src/components/BestIntentions/BrainDumpCoach.tsx`

**Purpose:** AI-assisted intention creation through conversation

**Props:**
```typescript
interface BrainDumpCoachProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  selectedPrivacy: PrivacyLevel;
}
```

**Features:**
- Conversational AI interface
- Helps organize scattered thoughts into structured intentions
- Integrates with SmartNotepad for note-taking
- Privacy-aware creation

---

#### QuickAddForm

**Location:** `src/components/BestIntentions/QuickAddForm.tsx`

**Purpose:** Simple form for quick intention entry

**Props:**
```typescript
interface QuickAddFormProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  selectedPrivacy: PrivacyLevel;
  familyId: string;
  onSuccess?: () => void;
}
```

**Features:**
- Category selection (system + custom categories)
- Title, current state, desired state, why it matters
- Priority selection (high/medium/low)
- Direct save to database
- Success callback for refreshing parent view

---

#### CategoryFilter

**Location:** `src/components/BestIntentions/CategoryFilter.tsx`

**Purpose:** Category sidebar with system and custom categories

**Props:**
```typescript
interface CategoryFilterProps {
  familyId: string;
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  onAddCustom?: () => void;
  showCounts?: boolean;
}
```

**Features:**
- System default categories (with icons and descriptions)
- Custom family categories
- Intention counts per category (optional)
- "Add Custom Category" button
- "All Categories" option

---

#### IntentionCard

**Location:** `src/components/BestIntentions/IntentionCard.tsx`

**Purpose:** Display individual intention with actions

**Props:**
```typescript
interface IntentionCardProps {
  intention: Intention;
  onEdit?: (intention: Intention) => void;
  onDelete?: (intentionId: string) => void;
  onStatusChange?: (intentionId: string, status: string) => void;
  currentUserId?: string;
  isCompact?: boolean;
}
```

**Features:**
- Displays all intention fields
- Status indicator
- Edit/Delete actions (if user is creator)
- Status change dropdown
- Compact mode for smaller displays
- Privacy level badge

---

## Dashboard Components

### Role-Based Dashboards

Each role (mom/teen/child) has a dedicated dashboard with customized widgets.

#### MomDashboard

**Location:** `src/components/dashboard/mom/MomDashboard.tsx`

**Widgets:**
1. **FamilyOverviewWidget** - Family member status overview
2. **TaskManagementWidget** - Task creation and assignment
3. **ChildProgressWidget** - Children's progress tracking
4. **ScheduleWidget** - Family schedule and calendar
5. **NotificationsWidget** - Important notifications
6. **QuickActionsWidget** - Frequently used actions
7. **VictoryRecorderWidget** - Record family victories

**Layout:** `DashboardGrid` with `WidgetContainer` wrappers

---

#### TeenDashboard

**Location:** `src/components/dashboard/teen/TeenDashboard.tsx`

**Widgets:**
1. **TaskOverviewWidget** - Assigned tasks overview
2. **TaskProgressWidget** - Progress tracking
3. **AchievementWidget** - Achievements and badges
4. **CalendarWidget** - Personal calendar
5. **RewardsWidget** - Earned rewards
6. **VictoryRecorderWidget** - Record personal victories

**Layout:** `TeenDashboardGrid` with `TeenWidgetContainer` wrappers

---

#### ChildDashboard

**Location:** `src/components/dashboard/child/ChildDashboard.tsx`

**Widgets:**
1. **MyTasksWidget** - Simple task list with images
2. **TaskImageWidget** - Visual task representation
3. **SuccessAnimationWidget** - Celebration animations
4. **RewardStarsWidget** - Star collection system
5. **VictoryRecorderWidget** - Record victories
6. **FamilyPhotosWidget** - Family photo gallery
7. **FunActivitiesWidget** - Fun family activities

**Special Components:**
- `ImageTaskCard` - Picture-based task cards
- `CustomImageUploader` - Upload custom task images
- `SuccessAnimation` - Animated celebration
- `StarReward` - Animated star rewards
- `SimpleTaskButton` - Large, colorful task buttons

**Layout:** `ChildDashboardGrid` with `ChildWidgetContainer` wrappers

---

### Shared Dashboard Components

#### WidgetWrapper

**Location:** `src/components/dashboard/shared/WidgetWrapper.tsx`

**Purpose:** Standardized widget container with drag/drop

**Props:**
```typescript
interface WidgetWrapperProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  draggable?: boolean;
  onRemove?: () => void;
}
```

---

#### WidgetSelector

**Location:** `src/components/dashboard/shared/WidgetSelector.tsx`

**Purpose:** Choose which widgets to display

**Props:**
```typescript
interface WidgetSelectorProps {
  availableWidgets: Widget[];
  activeWidgets: string[];
  onToggleWidget: (widgetId: string) => void;
}
```

---

#### DragDropProvider

**Location:** `src/components/dashboard/shared/DragDropProvider.tsx`

**Purpose:** Drag and drop context for widget rearrangement

---

## Authentication Components

### BetaLogin

**Location:** `src/components/auth/BetaLogin.jsx`

**Purpose:** Beta user login interface

**Features:**
- Email/password authentication
- Supabase Auth integration
- Beta code validation
- Redirect to dashboard on success

---

### AuthHandler

**Location:** `src/components/auth/AuthHandler.jsx`

**Purpose:** Route protection and auth state management

**Features:**
- Protected route wrapper
- Redirect unauthenticated users
- Session persistence
- Auto-refresh tokens

---

### ForcedFamilySetup

**Location:** `src/components/auth/ForcedFamilySetup.jsx`

**Purpose:** Post-signup family onboarding

**Features:**
- Family structure setup (couple/solo)
- Primary parent information
- Partner information (optional)
- Children information (unlimited)
- Age-appropriate role assignment
- Database initialization for new families

**Flow:**
1. Choose family structure (couple/solo)
2. Enter primary parent details
3. Add partner (if couple)
4. Add children
5. Save to database (families + family_members)

**Database Integration:**
- Creates family record with `auth_user_id`
- Creates family_members record for primary parent
- Sets `auth_user_id` for primary parent only
- Partner and children have `auth_user_id: null`

---

### AuthUI

**Location:** `src/components/auth/AuthUI.tsx`

**Purpose:** Unified auth interface (login/signup)

**Features:**
- Tab-based UI (Login/Signup)
- Form validation
- Error handling
- Loading states

---

## Family Management Components

### FamilySettings

**Location:** `src/components/family/FamilySettings/index.tsx`

**Purpose:** Comprehensive family management interface

**Sub-components:**
1. **FamilyMemberList** - List of all family members
2. **FamilyMemberCard** - Individual member display/edit
3. **FamilyMemberForm** - Add/edit family member
4. **PermissionManager** - Manage feature permissions
5. **AccessLevelSelector** - Set access levels
6. **AIVerificationModal** - AI-assisted permission setup
7. **AIBulkAddModal** - AI-assisted bulk member addition

**Features:**
- View all family members
- Add/edit/remove members
- Set household vs context-only status
- Manage permissions per member
- Access level presets (Teen, Child, Limited)
- AI-assisted setup for complex families
- Permission templates

**Permission Categories:**
```typescript
{
  content: ['library', 'tutorials', 'discussions'],
  tasks: ['create', 'assign', 'approve'],
  family: ['viewMembers', 'editMembers', 'manageSettings'],
  ai: ['basicAssist', 'advancedOptimization', 'contextAccess']
}
```

---

### FamilyMemberForm

**Location:** `src/components/family/FamilyMemberForm.tsx`

**Purpose:** Add or edit family member

**Props:**
```typescript
interface FamilyMemberFormProps {
  familyId: string;
  member?: FamilyMember; // If editing
  onSave: (member: FamilyMember) => void;
  onCancel: () => void;
}
```

**Fields:**
- Name
- Role (primary_parent, parent, teen, child)
- Age
- Household status (household/context-only)
- PIN (for dashboard access)

---

## Task Management Components

### TaskCreationModal

**Location:** `src/components/tasks/TaskCreationModal.tsx`

**Purpose:** Create new tasks with full options

**Props:**
```typescript
interface TaskCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: TaskData) => void;
  familyMembers: FamilyMember[];
}
```

**Features:**
- Task title and description
- Assignee selection (family members)
- Due date picker
- Priority selection
- Subtask creation
- Custom images/icons
- Save to database

---

### TaskCard

**Location:** `src/components/tasks/TaskCard.tsx`

**Purpose:** Display individual task

**Props:**
```typescript
interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: string) => void;
  isCompact?: boolean;
}
```

**Features:**
- Task details display
- Status indicator
- Edit/Delete actions
- Subtask progress
- Due date display
- Assignee avatar

---

### SubtaskItem

**Location:** `src/components/tasks/SubtaskItem.tsx`

**Purpose:** Individual subtask with checkbox

**Props:**
```typescript
interface SubtaskItemProps {
  subtask: Subtask;
  onToggle: (subtaskId: string) => void;
}
```

---

## Library Components

### Library

**Location:** `src/components/Library/Library.jsx`

**Purpose:** Main tutorial library (Vault-style)

**Features:**
- Category-based browsing
- Tutorial cards with engagement stats
- Like/favorite buttons
- Search and filtering
- Vault-style social features
- Discussion threads

**Sub-components:**
- `TutorialCard` - Individual tutorial display
- `CategoryRow` - Category selector
- `TutorialPreviewModal` - Preview before opening
- `UpgradeModal` - Beta tier upgrade prompt

---

### Vault Content (VC) Components

**Social engagement components for Library:**

1. **VCLikeButton** - Like button with count
2. **VCFavoriteButton** - Favorite/bookmark button
3. **VCEngagement** - Full engagement interface
4. **VCEngagementStats** - View counts, likes, comments
5. **VCUserAvatar** - User avatar display
6. **VCCommentForm** - Post comments
7. **VCCommentThread** - Display comment threads
8. **VCCommentActions** - Comment actions (edit, delete, report)
9. **VCDiscussion** - Discussion board
10. **VCReportModal** - Report inappropriate content
11. **VCAutoModerator** - Auto-moderation system
12. **VCModerationPanel** - Admin moderation tools

---

## Context Providers

### AuthContext

**Location:** `src/components/auth/shared/AuthContext.tsx`

**Purpose:** Global authentication state

**Provides:**
```typescript
{
  state: AuthState;
  dispatch: Dispatch<AuthAction>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updatePermissions: (permissions: Record<string, boolean>) => Promise<void>;
  loadUserPermissions: () => Promise<void>;
  saveThemePreference: (theme: string, type?: string) => Promise<void>;
  loadThemePreference: () => Promise<{ theme: string; type: string } | null>;
  hasPermission: (permission: string) => boolean;
  isPrimaryParent: () => boolean;
  isParent: () => boolean;
  isTeen: () => boolean;
  isChild: () => boolean;
}
```

**User Interface:**
```typescript
interface User {
  id: string | number;
  email: string;
  role: 'primary_parent' | 'parent' | 'teen' | 'child';
  familyId: string;
  familyMemberId: string | null;
  permissions: Record<string, boolean>;
  preferences: Record<string, any>;
  auth_user_id?: string;
  name?: string;
}
```

**Usage:**
```javascript
import { useAuthContext } from './components/auth/shared/AuthContext';

const { state, login, logout, hasPermission } = useAuthContext();

if (hasPermission('tasks.create')) {
  // User can create tasks
}
```

---

### FamilyContext

**Location:** `src/components/family/shared/FamilyContext.tsx`

**Purpose:** Family data and member management

**Provides:**
```typescript
{
  family: Family | null;
  members: FamilyMember[];
  loading: boolean;
  error: string | null;
  loadFamily: () => Promise<void>;
  updateFamily: (updates: Partial<Family>) => Promise<void>;
  addMember: (member: FamilyMember) => Promise<void>;
  updateMember: (memberId: string, updates: Partial<FamilyMember>) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
}
```

---

### TaskContext

**Location:** `src/components/tasks/shared/TaskProvider.tsx`

**Purpose:** Task data and operations

**Provides:**
```typescript
{
  tasks: Task[];
  loading: boolean;
  error: string | null;
  loadTasks: () => Promise<void>;
  createTask: (task: Task) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  updateSubtask: (taskId: string, subtaskId: string, completed: boolean) => Promise<void>;
}
```

---

### DashboardContext

**Location:** `src/components/dashboard/shared/DashboardProvider.tsx`

**Purpose:** Dashboard configuration and widget state

**Provides:**
```typescript
{
  activeWidgets: string[];
  widgetOrder: string[];
  toggleWidget: (widgetId: string) => void;
  reorderWidgets: (newOrder: string[]) => void;
  resetWidgets: () => void;
}
```

---

## Usage Examples

### Example 1: Create Task Flow

```javascript
import QuickActions from './components/global/QuickActions';
import TaskCreationModal from './components/tasks/TaskCreationModal';
import { useAuthContext } from './components/auth/shared/AuthContext';

const MyComponent = () => {
  const { state } = useAuthContext();

  // QuickActions automatically handles the modal
  return <QuickActions />;

  // Or handle manually:
  const [showTaskCreator, setShowTaskCreator] = useState(false);

  const handleSaveTask = async (taskData) => {
    // Save to database
    await saveTask(taskData);
    setShowTaskCreator(false);
  };

  return (
    <>
      <button onClick={() => setShowTaskCreator(true)}>
        Create Task
      </button>

      <TaskCreationModal
        isOpen={showTaskCreator}
        onClose={() => setShowTaskCreator(false)}
        onSave={handleSaveTask}
        familyMembers={state.familyMembers || []}
      />
    </>
  );
};
```

---

### Example 2: Best Intentions Workflow

```javascript
import BestIntentionsModal from './components/BestIntentions/BestIntentionsModal';

const Dashboard = () => {
  const [showBestIntentions, setShowBestIntentions] = useState(false);

  return (
    <>
      <button onClick={() => setShowBestIntentions(true)}>
        Best Intentions
      </button>

      <BestIntentionsModal
        isOpen={showBestIntentions}
        onClose={() => setShowBestIntentions(false)}
      />
    </>
  );
};

// User flow:
// 1. Click "Best Intentions" button
// 2. Modal opens on "landing" view
// 3. User clicks "Create New"
// 4. Selects privacy level
// 5. Chooses "Quick Add" or "Brain Dump"
// 6. Fills form / has conversation
// 7. Intention saved to database
// 8. Modal switches to "view" mode showing all intentions
```

---

### Example 3: Protected Component with Permissions

```javascript
import { useAuthContext } from './components/auth/shared/AuthContext';

const AdminPanel = () => {
  const { hasPermission, isPrimaryParent } = useAuthContext();

  if (!isPrimaryParent()) {
    return <div>Access denied</div>;
  }

  return (
    <div>
      <h1>Admin Panel</h1>

      {hasPermission('family.editMembers') && (
        <button>Edit Family Members</button>
      )}

      {hasPermission('tasks.assign') && (
        <button>Assign Tasks</button>
      )}
    </div>
  );
};
```

---

### Example 4: Custom Dashboard Widget

```javascript
import WidgetWrapper from './components/dashboard/shared/WidgetWrapper';

const MyCustomWidget = () => {
  return (
    <WidgetWrapper
      title="My Widget"
      icon={<Star size={20} />}
      draggable={true}
      onRemove={() => console.log('Remove widget')}
    >
      <div style={{ padding: '16px' }}>
        <p>Widget content here</p>
      </div>
    </WidgetWrapper>
  );
};

// Use in dashboard:
const MyDashboard = () => {
  return (
    <DashboardGrid>
      <MyCustomWidget />
      <AnotherWidget />
    </DashboardGrid>
  );
};
```

---

### Example 5: Using SmartNotepad

```javascript
import SmartNotepad from './components/ui/SmartNotepad';

const MyPage = () => {
  // SmartNotepad is completely self-contained
  // No props needed, no state management required

  return (
    <div className="page-layout">
      <div className="main-content">
        {/* Your main content */}
      </div>

      <div className="sidebar">
        <SmartNotepad />
      </div>
    </div>
  );
};

// Features available:
// - Create multiple tabs
// - Rich text formatting
// - Copy to clipboard
// - Download as .txt
// - Summarize content
// - Use as AI prompt (placeholder)
```

---

### Example 6: Theme-Aware Modal

```javascript
import Modal from './components/ui/Modal';

const MyFeature = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Open Modal
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Feature Name"
        size="large"
      >
        <div style={{
          padding: '24px',
          // Use CSS variables for theme compatibility
          background: 'var(--background-color)',
          color: 'var(--text-color)'
        }}>
          <h3 style={{ color: 'var(--primary-color)' }}>
            Section Title
          </h3>
          <p>Content here automatically uses theme colors</p>

          <button style={{
            background: 'var(--gradient-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            cursor: 'pointer'
          }}>
            Themed Button
          </button>
        </div>
      </Modal>
    </>
  );
};
```

---

## Component Best Practices

### 1. Always Use CSS Variables for Theming

```javascript
// ✅ Good - Theme-aware
<div style={{
  background: 'var(--background-color)',
  color: 'var(--text-color)',
  border: '1px solid var(--accent-color)'
}} />

// ❌ Bad - Hard-coded colors
<div style={{
  background: '#fff4ec',
  color: '#5a4033',
  border: '1px solid #d4e3d9'
}} />
```

### 2. Use Portal Rendering for Modals

```javascript
import ReactDOM from 'react-dom';

const Modal = ({ children }) => {
  return ReactDOM.createPortal(
    <div className="modal-overlay">
      {children}
    </div>,
    document.getElementById('modal-root') || document.body
  );
};
```

### 3. Provide Accessibility Attributes

```javascript
<Modal
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">Modal Title</h2>
</Modal>
```

### 4. Use Context for Shared State

```javascript
// Don't prop-drill through many levels
// ❌ Bad
<Parent user={user}>
  <Child user={user}>
    <Grandchild user={user}>
      <GreatGrandchild user={user} />
    </Grandchild>
  </Child>
</Parent>

// ✅ Good - Use AuthContext
import { useAuthContext } from './components/auth/shared/AuthContext';

const GreatGrandchild = () => {
  const { state } = useAuthContext();
  return <div>User: {state.user.name}</div>;
};
```

### 5. Handle Loading and Error States

```javascript
const MyComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return <EmptyState />;

  return <DataDisplay data={data} />;
};
```

---

## Component Checklist

When creating a new component:

- [ ] Use PascalCase naming
- [ ] Create matching CSS file (if needed)
- [ ] Use TypeScript for complex components
- [ ] Define clear prop interfaces
- [ ] Use CSS variables for all colors
- [ ] Handle loading/error states
- [ ] Add accessibility attributes
- [ ] Provide keyboard navigation
- [ ] Support theme changes
- [ ] Test on mobile/tablet/desktop
- [ ] Document props and usage
- [ ] Add to this README

---

## Quick Reference

### Import Paths

```javascript
// Global components
import GlobalHeader from './components/global/GlobalHeader';
import QuickActions from './components/global/QuickActions';
import LiLaPanel from './components/global/LiLaPanel';

// UI components
import Modal from './components/ui/Modal';
import SmartNotepad from './components/ui/SmartNotepad';
import Spinner from './components/ui/Spinner';

// Feature components
import BestIntentionsModal from './components/BestIntentions/BestIntentionsModal';
import TaskCreationModal from './components/tasks/TaskCreationModal';

// Context
import { useAuthContext } from './components/auth/shared/AuthContext';
import { useFamilyContext } from './components/family/shared/FamilyContext';
import { useTaskContext } from './components/tasks/shared/TaskProvider';
```

### Common Props Patterns

```typescript
// Modal props
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
  title?: string;
}

// Form props
interface FormProps {
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

// Card props
interface CardProps {
  data: any;
  onEdit?: (data: any) => void;
  onDelete?: (id: string) => void;
  isCompact?: boolean;
}
```

---

**Created:** Claude Code
**For:** MyAIM-Central Component Library
**Version:** 2.0 (Post Auth Migration)
