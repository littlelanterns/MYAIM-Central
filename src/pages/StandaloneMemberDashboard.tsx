/**
 * StandaloneMemberDashboard
 * Full-page dashboard for family members who log in with PIN
 * This is completely separate from the Command Center - no navigation to mom-only features
 *
 * Route: /family-dashboard/:memberId
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import PlayModeDashboard from '../components/dashboard/modes/play/PlayModeDashboard';
import GuidedModeDashboard from '../components/dashboard/modes/guided/GuidedModeDashboard';
import IndependentModeDashboard from '../components/dashboard/modes/independent/IndependentModeDashboard';
import AdditionalAdultDashboard from '../components/dashboard/additional-adult/AdditionalAdultDashboard';

interface MemberData {
  id: string;
  name: string;
  dashboard_type: string | null;
  dashboard_mode: string | null;
  family_id: string;
  theme_preference: string | null;
}

const StandaloneMemberDashboard: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verify session on mount
    const session = localStorage.getItem('aimfm_session');
    if (!session) {
      console.log('[STANDALONE] No session found, redirecting to login');
      navigate('/dashboard');
      return;
    }

    try {
      const sessionData = JSON.parse(session);
      // Verify this is a family member login (not mom's email login)
      if (sessionData.login_type !== 'family_member') {
        console.log('[STANDALONE] Not a family member login, redirecting');
        navigate('/commandcenter');
        return;
      }
      // Verify the member ID matches the session
      if (sessionData.family_member_id !== memberId) {
        console.log('[STANDALONE] Member ID mismatch, redirecting');
        navigate('/dashboard');
        return;
      }
    } catch (e) {
      console.error('[STANDALONE] Invalid session data:', e);
      navigate('/dashboard');
      return;
    }

    loadMemberData();
  }, [memberId, navigate]);

  const loadMemberData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!memberId) {
        setError('No member ID provided');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('family_members')
        .select('id, name, dashboard_type, dashboard_mode, family_id, theme_preference')
        .eq('id', memberId)
        .single();

      if (fetchError) {
        console.error('[STANDALONE] Error loading member:', fetchError);
        setError('Could not load your dashboard');
        return;
      }

      setMemberData(data);
    } catch (err) {
      console.error('[STANDALONE] Exception loading member:', err);
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    // Clear session
    localStorage.removeItem('aimfm_session');
    localStorage.removeItem('last_login_type');
    // Redirect to family member login
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--background-color, #fff4ec)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: 'var(--text-color, #5a4033)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !memberData) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--background-color, #fff4ec)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          background: 'rgba(244, 67, 54, 0.1)',
          borderRadius: '12px',
          maxWidth: '400px'
        }}>
          <h3 style={{ color: '#c00', marginBottom: '0.5rem' }}>Error</h3>
          <p style={{ margin: '0 0 1rem 0', color: '#666' }}>{error || 'Could not load dashboard'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'var(--primary-color, #68a395)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const dashboardType = memberData.dashboard_type || memberData.dashboard_mode || 'guided';

  const renderDashboard = () => {
    switch (dashboardType) {
      case 'play':
        return <PlayModeDashboard familyMemberId={memberId!} />;
      case 'guided':
        return <GuidedModeDashboard familyMemberId={memberId!} />;
      case 'independent':
        return <IndependentModeDashboard familyMemberId={memberId!} />;
      case 'additional_adult':
        return <AdditionalAdultDashboard familyMemberId={memberId!} familyId={memberData.family_id} />;
      default:
        return <GuidedModeDashboard familyMemberId={memberId!} />;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background-color, #fff4ec)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Simple Header - just name and sign out */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.5rem',
        borderBottom: '1px solid var(--accent-color, #d4e3d9)',
        background: 'var(--background-color, #fff4ec)',
        flexShrink: 0
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '1.5rem',
          fontWeight: 600,
          color: 'var(--text-color, #5a4033)',
          fontFamily: 'var(--font-heading, "The Seasons"), "Playfair Display", serif'
        }}>
          Hello, {memberData.name}!
        </h1>
        <button
          onClick={handleSignOut}
          style={{
            background: 'transparent',
            border: '2px solid var(--accent-color, #d4e3d9)',
            color: 'var(--text-color, #5a4033)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'var(--accent-color, #d4e3d9)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          Sign Out
        </button>
      </header>

      {/* Dashboard Content */}
      <main style={{
        flex: 1,
        overflow: 'auto'
      }}>
        {renderDashboard()}
      </main>
    </div>
  );
};

export default StandaloneMemberDashboard;
