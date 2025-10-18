# WordPress User ID → Auth User ID Migration Plan

**Date:** 2025-10-17
**Status:** ⏸️ AWAITING APPROVAL

---

## 📋 Overview

Your database schema has been updated to use proper UUID linking instead of converted integers:

**OLD SCHEMA:**
- `families.wordpress_user_id` (bigint) - stored converted UUID as integer
- `family_members.wordpress_user_id` (bigint) - stored converted UUID as integer

**NEW SCHEMA:**
- `families.auth_user_id` (UUID) - references auth.users(id)
- `families.family_login_name` (TEXT, UNIQUE) - unique username for family logins
- `family_members.auth_user_id` (UUID, nullable) - references auth.users(id)
- `family_members.pin` (TEXT) - personal PIN for dashboard access

---

## 🔍 Files Requiring Changes

Found **6 files** with problematic code:

1. ✅ `src/components/auth/ForcedFamilySetup.jsx` - Family onboarding
2. ✅ `src/components/beta/BetaUpgradeModal.jsx` - Tier upgrades
3. ✅ `src/lib/api.js` - Family API functions
4. ✅ `src/pages/FamilySettings.tsx` - Family settings page
5. ✅ `src/components/auth/shared/AuthContext.tsx` - Auth context (interface only)
6. ✅ `src/layouts/MainLayout.tsx` - Commented out code
7. ✅ `supabase/migrations/004_intention_categories_rls_policies.sql` - RLS policies

---

## 📝 DETAILED CHANGES REQUIRED

### 1. `src/components/auth/ForcedFamilySetup.jsx`

**Lines 90-91, 110, 145-146, 151, 164** - UUID to integer conversion

#### ❌ CURRENT CODE (WRONG):
```javascript
// Line 90-91
// Generate a simple numeric ID from UUID for wordpress_user_id compatibility
const numericId = parseInt(user.id.replace(/-/g, '').substring(0, 8), 16);

// Line 95-97
.insert({
  family_name: familyData.familyName,
  wordpress_user_id: numericId,  // ❌ WRONG - using converted integer
})

// Line 108-110
.insert({
  family_id: familyId,
  wordpress_user_id: numericId,  // ❌ WRONG - using converted integer
  name: familyData.primaryParentName,
  role: familyData.primaryParentRole,
  age: 30,
})
```

#### ✅ PROPOSED FIX:
```javascript
// Remove the numericId conversion entirely - lines 90-91 DELETE

// Line 95-97 - families table insert
.insert({
  family_name: familyData.familyName,
  auth_user_id: user.id,  // ✅ CORRECT - use UUID directly
  family_login_name: user.email  // ✅ NEW - use email as login name
})

// Line 108-113 - family_members table insert (PRIMARY PARENT)
.insert({
  family_id: familyId,
  auth_user_id: user.id,  // ✅ CORRECT - link to auth user
  name: familyData.primaryParentName,
  role: familyData.primaryParentRole,
  age: 30,
  pin: null  // ✅ NEW - PIN optional for auth users
})

// Lines 120-125 - Partner (NO auth_user_id - they don't have auth account)
.insert({
  family_id: familyId,
  // NO auth_user_id - partner doesn't have own auth account
  name: familyData.partnerName,
  role: familyData.partnerRole === 'mom' || familyData.partnerRole === 'dad'
    ? familyData.partnerRole
    : 'guardian',
  age: 30,
  pin: null  // ✅ NEW - will be set later if they want dashboard access
})

// Lines 129-140 - Children (NO auth_user_id)
const childrenData = familyData.children.map(child => ({
  family_id: familyId,
  // NO auth_user_id - children don't have auth accounts
  name: child.name,
  role: parseInt(child.age) < 13 ? 'child' : parseInt(child.age) < 18 ? 'teen' : 'guardian',
  age: parseInt(child.age),
  interests: child.interests ? [child.interests] : [],
  pin: null  // ✅ NEW - will be set if child gets dashboard access
}));

// SOLO SETUP - Lines 149-152
.insert({
  family_name: familyData.primaryParentName + "'s Family",
  auth_user_id: user.id,  // ✅ CORRECT
  family_login_name: user.email  // ✅ NEW
})

// SOLO SETUP - Lines 162-167
.insert({
  family_id: familyId,
  auth_user_id: user.id,  // ✅ CORRECT
  name: familyData.primaryParentName,
  role: familyData.primaryParentRole,
  age: 30,
  pin: null  // ✅ NEW
})
```

