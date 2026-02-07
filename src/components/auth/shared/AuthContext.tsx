import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import {
  saveUserPermissions,
  getUserPermissions,
  saveUserTheme,
  getUserTheme
} from '../../../lib/api';

// User interface
interface User {
  id: string | number;
  email: string;
  role: 'primary_parent' | 'parent' | 'teen' | 'child';
  familyId: string;
  familyMemberId: string | null;  // family_members.id for foreign key references
  permissions: Record<string, boolean>;
  preferences: Record<string, any>;
  auth_user_id?: string;
  name?: string;
}

// Auth state interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  sessionData: Record<string, any>;
}

// Action types
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_SESSION_DATA'; payload: Record<string, any> }
  | { type: 'AUTH_INITIALIZED' }  // Auth check complete, no valid session
  | { type: 'AUTH_INITIALIZED_WITH_SESSION'; payload: User };  // Auth check complete with valid session

// Initial state - IMPORTANT: loading starts as TRUE until auth is resolved
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,  // Start as true - auth check happens on mount
  error: null,
  sessionData: {}
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null
      };

    case 'LOGOUT':
      return {
        ...initialState,
        loading: false  // Don't reset to loading: true on logout
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      };

    case 'SET_SESSION_DATA':
      return {
        ...state,
        sessionData: { ...state.sessionData, ...action.payload }
      };

    case 'AUTH_INITIALIZED':
      // Auth check complete, no valid session found
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null
      };

    case 'AUTH_INITIALIZED_WITH_SESSION':
      // Auth check complete with valid session
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null
      };

    default:
      return state;
  }
};

// Context interface
interface AuthContextType {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  // Helper functions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updatePermissions: (permissions: Record<string, boolean>) => Promise<void>;
  loadUserPermissions: () => Promise<void>;
  saveThemePreference: (theme: string, type?: string) => Promise<void>;
  loadThemePreference: () => Promise<{ theme: string; type: string } | null>;
  hasPermission: (permission: string) => boolean;
  // Role checks
  isPrimaryParent: () => boolean;
  isParent: () => boolean;
  isTeen: () => boolean;
  isChild: () => boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Helper function to load family member data from Supabase
  // Uses proper linking chain: auth.users → beta_users → families → family_members
  const loadFamilyMemberData = async (authUserId: string) => {
    console.log('🔐 [AUTH] loadFamilyMemberData called for:', authUserId);

    try {
      // Step 1: Get beta_user record (includes family_id)
      console.log('🔐 [AUTH] Step 1: Querying beta_users...');
      const { data: betaUser, error: betaError } = await supabase
        .from('beta_users')
        .select('family_id')
        .eq('user_id', authUserId)
        .single();

      if (betaError) {
        console.warn('⚠️ [AUTH] beta_users query error:', betaError.message);
        // Try alternate path: direct family_members lookup by auth_user_id
        console.log('🔐 [AUTH] Trying alternate path via family_members.auth_user_id...');
        const { data: directMember, error: directError } = await supabase
          .from('family_members')
          .select('id, family_id, role, name')
          .eq('auth_user_id', authUserId)
          .single();

        if (directError || !directMember) {
          console.error('❌ [AUTH] No member found via alternate path:', directError?.message);
          return null;
        }

        console.log('✅ [AUTH] Found member via alternate path:', directMember.name);
        return directMember;
      }

      if (!betaUser?.family_id) {
        console.error('❌ [AUTH] No family_id in beta_user record');
        return null;
      }

      // Step 2: Get family_member using family_id
      console.log('🔐 [AUTH] Step 2: Querying family_members for family:', betaUser.family_id);
      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select('id, family_id, role, name')
        .eq('family_id', betaUser.family_id)
        .eq('role', 'primary_parent')
        .single();

      if (memberError || !memberData) {
        console.warn('⚠️ [AUTH] No primary_parent found, trying any member with auth_user_id...');
        // Try to find any member with this auth_user_id
        const { data: anyMember, error: anyError } = await supabase
          .from('family_members')
          .select('id, family_id, role, name')
          .eq('auth_user_id', authUserId)
          .single();

        if (anyError || !anyMember) {
          console.error('❌ [AUTH] No family_member found by any method');
          return null;
        }

        console.log('✅ [AUTH] Found member via auth_user_id:', anyMember.name);
        return anyMember;
      }

      console.log('✅ [AUTH] Successfully loaded family member data:', {
        memberId: memberData.id,
        memberName: memberData.name,
        role: memberData.role
      });

      return memberData;
    } catch (error) {
      console.error('❌ [AUTH] Exception in loadFamilyMemberData:', error);
      return null;
    }
  };

