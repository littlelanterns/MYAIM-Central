/**
 * DashboardSwitcher Component
 * Allows mom to switch between her views and view/edit as family members
 * Family Tablet Hub: Everyone can switch to their view from one device
 * Each member has an assigned dashboard mode (play/guided/independent)
 * CRITICAL: CSS variables only - theme compatible
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ChevronDown, User, Users, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './DashboardSwitcher.css';

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  custom_role?: string;
  dashboard_mode?: string;
  dashboard_type?: string;
}

interface DashboardOption {
  id: string;
  name: string;
  path: string;
  description: string;
  memberId?: string;
  dashboardMode?: string;
}

interface DashboardSwitcherProps {
  onManageDashboards?: () => void;
  onViewMemberDashboard?: (memberId: string) => void;
}

// Helper function to format dashboard type for display
const formatDashboardType = (dashboardType: string | undefined): string => {
  if (!dashboardType) return 'Guided Mode';

  const typeMap: Record<string, string> = {
    'play': 'Play Mode',
    'guided': 'Guided Mode',
    'independent': 'Independent Mode',
    'additional_adult': 'Partner Dashboard',
    'partner': 'Partner Dashboard'
  };

  return typeMap[dashboardType.toLowerCase()] || dashboardType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

// Helper function to format role for display
const formatRole = (role: string | undefined, customRole?: string): string => {
  if (!role) return '';

  const roleMap: Record<string, string> = {
    'primary_organizer': 'Mom',
    'partner': customRole || 'Husband',
    'child': 'Child',
    'teen': 'Teen',
    'out-of-nest': customRole || 'Adult Child',
    'special': customRole || 'Special'
  };

  return roleMap[role.toLowerCase()] || customRole || role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

const DashboardSwitcher: React.FC<DashboardSwitcherProps> = ({ onManageDashboards, onViewMemberDashboard }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [availableDashboards, setAvailableDashboards] = useState<DashboardOption[]>([]);
  const [currentDashboard, setCurrentDashboard] = useState<DashboardOption | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (currentUserId && userRole && familyMembers.length > 0) {
      buildDashboardList();
    }
  }, [currentUserId, userRole, familyMembers]);

  useEffect(() => {
    // Determine current dashboard based on path and query params
    findCurrentDashboard();
  }, [location.pathname, searchParams, availableDashboards]);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current user's member record
      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select('id, role, family_id')
        .eq('auth_user_id', user.id)
        .single();

      if (memberError) {
        console.error('Error loading user:', memberError);
        return;
      }

      setCurrentUserId(memberData.id);
      setUserRole(memberData.role);

      // Load all household family members if user is organizer or parent
      // Filter by in_household=true to exclude out-of-nest members (e.g., adult children living elsewhere)
      if (['primary_organizer', 'parent'].includes(memberData.role)) {
        const { data: familyData, error: familyError } = await supabase
          .from('family_members')
          .select('id, name, role, custom_role, dashboard_mode, dashboard_type')
          .eq('family_id', memberData.family_id)
          .eq('in_household', true)
          .order('name');

        if (familyError) {
          console.error('Error loading family members:', familyError);
          return;
        }

        setFamilyMembers(familyData || []);
      }
    } catch (error) {
      console.error('Error in loadUserData:', error);
    }
  };

  const buildDashboardList = () => {
    const dashboards: DashboardOption[] = [];

    // Always add Family Dashboard first
    dashboards.push({
      id: 'family',
      name: 'Family Dashboard',
      path: '/family-dashboard',
      description: 'Whole family overview'
    });

    // Add Personal Dashboard for organizers and parents
    if (['primary_organizer', 'parent'].includes(userRole!)) {
      dashboards.push({
        id: 'personal',
        name: 'Personal Dashboard',
        path: '/dashboard/personal',
        description: 'Your private space'
      });
    }

    // Add each family member's dashboard
    familyMembers.forEach(member => {
      if (member.id === currentUserId) return; // Skip self

      // Use dashboard_type as primary, fallback to dashboard_mode
      const mode = member.dashboard_type || member.dashboard_mode || 'guided';
      const displayMode = formatDashboardType(mode);
      const displayRole = formatRole(member.role, member.custom_role);
      dashboards.push({
        id: `member-${member.id}`,
        name: member.name,
        path: `/commandcenter/member/${member.id}`,
        description: displayRole ? `${displayRole} · ${displayMode}` : displayMode,
        memberId: member.id,
        dashboardMode: mode
      });
    });

    setAvailableDashboards(dashboards);
  };

  const findCurrentDashboard = () => {
    // Check if we're on a member dashboard (/member/id)
    const memberIdMatch = location.pathname.match(/\/member\/([a-f0-9-]+)/);

    if (memberIdMatch) {
      const memberId = memberIdMatch[1];
      const dashboard = availableDashboards.find(d => d.memberId === memberId);
      setCurrentDashboard(dashboard || availableDashboards[0]);
    } else {
      // We're on Family or Personal dashboard
      const dashboard = availableDashboards.find(d =>
        location.pathname.includes(d.path)
      );
      setCurrentDashboard(dashboard || availableDashboards[0]);
    }
  };

  const handleDashboardChange = (dashboard: DashboardOption) => {
    setIsOpen(false);

    // If this is a member dashboard and we have a modal callback, use it
    if (dashboard.memberId && onViewMemberDashboard) {
      onViewMemberDashboard(dashboard.memberId);
      return;
    }

    // Otherwise navigate normally
    navigate(dashboard.path);
  };

  const handleManageDashboards = () => {
    setIsOpen(false);
    if (onManageDashboards) {
      onManageDashboards();
    }
  };

  // Only show for organizers and parents
  if (!['primary_organizer', 'parent'].includes(userRole || '')) {
    return null;
  }

  // Don't show if no dashboards available
  if (!currentDashboard || availableDashboards.length <= 1) {
    return null;
  }

  return (
    <div className="dashboard-switcher">
      <button
        className="switcher-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="current-dashboard">
          <span className="dashboard-name">{currentDashboard.name}</span>
        </span>
        <ChevronDown
          size={20}
          className={`chevron ${isOpen ? 'open' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div className="switcher-overlay" onClick={() => setIsOpen(false)} />
          <div className="switcher-dropdown">
            <div className="dropdown-header">
              <h3>Switch View</h3>
            </div>

            <div className="dashboard-options">
              {availableDashboards.map((dashboard) => {
                const isActive = currentDashboard.id === dashboard.id;

                return (
                  <button
                    key={dashboard.id}
                    className={`dashboard-option ${isActive ? 'active' : ''}`}
                    onClick={() => handleDashboardChange(dashboard)}
                  >
                    <div className="option-content">
                      <div className="option-name">{dashboard.name}</div>
                      <div className="option-description">{dashboard.description}</div>
                    </div>
                    {isActive && (
                      <span className="active-indicator">✓</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="dropdown-footer">
              <button
                className="manage-dashboards-button"
                onClick={handleManageDashboards}
              >
                <Settings size={18} />
                <span>Manage Dashboards</span>
              </button>
              <small>
                Switch between family members to view and manage their dashboards
              </small>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardSwitcher;
