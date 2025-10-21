/**
 * useDashboardPermissions Hook
 * Hook for checking dashboard edit/view permissions
 */

import { useState, useEffect } from 'react';
import { DashboardService } from '../../services/dashboardService';

export function useDashboardPermissions(
  viewingUserId: string | null,
  dashboardOwnerId: string | null
) {
  const [canEdit, setCanEdit] = useState(false);
  const [canView, setCanView] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!viewingUserId || !dashboardOwnerId) {
      setLoading(false);
      return;
    }

    checkPermissions();
  }, [viewingUserId, dashboardOwnerId]);

  const checkPermissions = async () => {
    if (!viewingUserId || !dashboardOwnerId) return;

    try {
      setLoading(true);

      const editPermission = await DashboardService.canEditDashboard(
        viewingUserId,
        dashboardOwnerId
      );

      setCanEdit(editPermission);
      // If can edit, can also view
      setCanView(true);
    } catch (err) {
      console.error('Error checking permissions:', err);
      setCanEdit(false);
      setCanView(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    canEdit,
    canView,
    loading,
    refresh: checkPermissions
  };
}
