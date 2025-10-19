/**
 * Session Management Utilities
 * Handles session storage, validation, and timeout for MyAIM Central
 */

import { supabase } from './supabase';

export interface SessionData {
  // Common fields
  user_id?: string;
  family_id?: string;
  family_member_id?: string;
  login_type: 'normal' | 'beta' | 'admin' | 'family_member';

  // Normal/Beta login specific
  role?: string;
  subscription_tier?: string;
  is_primary_parent?: boolean;
  is_beta_user?: boolean;
  show_feedback_button?: boolean;

  // Admin login specific
  is_admin?: boolean;
  email?: string;
  admin_permissions?: string[];

  // Family member login specific
  name?: string;
  age?: number;
  dashboard_type?: string;
  theme_preference?: string;
  color?: string;
  requires_parent_approval?: boolean;
  content_filter_level?: string;

  // Session metadata
  login_timestamp?: number;
  last_activity?: number;
}

/**
 * Session Duration Constants (in milliseconds)
 */
export const SESSION_DURATIONS = {
  MOM_REMEMBERED: 7 * 24 * 60 * 60 * 1000, // 7 days
  MOM_DEFAULT: 24 * 60 * 60 * 1000, // 24 hours
  FAMILY_MEMBER: 12 * 60 * 60 * 1000, // 12 hours
  ADMIN: 24 * 60 * 60 * 1000, // 24 hours
  BETA: 24 * 60 * 60 * 1000, // 24 hours
};

/**
 * Inactivity Timeout Constants (in milliseconds)
 */
export const INACTIVITY_TIMEOUTS = {
  PARENT: 30 * 60 * 1000, // 30 minutes
  CHILD: 15 * 60 * 1000, // 15 minutes
  ADMIN: 60 * 60 * 1000, // 60 minutes
};

/**
 * Get current session data from localStorage
 */
export const getSession = (): SessionData | null => {
  try {
    const sessionStr = localStorage.getItem('aimfm_session');
    if (!sessionStr) return null;

    const session: SessionData = JSON.parse(sessionStr);
    return session;
  } catch (error) {
    console.error('Error reading session:', error);
    return null;
  }
};

/**
 * Save session data to localStorage
 */
export const setSession = (session: SessionData): void => {
  const sessionWithTimestamps: SessionData = {
    ...session,
    login_timestamp: Date.now(),
    last_activity: Date.now(),
  };
  localStorage.setItem('aimfm_session', JSON.stringify(sessionWithTimestamps));
};

/**
 * Update last activity timestamp
 */
export const updateActivity = (): void => {
  const session = getSession();
  if (session) {
    session.last_activity = Date.now();
    localStorage.setItem('aimfm_session', JSON.stringify(session));
  }
};

/**
 * Clear session data (logout)
 */
export const clearSession = async (): Promise<void> => {
  localStorage.removeItem('aimfm_session');
  localStorage.removeItem('remember_me');
  await supabase.auth.signOut();
};

/**
 * Check if session is expired based on login type
 */
export const isSessionExpired = (session: SessionData): boolean => {
  if (!session.login_timestamp) return true;

  const now = Date.now();
  const elapsed = now - session.login_timestamp;

  let maxDuration: number;

  switch (session.login_type) {
    case 'normal':
      const rememberMe = localStorage.getItem('remember_me') === 'true';
      maxDuration = rememberMe
        ? SESSION_DURATIONS.MOM_REMEMBERED
        : SESSION_DURATIONS.MOM_DEFAULT;
      break;

    case 'family_member':
      maxDuration = SESSION_DURATIONS.FAMILY_MEMBER;
      break;

    case 'admin':
      maxDuration = SESSION_DURATIONS.ADMIN;
      break;

    case 'beta':
      maxDuration = SESSION_DURATIONS.BETA;
      break;

    default:
      maxDuration = SESSION_DURATIONS.MOM_DEFAULT;
  }

  return elapsed > maxDuration;
};

/**
 * Check if user is inactive (based on last activity)
 */
