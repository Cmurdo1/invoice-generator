import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CreditCardIcon,
  CogIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  CreditCardIcon as CreditCardIconSolid,
  CogIcon as CogIconSolid
} from '@heroicons/react/24/solid';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionUsage } from '@/hooks/useSubscription';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { profile } = useAuth();
  const { data: usage } = useSubscriptionUsage();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
      current: location.pathname === '/dashboard'
    },
    {
      name: 'Invoices',
      href: '/invoices',
      icon: DocumentTextIcon,
      iconSolid: DocumentTextIconSolid,
      current: location.pathname.startsWith('/invoices')
    },
    {
      name: 'Clients',
      href: '/clients',
      icon: UserGroupIcon,
      iconSolid: UserGroupIconSolid,
      current: location.pathname.startsWith('/clients')
    },
    {
      name: 'Subscription',
      href: '/subscription',
      icon: CreditCardIcon,
      iconSolid: CreditCardIconSolid,
      current: location.pathname === '/subscription'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: CogIcon,
      iconSolid: CogIconSolid,
      current: location.pathname === '/settings'
    }
  ];

  const quickActions = [
    {
      name: 'New Invoice',
      href: '/invoices/create',
      icon: PlusIcon,
      color: 'bg-green-600 hover:bg-green-700'
    }
  ];

  const currentPlan = profile?.subscription_plan || 'free';
  const isFreePlan = currentPlan === 'free';

  return (
    <div className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-6">
        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                to={action.href}
                className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${action.color}`}
              >
                <action.icon className="w-5 h-5 mr-3" />
                {action.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <nav>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Navigation
          </h3>
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.current ? item.iconSolid : item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    item.current
                      ? 'bg-green-50 text-green-700 border-r-2 border-green-600'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Usage Stats (for free plan users) */}
        {isFreePlan && usage && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Usage This Month</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Invoices</span>
                  <span className="font-medium">
                    {usage.invoicesThisMonth} / {usage.remainingInvoices === -1 ? '∞' : usage.invoicesThisMonth + usage.remainingInvoices}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className={`h-2 rounded-full ${
                      usage.remainingInvoices <= 1 ? 'bg-red-500' : 
                      usage.remainingInvoices <= 2 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ 
                      width: usage.remainingInvoices === -1 ? '100%' : 
                        `${Math.min((usage.invoicesThisMonth / (usage.invoicesThisMonth + usage.remainingInvoices)) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Clients</span>
                  <span className="font-medium">
                    {usage.totalClients} / {usage.remainingClients === -1 ? '∞' : usage.totalClients + usage.remainingClients}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ 
                      width: usage.remainingClients === -1 ? '100%' : 
                        `${Math.min((usage.totalClients / (usage.totalClients + usage.remainingClients)) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <Link
              to="/subscription"
              className="inline-block mt-3 text-xs text-green-600 hover:text-green-700 font-medium"
            >
              Upgrade Plan →
            </Link>
          </div>
        )}

        {/* Plan Status */}
        <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900 capitalize">
              {currentPlan} Plan
            </h4>
            <span className={`px-2 py-1 text-xs rounded-full ${
              profile?.subscription_status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {profile?.subscription_status || 'inactive'}
            </span>
          </div>
          {isFreePlan && (
            <p className="text-xs text-gray-600 mb-2">
              Upgrade for unlimited invoices and premium features
            </p>
          )}
          <Link
            to="/subscription"
            className="text-xs text-green-600 hover:text-green-700 font-medium"
          >
            {isFreePlan ? 'Upgrade Now' : 'Manage Plan'} →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;