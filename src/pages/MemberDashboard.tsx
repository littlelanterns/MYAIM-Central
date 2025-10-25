/**
 * MemberDashboard Component
 * Dynamically loads the correct dashboard type based on member's assigned mode
 * This allows URLs to stay the same even if mom changes the dashboard type
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import PlayModeDashboard from '../components/dashboard/modes/play/PlayModeDashboard';
import GuidedModeDashboard from '../components/dashboard/modes/guided/GuidedModeDashboard';
import IndependentModeDashboard from '../components/dashboard/modes/independent/IndependentModeDashboard';

const MemberDashboard: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const [dashboardMode, setDashboardMode] = useState<string | null>(null);
  const [memberName, setMemberName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (memberId) {
      loadMemberDashboardMode();
    }
  }, [memberId]);

  const loadMemberDashboardMode = async () => {
    try {
      setLoading(true);
      setError(null);

      // Handle demo/sample family members (Emma and Noah from Family Dashboard)
      const demoMembers: Record<string, { name: string; mode: string }> = {
        '1': { name: 'Emma', mode: 'independent' },
        '2': { name: 'Noah', mode: 'guided' }
      };

      if (memberId && demoMembers[memberId]) {
        // This is a demo member, use mock data
        setDashboardMode(demoMembers[memberId].mode);
        setMemberName(demoMembers[memberId].name);
        setLoading(false);
        return;
      }

      // Real family member - load from database
      const { data, error: fetchError } = await supabase
        .from('family_members')
        .select('dashboard_mode, name')
        .eq('id', memberId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Default to 'independent' if no mode set
      setDashboardMode(data.dashboard_mode || 'independent');
      setMemberName(data.name || '');
    } catch (err) {
      console.error('Error loading member dashboard mode:', err);
      setError('Failed to load dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div style={{ color: 'var(--text-color, #5a4033)' }}>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          background: '#fee',
          borderRadius: '12px',
          maxWidth: '400px'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
          <h3 style={{ color: '#c00', marginBottom: '0.5rem' }}>Error</h3>
          <p style={{ margin: 0, color: '#666' }}>{error}</p>
        </div>
      </div>
    );
  }

  // Render the appropriate dashboard based on mode
  switch (dashboardMode) {
    case 'play':
      return <PlayModeDashboard familyMemberId={memberId!} />;
    case 'guided':
      return <GuidedModeDashboard familyMemberId={memberId!} />;
    case 'independent':
      return <IndependentModeDashboard familyMemberId={memberId!} />;
    default:
      return <IndependentModeDashboard familyMemberId={memberId!} />;
  }
};

export default MemberDashboard;