export const isInactive = (session: SessionData): boolean => {
  if (!session.last_activity) return true;

  const now = Date.now();
  const elapsed = now - session.last_activity;

  let timeout: number;

  switch (session.login_type) {
    case 'family_member':
      timeout = INACTIVITY_TIMEOUTS.CHILD;
      break;

    case 'admin':
      timeout = INACTIVITY_TIMEOUTS.ADMIN;
      break;

    case 'normal':
    case 'beta':
      timeout = INACTIVITY_TIMEOUTS.PARENT;
      break;

    default:
      timeout = INACTIVITY_TIMEOUTS.PARENT;
  }

  return elapsed > timeout;
};

/**
 * Validate session and return appropriate redirect path if invalid
 * Returns null if session is valid, redirect path if invalid
 */
export const validateSession = (): string | null => {
  const session = getSession();

  if (!session) {
    // No session - redirect based on last login type
    const lastLoginType = localStorage.getItem('last_login_type');
    if (lastLoginType === 'beta') return '/beta/login';
    if (lastLoginType === 'admin') return '/admin';
    if (lastLoginType === 'family_member') return '/dashboard';
    return '/login';
  }

  // Check if session is expired
  if (isSessionExpired(session)) {
    clearSession();
    if (session.login_type === 'beta') return '/beta/login';
    if (session.login_type === 'admin') return '/admin';
    if (session.login_type === 'family_member') return '/dashboard';
    return '/login';
  }

  // Check if user is inactive
  if (isInactive(session)) {
    clearSession();
    if (session.login_type === 'beta') return '/beta/login';
    if (session.login_type === 'admin') return '/admin';
    if (session.login_type === 'family_member') return '/dashboard';
    return '/login';
  }

  // Session is valid - update activity
  updateActivity();
  return null;
};

/**
 * Get time remaining until session expires (in seconds)
 */
export const getSessionTimeRemaining = (session: SessionData): number => {
  if (!session.login_timestamp) return 0;

  const now = Date.now();
  const elapsed = now - session.login_timestamp;

  let maxDuration: number;

  switch (session.login_type) {
    case 'normal':
      const rememberMe = localStorage.getItem('remember_me') === 'true';
      maxDuration = rememberMe
        ? SESSION_DURATIONS.MOM_REMEMBERED
        : SESSION_DURATIONS.MOM_DEFAULT;
      break;

    case 'family_member':
      maxDuration = SESSION_DURATIONS.FAMILY_MEMBER;
      break;

    case 'admin':
      maxDuration = SESSION_DURATIONS.ADMIN;
      break;

    case 'beta':
      maxDuration = SESSION_DURATIONS.BETA;
      break;

    default:
      maxDuration = SESSION_DURATIONS.MOM_DEFAULT;
  }

  const remaining = maxDuration - elapsed;
  return Math.max(0, Math.floor(remaining / 1000)); // Convert to seconds
};

/**
 * Get time since last activity (in seconds)
 */
export const getTimeSinceActivity = (session: SessionData): number => {
  if (!session.last_activity) return 999999;

  const now = Date.now();
  const elapsed = now - session.last_activity;
  return Math.floor(elapsed / 1000); // Convert to seconds
};

/**
 * Check if user has permission (for admin/normal users)
 */
export const hasPermission = (permission: string): boolean => {
  const session = getSession();
  if (!session) return false;

  // Admin permissions
  if (session.is_admin && session.admin_permissions) {
    // Super admin has all permissions
    if (session.admin_permissions.includes('super_admin')) return true;

    // Check specific permission
    return session.admin_permissions.includes(permission);
  }

  // Family member permissions (stored in session)
  // TODO: Implement based on your permission structure
  return false;
};

/**
 * Check if user is primary parent (account owner)
 */
export const isPrimaryParent = (): boolean => {
  const session = getSession();
  return session?.is_primary_parent === true;
};

/**
 * Check if user is beta tester
 */
export const isBetaUser = (): boolean => {
  const session = getSession();
  return session?.is_beta_user === true;
};

/**
 * Check if user is admin
 */
export const isAdmin = (): boolean => {
  const session = getSession();
  return session?.is_admin === true;
};

/**
 * Format time remaining as human-readable string
 * @param seconds - Number of seconds
 * @returns Formatted string like "2h 30m" or "15m"
 */
export const formatTimeRemaining = (seconds: number): string => {
  if (seconds <= 0) return '0m';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};
