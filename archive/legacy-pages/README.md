# Legacy Pages Archive

This directory contains deprecated page components that have been replaced by newer implementations.

## Archived Files

### Login.tsx
- **Archived Date:** 2025-10-19
- **Reason:** Replaced by `AdminLogin.tsx`
- **Old Route:** `/admin-login`
- **New Route:** `/admin`
- **Key Differences:**
  - Old: Generic login with GitHub OAuth, basic super admin check
  - New: Dedicated admin portal with staff permissions system, better UX
- **Replacement:** `src/pages/AdminLogin.tsx`

### Library.tsx
- **Archived Date:** 2025-10-19
- **Reason:** Empty stub replaced by full implementation
- **File Size:** 11 lines (placeholder component)
- **Replacement:** `src/pages/Library.jsx` (313 lines, full Vault-style library)

## Admin System Changes

The admin authentication system has been consolidated:
- **Active Admin Login:** `/admin` → `AdminLogin.tsx`
- **Active Admin Dashboard:** `/aim-admin` → `AimAdminDashboard.jsx`
- **Library Admin:** Accessible via AimAdminDashboard tabs

Both systems use Supabase authentication and are fully compatible.
