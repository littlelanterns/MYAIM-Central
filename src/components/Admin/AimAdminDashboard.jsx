import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import LibraryAdmin from './LibraryAdmin.jsx';
import BetaAdmin from './BetaAdmin.jsx';

const AimAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('library');
  const [userEmail, setUserEmail] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const superAdminEmails = [
    'tenisewertman@gmail.com',
    'aimagicformoms@gmail.com', 
    '3littlelanterns@gmail.com'
  ];

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.log('No authenticated user');
        setLoading(false);
        return;
      }

      setUserEmail(user.email);
      const isSuper = superAdminEmails.includes(user.email);
      setIsSuperAdmin(isSuper);
      
      // If not super admin, redirect to login
      if (!isSuper) {
        console.log('User is not a super admin:', user.email);
      }
      
      console.log('Admin check:', { email: user.email, isSuper });
    } catch (error) {
      console.error('Error checking admin access:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            Only super administrators can access this area.
          </p>
          {userEmail ? (
            <p className="text-sm text-gray-500">
              Signed in as: {userEmail}
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              Please sign in with an administrator account.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AIM Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Super Admin Access • {userEmail}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                Super Admin
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'library' && (
          <div>
            <LibraryAdmin />
          </div>
        )}
        
        {activeTab === 'beta' && (
          <div>
            <BetaAdmin />
          </div>
        )}
        
        {activeTab === 'system' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">System Settings</h3>
            <p className="text-gray-600 mb-4">
              System configuration and maintenance tools coming soon.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-800">
                Future features: Database management, user role administration, 
                system monitoring, and configuration tools.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AimAdminDashboard;