import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('Stripe publishable key not found. Payment features will be disabled.');
}

export const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      'Up to 5 invoices per month',
      'Basic invoice templates',
      'Client management',
      'PDF downloads'
    ],
    limits: {
      invoices: 5,
      clients: 10,
      templates: 1
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 19,
    priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID,
    paymentLink: import.meta.env.VITE_STRIPE_PRO_LINK,
    features: [
      'Unlimited invoices',
      'Premium templates',
      'Email automation',
      'Payment tracking',
      'Advanced reporting',
      'Priority support'
    ],
    limits: {
      invoices: -1, // unlimited
      clients: -1,
      templates: -1
    }
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 49,
    priceId: import.meta.env.VITE_STRIPE_BUSINESS_PRICE_ID,
    paymentLink: import.meta.env.VITE_STRIPE_BUSINESS_LINK,
    features: [
      'Everything in Pro',
      'Multi-user access',
      'API access',
      'Custom branding',
      'Advanced integrations',
      'Dedicated support'
    ],
    limits: {
      invoices: -1,
      clients: -1,
      templates: -1,
      users: 10
    }
  }
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;

// Helper function to create checkout session
export const createCheckoutSession = async (priceId: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      throw new Error('Not authenticated')
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        priceId,
        successUrl: `${window.location.origin}/subscription?success=true`,
        cancelUrl: `${window.location.origin}/subscription?canceled=true`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const { sessionId } = await response.json();
    return sessionId;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Helper function to create customer portal session
export const createCustomerPortalSession = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      throw new Error('Not authenticated')
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        returnUrl: `${window.location.origin}/subscription`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create portal session');
    }

    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
};

// Helper function to redirect to Stripe payment link
export const redirectToStripePayment = (planId: SubscriptionPlan) => {
  const plan = SUBSCRIPTION_PLANS[planId];
  if (plan.paymentLink) {
    window.open(plan.paymentLink, '_blank');
  } else {
    throw new Error(`No payment link configured for ${planId} plan`);
  }
};

// Helper function to upgrade subscription using Stripe Checkout
export const upgradeSubscription = async (planId: SubscriptionPlan) => {
  const plan = SUBSCRIPTION_PLANS[planId]
  
  if (!plan.priceId) {
    throw new Error(`No price ID configured for ${planId} plan`)
  }

  try {
    const sessionId = await createCheckoutSession(plan.priceId)
    
    if (!stripePromise) {
      throw new Error('Stripe not initialized')
    }

    const stripe = await stripePromise
    const { error } = await stripe!.redirectToCheckout({ sessionId })
    
    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Upgrade error:', error)
    throw error
  }
}