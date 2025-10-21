/**
 * usePersonalDashboard Hook
 * Hook for managing mom's personal dashboard (hidden from family)
 */

import { useState, useEffect } from 'react';
import { DashboardService } from '../../services/dashboardService';
import {
  DashboardConfig,
  WidgetType,
  WidgetPosition
} from '../../types/dashboard.types';

export function usePersonalDashboard(familyMemberId: string | null) {
  const [config, setConfig] = useState<DashboardConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!familyMemberId) {
      setLoading(false);
      return;
    }

    loadPersonalDashboard();
  }, [familyMemberId]);

  const loadPersonalDashboard = async () => {
    if (!familyMemberId) return;

    try {
      setLoading(true);
      setError(null);

      // Try to get existing personal config
      let dashboardConfig = await DashboardService.getDashboardConfig(
        familyMemberId,
        'personal'
      );

      // Create if doesn't exist
      if (!dashboardConfig) {
        dashboardConfig = await DashboardService.createDashboardConfig(
          familyMemberId,
          'personal',
          true // is_personal = true
        );
      }

      setConfig(dashboardConfig);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load personal dashboard');
    } finally {
      setLoading(false);
    }
  };

  const addWidget = async (widgetType: WidgetType, position: WidgetPosition) => {
    if (!config) return false;

    const success = await DashboardService.addWidget(
      config.id,
      widgetType,
      position
    );

    if (success) {
      await loadPersonalDashboard();
    }

    return success;
  };

  const removeWidget = async (widgetId: string) => {
    if (!config) return false;

    const success = await DashboardService.removeWidget(config.id, widgetId);

    if (success) {
      await loadPersonalDashboard();
    }

    return success;
  };

  const updateWidgetPosition = async (widgetId: string, position: WidgetPosition) => {
    if (!config) return false;

    const success = await DashboardService.updateWidgetPosition(
      config.id,
      widgetId,
      position
    );

    if (success) {
      await loadPersonalDashboard();
    }

    return success;
  };

  return {
    config,
    loading,
    error,
    addWidget,
    removeWidget,
    updateWidgetPosition,
    refresh: loadPersonalDashboard
  };
}
