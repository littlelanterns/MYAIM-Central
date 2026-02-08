/**
 * MemberDashboardModal
 * Full-screen modal for viewing a family member's dashboard
 * Used when mom clicks "View Dashboard" to preview a member's dashboard
 * without navigating away from her current page
 */

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import PlayModeDashboard from './modes/play/PlayModeDashboard';
import GuidedModeDashboard from './modes/guided/GuidedModeDashboard';
import IndependentModeDashboard from './modes/independent/IndependentModeDashboard';
import AdditionalAdultDashboard from './additional-adult/AdditionalAdultDashboard';

interface MemberDashboardModalProps {
  memberId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface MemberData {
  id: string;
  name: string;
  dashboard_type: string | null;
  dashboard_mode: string | null;
  family_id: string;
  theme_preference: string | null;
}

const MemberDashboardModal: React.FC<MemberDashboardModalProps> = ({
  memberId,
  isOpen,
  onClose
}) => {
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && memberId) {
      loadMemberData();
    }
  }, [isOpen, memberId]);

  const loadMemberData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('family_members')
        .select('id, name, dashboard_type, dashboard_mode, family_id, theme_preference')
        .eq('id', memberId)
        .single();

      if (fetchError) {
        console.error('[MODAL] Error loading member:', fetchError);
        setError('Could not load member dashboard');
        return;
      }

      setMemberData(data);
    } catch (err) {
      console.error('[MODAL] Exception loading member:', err);
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const dashboardType = memberData?.dashboard_type || memberData?.dashboard_mode || 'guided';

  const renderDashboard = () => {
    if (loading) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px'
        }}>
          <div style={{ textAlign: 'center', color: 'var(--text-color, #5a4033)' }}>
            Loading dashboard...
          </div>
        </div>
      );
    }

    if (error || !memberData) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            background: 'rgba(244, 67, 54, 0.1)',
            borderRadius: '12px',
            maxWidth: '400px'
          }}>
            <h3 style={{ color: '#c00', marginBottom: '0.5rem' }}>Error</h3>
            <p style={{ margin: 0, color: '#666' }}>{error || 'Member not found'}</p>
          </div>
        </div>
      );
    }

    switch (dashboardType) {
      case 'play':
        return <PlayModeDashboard familyMemberId={memberId} />;
      case 'guided':
        return <GuidedModeDashboard familyMemberId={memberId} />;
      case 'independent':
        return <IndependentModeDashboard familyMemberId={memberId} />;
      case 'additional_adult':
        return <AdditionalAdultDashboard familyMemberId={memberId} familyId={memberData.family_id} />;
      default:
        return <GuidedModeDashboard familyMemberId={memberId} />;
    }
  };

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column'
      }}
      onClick={(e) => {
        // Close when clicking backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Modal Container - applies member's theme inside only */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          right: '1rem',
          bottom: '1rem',
          background: 'var(--background-color, #fff4ec)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--accent-color, #d4e3d9)',
            background: 'var(--background-color, #fff4ec)',
            flexShrink: 0
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'var(--text-color, #5a4033)',
              fontFamily: 'var(--font-heading, "The Seasons"), "Playfair Display", serif'
            }}
          >
            {memberData?.name ? `${memberData.name}'s Dashboard` : 'Loading...'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-color, #5a4033)',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'none';
            }}
            title="Close (Esc)"
          >
            <X size={24} />
          </button>
        </div>

        {/* Dashboard Content */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            background: 'var(--background-color, #fff4ec)'
          }}
        >
          {renderDashboard()}
        </div>
      </div>
    </div>
  );

  // Render to portal
  const modalRoot = document.getElementById('modal-root') || document.body;
  return ReactDOM.createPortal(modalContent, modalRoot);
};

export default MemberDashboardModal;
