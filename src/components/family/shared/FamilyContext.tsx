import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { FamilyMember } from '../../../types';
import { 
  saveFamilyMember, 
  getFamilyMembers, 
  deleteFamilyMember,
  getFamilyByUserId 
} from '../../../lib/api';

// Family state interface
interface FamilyState {
  members: FamilyMember[];
  selectedMember: FamilyMember | null;
  permissions: Record<string, any>;
  loading: boolean;
  error: string | null;
  // Context Archive Integration points
  contextData: Record<string, any>;
  familyIntelligence: Record<string, any>;
}

// Action types
type FamilyAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MEMBERS'; payload: FamilyMember[] }
  | { type: 'ADD_MEMBER'; payload: FamilyMember }
  | { type: 'UPDATE_MEMBER'; payload: { id: string | number; updates: Partial<FamilyMember> } }
  | { type: 'REMOVE_MEMBER'; payload: string | number }
  | { type: 'SELECT_MEMBER'; payload: FamilyMember | null }
  | { type: 'UPDATE_PERMISSIONS'; payload: { memberId: string | number; permissions: Record<string, boolean> } }
  | { type: 'SET_CONTEXT_DATA'; payload: Record<string, any> }
  | { type: 'UPDATE_FAMILY_INTELLIGENCE'; payload: Record<string, any> };

// Initial state
const initialState: FamilyState = {
  members: [],
  selectedMember: null,
  permissions: {},
  loading: false,
  error: null,
  contextData: {},
  familyIntelligence: {}
};

// Reducer
const familyReducer = (state: FamilyState, action: FamilyAction): FamilyState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_MEMBERS':
      return { ...state, members: action.payload, loading: false };
    
    case 'ADD_MEMBER':
      return { 
        ...state, 
        members: [...state.members, action.payload],
        loading: false 
      };
    
    case 'UPDATE_MEMBER':
      return {
        ...state,
        members: state.members.map(member =>
          member.id === action.payload.id
            ? { ...member, ...action.payload.updates }
            : member
        )
      };
    
    case 'REMOVE_MEMBER':
      return {
        ...state,
        members: state.members.filter(member => member.id !== action.payload),
        selectedMember: state.selectedMember?.id === action.payload ? null : state.selectedMember
      };
    
    case 'SELECT_MEMBER':
      return { ...state, selectedMember: action.payload };
    
    case 'UPDATE_PERMISSIONS':
      return {
        ...state,
        permissions: {
          ...state.permissions,
          [action.payload.memberId]: action.payload.permissions
        }
      };
    
    case 'SET_CONTEXT_DATA':
      return { ...state, contextData: action.payload };
    
    case 'UPDATE_FAMILY_INTELLIGENCE':
      return { 
        ...state, 
        familyIntelligence: { ...state.familyIntelligence, ...action.payload } 
      };
    
    default:
      return state;
  }
};

// Context interface
interface FamilyContextType {
  state: FamilyState;
  dispatch: React.Dispatch<FamilyAction>;
  // Helper functions
  addMember: (member: FamilyMember) => void;
  updateMember: (id: string | number, updates: Partial<FamilyMember>) => void;
  removeMember: (id: string | number) => void;
  selectMember: (member: FamilyMember | null) => void;
  updatePermissions: (memberId: string | number, permissions: Record<string, boolean>) => void;
  // Context Archive Ready functions
  collectContextData: (data: Record<string, any>) => void;
  updateFamilyIntelligence: (intelligence: Record<string, any>) => void;
  // LiLa Ready functions
  getFamilyInsights: () => any[];
}

// Create context
const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

// Custom hook to use family context
export const useFamilyContext = () => {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamilyContext must be used within a FamilyProvider');
  }
  return context;
};

// Family Provider component
export const FamilyProvider: React.FC<{ children: React.ReactNode; familyId?: string }> = ({ 
  children, 
  familyId 
}) => {
  const [state, dispatch] = useReducer(familyReducer, initialState);

  // Load family members on mount
  useEffect(() => {
    if (familyId) {
      loadFamilyMembers(familyId);
    }
  }, [familyId]);

  // Load family members from database
  const loadFamilyMembers = async (familyId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await getFamilyMembers(familyId);
      if (result.success) {
        // Transform database format to component format
        const transformedMembers = result.members?.map((dbMember: any) => ({
          id: dbMember.id,
          name: dbMember.name,
          nicknames: dbMember.nicknames || [],
          birthday: dbMember.birthday,
          relationship: dbMember.role,
          customRole: dbMember.role,
          accessLevel: dbMember.access_level || 'guided',
          dashboard_type: dbMember.dashboard_type || 'guided',
          pin: dbMember.pin || '',
          inHousehold: dbMember.in_household,
          permissions: dbMember.permissions || {},
          notes: dbMember.notes || '',
          family_id: dbMember.family_id
        })) || [];
        
        dispatch({ type: 'SET_MEMBERS', payload: transformedMembers });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  // Helper functions with database integration
  const addMember = async (member: FamilyMember) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await saveFamilyMember({
        ...member,
        family_id: familyId
      });
      
      if (result.success) {
        const transformedMember = {
          id: result.member.id,
          name: result.member.name,
          nicknames: result.member.nicknames || [],
          birthday: result.member.birthday,
          relationship: result.member.role,
          customRole: result.member.role,
          accessLevel: result.member.access_level,
          dashboard_type: result.member.dashboard_type || 'guided',
          pin: result.member.pin || '',
          inHousehold: result.member.in_household,
          permissions: result.member.permissions || {},
          notes: result.member.notes || '',
          family_id: result.member.family_id
        };
        dispatch({ type: 'ADD_MEMBER', payload: transformedMember });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const updateMember = async (id: string | number, updates: Partial<FamilyMember>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Find current member to merge updates
      const currentMember = state.members.find(m => m.id === id);
      if (!currentMember) {
        dispatch({ type: 'SET_ERROR', payload: 'Member not found' });
        return;
      }

      const updatedMember = { ...currentMember, ...updates };
      const result = await saveFamilyMember(updatedMember);
      
      if (result.success) {
        dispatch({ type: 'UPDATE_MEMBER', payload: { id, updates } });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const removeMember = async (id: string | number) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await deleteFamilyMember(id as string);
      if (result.success) {
        dispatch({ type: 'REMOVE_MEMBER', payload: id });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const selectMember = (member: FamilyMember | null) => {
    dispatch({ type: 'SELECT_MEMBER', payload: member });
  };

  const updatePermissions = (memberId: string | number, permissions: Record<string, boolean>) => {
    dispatch({ type: 'UPDATE_PERMISSIONS', payload: { memberId, permissions } });
  };

  // Context Archive Integration
  const collectContextData = (data: Record<string, any>) => {
    dispatch({ type: 'SET_CONTEXT_DATA', payload: { ...state.contextData, ...data } });
  };

  const updateFamilyIntelligence = (intelligence: Record<string, any>) => {
    dispatch({ type: 'UPDATE_FAMILY_INTELLIGENCE', payload: intelligence });
  };

  // LiLa Integration Preparation
  const getFamilyInsights = () => {
    // TODO: Implement family insights logic when LiLa is ready
    return [];
  };

  const value: FamilyContextType = {
    state,
    dispatch,
    addMember,
    updateMember,
    removeMember,
    selectMember,
    updatePermissions,
    collectContextData,
    updateFamilyIntelligence,
    getFamilyInsights
  };

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
};

export default FamilyContext;