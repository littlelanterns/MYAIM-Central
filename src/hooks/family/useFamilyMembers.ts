import { useState, useEffect } from 'react';
import { useFamilyContext } from '../../components/family/shared/FamilyContext';
import type { FamilyMember } from '../../types';

// Custom hook for family member management
export const useFamilyMembers = () => {
  const { state, addMember, updateMember, removeMember, selectMember } = useFamilyContext();
  
  // Filter functions
  const getActiveMembers = () => {
    return state.members.filter(member => member.inHousehold);
  };

  const getContextOnlyMembers = () => {
    return state.members.filter(member => !member.inHousehold);
  };

  const getMembersByRole = (relationship: string) => {
    return state.members.filter(member => member.relationship === relationship);
  };

  // Member operations with context collection
  const addMemberWithContext = (member: FamilyMember) => {
    addMember(member);
    // TODO: Collect context data when Context Archive is ready
  };

  const updateMemberWithContext = (id: string | number, updates: Partial<FamilyMember>) => {
    updateMember(id, updates);
    // TODO: Update family intelligence when LiLa is ready
  };

  return {
    // State
    members: state.members,
    selectedMember: state.selectedMember,
    loading: state.loading,
    error: state.error,
    
    // Actions
    addMember: addMemberWithContext,
    updateMember: updateMemberWithContext,
    removeMember,
    selectMember,
    
    // Filters
    getActiveMembers,
    getContextOnlyMembers,
    getMembersByRole,
    
    // Stats
    totalMembers: state.members.length,
    activeMembers: getActiveMembers().length,
    contextOnlyMembers: getContextOnlyMembers().length
  };
};