  // Helper functions
  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // TODO: Implement actual login logic with your existing auth system
      // This is a placeholder that works with your existing patterns
      const mockUser: User = {
        id: '1',
        email,
        role: 'parent',
        familyId: '123e4567-e89b-12d3-a456-426614174000',
        familyMemberId: null,
        permissions: {},
        preferences: {}
      };
      dispatch({ type: 'LOGIN_SUCCESS', payload: mockUser });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const logout = () => {
    // TODO: Implement actual logout logic
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
  };

  // Permission management with database integration
  const updatePermissions = async (permissions: Record<string, boolean>) => {
    if (!state.user?.id) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await saveUserPermissions(state.user.id as string, permissions);
      if (result.success) {
        dispatch({ type: 'UPDATE_USER', payload: { permissions } });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const loadUserPermissions = async () => {
    if (!state.user?.id) return;
    
    try {
      const result = await getUserPermissions(state.user.id as string);
      if (result.success) {
        dispatch({ type: 'UPDATE_USER', payload: { permissions: result.permissions } });
      }
    } catch (error: any) {
      console.error('Error loading user permissions:', error);
    }
  };

  // Theme preferences with database integration
  const saveThemePreference = async (theme: string, type: string = 'personal') => {
    if (!state.user?.id) return;
    
    try {
      const result = await saveUserTheme(state.user.id as string, theme, type);
      if (result.success) {
        const updatedPreferences = { ...state.user.preferences, theme, themeType: type };
        dispatch({ type: 'UPDATE_USER', payload: { preferences: updatedPreferences } });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const loadThemePreference = async () => {
    if (!state.user?.id) return null;
    
    try {
      const result = await getUserTheme(state.user.id as string);
      if (result.success) {
        return { theme: result.theme, type: result.type };
      }
      return null;
    } catch (error: any) {
      console.error('Error loading theme preference:', error);
      return null;
    }
  };

  const hasPermission = (permission: string): boolean => {
    return state.user?.permissions[permission] || false;
  };

  const isPrimaryParent = (): boolean => {
    return state.user?.role === 'primary_parent';
  };

  const isParent = (): boolean => {
    return state.user?.role === 'parent' || state.user?.role === 'primary_parent';
  };

  const isTeen = (): boolean => {
    return state.user?.role === 'teen';
  };

  const isChild = (): boolean => {
    return state.user?.role === 'child';
  };

  // Session recovery: clear invalid session and redirect to login
  const recoverSession = (reason: string) => {
    console.log(`🔄 [AUTH] Session recovery triggered: ${reason}`);
    dispatch({ type: 'AUTH_INITIALIZED' });  // Set loading: false, clear user
    // Clear any stale session data
    localStorage.removeItem('aimfm_session');
    sessionStorage.removeItem('aimfm_session_temporary');
    // Only redirect if not already on login page
    if (window.location.pathname !== '/login' &&
        window.location.pathname !== '/dashboard' &&
        window.location.pathname !== '/') {
      console.log('🔄 [AUTH] Redirecting to /login');
      window.location.href = '/login';
    }
  };

  // Initialize auth state from Supabase session on mount
  useEffect(() => {
    let isMounted = true;  // Prevent state updates after unmount

    const initializeAuth = async () => {
      console.log('🔐 [AUTH] Starting auth initialization...');
      const startTime = Date.now();

      try {
        // Step 1: Get Supabase session
        console.log('🔐 [AUTH] Calling supabase.auth.getSession()...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log(`🔐 [AUTH] getSession() completed in ${Date.now() - startTime}ms`);

        if (!isMounted) {
          console.log('🔐 [AUTH] Component unmounted, aborting initialization');
          return;
        }

        // If getSession fails, mark as not authenticated
        if (sessionError) {
          console.error('❌ [AUTH] getSession failed:', sessionError);
          dispatch({ type: 'AUTH_INITIALIZED' });
          return;
        }

        // No session = not logged in
        if (!session?.user) {
          console.log('🔐 [AUTH] No active session found');
          dispatch({ type: 'AUTH_INITIALIZED' });
          return;
        }

        console.log('🔐 [AUTH] Session found for user:', session.user.id);
        console.log('🔐 [AUTH] Session expires at:', session.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'unknown');

        // Step 2: Load family member data
        console.log('🔐 [AUTH] Loading family member data...');
        const memberData = await loadFamilyMemberData(session.user.id);

        if (!isMounted) {
          console.log('🔐 [AUTH] Component unmounted, aborting initialization');
          return;
        }

        if (memberData) {
          // SUCCESS: Full user data loaded
          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            role: memberData.role as 'primary_parent' | 'parent' | 'teen' | 'child',
            familyId: memberData.family_id,
            familyMemberId: memberData.id,
            name: memberData.name,
            permissions: {},
            preferences: {}
          };

          dispatch({ type: 'AUTH_INITIALIZED_WITH_SESSION', payload: user });

          console.log(`✅ [AUTH] Auth initialized successfully in ${Date.now() - startTime}ms:`, {
            userId: user.id,
            familyId: user.familyId,
            familyMemberId: user.familyMemberId,
            name: user.name
          });
        } else {
          // FALLBACK: Session valid but no family member data
          // Create minimal user object so app doesn't get stuck
          console.warn('⚠️ [AUTH] No family member data found, using fallback user');
          const fallbackUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            role: 'parent',  // Default role
            familyId: '',    // Empty - will need setup
            familyMemberId: null,
            name: session.user.email?.split('@')[0] || 'User',
            permissions: {},
            preferences: {}
          };

          dispatch({ type: 'AUTH_INITIALIZED_WITH_SESSION', payload: fallbackUser });

          console.log(`⚠️ [AUTH] Auth initialized with fallback user in ${Date.now() - startTime}ms`);
        }
      } catch (error) {
        console.error('❌ [AUTH] Error during auth initialization:', error);
        if (isMounted) {
          // Don't redirect on errors - just mark as not authenticated
          dispatch({ type: 'AUTH_INITIALIZED' });
        }
      }
    };

    initializeAuth();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);  // Empty deps - only run once on mount

  // Separate effect for auth state changes (sign in/out events)
  useEffect(() => {
    console.log('🔐 [AUTH] Setting up auth state change listener');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`🔐 [AUTH] Auth state changed: ${event}`);

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('🔐 [AUTH] SIGNED_IN event, loading user data...');
        const memberData = await loadFamilyMemberData(session.user.id);

        if (memberData) {
          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            role: memberData.role as 'primary_parent' | 'parent' | 'teen' | 'child',
            familyId: memberData.family_id,
            familyMemberId: memberData.id,
            name: memberData.name,
            permissions: {},
            preferences: {}
          };

          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
          console.log('✅ [AUTH] User signed in:', user.name);
        } else {
          // Fallback user for SIGNED_IN event
          const fallbackUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            role: 'parent',
            familyId: '',
            familyMemberId: null,
            name: session.user.email?.split('@')[0] || 'User',
            permissions: {},
            preferences: {}
          };
          dispatch({ type: 'LOGIN_SUCCESS', payload: fallbackUser });
          console.log('⚠️ [AUTH] User signed in with fallback data');
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('🔐 [AUTH] User signed out');
        dispatch({ type: 'LOGOUT' });
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔐 [AUTH] Token refreshed successfully');
      } else if (event === 'USER_UPDATED') {
        console.log('🔐 [AUTH] User updated');
      }
    });

    return () => {
      console.log('🔐 [AUTH] Cleaning up auth state change listener');
      subscription.unsubscribe();
    };
  }, []);

  // Load user permissions on login
  useEffect(() => {
    if (state.user?.id && state.isAuthenticated) {
      loadUserPermissions();
    }
  }, [state.user?.id, state.isAuthenticated]);

  const value: AuthContextType = {
    state,
    dispatch,
    login,
    logout,
    updateUser,
    updatePermissions,
    loadUserPermissions,
    saveThemePreference,
    loadThemePreference,
    hasPermission,
    isPrimaryParent,
    isParent,
    isTeen,
    isChild
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
