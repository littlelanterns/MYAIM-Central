/**
 * useFamilyDashboard Hook
 * Hook for managing the family master dashboard (mom's overview)
 */

import { useState, useEffect } from 'react';
import { DashboardService } from '../../services/dashboardService';
import { FamilyOverviewData } from '../../types/dashboard.types';

export function useFamilyDashboard(familyId: string | null) {
  const [overview, setOverview] = useState<FamilyOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!familyId) {
      setLoading(false);
      return;
    }

    loadFamilyOverview();
  }, [familyId]);

  const loadFamilyOverview = async () => {
    if (!familyId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await DashboardService.getFamilyOverview(familyId);
      setOverview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load family overview');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadFamilyOverview();
  };

  return {
    overview,
    loading,
    error,
    refresh
  };
}
