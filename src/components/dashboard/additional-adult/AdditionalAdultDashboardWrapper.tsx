/**
 * AdditionalAdultDashboardWrapper
 * Wrapper component that retrieves familyMemberId from session storage
 * and passes it to AdditionalAdultDashboard
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdditionalAdultDashboard from './AdditionalAdultDashboard';

const AdditionalAdultDashboardWrapper: React.FC = () => {
  const [familyMemberId, setFamilyMemberId] = useState<string | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve session data from localStorage
    const sessionDataStr = localStorage.getItem('aimfm_session');

    if (!sessionDataStr) {
      // No session found - redirect to login
      console.error('No session found, redirecting to family member login');
      navigate('/dashboard');
      return;
    }

    try {
      const sessionData = JSON.parse(sessionDataStr);

      // Verify this is a family member login (not mom's normal login)
      if (sessionData.login_type !== 'family_member') {
        console.error('Invalid session type for additional adult dashboard');
        navigate('/commandcenter');
        return;
      }

      // Verify this is an additional adult (not a child)
      const relationship = sessionData.relationship;
      if (relationship !== 'partner' && relationship !== 'special') {
        console.error('Access denied: This dashboard is for additional adults only');
        navigate('/commandcenter');
        return;
      }

      // Set both family ID and family member ID
      setFamilyId(sessionData.family_id);
      setFamilyMemberId(sessionData.family_member_id);
    } catch (err) {
      console.error('Error parsing session data:', err);
      navigate('/dashboard');
      return;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--background-color)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--accent-color)',
          borderTop: '3px solid var(--primary-color)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  if (!familyMemberId || !familyId) {
    return null; // Will redirect in useEffect
  }

  return <AdditionalAdultDashboard familyMemberId={familyMemberId} familyId={familyId} />;
};

export default AdditionalAdultDashboardWrapper;
