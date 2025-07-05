import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/lib/stripe';
import toast from 'react-hot-toast';

export interface UserSubscription {
  plan: SubscriptionPlan;
  status: 'active' | 'inactive' | 'canceled' | 'past_due';
  current_period_start?: string;
  current_period_end?: string;
  stripe_customer_id?: string;
  subscription_id?: string;
}

export interface SubscriptionUsage {
  invoicesThisMonth: number;
  totalClients: number;
  canCreateInvoice: boolean;
  canCreateClient: boolean;
  remainingInvoices: number;
  remainingClients: number;
}

export const useSubscription = () => {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async (): Promise<UserSubscription> => {
      if (!user || !profile) throw new Error('User not authenticated');

      return {
        plan: (profile.subscription_plan as SubscriptionPlan) || 'free',
        status: profile.subscription_status as any || 'inactive',
        stripe_customer_id: profile.stripe_customer_id,
      };
    },
    enabled: !!user && !!profile,
  });
};

export const useSubscriptionUsage = () => {
  const { user } = useAuth();
  const { data: subscription } = useSubscription();

  return useQuery({
    queryKey: ['subscription-usage', user?.id, subscription?.plan],
    queryFn: async (): Promise<SubscriptionUsage> => {
      if (!user || !subscription) throw new Error('User or subscription not available');

      // Get current month's invoice count
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString());

      if (invoicesError) throw invoicesError;

      // Get total clients count
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id);

      if (clientsError) throw clientsError;

      const plan = SUBSCRIPTION_PLANS[subscription.plan];
      const invoicesThisMonth = invoices?.length || 0;
      const totalClients = clients?.length || 0;

      const canCreateInvoice = plan.limits.invoices === -1 || invoicesThisMonth < plan.limits.invoices;
      const canCreateClient = plan.limits.clients === -1 || totalClients < plan.limits.clients;

      const remainingInvoices = plan.limits.invoices === -1 ? -1 : Math.max(0, plan.limits.invoices - invoicesThisMonth);
      const remainingClients = plan.limits.clients === -1 ? -1 : Math.max(0, plan.limits.clients - totalClients);

      return {
        invoicesThisMonth,
        totalClients,
        canCreateInvoice,
        canCreateClient,
        remainingInvoices,
        remainingClients,
      };
    },
    enabled: !!user && !!subscription,
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  const { refreshProfile } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      plan, 
      status, 
      stripeCustomerId, 
      subscriptionId 
    }: {
      userId: string;
      plan: SubscriptionPlan;
      status: string;
      stripeCustomerId?: string;
      subscriptionId?: string;
    }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_plan: plan,
          subscription_status: status,
          stripe_customer_id: stripeCustomerId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;

      // Also update stripe_customers table if we have Stripe data
      if (stripeCustomerId) {
        const { error: stripeError } = await supabase
          .from('stripe_customers')
          .upsert({
            user_id: userId,
            stripe_customer_id: stripeCustomerId,
            subscription_id: subscriptionId,
            subscription_status: status,
            subscription_plan: plan,
            updated_at: new Date().toISOString(),
          });

        if (stripeError) console.warn('Failed to update stripe_customers:', stripeError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-usage'] });
      refreshProfile(); // Refresh the profile data in AuthContext
      toast.success('Subscription updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update subscription');
    },
  });
};

export const useCheckSubscriptionLimits = () => {
  const { data: usage } = useSubscriptionUsage();

  return {
    canCreateInvoice: usage?.canCreateInvoice ?? false,
    canCreateClient: usage?.canCreateClient ?? false,
    checkInvoiceLimit: () => {
      if (!usage?.canCreateInvoice) {
        toast.error('You have reached your monthly invoice limit. Please upgrade your plan.');
        return false;
      }
      return true;
    },
    checkClientLimit: () => {
      if (!usage?.canCreateClient) {
        toast.error('You have reached your client limit. Please upgrade your plan.');
        return false;
      }
      return true;
    },
  };
};