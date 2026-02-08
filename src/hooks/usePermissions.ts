/**
 * usePermissions Hook
 * Manages permission state and checking for Additional Adult Dashboard
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { AdditionalAdultPermissions, PermissionAction, DEFAULT_PERMISSIONS } from '../types/permissions';
import { PermissionEngine } from '../lib/permissions';

export const usePermissions = (familyMemberId?: string) => {
  const [permissions, setPermissions] = useState<AdditionalAdultPermissions>(DEFAULT_PERMISSIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [engine, setEngine] = useState<PermissionEngine>(new PermissionEngine(DEFAULT_PERMISSIONS));

  /**
   * Load permissions from database - with silent failure to prevent app blocking
   */
  const loadPermissions = useCallback(async () => {
    if (!familyMemberId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('family_members')
        .select('permissions')
        .eq('id', familyMemberId)
        .single();

      if (fetchError) {
        // Log but don't throw - use default permissions instead
        console.log('[PERMISSIONS] Could not load permissions (non-blocking):', fetchError.message);
        setPermissions(DEFAULT_PERMISSIONS);
        setEngine(new PermissionEngine(DEFAULT_PERMISSIONS));
        return;
      }

      const loadedPermissions = data?.permissions || DEFAULT_PERMISSIONS;
      setPermissions(loadedPermissions);
      setEngine(new PermissionEngine(loadedPermissions));
    } catch (err) {
      // Silently handle - permissions are not critical for initial render
      console.log('[PERMISSIONS] Permission load failed (non-blocking):', err);
      setPermissions(DEFAULT_PERMISSIONS);
      setEngine(new PermissionEngine(DEFAULT_PERMISSIONS));
    } finally {
      setLoading(false);
    }
  }, [familyMemberId]);

  /**
   * Check if user has specific permission
   */
  const checkPermission = useCallback(
    (action: PermissionAction, targetMemberId?: string): boolean => {
      return engine.can(action, targetMemberId);
    },
    [engine]
  );

  /**
   * Get all granted permissions as readable list
   */
  const getGrantedPermissions = useCallback((): string[] => {
    return engine.getGrantedPermissions();
  }, [engine]);

  /**
   * Get permission level summary
   */
  const getPermissionLevel = useCallback((): 'none' | 'limited' | 'moderate' | 'extensive' => {
    return engine.getPermissionLevel();
  }, [engine]);

  /**
   * Request additional permissions (sends notification to mom)
   */
  const requestPermission = useCallback(
    async (requestedPermission: string, reason?: string) => {
      if (!familyMemberId) return false;

      try {
        // TODO: Implement permission request system
        // This would create a notification for the primary parent
        console.log('Permission request:', requestedPermission, reason);

        // For now, just log the request
        const { error: insertError } = await supabase
          .from('permission_requests')
          .insert({
            requester_id: familyMemberId,
            requested_permission: requestedPermission,
            reason: reason || null,
            status: 'pending',
            created_at: new Date().toISOString(),
          });

        if (insertError) throw insertError;

        return true;
      } catch (err) {
        console.error('Error requesting permission:', err);
        return false;
      }
    },
    [familyMemberId]
  );

  // Load permissions on mount
  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  return {
    permissions,
    loading,
    error,
    checkPermission,
    getGrantedPermissions,
    getPermissionLevel,
    requestPermission,
    refreshPermissions: loadPermissions,
  };
};
