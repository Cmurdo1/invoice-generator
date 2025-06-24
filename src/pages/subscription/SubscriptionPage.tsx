import React, { useState, useEffect } from 'react';
import {
  CheckIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  limits: {
    monthly_invoices: number;
    clients: number;
    templates: number;
  };
}

interface SubscriptionData {
  subscription: {
    plan: string;
    status: string;
    current_period_start: string;
    current_period_end: string;
    plan_details: Plan;
  };
  usage: {
    invoices_this_month: number;
    total_invoices: number;
    total_clients: number;
  };
  limits: {
    monthly_invoices: number;
    clients: number;
    templates: number;
  };
}

const SubscriptionPage: React.FC = () => {
  const { user, token } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [changingPlan, setChangingPlan] = useState(false);

  useEffect(() => {
    fetchSubscriptionData();
    fetchAvailablePlans();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/subscriptions/current', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
    }
  };

  const fetchAvailablePlans = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/subscriptions/plans');
      
      if (response.ok) {
        const data = await response.json();
        setAvailablePlans(data.plans);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = (planId: string) => {
    if (planId === 'pro') {
      window.open('https://buy.stripe.com/5kQ4gzb0HdM31Ur1cz7kc00', '_blank');
    } else if (planId === 'business') {
      window.open('https://buy.stripe.com/6oUaEX3yffUb0QndZl7kc01', '_blank');
    }
  };

  const formatDate = (dateString: string) => {
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

  if (loading) {
    return <LoadingSpinner text="Loading subscription details..." />;
  }

  return (
    <div className="space-y-8 pt-16">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subscription</h1>
        <p className="text-gray-600 mt-1">Manage your billing and subscription plan</p>
      </div>

      {/* Current Plan */}
      {subscriptionData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              subscriptionData.subscription.status === 'active' 
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {subscriptionData.subscription.status.charAt(0).toUpperCase() + subscriptionData.subscription.status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {subscriptionData.subscription.plan_details.name} Plan
              </h3>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                ${subscriptionData.subscription.plan_details.price}
                <span className="text-base font-normal text-gray-600">/month</span>
              </p>
              <div className="flex items-center text-sm text-gray-600 mb-4">
                <CalendarDaysIcon className="w-4 h-4 mr-2" />
                Next billing: {formatDate(subscriptionData.subscription.current_period_end)}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Usage This Month</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Invoices</span>
                    <span>
                      {subscriptionData.usage.invoices_this_month} / {
                        subscriptionData.limits.monthly_invoices === -1 
                          ? 'Unlimited' 
                          : subscriptionData.limits.monthly_invoices
                      }
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${getUsagePercentage(
                          subscriptionData.usage.invoices_this_month, 
                          subscriptionData.limits.monthly_invoices
                        )}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Clients</span>
                    <span>
                      {subscriptionData.usage.total_clients} / {
                        subscriptionData.limits.clients === -1 
                          ? 'Unlimited' 
                          : subscriptionData.limits.clients
                      }
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${getUsagePercentage(
                          subscriptionData.usage.total_clients, 
                          subscriptionData.limits.clients
                        )}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border-2 border-green-500 p-6 relative">
            <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Most Popular
            </span>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Pro Plan</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">$9</span>
                <span className="text-gray-600">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <CheckIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">50 Invoices Per Month</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Basic templates</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Email support</span>
              </li>
            </ul>

            <button
              onClick={() => handlePlanChange('pro')}
              className="w-full py-3 px-4 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
            >
              Select Pro Plan
            </button>
          </div>

          <div className="bg-white rounded-lg border-2 border-gray-200 hover:border-green-300 p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Business Plan</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">$19</span>
                <span className="text-gray-600">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <CheckIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Unlimited invoices per month</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Premium templates</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Priority support</span>
              </li>
            </ul>

            <button
              onClick={(e) => {
                e.preventDefault();
                handlePlanChange('business');
              }}
              className="w-full py-3 px-4 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
            >
              Select Business Plan
            </button>
          </div>
        </div>
      </div>

      {/* Billing Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing Information</h2>
        
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <CreditCardIcon className="w-8 h-8 text-gray-400 mr-3" />
            <div>
              <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
              <p className="text-sm text-gray-600">Expires 12/25</p>
            </div>
          </div>
          <button className="text-green-600 hover:text-green-700 font-medium">
            Update
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Need to upgrade?</h4>
          <p className="text-sm text-blue-700 mb-3">
            Get unlimited invoices, premium templates, and priority support with our Business Plan.
          </p>
          <button
            onClick={() => handlePlanChange('pro')}
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            <ArrowUpIcon className="w-4 h-4 mr-1" />
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
