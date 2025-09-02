import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import './LibraryAdmin.css';

const BetaAdmin = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [betaUsers, setBetaUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadBetaUsers();
    loadFeedback();
  }, []);

  const loadBetaUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('beta_user_overview')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBetaUsers(data || []);
    } catch (error) {
      console.error('Error loading beta users:', error);
    }
  };

  const loadFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback_dashboard')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedback(data || []);
    } catch (error) {
      console.error('Error loading feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBetaUser = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUserEmail,
        password: newUserPassword,
        user_metadata: {
          is_beta_user: 'true',
          created_by_admin: (await supabase.auth.getUser()).data.user.id
        }
      });

      if (authError) throw authError;

      // The beta_users entry will be created automatically by the trigger
      // Reload the users list
      await loadBetaUsers();
      
      setNewUserEmail('');
      setNewUserPassword('');
      setShowCreateUser(false);
      alert('Beta user created successfully!');

    } catch (error) {
      console.error('Error creating beta user:', error);
      alert('Error creating beta user: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  const updateUserStatus = async (userId, newStatus) => {
    try {
      const { error } = await supabase
        .from('beta_users')
        .update({ status: newStatus })
        .eq('user_id', userId);

      if (error) throw error;
      await loadBetaUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Error updating user status');
    }
  };

  const updateFeedbackStatus = async (feedbackId, newStatus, response = '') => {
    try {
      const currentUser = await supabase.auth.getUser();
      const updateData = { 
        status: newStatus,
        admin_id: currentUser.data.user.id
      };
      
      if (response) {
        updateData.admin_response = response;
      }

      const { error } = await supabase
        .from('feedback_submissions')
        .update(updateData)
        .eq('id', feedbackId);

      if (error) throw error;
      await loadFeedback();
    } catch (error) {
      console.error('Error updating feedback status:', error);
      alert('Error updating feedback status');
    }
  };

  const generateTempPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUserPassword(password);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'blocking': return 'bg-red-100 text-red-800 border-red-200';
      case 'annoying': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'minor': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getIssueTypeIcon = (type) => {
    switch (type) {
      case 'broken': return '🔧';
      case 'confusing': return '🤔';
      case 'missing': return '➕';
      case 'suggestion': return '💡';
      default: return '📝';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading beta admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      {/* Header */}
      <div className="admin-header">
        <h1>Beta Testing Administration</h1>
        <p>Manage beta users and review feedback</p>
        
        <div className="admin-nav">
          <button
            className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Beta Users ({betaUsers.length})
          </button>
          <button
            className={`nav-btn ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedback')}
          >
            Feedback ({feedback.filter(f => f.status === 'new').length} new)
          </button>
        </div>
      </div>


      {/* Beta Users Tab */}
      {activeTab === 'users' && (
        <div className="form-section">
          <div className="flex justify-between items-center mb-6">
            <h2>Beta Users</h2>
            <button
              onClick={() => setShowCreateUser(true)}
              className="submit-btn"
            >
              ✨ Create Beta User
            </button>
          </div>

          {/* Create User Modal */}
          {showCreateUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="form-section max-w-md w-full">
                <h3 style={{color: 'var(--primary-color, #68a395)', marginBottom: '25px', fontSize: '1.5rem'}}>✨ Create Beta User</h3>
                <form onSubmit={createBetaUser} className="tutorial-form">
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      required
                      placeholder="beta.user@example.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Temporary Password</label>
                    <div style={{display: 'flex', gap: '10px'}}>
                      <input
                        type="text"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        required
                        placeholder="Enter temporary password"
                        style={{flex: 1}}
                      />
                      <button
                        type="button"
                        onClick={generateTempPassword}
                        className="submit-btn"
                        style={{padding: '8px 16px', fontSize: '0.9rem'}}
                      >
                        🎲 Generate
                      </button>
                    </div>
                  </div>
                  <div style={{display: 'flex', gap: '15px', marginTop: '25px'}}>
                    <button
                      type="button"
                      onClick={() => setShowCreateUser(false)}
                      className="submit-btn"
                      style={{flex: 1, background: 'var(--background-color, #fff4ec)', color: 'var(--text-color, #5a4033)', border: '2px solid var(--accent-color, #d4e3d9)'}}
                    >
                      ❌ Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="submit-btn"
                      style={{flex: 1, opacity: creating ? 0.7 : 1}}
                    >
                      {creating ? '⏳ Creating...' : '✨ Create User'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Setup</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {betaUsers.map((user) => (
                  <tr key={user.user_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.user_name || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' :
                        user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.setup_completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.setup_completed ? 'Complete' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>Actions: {user.total_actions}</div>
                      <div>Feedback: {user.feedback_count}</div>
                      <div className="text-xs text-gray-500">
                        Last: {user.last_activity_time ? new Date(user.last_activity_time).toLocaleDateString() : 'Never'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <select
                        value={user.status}
                        onChange={(e) => updateUserStatus(user.user_id, e.target.value)}
                        className="text-sm border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Feedback Tab */}
      {activeTab === 'feedback' && (
        <div className="form-section">
          <h2>💬 Feedback & Issues</h2>
          
          <div className="space-y-4">
            {feedback.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow border">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getIssueTypeIcon(item.issue_type)}</span>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {item.issue_type.charAt(0).toUpperCase() + item.issue_type.slice(1)} Issue
                        </h3>
                        <p className="text-sm text-gray-500">
                          From {item.user_name || 'Unknown User'} • {new Date(item.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        item.status === 'new' ? 'bg-blue-100 text-blue-800' :
                        item.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        item.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mb-4">
                    <p className="text-gray-900">{item.description}</p>
                  </div>

                  {/* Context */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-1">Page Context:</p>
                    <p className="text-sm text-gray-600">{item.page_url}</p>
                    {item.similar_issues_count > 1 && (
                      <p className="text-sm text-orange-600 mt-1">
                        ⚠️ {item.similar_issues_count} similar issues reported recently
                      </p>
                    )}
                  </div>

                  {/* Admin Response */}
                  {item.admin_response && (
                    <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-400">
                      <p className="text-sm font-medium text-green-800 mb-1">Admin Response:</p>
                      <p className="text-sm text-green-700">{item.admin_response}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    <select
                      value={item.status}
                      onChange={(e) => updateFeedbackStatus(item.id, e.target.value)}
                      className="text-sm border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    
                    <button
                      onClick={() => {
                        const response = prompt('Enter admin response:');
                        if (response) {
                          updateFeedbackStatus(item.id, 'resolved', response);
                        }
                      }}
                      className="text-sm text-purple-600 hover:text-purple-800"
                    >
                      Add Response
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {feedback.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No feedback submissions yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BetaAdmin;