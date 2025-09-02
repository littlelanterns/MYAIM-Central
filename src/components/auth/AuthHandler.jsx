import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const AuthHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Auth error:', error);
          navigate('/login');
          return;
        }

        if (user) {
          // Check if user is super admin
          const superAdminEmails = [
            'tenisewertman@gmail.com',
            'aimagicformoms@gmail.com',
            '3littlelanterns@gmail.com'
          ];

          if (superAdminEmails.includes(user.email)) {
            navigate('/aim-admin');
          } else {
            navigate('/');
          }
        } else {
          navigate('/login');
        }

      } catch (error) {
        console.error('Auth handler error:', error);
        navigate('/login');
      }
    };

    // Handle auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const superAdminEmails = [
          'tenisewertman@gmail.com',
          'aimagicformoms@gmail.com',
          '3littlelanterns@gmail.com'
        ];

        if (superAdminEmails.includes(session.user.email)) {
          navigate('/aim-admin');
        } else {
          navigate('/');
        }
      } else if (event === 'SIGNED_OUT') {
        navigate('/login');
      }
    });

    // Initial check
    handleAuthCallback();

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthHandler;