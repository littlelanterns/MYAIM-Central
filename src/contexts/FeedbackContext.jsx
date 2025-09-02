import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import HitASnagButton from '../components/feedback/HitASnagButton';

const FeedbackContext = createContext();

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};

export const FeedbackProvider = ({ children }) => {
  const [isBetaUser, setIsBetaUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkBetaStatus();
  }, []);

  const checkBetaStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsBetaUser(false);
        setLoading(false);
        return;
      }

      // Check if user is a beta user
      const { data: betaUser, error } = await supabase
        .from('beta_users')
        .select('id, status')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.log('Not a beta user or error checking status:', error.message);
        setIsBetaUser(false);
      } else {
        setIsBetaUser(betaUser?.status === 'active');
      }
    } catch (error) {
      console.error('Error checking beta status:', error);
      setIsBetaUser(false);
    } finally {
      setLoading(false);
    }
  };

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        checkBetaStatus();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    isBetaUser,
    loading,
    checkBetaStatus
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      {/* Show HitASnag button only for beta users */}
      {!loading && isBetaUser && <HitASnagButton />}
    </FeedbackContext.Provider>
  );
};

export default FeedbackProvider;