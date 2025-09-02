import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const BetaLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Sign in the user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Check if user is a beta user
      const { data: betaUser, error: betaError } = await supabase
        .from('beta_users')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      if (betaError) {
        // Not a beta user
        await supabase.auth.signOut();
        throw new Error('This account is not authorized for beta testing. Please contact support.');
      }

      // Check if family setup is completed
      if (!betaUser.setup_completed) {
        navigate('/beta/family-setup');
      } else {
        navigate('/');
      }

      // Log the activity
      await supabase.from('user_activity_log').insert({
        user_id: authData.user.id,
        page_visited: '/beta/login',
        action_taken: 'login_success',
        session_id: authData.session.access_token.slice(-12),
      });

    } catch (err) {
      setError(err.message);
      console.error('Beta login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        {/* Beta Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold mb-4">
            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
            Beta Testing
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to AIMfM Beta</h1>
          <p className="text-gray-600 text-sm">
            Sign in with the credentials provided by your beta coordinator
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your beta testing email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Temporary Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your temporary password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing In...
              </div>
            ) : (
              'Sign In to Beta'
            )}
          </button>
        </form>

        {/* Beta Testing Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Beta Testing Guidelines</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Explore all features and provide feedback</li>
            <li>• Use the "Hit a Snag?" button when you encounter issues</li>
            <li>• Your family setup is required before accessing the system</li>
          </ul>
        </div>

        {/* Support Contact */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact your beta coordinator or{' '}
            <a href="mailto:beta-support@aimfm.app" className="text-purple-600 hover:underline">
              beta-support@aimfm.app
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BetaLogin;