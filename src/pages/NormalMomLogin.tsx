import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const NormalMomLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Step 1: Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('No user data returned from authentication');
      }

      // Step 2: Check if this is a beta-only user (should use /beta/login instead)
      const { data: betaUser } = await supabase
        .from('beta_users')
        .select('id, status, setup_completed')
        .eq('user_id', authData.user.id)
        .maybeSingle();

      // If beta user exists, check if they have a family
      if (betaUser) {
        const { data: family } = await supabase
          .from('families')
          .select('id')
          .eq('auth_user_id', authData.user.id)
          .maybeSingle();

        // Beta user without family should use beta login
        if (!family) {
          await supabase.auth.signOut();
          navigate('/beta/login');
          return;
        }
      }

      // Step 3: Load family context
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .select(`
          id,
          family_name,
          subscription_tier,
          family_members!inner (
            id,
            name,
            role,
            is_primary_parent
          )
        `)
        .eq('auth_user_id', authData.user.id)
        .eq('family_members.is_primary_parent', true)
        .maybeSingle();

      if (familyError) throw familyError;

      // Step 4: Check if family setup is complete
      if (!familyData) {
        // No family found - redirect to family setup
        console.log('No family found, redirecting to family setup');
        localStorage.setItem('last_login_type', 'normal');
        navigate('/family-setup');
        return;
      }

      // Step 5: Count family members to verify setup
      const { count: memberCount } = await supabase
        .from('family_members')
        .select('*', { count: 'exact', head: true })
        .eq('family_id', familyData.id);

      if (memberCount === 0) {
        // Family exists but no members - incomplete setup
        console.log('Family has no members, redirecting to family setup');
        localStorage.setItem('last_login_type', 'normal');
        navigate('/family-setup');
        return;
      }

      // Step 6: Store session data
      const familyMember = Array.isArray(familyData.family_members)
        ? familyData.family_members[0]
        : familyData.family_members;

      const sessionData = {
        user_id: authData.user.id,
        family_id: familyData.id,
        family_member_id: familyMember.id,
        role: familyMember.role,
        subscription_tier: familyData.subscription_tier,
        is_primary_parent: true,
        login_type: 'normal',
      };

      // Store in localStorage for quick access
      localStorage.setItem('aimfm_session', JSON.stringify(sessionData));
      localStorage.setItem('last_login_type', 'normal');

      // Set remember me (7 days vs 24 hours)
      if (rememberMe) {
        localStorage.setItem('remember_me', 'true');
      }

      // Step 7: Redirect to Command Center
      console.log('Login successful, redirecting to command center');
      navigate('/command-center');

    } catch (err: any) {
      console.error('Login error:', err);
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
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Welcome to MyAIM Central
          </h1>
          <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>
            Sign in to manage your family's journey
          </p>
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
                placeholder="your.email@example.com"
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

            {/* Remember Me */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: 'var(--primary-color, #68a395)',
                  marginRight: '0.5rem',
                  cursor: 'pointer'
                }}
              />
              <label
                htmlFor="remember"
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-color, #5a4033)',
                  cursor: 'pointer'
                }}
              >
                Remember me for 7 days
              </label>
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
                  Signing In...
                </div>
              ) : (
                'Login'
              )}
            </button>
          </div>
        </form>

        {/* Links */}
        <div style={{ padding: '0 1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'center' }}>
            <button
              onClick={() => {/* TODO: Implement password reset */}}
              style={{
                fontSize: '0.875rem',
                color: 'var(--primary-color, #68a395)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'none'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              Forgot password?
            </button>

            <div style={{ fontSize: '0.875rem', color: 'var(--text-color, #5a4033)', opacity: 0.7 }}>
              Don't have an account?{' '}
              <button
                onClick={() => {/* TODO: Navigate to signup */}}
                style={{
                  color: 'var(--primary-color, #68a395)',
                  fontWeight: '500',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'none'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                Sign up
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ position: 'relative', margin: '1.5rem 1.5rem' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '100%', borderTop: '1px solid var(--accent-color, #d4e3d9)' }} />
          </div>
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', fontSize: '0.875rem' }}>
            <span style={{ padding: '0 0.5rem', background: 'var(--background-color, #fff4ec)', color: 'var(--text-color, #5a4033)', opacity: 0.6 }}>
              OR
            </span>
          </div>
        </div>

        {/* Family Member Login Button */}
        <div style={{ padding: '0 1.5rem 1.5rem' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, var(--secondary-color, #d6a461), var(--primary-color, #68a395))',
              color: 'white',
              padding: '0.875rem 1.5rem',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '1rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              marginBottom: '1rem'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Login as Family Member
          </button>

          {/* Info Box */}
          <div
            style={{
              padding: '0.75rem 1rem',
              background: 'rgba(104, 163, 149, 0.1)',
              borderRadius: '8px',
              border: '1px solid var(--accent-color, #d4e3d9)'
            }}
          >
            <p style={{ fontSize: '0.75rem', color: 'var(--text-color, #5a4033)', opacity: 0.8, textAlign: 'center' }}>
              Family members (children/teens) should use "Login as Family Member" button above
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NormalMomLogin;
