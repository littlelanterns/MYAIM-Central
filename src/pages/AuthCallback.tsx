import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { primaryBrand, colorPalette } from '../styles/colors';

/**
 * AuthCallback handles redirects from Supabase auth flows:
 * - Email confirmation
 * - Password reset
 * - OAuth callbacks
 *
 * It checks the user's setup status and redirects appropriately.
 */
const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the current session (Supabase handles token exchange automatically)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session?.user) {
          // No session - might be an invalid/expired link
          // Try to listen for auth state change
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              await checkSetupAndRedirect(session.user.id);
              subscription.unsubscribe();
            } else if (event === 'PASSWORD_RECOVERY') {
              // Password recovery flow - redirect to reset password page
              navigate('/reset-password');
              subscription.unsubscribe();
            }
          });

          // Give it a few seconds, then show error if no auth event
          setTimeout(() => {
            if (status === 'loading') {
              setStatus('error');
              setErrorMessage('Your session has expired. Please try logging in again.');
            }
          }, 5000);
          return;
        }

        // We have a session - check setup status and redirect
        await checkSetupAndRedirect(session.user.id);

      } catch (error: any) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setErrorMessage(error.message || 'Something went wrong. Please try again.');
      }
    };

    const checkSetupAndRedirect = async (userId: string) => {
      // Check if this is a beta user and their setup status
      const { data: betaUser } = await supabase
        .from('beta_users')
        .select('setup_completed')
        .eq('user_id', userId)
        .maybeSingle();

      if (betaUser && !betaUser.setup_completed) {
        // Beta user hasn't completed setup - go to family setup
        navigate('/beta/family-setup');
      } else {
        // Setup complete or not a beta user - go to command center
        navigate('/commandcenter');
      }
    };

    handleAuthCallback();
  }, [navigate, status]);

  if (status === 'error') {
    return (
      <div style={{
        minHeight: '100vh',
        background: colorPalette.neutrals.cream,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}>
        <div style={{
          maxWidth: '500px',
          width: '100%',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: `3px solid ${colorPalette.red.medium}`,
          padding: '3rem',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            color: primaryBrand.warmEarth,
            marginBottom: '1rem'
          }}>
            Oops!
          </h1>
          <p style={{
            fontSize: '1rem',
            color: colorPalette.brown.dark,
            marginBottom: '2rem'
          }}>
            {errorMessage}
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: primaryBrand.sageTeal,
              color: 'white',
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: colorPalette.neutrals.cream,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: `3px solid ${primaryBrand.sageTeal}`,
        padding: '3rem',
        textAlign: 'center'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: `4px solid ${primaryBrand.sageTeal}`,
          borderTopColor: 'transparent',
          borderRadius: '50%',
          margin: '0 auto 1.5rem',
          animation: 'spin 1s linear infinite'
        }} />
        <h1 style={{
          fontSize: '1.5rem',
          color: primaryBrand.warmEarth,
          marginBottom: '0.5rem'
        }}>
          Confirming your account...
        </h1>
        <p style={{
          fontSize: '1rem',
          color: colorPalette.brown.medium
        }}>
          Please wait while we set things up.
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default AuthCallback;
