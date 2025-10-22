/**
 * ManageDashboardsModal Component
 * Central hub for managing family dashboards
 * Options: Add Dashboard, Edit Member, Browse Widgets, Customize Layouts, Settings
 * CRITICAL: CSS variables only - theme compatible
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Edit3, Grid, Layout, Settings, X } from 'lucide-react';
import './ManageDashboardsModal.css';

interface ManageDashboardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  available: boolean;
}

export const ManageDashboardsModal: React.FC<ManageDashboardsModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const menuOptions: MenuOption[] = [
    {
      id: 'add-dashboard',
      title: 'Add Dashboard',
      description: 'Create a new family member dashboard',
      icon: <UserPlus size={24} />,
      action: () => {
        navigate('/command-center?tab=family');
        onClose();
      },
      available: true
    },
    {
      id: 'edit-member',
      title: 'Edit Member',
      description: 'Update family member settings',
      icon: <Edit3 size={24} />,
      action: () => {
        navigate('/command-center?tab=family');
        onClose();
      },
      available: true
    },
    {
      id: 'browse-widgets',
      title: 'Browse Widgets',
      description: 'Add trackers and widgets to dashboards',
      icon: <Grid size={24} />,
      action: () => {
        // TODO: Navigate to Widget Catalogue when built
        console.log('Browse Widgets - Coming soon');
        onClose();
      },
      available: false // Will be true once Widget Catalogue is built
    },
    {
      id: 'customize-layouts',
      title: 'Customize Layouts',
      description: 'Adjust dashboard layouts and arrangement',
      icon: <Layout size={24} />,
      action: () => {
        console.log('Customize Layouts - Coming soon');
        onClose();
      },
      available: false
    },
    {
      id: 'dashboard-settings',
      title: 'Dashboard Settings',
      description: 'Configure dashboard preferences',
      icon: <Settings size={24} />,
      action: () => {
        console.log('Dashboard Settings - Coming soon');
        onClose();
      },
      available: false
    }
  ];

  return (
    <>
      {/* Overlay */}
      <div className="manage-dashboards-overlay" onClick={onClose} />

      {/* Modal */}
      <div className="manage-dashboards-modal">
        {/* Header */}
        <div className="modal-header">
          <h2>Manage Dashboards</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            <X size={24} />
          </button>
        </div>

        {/* Menu Options */}
        <div className="menu-options">
          {menuOptions.map((option) => (
            <button
              key={option.id}
              className={`menu-option ${option.available ? '' : 'disabled'}`}
              onClick={option.action}
              disabled={!option.available}
            >
              <div className="option-icon">{option.icon}</div>
              <div className="option-content">
                <h3>{option.title}</h3>
                <p>{option.description}</p>
                {!option.available && (
                  <span className="coming-soon-badge">Coming Soon</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <p>Manage your family's dashboards, widgets, and settings from one place</p>
        </div>
      </div>
    </>
  );
};

export default ManageDashboardsModal;
