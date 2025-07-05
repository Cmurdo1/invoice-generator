import React from 'react';
import { Link } from 'react-router-dom';
import { useSubscriptionUsage } from '@/hooks/useSubscription';
import { SUBSCRIPTION_PLANS } from '@/lib/stripe';
import { LockClosedIcon, ArrowUpIcon } from '@heroicons/react/24/outline';

interface SubscriptionGuardProps {
  feature: 'invoice' | 'client';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
  feature,
  children,
  fallback,
}) => {
  const { data: usage, isLoading } = useSubscriptionUsage();

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 rounded h-8"></div>;
  }

  const canAccess = feature === 'invoice' ? usage?.canCreateInvoice : usage?.canCreateClient;

  if (!canAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <LockClosedIcon className="w-6 h-6 text-yellow-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium text-yellow-900 mb-2">
              {feature === 'invoice' ? 'Invoice Limit Reached' : 'Client Limit Reached'}
            </h3>
            <p className="text-yellow-800 mb-4">
              {feature === 'invoice' 
                ? `You've reached your monthly limit of ${usage?.invoicesThisMonth} invoices.`
                : `You've reached your limit of ${usage?.totalClients} clients.`
              } Upgrade to Pro for unlimited access.
            </p>
            <Link
              to="/subscription"
              className="inline-flex items-center bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <ArrowUpIcon className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

interface FeatureLimitWarningProps {
  feature: 'invoice' | 'client';
  className?: string;
}

export const FeatureLimitWarning: React.FC<FeatureLimitWarningProps> = ({
  feature,
  className = '',
}) => {
  const { data: usage } = useSubscriptionUsage();

  if (!usage) return null;

  const remaining = feature === 'invoice' ? usage.remainingInvoices : usage.remainingClients;
  const isUnlimited = remaining === -1;
  const isNearLimit = !isUnlimited && remaining <= 2 && remaining > 0;
  const isAtLimit = !isUnlimited && remaining <= 0;

  if (isUnlimited || (!isNearLimit && !isAtLimit)) return null;

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center">
        <ArrowUpIcon className="w-5 h-5 text-yellow-600 mr-2" />
        <div className="text-sm">
          {isAtLimit ? (
            <span className="text-yellow-800 font-medium">
              {feature === 'invoice' ? 'Invoice' : 'Client'} limit reached.
            </span>
          ) : (
            <span className="text-yellow-800">
              {remaining} {feature === 'invoice' ? 'invoice' : 'client'}
              {remaining === 1 ? '' : 's'} remaining this month.
            </span>
          )}
          <Link
            to="/subscription"
            className="text-yellow-700 hover:text-yellow-900 font-medium ml-2"
          >
            Upgrade →
          </Link>
        </div>
      </div>
    </div>
  );
};