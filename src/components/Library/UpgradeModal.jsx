/* 
 * AIMfM Library - Upgrade Modal Component
 * 
 * EMOJI POLICY: No emojis in this file or related Library components
 * Emojis should only be used on children's dashboards for age-appropriate UI
 * Use proper icons, symbols, or text instead
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const UpgradeModal = ({ 
  isOpen, 
  onClose, 
  tutorial, 
  currentUserTier = 'free',
  requiredTier = 'premium' 
}) => {
  const [subscriptionTiers, setSubscriptionTiers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadSubscriptionTiers();
    }
  }, [isOpen]);

  const loadSubscriptionTiers = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .order('tier_level', { ascending: true });

      if (error) throw error;
      setSubscriptionTiers(data || []);
    } catch (error) {
      console.error('Error loading subscription tiers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierDisplayName = (tierName) => {
    const tierMap = {
      'free': 'Free',
      'basic': 'Basic',
      'premium': 'Premium',
      'enterprise': 'Enterprise'
    };
    return tierMap[tierName] || tierName;
  };

  const getTierFeatures = (tierName) => {
    const features = {
      'free': [
        'Access to basic tutorials',
        'Community support',
        'Limited AI assistance'
      ],
      'basic': [
        'Access to intermediate tutorials',
        'Email support',
        'Standard AI assistance',
        'Progress tracking'
      ],
      'premium': [
        'Access to all tutorials',
        'Priority support',
        'Advanced AI assistance',
        'Progress tracking',
        'Exclusive content',
        'Early access to new tutorials'
      ],
      'enterprise': [
        'Everything in Premium',
        'Custom tutorials',
        'Team management',
        '24/7 dedicated support',
        'API access',
        'Custom integrations'
      ]
    };
    return features[tierName] || [];
  };

  const handleUpgrade = (tierName) => {
    // This would integrate with your existing subscription system
    // You might redirect to Stripe, show a payment form, etc.
    console.log(`Upgrading to ${tierName}`);
    
    // For now, we'll show an alert - replace with your actual upgrade flow
    alert(`Upgrade to ${getTierDisplayName(tierName)} coming soon! Contact support for early access.`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upgrade Required</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-content">
          {tutorial && (
            <div className="tutorial-preview">
              <div className="tutorial-thumbnail">
                <img 
                  src={tutorial.thumbnail_url || '/api/placeholder/120/80'} 
                  alt={tutorial.title}
                  onError={(e) => {
                    e.target.src = '/api/placeholder/120/80';
                  }}
                />
              </div>
              <div className="tutorial-info">
                <h3>"{tutorial.title}"</h3>
                <p>This tutorial requires a {getTierDisplayName(requiredTier)} subscription or higher.</p>
              </div>
            </div>
          )}

          <div className="current-plan">
            <p>Your current plan: <strong>{getTierDisplayName(currentUserTier)}</strong></p>
          </div>

          {loading ? (
            <div className="loading-tiers">Loading subscription options...</div>
          ) : (
            <div className="subscription-tiers">
              {subscriptionTiers
                .filter(tier => tier.tier_level > (subscriptionTiers.find(t => t.tier_name === currentUserTier)?.tier_level || 0))
                .map((tier) => (
                <div key={tier.id} className={`tier-card ${tier.tier_name === requiredTier ? 'recommended' : ''}`}>
                  {tier.tier_name === requiredTier && (
                    <div className="recommended-badge">Recommended</div>
                  )}
                  
                  <div className="tier-header">
                    <h3>{getTierDisplayName(tier.tier_name)}</h3>
                    <div className="tier-price">
                      <span className="price">${tier.monthly_price}</span>
                      <span className="period">/month</span>
                    </div>
                  </div>

                  <div className="tier-features">
                    {getTierFeatures(tier.tier_name).map((feature, index) => (
                      <div key={index} className="feature">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20,6 9,17 4,12"></polyline>
                        </svg>
                        {feature}
                      </div>
                    ))}
                  </div>

                  <button 
                    className="upgrade-btn"
                    onClick={() => handleUpgrade(tier.tier_name)}
                  >
                    Upgrade to {getTierDisplayName(tier.tier_name)}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="modal-footer">
            <p>Cancel anytime. All plans include a 7-day free trial.</p>
            <button className="contact-support" onClick={() => {
              // This would open your support system
              alert('Contact support: support@aimfm.com');
            }}>
              Questions? Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;