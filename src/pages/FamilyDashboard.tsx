/**
 * FamilyDashboard Page
 * Wrapper for the Family Mode Dashboard
 */

import React from 'react';
import { useAuthContext } from '../components/auth/shared/AuthContext';
import FamilyModeDashboard from '../components/dashboard/modes/family/FamilyModeDashboard';

const FamilyDashboard: React.FC = () => {
  const { state } = useAuthContext();

  // Get family ID from user's family_members record
  const familyId = state.user?.familyId;

  return <FamilyModeDashboard familyId={familyId} />;
};

export default FamilyDashboard;