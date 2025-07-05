import React, { useState } from 'react';
import {
  CheckIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  ArrowUpIcon,
  SparklesIcon,
  CogIcon,
  ExternalLinkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription, useSubscriptionUsage } from '@/hooks/useSubscription';
import { SUBSCRIPTION_PLANS, redirectToStripePayment } from '@/lib/stripe';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const { data: subscription, isLoading: subscriptionLoading } = useSubscription();
  const { data: usage, isLoading: usageLoading } = useSubscriptionUsage();
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const currentPlan = subscription?.plan || 'free';
  const isActive = subscription?.status === 'active';

  const handleUpgrade = async (planId: string) => {
    try {
      setUpgrading(planId);
      redirectToStripePayment(planId as keyof typeof SUBSCRIPTION_PLANS);
      toast.success('Redirecting to Stripe checkout...');
    } catch (error: any) {
      console.error('Upgrade error:', error);
      toast.error(error.message || 'Failed to start upgrade process');
    } finally {
      setUpgrading(null);
    }
  };

  const handleManageBilling = () => {
    if (subscription?.stripe_customer_id) {
      // Redirect to Stripe customer portal
      window.open('https://billing.stripe.com/p/login/test_your_portal_link', '_blank');
    } else {
      toast.error('No billing information found');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  if (subscriptionLoading || usageLoading) {
    return <LoadingSpinner text="Loading subscription details..." />;
  }

  return (
    <div className="space-y-8 pt-16">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subscription</h1>
        <p className="text-gray-600 mt-1">Manage your billing and subscription plan</p>
      </div>

      {/* Current Plan Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isActive 
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
            {subscription?.stripe_customer_id && (
              <button
                onClick={handleManageBilling}
                className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <CogIcon className="w-4 h-4 mr-1" />
                Manage Billing
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {SUBSCRIPTION_PLANS[currentPlan].name} Plan
            </h3>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              ${SUBSCRIPTION_PLANS[currentPlan].price}
              <span className="text-base font-normal text-gray-600">/month</span>
            </p>
            {subscription?.current_period_end && (
              <div className="flex items-center text-sm text-gray-600 mb-4">
                <CalendarDaysIcon className="w-4 h-4 mr-2" />
                Next billing: {formatDate(subscription.current_period_end)}
              </div>
            )}
          </div>

          {usage && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Usage This Month</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Invoices</span>
                    <span>
                      {usage.invoicesThisMonth} / {
                        SUBSCRIPTION_PLANS[currentPlan].limits.invoices === -1 
                          ? 'Unlimited' 
                          : SUBSCRIPTION_PLANS[currentPlan].limits.invoices
                      }
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        getUsagePercentage(usage.invoicesThisMonth, SUBSCRIPTION_PLANS[currentPlan].limits.invoices) > 80
                          ? 'bg-red-500'
                          : getUsagePercentage(usage.invoicesThisMonth, SUBSCRIPTION_PLANS[currentPlan].limits.invoices) > 60
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ 
                        width: `${getUsagePercentage(
                          usage.invoicesThisMonth, 
                          SUBSCRIPTION_PLANS[currentPlan].limits.invoices
                        )}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Clients</span>
                    <span>
                      {usage.totalClients} / {
                        SUBSCRIPTION_PLANS[currentPlan].limits.clients === -1 
                          ? 'Unlimited' 
                          : SUBSCRIPTION_PLANS[currentPlan].limits.clients
                      }
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ 
                        width: `${getUsagePercentage(
                          usage.totalClients, 
                          SUBSCRIPTION_PLANS[currentPlan].limits.clients
                        )}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Available Plans */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(SUBSCRIPTION_PLANS).map(([planId, plan]) => {
            const isCurrentPlan = currentPlan === planId;
            const isPopular = planId === 'pro';
            const isUpgrading = upgrading === planId;
            
            return (
              <div
                key={planId}
                className={`relative bg-white rounded-lg border-2 p-6 ${
                  isCurrentPlan
                    ? 'border-green-500 ring-2 ring-green-200'
                    : isPopular
                    ? 'border-blue-500'
                    : 'border-gray-200 hover:border-gray-300'
                } transition-all`}
              >
                {isPopular && (
                  <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    <SparklesIcon className="w-4 h-4 mr-1" />
                    Most Popular
                  </span>
                )}

                {isCurrentPlan && (
                  <span className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Current
                  </span>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(planId)}
                  disabled={isCurrentPlan || isUpgrading || planId === 'free'}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                    isCurrentPlan
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : planId === 'free'
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isCurrentPlan ? (
                    'Current Plan'
                  ) : planId === 'free' ? (
                    'Free Plan'
                  ) : isUpgrading ? (
                    'Redirecting...'
                  ) : (
                    <>
                      Upgrade to {plan.name}
                      <ExternalLinkIcon className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Usage Warning */}
      {usage && currentPlan === 'free' && usage.remainingInvoices <= 2 && usage.remainingInvoices > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <ArrowUpIcon className="w-6 h-6 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-yellow-900 mb-2">
                Approaching Plan Limits
              </h3>
              <p className="text-yellow-800 mb-4">
                You have {usage.remainingInvoices} invoice{usage.remainingInvoices === 1 ? '' : 's'} remaining this month. 
                Upgrade to Pro for unlimited invoices and premium features.
              </p>
              <button
                onClick={() => handleUpgrade('pro')}
                disabled={upgrading === 'pro'}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                {upgrading === 'pro' ? 'Redirecting...' : 'Upgrade to Pro'}
                <ExternalLinkIcon className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Billing Information */}
      {subscription?.stripe_customer_id && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing Information</h2>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <CreditCardIcon className="w-8 h-8 text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Stripe Customer</p>
                <p className="text-sm text-gray-600">Manage your billing and payment methods</p>
              </div>
            </div>
            <button
              onClick={handleManageBilling}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              Manage
              <ExternalLinkIcon className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;