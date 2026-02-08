// src/hooks/useAdminPermissions.ts
// Hook to check if current user has admin permissions

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Hardcoded super admin emails (always have access)
const SUPER_ADMIN_EMAILS = [
  'tenisewertman@gmail.com',
  'aimagicformoms@gmail.com',
  '3littlelanterns@gmail.com',
];

interface AdminPermissions {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  permissions: string[];
  loading: boolean;
}

export function useAdminPermissions(): AdminPermissions {
  const [state, setState] = useState<AdminPermissions>({
    isAdmin: false,
    isSuperAdmin: false,
    permissions: [],
    loading: true,
  });

  useEffect(() => {
    checkAdminPermissions();
  }, []);

  const checkAdminPermissions = async () => {
    try {
      // First check localStorage for cached permissions
      const sessionData = localStorage.getItem('aimfm_session');
      if (sessionData) {
        try {
          const session = JSON.parse(sessionData);
          if (session.is_admin && session.admin_permissions) {
            setState({
              isAdmin: true,
              isSuperAdmin: session.admin_permissions.includes('super_admin'),
              permissions: session.admin_permissions,
              loading: false,
            });
            return;
          }
        } catch (parseErr) {
          console.log('[ADMIN] Could not parse session data (non-blocking)');
        }
      }

      // Get current user - handle errors gracefully
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user || !user.email) {
        console.log('[ADMIN] No user found (non-blocking):', userError?.message);
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      // Check if super admin by email
      const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase());

      // Check staff_permissions table - handle errors gracefully
      let activePermissions: string[] = [];
      try {
        const { data: permissions, error } = await supabase
          .from('staff_permissions')
          .select('permission_type, expires_at')
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (error) {
          console.log('[ADMIN] Could not check staff permissions (non-blocking):', error.message);
        } else if (permissions) {
          // Filter valid (non-expired) permissions
          activePermissions = permissions
            .filter((perm) => perm.expires_at === null || new Date(perm.expires_at) > new Date())
            .map((perm) => perm.permission_type);
        }
      } catch (permErr) {
        console.log('[ADMIN] Staff permissions query failed (non-blocking):', permErr);
      }

      // Add super_admin if applicable
      if (isSuperAdmin && !activePermissions.includes('super_admin')) {
        activePermissions.push('super_admin');
      }

      const isAdmin = isSuperAdmin || activePermissions.length > 0;

      // Update localStorage with admin info - wrapped in try/catch
      try {
        if (sessionData && isAdmin) {
          const session = JSON.parse(sessionData);
          session.is_admin = true;
          session.admin_permissions = activePermissions;
          localStorage.setItem('aimfm_session', JSON.stringify(session));
        }
      } catch (storageErr) {
        console.log('[ADMIN] Could not update session storage (non-blocking)');
      }

      setState({
        isAdmin,
        isSuperAdmin,
        permissions: activePermissions,
        loading: false,
      });
    } catch (error) {
      // Silently handle - admin check is not critical for initial render
      console.log('[ADMIN] Admin check failed (non-blocking):', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  return state;
}

// Utility function to check admin status synchronously from localStorage
export function getAdminStatusFromSession(): { isAdmin: boolean; permissions: string[] } {
  try {
    const sessionData = localStorage.getItem('aimfm_session');
    if (sessionData) {
      const session = JSON.parse(sessionData);
      if (session.is_admin && session.admin_permissions) {
        return {
          isAdmin: true,
          permissions: session.admin_permissions,
        };
      }
    }
  } catch (error) {
    console.error('Error reading admin status from session:', error);
  }
  return { isAdmin: false, permissions: [] };
}