**EXPLANATION:**
- Only the PRIMARY PARENT (who created the account) gets `auth_user_id` set
- Partner and children DO NOT get `auth_user_id` because they don't have Supabase Auth accounts
- `family_login_name` should be the user's email for now (can be customized later)
- `pin` field added for future PIN-based family member logins

---

### 2. `src/components/beta/BetaUpgradeModal.jsx`

**Lines 53-54, 62** - UUID to integer conversion for tier upgrades

#### ❌ CURRENT CODE (WRONG):
```javascript
// Lines 53-54
// Generate a simple numeric ID from UUID for wordpress_user_id compatibility
const numericId = parseInt(user.id.replace(/-/g, '').substring(0, 8), 16);

// Lines 56-62
const { error: updateError } = await supabase
  .from('families')
  .update({
    subscription_tier: targetTier,
    updated_at: new Date().toISOString()
  })
  .eq('wordpress_user_id', numericId);  // ❌ WRONG
```

#### ✅ PROPOSED FIX:
```javascript
// Delete lines 53-54 (numericId conversion)

// Lines 56-62 - Update families table
const { error: updateError } = await supabase
  .from('families')
  .update({
    subscription_tier: targetTier,
    updated_at: new Date().toISOString()
  })
  .eq('auth_user_id', user.id);  // ✅ CORRECT - use UUID directly
```

**EXPLANATION:**
- Tier upgrades should query by `auth_user_id` UUID
- No more integer conversion needed

---

### 3. `src/lib/api.js`

**Lines 20, 48, 151** - Multiple functions using wordpress_user_id

#### ❌ CURRENT CODE (WRONG):
```javascript
// Line 20 - getFamilyByUserId (checking if family exists)
.eq('wordpress_user_id', familyData.wordpress_user_id)  // ❌ WRONG

// Line 48 - saveFamilySetup (creating new family)
.insert([{
  wordpress_user_id: familyData.wordpress_user_id,  // ❌ WRONG
  family_name: familyData.family_name,
  subscription_tier: familyData.subscription_tier || 'basic'
}])

// Line 151 - getFamilyByUserId (fetching family)
.eq('wordpress_user_id', userId)  // ❌ WRONG
```

#### ✅ PROPOSED FIX:
```javascript
// Line 20 - Check if family exists by auth_user_id
.eq('auth_user_id', familyData.auth_user_id)  // ✅ CORRECT

// Line 48 - Create new family with auth_user_id
.insert([{
  auth_user_id: familyData.auth_user_id,  // ✅ CORRECT
  family_login_name: familyData.family_login_name || familyData.email,  // ✅ NEW
  family_name: familyData.family_name,
  subscription_tier: familyData.subscription_tier || 'basic'
}])

// Line 151 - Fetch family by auth_user_id
.eq('auth_user_id', userId)  // ✅ CORRECT
```

**EXPLANATION:**
- All family lookups should use `auth_user_id` (UUID) instead of `wordpress_user_id` (integer)
- When creating families, include `family_login_name`

---

### 4. `src/pages/FamilySettings.tsx`

**Lines 260** - Saving family setup

#### ❌ CURRENT CODE (WRONG):
```typescript
// Line 259-263
const familyData = {
  wordpress_user_id: currentUserId,  // ❌ WRONG - currentUserId is integer (1)
  family_name: familyName,
  subscription_tier: 'basic'
};
```

#### ✅ PROPOSED FIX:
```typescript
// First, update line 46 to get real auth user ID
// Line 46 - Change from mock to real
const [currentUserId, setCurrentUserId] = useState<string | null>(null);

// Add useEffect to get actual auth user
useEffect(() => {
  const getAuthUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };
  getAuthUser();
}, []);

// Line 259-265 - Save family setup with correct fields
const familyData = {
  auth_user_id: currentUserId,  // ✅ CORRECT - UUID from auth.users
  family_login_name: user?.email || familyName.toLowerCase().replace(/\s+/g, ''),  // ✅ NEW
  family_name: familyName,
  subscription_tier: 'basic'
};
```

**EXPLANATION:**
- `currentUserId` must be the actual Supabase Auth UUID, not a mock integer
- Need to fetch the real user ID from auth context
- `family_login_name` should be derived from email or family name

---

### 5. `src/components/auth/shared/AuthContext.tsx`

**Line 19** - Interface definition only

#### ❌ CURRENT CODE:
```typescript
wordpress_user_id?: string;  // Just interface, not used in logic
```

#### ✅ PROPOSED FIX:
```typescript
auth_user_id?: string;  // ✅ Renamed to match new schema
```

