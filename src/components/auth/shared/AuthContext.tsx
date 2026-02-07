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
  | { type: 'SET_SESSION_DATA'; payload: Record<string, any> };

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
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
        ...initialState // Reset to initial state
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
    try {
      // Step 1: Get beta_user record (includes family_id)
      const { data: betaUser, error: betaError } = await supabase
        .from('beta_users')
        .select('family_id')
        .eq('user_id', authUserId)
        .single();

      if (betaError || !betaUser) {
        console.error('❌ No beta_user record found for auth user:', authUserId, betaError);
        return null;
      }

      // Step 2: Get family_member using family_id
      // Assuming primary parent for beta users (adjust logic if needed)
      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select('id, family_id, role, name')
        .eq('family_id', betaUser.family_id)
        .eq('role', 'primary_parent') // Adjust if beta users can have other roles
        .single();

      if (memberError || !memberData) {
        console.error('❌ No family_member found for family_id:', betaUser.family_id, memberError);
        return null;
      }

      console.log('✅ Successfully linked auth.users → beta_users → family_members:', {
        authUserId,
        familyId: betaUser.family_id,
        memberId: memberData.id,
        memberName: memberData.name
      });

      return memberData;
    } catch (error) {
      console.error('Error in loadFamilyMemberData:', error);
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
  const recoverSession = () => {
    console.log('🔄 Session recovery: clearing invalid session state');
    dispatch({ type: 'LOGOUT' });
    // Clear any stale session data
    localStorage.removeItem('aimfm_session');
    sessionStorage.removeItem('aimfm_session_temporary');
    // Only redirect if not already on login page
    if (window.location.pathname !== '/login' &&
        window.location.pathname !== '/dashboard' &&
        window.location.pathname !== '/') {
      window.location.href = '/login';
    }
  };

  // Initialize auth state from Supabase session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        // If getSession fails, recover gracefully
        if (sessionError) {
          console.error('❌ getSession failed:', sessionError);
          recoverSession();
          return;
        }

        if (session?.user) {
          // Load family member data
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

            console.log('✅ Auth initialized:', {
              userId: user.id,
              familyId: user.familyId,
              familyMemberId: user.familyMemberId,
              name: user.name
            });
          } else {
            console.warn('⚠️ No family member data found for user');
            // Don't recover here - user might be in setup flow
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // On unexpected errors, try to recover
        recoverSession();
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
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
        }
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'LOGOUT' });
      }
    });

    return () => {
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
