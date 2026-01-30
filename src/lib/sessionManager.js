// src/lib/sessionManager.js
// Manages session persistence based on "Remember Me" preference

/**
 * Set session remember preference
 * @param {boolean} rememberMe - Whether to remember the session
 */
export const setRememberPreference = (rememberMe) => {
  if (rememberMe) {
    localStorage.setItem('aimfm_remember_me', 'true');
    // Session will persist in localStorage (default Supabase behavior)
  } else {
    localStorage.setItem('aimfm_remember_me', 'false');
    // Mark session as temporary - will be cleared on browser close
    sessionStorage.setItem('aimfm_session_temporary', 'true');
  }
};

/**
 * Check if session should be cleared (for non-remember sessions)
 * Call this on app initialization
 */
export const checkSessionValidity = () => {
  const rememberMe = localStorage.getItem('aimfm_remember_me');
  const isTemporary = sessionStorage.getItem('aimfm_session_temporary');

  // If remember me is false and this is a new browser session (no temp flag)
  // then the user closed their browser and we should clear the session
  if (rememberMe === 'false' && !isTemporary) {
    console.log('Session was not marked for remembering and browser was closed - clearing session');
    clearSession();
    return false; // Session invalid
  }

  return true; // Session valid
};

/**
 * Clear all session data
 */
export const clearSession = () => {
  localStorage.removeItem('aimfm_session');
  localStorage.removeItem('aimfm_remember_me');
  localStorage.removeItem('last_login_type');
  localStorage.removeItem('remember_me'); // Old flag
  sessionStorage.removeItem('aimfm_session_temporary');
};

/**
 * Get session remember status
 */
export const isSessionRemembered = () => {
  return localStorage.getItem('aimfm_remember_me') === 'true';
};
