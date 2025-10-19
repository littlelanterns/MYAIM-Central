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
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--background-color, #fff4ec)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        style={{
          maxWidth: '500px',
          width: '100%',
          background: 'var(--background-color, #fff4ec)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          border: '1px solid var(--accent-color, #d4e3d9)',
          overflow: 'hidden'
        }}
      >
        {/* Beta Badge & Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, var(--primary-color, #68a395), var(--secondary-color, #d6a461))',
            color: 'white',
            padding: '2rem 1.5rem',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.5rem 1rem',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '1rem'
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                background: 'white',
                borderRadius: '50%',
                marginRight: '0.5rem'
              }}
            />
            Beta Testing
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Welcome to AIMfM Beta
          </h1>
          <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>
            Sign in with your beta testing credentials
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ padding: '2rem 1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {error && (
              <div
                style={{
                  background: 'rgba(244, 67, 54, 0.1)',
                  border: '2px solid #f44336',
                  color: '#d32f2f',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              >
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--text-color, #5a4033)',
                  marginBottom: '0.5rem'
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'white',
                  border: '2px solid var(--accent-color, #d4e3d9)',
                  color: 'var(--text-color, #5a4033)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary-color, #68a395)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(104, 163, 149, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--accent-color, #d4e3d9)';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Enter your beta testing email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--text-color, #5a4033)',
                  marginBottom: '0.5rem'
                }}
              >
                Temporary Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'white',
                  border: '2px solid var(--accent-color, #d4e3d9)',
                  color: 'var(--text-color, #5a4033)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary-color, #68a395)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(104, 163, 149, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--accent-color, #d4e3d9)';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Enter your temporary password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, var(--primary-color, #68a395), var(--secondary-color, #d6a461))',
                color: 'white',
                padding: '0.875rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '1rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
              onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid white',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      marginRight: '0.5rem'
                    }}
                  />
                  Signing In...
                </div>
              ) : (
                'Sign In to Beta'
              )}
            </button>
          </div>
        </form>

        {/* Beta Testing Info */}
        <div style={{ padding: '0 1.5rem 1.5rem' }}>
          <div
            style={{
              padding: '1rem',
              background: 'rgba(104, 163, 149, 0.1)',
              border: '1px solid var(--primary-color, #68a395)',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}
          >
            <h3
              style={{
                fontWeight: '600',
                color: 'var(--primary-color, #68a395)',
                marginBottom: '0.5rem',
                fontSize: '0.875rem'
              }}
            >
              Beta Testing Guidelines
            </h3>
            <ul style={{ fontSize: '0.8rem', color: 'var(--text-color, #5a4033)', opacity: 0.8 }}>
              <li style={{ marginBottom: '0.25rem' }}>• Explore all features and provide feedback</li>
              <li style={{ marginBottom: '0.25rem' }}>• Use the "Hit a Snag?" button when you encounter issues</li>
              <li>• Your family setup is required before accessing the system</li>
            </ul>
          </div>

          {/* Support Contact */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-color, #5a4033)', opacity: 0.7 }}>
              Need help? Contact{' '}
              <a
                href="mailto:aimagicformoms@gmail.com"
                style={{
                  color: 'var(--primary-color, #68a395)',
                  textDecoration: 'none'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                aimagicformoms@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetaLogin;