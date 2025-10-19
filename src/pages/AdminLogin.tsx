import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔐 Login attempt started');
    console.log('📧 Email:', email);
    console.log('🔑 Supabase client:', supabase);
    setLoading(true);
    setError('');

    try {
      console.log('📞 Calling Supabase signInWithPassword...');
      // Step 1: Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('✅ Supabase response:', { authData, authError });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('No user data returned from authentication');
      }

      // Hardcoded super admin emails (always have access)
      const superAdminEmails = [
        'tenisewertman@gmail.com',
        'aimagicformoms@gmail.com',
        '3littlelanterns@gmail.com',
      ];

      const isSuperAdmin = superAdminEmails.includes(email.toLowerCase());

      // Step 2: Verify admin permissions
      const { data: permissions, error: permissionsError } = await supabase
        .from('staff_permissions')
        .select('permission_type, expires_at')
        .eq('user_id', authData.user.id)
        .eq('is_active', true);

      if (permissionsError) {
        console.error('Error checking permissions:', permissionsError);
      }

      // Check if user has any valid permissions
      const hasValidPermissions = permissions && permissions.length > 0 && permissions.some(
        (perm) => perm.expires_at === null || new Date(perm.expires_at) > new Date()
      );

      // If not super admin AND no valid permissions, deny access
      if (!isSuperAdmin && !hasValidPermissions) {
        await supabase.auth.signOut();
        throw new Error('Access denied. Admin permissions required.');
      }

      // Step 3: Get all active permission types
      const activePermissions = permissions
        ? permissions
            .filter((perm) => perm.expires_at === null || new Date(perm.expires_at) > new Date())
            .map((perm) => perm.permission_type)
        : [];

      // Super admins get all permissions
      if (isSuperAdmin && !activePermissions.includes('super_admin')) {
        activePermissions.push('super_admin');
      }

      // Step 4: Store session data
      const sessionData = {
        user_id: authData.user.id,
        email: authData.user.email,
        is_admin: true,
        admin_permissions: activePermissions,
        login_type: 'admin',
      };

      localStorage.setItem('aimfm_session', JSON.stringify(sessionData));
      localStorage.setItem('last_login_type', 'admin');

      // Step 5: Redirect to admin dashboard
      console.log('Admin login successful, redirecting to AIM-Admin');
      navigate('/aim-admin');

    } catch (err: any) {
      console.error('Admin login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
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
        {/* Header */}
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
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              marginBottom: '1rem'
            }}
          >
            <svg
              style={{ width: '32px', height: '32px', color: 'white' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Admin Portal
          </h1>
          <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>Admin Access Required</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ padding: '2rem 1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Error Message */}
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

            {/* Email Input */}
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
                Email
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
                placeholder="admin@aimfm.app"
              />
            </div>

            {/* Password Input */}
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
                Password
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
                placeholder="Enter your password"
              />
            </div>

            {/* Login Button */}
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
                  Authenticating...
                </div>
              ) : (
                'Admin Login'
              )}
            </button>
          </div>
        </form>

        {/* Info Box */}
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
              Admin Access
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-color, #5a4033)', opacity: 0.8 }}>
              Only authorized administrators can access this portal. If you need admin access, contact
              the system administrator.
            </p>
          </div>

          {/* Back Link */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-color, #5a4033)',
                opacity: 0.6,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'none'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.opacity = '0.6';
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              ← Back to main login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