**EXPLANATION:**
- This is just a TypeScript interface definition
- Rename for clarity and consistency

---

### 6. `src/layouts/MainLayout.tsx`

**Lines 21-25** - Commented out code

#### ❌ CURRENT CODE:
```typescript
// Lines 21-24 (COMMENTED OUT - but shows old pattern)
//     .from('family_members')
//     .select('theme_preference')
//     .eq('wordpress_user_id', currentUserId)  // ❌ Would be wrong if uncommented
//     .single();
```

#### ✅ PROPOSED FIX:
```typescript
// If this code is ever uncommented, it should be:
//     .from('family_members')
//     .select('theme_preference')
//     .eq('auth_user_id', auth.uid())  // ✅ CORRECT
//     .single();
```

**EXPLANATION:**
- Code is already commented out, so no immediate fix needed
- Document the correct approach for future reference

---

### 7. `supabase/migrations/004_intention_categories_rls_policies.sql`

**Lines 30, 61-62, 93-94, 101-102, 132-133, 164, 175** - RLS policies

#### ❌ CURRENT CODE (WRONG):
```sql
-- All RLS policies currently use:
WHERE fm.wordpress_user_id::text = auth.uid()::text
```

#### ✅ PROPOSED FIX:
```sql
-- Update ALL RLS policies to use:
WHERE fm.auth_user_id = auth.uid()

-- For example, Policy 2 (line 22-33):
CREATE POLICY "Family members can read own family categories"
ON intention_categories FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM family_members fm
        WHERE fm.auth_user_id = auth.uid()  -- ✅ CORRECT
        AND fm.family_id = intention_categories.family_id
    )
);
```

**APPLY THIS CHANGE TO:**
- Policy 2 (line 30)
- Policy 4 (lines 61-62)
- Policy 6 USING (lines 93-94)
- Policy 6 WITH CHECK (lines 101-102)
- Policy 8 (lines 132-133)
- Test 2 (line 164)
- Test 3 (line 175)

**EXPLANATION:**
- RLS policies must link using `auth_user_id` UUID field
- No more text casting needed since both are UUIDs

---

## 🎯 Summary of Changes

### Files to Modify: 6

| File | Lines Changed | Type of Change |
|------|---------------|----------------|
| ForcedFamilySetup.jsx | 90-91, 97, 110, 145-146, 151, 164 | Remove conversion, use auth_user_id |
| BetaUpgradeModal.jsx | 53-54, 62 | Remove conversion, use auth_user_id |
| api.js | 20, 48, 151 | Change wordpress_user_id → auth_user_id |
| FamilySettings.tsx | 46, 259-263 | Get real auth user, use auth_user_id |
| AuthContext.tsx | 19 | Rename interface field |
| MainLayout.tsx | 21-24 | Document correct pattern (commented) |
| 004_intention_categories_rls_policies.sql | 30, 61-62, 93-94, 101-102, 132-133, 164, 175 | Use auth_user_id in RLS policies |

###Conversion Pattern to Remove:
```javascript
// ❌ DELETE THIS PATTERN EVERYWHERE:
const numericId = parseInt(user.id.replace(/-/g, '').substring(0, 8), 16);
```

### New Pattern to Use:
```javascript
// ✅ USE THIS PATTERN:
// For families table:
auth_user_id: user.id  // Direct UUID, no conversion

// For family_members table (PRIMARY PARENT ONLY):
auth_user_id: user.id  // Only if they have Supabase Auth account

// For family_members table (other members):
auth_user_id: null  // They don't have auth accounts yet
pin: null  // Will be set later for PIN-based access
```

---

## ⚠️ IMPORTANT NOTES

1. **Only primary parent gets auth_user_id**: The person who created the account is the only one with `auth_user_id` set in `family_members`. Partner and children DO NOT get `auth_user_id` unless they create their own auth accounts later.

2. **family_login_name is new**: This field should be populated with the user's email or a custom family username.

3. **PIN field is new**: The `pin` field will be used for family member dashboard access without full auth accounts (future feature).

4. **RLS policies must be updated**: The migration SQL file needs updates to use `auth_user_id` instead of `wordpress_user_id`.

5. **No data migration needed**: Since this is beta, you can just update the code and schema. Existing beta users will need to re-setup their families.

---

## ✅ Approval Needed

**Please review this plan and confirm:**
- [ ] Do these changes look correct?
- [ ] Should I proceed with making these changes?
- [ ] Any additional considerations or concerns?

Once approved, I'll make all changes systematically and create a final summary.
