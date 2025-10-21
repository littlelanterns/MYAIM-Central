// Family Hooks
export * from './family/useFamilyMembers';
export * from './family/useFamilyPermissions';
export * from './family/useFamilyContext';
export * from './family/useFamilyIntelligence';

// Dashboard Hooks
export * from './dashboard/useDashboardLayout';
// export * from './dashboard/useWidgets'; // Temporarily disabled - broken imports
export * from './dashboard/useDashboardPreferences';
export * from './dashboard/useChildAnimations';
export * from './dashboard/useImageUpload';

// Task Hooks
export * from './tasks/useTasks';
export * from './tasks/useTaskAssignment';
export * from './tasks/useTaskCompletion';
export * from './tasks/useTaskContext';
export * from './tasks/useTaskOptimization';

// Auth Hooks
export * from './auth/useAuth';
export * from './auth/usePermissions';
export * from './auth/useUserContext';

// Shared Hooks
export * from './shared/useTheme';
export * from './shared/usePersonalTheme';
export * from './shared/useLocalStorage';
export * from './shared/useDebounce';
export * from './shared/useApi';

// Future Hooks
export * from './context/useContextCollection';
export * from './context/useContextProcessing';
export * from './context/useContextRetrieval';
export * from './ai/useLiLaOptimizer';
export * from './ai/useAIInsights';
export * from './ai/useSmartSuggestions';