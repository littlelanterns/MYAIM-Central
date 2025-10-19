import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

const BetaUpgradeModal = ({ isOpen, onClose, currentTier, targetTier, onUpgrade }) => {
  const [betaCode, setBetaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const tierInfo = {
    essential: {
      name: 'Essential',
      color: 'bg-blue-500',
      description: 'Perfect for getting organized',
      features: ['Basic Family Dashboard', 'Simple Task Management', 'Essential Library Access']
    },
    enhanced: {
      name: 'Enhanced',
      color: 'bg-purple-500',
      description: 'More features for busy families',
      features: ['Advanced Dashboards', 'Smart Scheduling', 'Extended Library', 'Family Archive']
    },
    'full-magic': {
      name: 'Full Magic',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      description: 'AI-powered family management',
      features: ['LiLa™ AI Assistant', 'Intelligent Automation', 'Predictive Planning', 'Full Library Access']
    },
    creator: {
      name: 'Creator',
      color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      description: 'Create and share with the community',
      features: ['Everything in Full Magic', 'Create Content', 'Share Templates', 'Community Features', 'Priority Support']
    }
  };

  const handleUpgrade = async () => {
    if (betaCode.toLowerCase() !== 'beta') {
      setError('Please enter the beta access code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Update family's subscription tier in the existing families table
      const { error: updateError } = await supabase
        .from('families')
        .update({
          subscription_tier: targetTier,
          updated_at: new Date().toISOString()
        })
        .eq('auth_user_id', user.id);

      if (updateError) throw updateError;

      // Log the upgrade activity
      await supabase.from('user_activity_log').insert({
        user_id: user.id,
        page_visited: window.location.pathname,
        action_taken: `beta_tier_upgrade_${currentTier}_to_${targetTier}`,
        metadata: { 
          from_tier: currentTier, 
          to_tier: targetTier,
          upgrade_method: 'beta_code'
        }
      });

      // Call the success callback
      if (onUpgrade) {
        await onUpgrade(targetTier);
      }

      setBetaCode('');
      onClose();

    } catch (err) {
      console.error('Beta upgrade error:', err);
      setError('There was an error upgrading your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const targetTierInfo = tierInfo[targetTier];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        {/* Beta Testing Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold mb-3">
            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
            Beta Testing
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Upgrade to {targetTierInfo?.name}
          </h2>
          <p className="text-gray-600 text-sm">
            Test the premium features before they go live
          </p>
        </div>

        {/* Tier Information */}
        <div className="mb-6">
          <div className={`${targetTierInfo?.color} text-white p-4 rounded-lg mb-4`}>
            <h3 className="text-lg font-semibold mb-1">{targetTierInfo?.name}</h3>
            <p className="text-sm opacity-90">{targetTierInfo?.description}</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">What you'll get:</h4>
            <ul className="space-y-1">
              {targetTierInfo?.features?.map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Beta Access Section */}
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium">Beta Testing Instructions</p>
                <p className="mt-1">
                  Since you're a beta tester, you won't be charged. Simply enter the beta access code to unlock these features.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="betaCode" className="block text-sm font-medium text-gray-700 mb-2">
              Beta Access Code
            </label>
            <input
              type="text"
              id="betaCode"
              value={betaCode}
              onChange={(e) => setBetaCode(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter beta access code"
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpgrade}
            disabled={loading || !betaCode}
            className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Upgrading...
              </div>
            ) : (
              'Upgrade Account'
            )}
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Need the beta code? Contact{' '}
            <a href="mailto:aimagicformoms@gmail.com" className="text-purple-600 hover:underline">
              aimagicformoms@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BetaUpgradeModal;