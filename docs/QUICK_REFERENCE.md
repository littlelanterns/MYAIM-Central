# Quick Reference Guide

Common patterns, code snippets, and recipes for the AIM project.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Database Operations](#database-operations)
3. [Modal System](#modal-system)
4. [Feedback/Toast Messages](#feedbacktoast-messages)
5. [Archives Operations](#archives-operations)
6. [Best Intentions Operations](#best-intentions-operations)
7. [Routing](#routing)
8. [Styling Patterns](#styling-patterns)
9. [Error Handling](#error-handling)
10. [Common Gotchas](#common-gotchas)

---

## Authentication

### Check if User is Authenticated

```typescript
import { useAuthContext } from '../components/auth/shared/AuthContext';

function MyComponent() {
  const { state: authState } = useAuthContext();

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Component logic...
}
```

### Check Subscription Tier

```typescript
const { state: authState } = useAuthContext();

if (authState.user?.subscriptionTier === 'FREE') {
  return <UpgradePrompt />;
}
```

### Get Current User Info

```typescript
const { state: authState } = useAuthContext();

const familyId = authState.user?.familyId;
const familyMemberId = authState.user?.familyMemberId;
const userName = authState.user?.name;
const userRole = authState.user?.role; // 'admin' | 'parent' | 'teen' | 'child'
```

### Login/Logout

```typescript
const { login, logout } = useAuthContext();

// Login
await login({ email, password });

// Logout
logout();
```

---

## Database Operations

### Basic Query Pattern

```typescript
import { supabase } from '../supabaseClient';

// SELECT
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('family_id', familyId);

if (error) {
  console.error('Error:', error);
  return;
}

// Use data...
```

### Insert Record

```typescript
const { data, error } = await supabase
  .from('table_name')
  .insert([{
    family_id: familyId,
    created_by: familyMemberId,
    title: 'Example',
    // ... other fields
  }])
  .select(); // Returns inserted record

if (error) throw error;
```

### Update Record

```typescript
const { data, error } = await supabase
  .from('table_name')
  .update({ status: 'completed' })
  .eq('id', recordId)
  .select();
```

### Delete Record

```typescript
const { error } = await supabase
  .from('table_name')
  .delete()
  .eq('id', recordId);
```

### Query with Filters

```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('family_id', familyId)
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .limit(10);
```

### Join Tables

```typescript
const { data, error } = await supabase
  .from('best_intentions')
  .select(`
    *,
    intention_categories(name, color)
  `)
  .eq('family_id', familyId);
```

---

## Modal System

### Open a Modal

```typescript
import { useModal } from '../hooks/useModal';

function MyComponent() {
  const { open, close } = useModal();

  const handleOpenModal = () => {
    open(
      'Modal Title',
      <ModalContent onClose={close} />,
      'medium' // 'small' | 'medium' | 'large'
    );
  };

  return <button onClick={handleOpenModal}>Open Modal</button>;
}
```

### Modal Content Component

```jsx
function ModalContent({ onClose }) {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Content Here</h2>
      <button onClick={onClose}>Close</button>
    </div>
  );
}
```

### Full Modal Example

```jsx
import { useState } from 'react';
import { useModal } from '../hooks/useModal';

function ParentComponent() {
  const { open } = useModal();
  const [someState, setSomeState] = useState(null);

  const openMyModal = () => {
    open(
      'My Custom Modal',
      <MyModalContent
        onSave={(data) => {
          setSomeState(data);
          // Modal auto-closes on successful action
        }}
      />,
      'medium'
    );
  };

  return <button onClick={openMyModal}>Open</button>;
}
```

---

## Feedback/Toast Messages

### Show Success Message

```typescript
import { useFeedback } from '../contexts/FeedbackContext';

function MyComponent() {
  const { showSuccess, showError } = useFeedback();

  const handleSave = async () => {
    try {
      // Save logic...
      showSuccess('Saved successfully!');
    } catch (error) {
      showError('Failed to save: ' + error.message);
    }
  };
}
```

### Message Types

```typescript
showSuccess('Operation completed!');
showError('Something went wrong');
showInfo('FYI: Something happened');
showWarning('Be careful!');
```

---

## Archives Operations

### Get Master Folders

```typescript
import { getMasterFolders } from '../lib/archivesService';

const masters = await getMasterFolders();
```

### Create Custom Folder

```typescript
import { createFolder } from '../lib/archivesService';

const newFolder = await createFolder({
  family_id: familyId,
  name: 'My Custom Folder',
  description: 'Folder description',
  cover_photo_url: photoUrl, // optional
  is_master_folder: false
});
```

### Get Subfolders

```typescript
import { getSubfolders } from '../lib/archivesService';

const subfolders = await getSubfolders(parentFolderId);
```

### Create Context Item

```typescript
import { createContextItem } from '../lib/archivesService';

const item = await createContextItem({
  folder_id: folderId,
  subfolder_id: subfolderId, // optional
  title: 'Context Title',
  content: 'Context details...',
  category: 'personal_info', // or other category
  created_by: familyMemberId
});
```

---

## Best Intentions Operations

### Get Family Intentions

```typescript
import { getFamilyIntentions } from '../lib/intentions';

const intentions = await getFamilyIntentions(familyId);
```

### Get Intentions by Category

```typescript
import { getIntentionsByCategory } from '../lib/intentions';

const intentions = await getIntentionsByCategory(familyId, categoryId);
```

### Create Intention

```typescript
import { createIntention } from '../lib/intentions';

const intention = await createIntention({
  family_id: familyId,
  created_by: familyMemberId,
  title: 'Improve Family Communication',
  current_state: 'We dont talk much at dinner',
  desired_state: 'Family dinners with meaningful conversations',
  why_it_matters: 'Building stronger family bonds',
  category_id: categoryId, // optional
  priority: 'high', // 'high' | 'medium' | 'low'
  privacy_level: 'family' // 'private' | 'parents_only' | 'family'
});
```

### Update Intention Status

```typescript
import { updateIntentionStatus } from '../lib/intentions';

await updateIntentionStatus(intentionId, 'completed'); // 'active' | 'completed' | 'archived'
```

### Delete Intention

```typescript
import { deleteIntention } from '../lib/intentions';

await deleteIntention(intentionId);
```

---

## Routing

### Navigate Programmatically

```typescript
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();

  const goToArchives = () => {
    navigate('/family-archive');
  };

  const goBack = () => {
    navigate(-1);
  };
}
```

### Link Component

```jsx
import { Link } from 'react-router-dom';

<Link to="/library" style={linkStyles}>
  Go to Library
</Link>
```

### Protected Route Pattern

```jsx
function ProtectedRoute({ children, requiredTier }) {
  const { state: authState } = useAuthContext();

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredTier && authState.user?.subscriptionTier !== requiredTier) {
    return <UpgradePrompt requiredTier={requiredTier} />;
  }

  return children;
}
```

---

## Styling Patterns

### Using CSS Variables

```jsx
const styles = {
  container: {
    background: 'var(--background-color)',
    color: 'var(--text-color)',
    padding: '20px',
  },
  primaryButton: {
    background: 'var(--primary-color)',
    color: 'white',
  },
  gradient: {
    background: 'var(--gradient-primary)',
  }
};
```

### TypeScript Styles

```typescript
import { CSSProperties } from 'react';

const styles: Record<string, CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  }
};
```

### Responsive Design

```jsx
const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
  }
};
```

### Hover Effects

```jsx
<button
  style={styles.button}
  onMouseEnter={(e) => {
    e.currentTarget.style.opacity = '0.8';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.opacity = '1';
  }}
>
  Hover Me
</button>
```

### Conditional Styling

```jsx
<div
  style={{
    ...styles.card,
    ...(isActive ? styles.activeCard : {}),
  }}
>
  Content
</div>
```

---

## Error Handling

### Try-Catch with Feedback

```typescript
import { useFeedback } from '../contexts/FeedbackContext';

function MyComponent() {
  const { showError } = useFeedback();

  const handleOperation = async () => {
    try {
      const result = await someOperation();
      // Handle success...
    } catch (error) {
      console.error('Operation failed:', error);
      showError(error instanceof Error ? error.message : 'Unknown error');
    }
  };
}
```

### Loading States

```typescript
function MyComponent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchData();
        setData(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>Data loaded!</div>;
}
```

### Error Boundaries (Future Enhancement)

```jsx
// To be implemented
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

---

## Common Gotchas

### 1. Supabase RLS Policies

**Problem**: Query returns empty even though data exists

**Solution**: Check RLS policies allow access for current user's family_id

```sql
-- Example policy
CREATE POLICY "Users can view their family's data"
ON table_name FOR SELECT
USING (family_id IN (
  SELECT family_id FROM family_members
  WHERE auth_user_id = auth.uid()
));
```

### 2. TypeScript Error on Unknown Type

**Problem**: TypeScript complains about `error.message` on `unknown` type

**Solution**:
```typescript
catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  console.error(errorMessage);
}
```

### 3. Modal Not Closing

**Problem**: Modal stays open after action

**Solution**: Always call `onClose()` or `close()` after successful operations:

```typescript
const handleSave = async () => {
  try {
    await saveData();
    onClose(); // ← Don't forget this!
  } catch (error) {
    // Handle error
  }
};
```

### 4. Context Provider Not Found

**Problem**: `useContext` returns `null` or `undefined`

**Solution**: Make sure component is wrapped in provider:

```jsx
// App.jsx
<AuthProvider>
  <ModalProvider>
    <FeedbackProvider>
      <MyComponent />  {/* ← Now can use all contexts */}
    </FeedbackProvider>
  </ModalProvider>
</AuthProvider>
```

### 5. State Not Updating

**Problem**: State variable doesn't update immediately after `setState`

**Solution**: State updates are batched. Use `useEffect` to react to state changes:

```typescript
const [data, setData] = useState(null);

const handleUpdate = () => {
  setData(newData);
  // DON'T: console.log(data); // ← Still old value!
};

useEffect(() => {
  console.log('Data updated:', data); // ← This works!
}, [data]);
```

### 6. Infinite Re-render Loop

**Problem**: Component keeps re-rendering

**Common Cause**: Object/array created in render without memoization

**Solution**:
```typescript
// ❌ BAD: Creates new array every render
return <MyComponent data={['item1', 'item2']} />;

// ✅ GOOD: Use useMemo or move outside component
const staticData = ['item1', 'item2'];
return <MyComponent data={staticData} />;

// Or:
const data = useMemo(() => ['item1', 'item2'], []);
return <MyComponent data={data} />;
```

### 7. Cannot Read Property of Undefined

**Problem**: `Cannot read property 'foo' of undefined`

**Solution**: Use optional chaining:

```typescript
// ❌ BAD
const name = user.profile.name;

// ✅ GOOD
const name = user?.profile?.name;

// ✅ WITH DEFAULT
const name = user?.profile?.name || 'Unknown';
```

### 8. Async/Await in useEffect

**Problem**: Can't make useEffect callback async

**Solution**: Create async function inside:

```typescript
useEffect(() => {
  // ❌ BAD: async () => {}

  // ✅ GOOD
  async function fetchData() {
    const result = await getData();
    setData(result);
  }

  fetchData();
}, []);
```

### 9. Form Input Not Controlled

**Problem**: React warning about uncontrolled inputs

**Solution**: Always provide value and onChange:

```jsx
// ❌ BAD
<input type="text" />

// ✅ GOOD
const [value, setValue] = useState('');
<input
  type="text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### 10. ESLint Warnings About Dependencies

**Problem**: ESLint warns about missing dependencies in useEffect

**Solution**: Add dependencies or use ESLint disable comment if truly not needed:

```typescript
// Option 1: Add dependency
useEffect(() => {
  doSomething(data);
}, [data]); // ← Add data

// Option 2: If truly don't need it
useEffect(() => {
  doSomething();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

---

## Performance Tips

### 1. Memoize Expensive Calculations

```typescript
import { useMemo } from 'react';

const sortedData = useMemo(() => {
  return data.sort((a, b) => a.value - b.value);
}, [data]);
```

### 2. Memoize Callbacks

```typescript
import { useCallback } from 'react';

const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

### 3. Lazy Load Components

```typescript
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

---

## Testing Patterns

### Mock Supabase in Tests

```typescript
jest.mock('../supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  }
}));
```

### Test Component with Context

```jsx
import { render } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';

function renderWithAuth(component) {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
}

test('my test', () => {
  renderWithAuth(<MyComponent />);
  // assertions...
});
```

---

## Code Snippets

### Full Component Template (TypeScript)

```typescript
import React, { FC, useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useFeedback } from '../contexts/FeedbackContext';

interface MyComponentProps {
  title: string;
  onSave?: (data: any) => void;
}

const MyComponent: FC<MyComponentProps> = ({ title, onSave }) => {
  const { state: authState } = useAuthContext();
  const { showSuccess, showError } = useFeedback();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch data...
      setData(fetchedData);
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Save logic...
      showSuccess('Saved successfully!');
      onSave?.(data);
    } catch (error) {
      showError('Failed to save');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={styles.container}>
      <h2>{title}</h2>
      {/* Component content */}
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
  }
};

export default MyComponent;
```

### Service Function Template

```typescript
// lib/myService.ts
import { supabase } from '../supabaseClient';

export async function getItems(familyId: string) {
  const { data, error } = await supabase
    .from('table_name')
    .select('*')
    .eq('family_id', familyId);

  if (error) throw error;
  return data;
}

export async function createItem(itemData: any) {
  const { data, error } = await supabase
    .from('table_name')
    .insert([itemData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateItem(id: string, updates: any) {
  const { data, error } = await supabase
    .from('table_name')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteItem(id: string) {
  const { error } = await supabase
    .from('table_name')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
```

---

## Debugging Tips

### 1. Check Supabase Logs
Go to Supabase Dashboard → Logs → View recent queries and errors

### 2. React DevTools
Install React DevTools browser extension to inspect:
- Component tree
- Props & state
- Context values

### 3. Console Logging Best Practices

```typescript
// ✅ GOOD: Descriptive logs
console.log('[Archives] Loading master folders...');
console.log('[Archives] Loaded:', data.length, 'folders');
console.error('[Archives] ERROR:', error);

// ❌ BAD: Vague logs
console.log(data);
```

### 4. Network Tab
Check browser Network tab to see:
- Supabase API calls
- Request/response bodies
- Status codes

---

## Environment Setup

### Required Environment Variables

Create `.env.development`:
```bash
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
REACT_APP_OPENROUTER_API_KEY=your_openrouter_key
```

### Access in Code

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
```

---

**Last Updated**: 2025-10-20
**Maintained By**: Development Team
