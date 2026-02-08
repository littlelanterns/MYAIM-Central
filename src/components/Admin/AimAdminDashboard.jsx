import React, { useState, useEffect } from 'react';
import LibraryAdmin from './LibraryAdmin.jsx';
import BetaAdmin from './BetaAdmin.jsx';
import ArticleAdmin from './ArticleAdmin.tsx';
import TestimonialAdmin from './TestimonialAdmin.tsx';

const AimAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('articles');
  const [userEmail, setUserEmail] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = () => {
    try {
      // Check session's is_admin flag from localStorage (set during login)
      // This avoids database queries that might hang due to RLS
      const sessionStr = localStorage.getItem('aimfm_session');

      if (!sessionStr) {
        console.log('[ADMIN] No session found');
        setLoading(false);
        return;
      }

      const session = JSON.parse(sessionStr);
      const email = session.email || session.user_email || '';
      setUserEmail(email);

      // Check is_admin flag from session (set during login based on staff_permissions)
      const isAdmin = session.is_admin === true;
      setIsSuperAdmin(isAdmin);

      console.log('[ADMIN] Access check:', { email, isAdmin });

      if (!isAdmin) {
        console.log('[ADMIN] User is not an admin:', email);
      }
    } catch (error) {
      console.error('[ADMIN] Error checking admin access:', error);
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

      {/* Tab Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('articles')}
              className={`${
                activeTab === 'articles'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Articles
            </button>
            <button
              onClick={() => setActiveTab('testimonials')}
              className={`${
                activeTab === 'testimonials'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Testimonials
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`${
                activeTab === 'library'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Library
            </button>
            <button
              onClick={() => setActiveTab('beta')}
              className={`${
                activeTab === 'beta'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Beta Users
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`${
                activeTab === 'system'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              System
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'articles' && (
          <div>
            <ArticleAdmin />
          </div>
        )}

        {activeTab === 'testimonials' && (
          <div>
            <TestimonialAdmin />
          </div>
        )}

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