/**
 * Pricing Constants for MyAIM-Central
 *
 * Regular pricing for all users, plus locked Founding Family rates
 * for the first 100 paid subscribers.
 */

export interface PricingTier {
  name: string;
  regularPrice: number;
  foundingFamilyPrice: number;
  description: string;
  features: string[];
}

export const PRICING_TIERS: Record<string, PricingTier> = {
  essential: {
    name: 'Essential',
    regularPrice: 9.99,
    foundingFamilyPrice: 7.99,
    description: 'Perfect for getting started with AI',
    features: [
      'Core tutorials in Library',
      'Basic prompt tools',
      'Limited context storage (5GB)',
      'Manual context export',
      'Up to 5 active Best Intentions',
      'Email support'
    ]
  },
  enhanced: {
    name: 'Enhanced',
    regularPrice: 16.99,
    foundingFamilyPrice: 13.99,
    description: 'For families serious about AI optimization',
    features: [
      'All tutorials',
      'All basic tools',
      'Full context management (50GB)',
      'LiLa prompt optimization',
      'Unlimited Best Intentions',
      'Dashboard widgets',
      'Priority email support',
      'Family member dashboards & logins'
    ]
  },
  fullMagic: {
    name: 'Full Magic',
    regularPrice: 24.99,
    foundingFamilyPrice: 21.99,
    description: 'Everything you need to amplify your brilliance',
    features: [
      'Everything in Enhanced',
      'Advanced AI tools',
      'Multi-AI panel integration',
      'Context presets & scenes',
      'Automation features',
      'Unlimited storage',
      'Priority chat support',
      'Advanced analytics',
      'Custom AI training'
    ]
  },
  creator: {
    name: 'Creator',
    regularPrice: 39.99,
    foundingFamilyPrice: 34.99,
    description: 'For power users and content creators',
    features: [
      'Everything in Full Magic',
      'Custom tool builder',
      'Marketplace access (sell tools)',
      'White-label options',
      'Advanced analytics & reporting',
      'API access',
      'Dedicated account manager',
      'Custom model training',
      'Revenue sharing program'
    ]
  }
};

export const FOUNDING_FAMILY_LIMIT = 100;

/**
 * Calculate the discount percentage for a tier
 */
export function getDiscountPercentage(tierKey: string): number {
  const tier = PRICING_TIERS[tierKey];
  if (!tier) return 0;

  const discount = ((tier.regularPrice - tier.foundingFamilyPrice) / tier.regularPrice) * 100;
  return Math.round(discount);
}

/**
 * Get the price for a tier based on founding family status
 */
export function getTierPrice(tierKey: string, isFoundingFamily: boolean): number {
  const tier = PRICING_TIERS[tierKey];
  if (!tier) return 0;

  return isFoundingFamily ? tier.foundingFamilyPrice : tier.regularPrice;
}

/**
 * Format price as currency
 */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}
