import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { stripePromise, createCheckoutSession, createCustomerPortalSession } from '@/lib/stripe';
import toast from 'react-hot-toast';

export interface StripeCustomer {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  subscription_id?: string;
  subscription_status?: string;
  subscription_plan?: string;
  current_period_end?: string;
  created_at: string;
  updated_at: string;
}

export const useStripeCustomer = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['stripe-customer', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('stripe_customers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data as StripeCustomer | null;
    },
    enabled: !!user,
  });
};

export const useCreateCheckoutSession = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ priceId, planId }: { priceId: string; planId: string }) => {
      if (!user) throw new Error('User not authenticated');

      // Get or create Stripe customer
      const { data: customer } = await supabase
        .from('stripe_customers')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .single();

      const sessionId = await createCheckoutSession(
        priceId,
        customer?.stripe_customer_id
      );

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe not loaded');

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw error;

      return sessionId;
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to start checkout');
    },
  });
};

export const useCreatePortalSession = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data: customer } = await supabase
        .from('stripe_customers')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .single();

      if (!customer?.stripe_customer_id) {
        throw new Error('No Stripe customer found');
      }

      const url = await createCustomerPortalSession(customer.stripe_customer_id);
      window.location.href = url;

      return url;
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to open billing portal');
    },
  });
};

export const useSubscriptionUsage = () => {
  const { user } = useAuth();
  const { data: customer } = useStripeCustomer();

  return useQuery({
    queryKey: ['subscription-usage', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // Get current month's invoice count
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString());

      if (error) throw error;

      // Get total clients count
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id);

      if (clientsError) throw clientsError;

      return {
        invoicesThisMonth: invoices?.length || 0,
        totalClients: clients?.length || 0,
        subscriptionPlan: customer?.subscription_plan || 'free',
        subscriptionStatus: customer?.subscription_status || 'inactive',
      };
    },
    enabled: !!user,
  });
};