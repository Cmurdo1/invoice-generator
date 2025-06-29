import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DocumentTextIcon,
  UserGroupIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  EyeIcon,
  PaperAirplaneIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { getTestDashboardData } from '@/services/testDataService';
import toast from 'react-hot-toast';

interface DashboardData {
  summary: {
    total_invoices: number;
    total_clients: number;
    total_revenue: number;
    pending_amount: number;
    overdue_amount: number;
    overdue_count: number;
  };
  status_breakdown: {
    draft: number;
    sent: number;
    paid: number;
    overdue: number;
  };
  this_month: {
    invoices: number;
    revenue: number;
    revenue_change: number;
    invoice_change: number;
  };
  recent_invoices: Array<{
    id: string;
    invoice_number: string;
    client_name: string;
    total: number;
    status: string;
    created_at: string;
    due_date: string;
  }>;
}

const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch dashboard data from API
        const data = await getTestDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Failed to load dashboard data');
        // Set empty data as fallback
        setDashboardData({
          summary: {
            total_invoices: 0,
            total_clients: 0,
            total_revenue: 0,
            pending_amount: 0,
            overdue_amount: 0,
            overdue_count: 0
          },
          status_breakdown: {
            draft: 0,
            sent: 0,
            paid: 0,
            overdue: 0
          },
          this_month: {
            invoices: 0,
            revenue: 0,
            revenue_change: 0,
            invoice_change: 0
          },
          recent_invoices: []
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.profile?.invoice_settings?.default_currency || 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'sent':
        return <PaperAirplaneIcon className="w-4 h-4" />;
      case 'overdue':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'draft':
        return <DocumentTextIcon className="w-4 h-4" />;
      default:
        return <DocumentTextIcon className="w-4 h-4" />;
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load dashboard data</p>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Revenue',
      value: formatCurrency(dashboardData.summary.total_revenue),
      change: `${dashboardData.this_month.revenue_change > 0 ? '+' : ''}${dashboardData.this_month.revenue_change.toFixed(1)}%`,
      changeType: dashboardData.this_month.revenue_change >= 0 ? 'positive' : 'negative',
      icon: BanknotesIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Total Invoices',
      value: dashboardData.summary.total_invoices.toString(),
      change: `${dashboardData.this_month.invoice_change > 0 ? '+' : ''}${dashboardData.this_month.invoice_change.toFixed(1)}%`,
      changeType: dashboardData.this_month.invoice_change >= 0 ? 'positive' : 'negative',
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Clients',
      value: dashboardData.summary.total_clients.toString(),
      change: '+0%',
      changeType: 'neutral',
      icon: UserGroupIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Pending Amount',
      value: formatCurrency(dashboardData.summary.pending_amount),
      change: '',
      changeType: 'neutral',
      icon: ExclamationTriangleIcon,
      color: 'bg-yellow-500',
    },
  ];

  return (
    <div className="space-y-8 pt-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name}! Here's what's happening with your business.
          </p>
        </div>
        <Link
          to="/invoices/create"
          className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Invoice
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                {stat.change && (
                  <p className={`text-sm ${
                    stat.changeType === 'positive' ? 'text-green-600' : 
                    stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {stat.change} from last month
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Invoice Status Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                <span className="text-gray-700 font-medium">Draft</span>
              </div>
              <span className="text-gray-900 font-bold">{dashboardData.status_breakdown.draft}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-700 font-medium">Sent</span>
              </div>
              <span className="text-gray-900 font-bold">{dashboardData.status_breakdown.sent}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700 font-medium">Paid</span>
              </div>
              <span className="text-gray-900 font-bold">{dashboardData.status_breakdown.paid}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="text-gray-700 font-medium">Overdue</span>
              </div>
              <span className="text-gray-900 font-bold">{dashboardData.status_breakdown.overdue}</span>
            </div>
          </div>
        </div>

        {/* This Month Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Invoices Created</span>
                <span className="text-2xl font-bold text-gray-900">{dashboardData.this_month.invoices}</span>
              </div>
              <div className="text-sm text-gray-500">
                {dashboardData.this_month.invoice_change > 0 ? '+' : ''}{dashboardData.this_month.invoice_change.toFixed(1)}% from last month
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Revenue Generated</span>
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.this_month.revenue)}</span>
              </div>
              <div className="text-sm text-gray-500">
                {dashboardData.this_month.revenue_change > 0 ? '+' : ''}{dashboardData.this_month.revenue_change.toFixed(1)}% from last month
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
          <Link
            to="/invoices"
            className="text-green-600 hover:text-green-700 font-medium text-sm"
          >
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData.recent_invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No invoices found. <Link to="/invoices/create" className="text-green-600 hover:text-green-700 font-medium">Create your first invoice</Link>
                  </td>
                </tr>
              ) : (
                dashboardData.recent_invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{invoice.invoice_number}</div>
                      <div className="text-sm text-gray-500">{formatDate(invoice.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{invoice.client_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(invoice.total)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        <span className="ml-1 capitalize">{invoice.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(invoice.due_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Link
                        to={`/invoices/${invoice.id}/view`}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/invoices/create"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
          >
            <PlusIcon className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">New Invoice</p>
              <p className="text-sm text-gray-600">Create a new invoice</p>
            </div>
          </Link>
          <Link
            to="/clients/create"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <UserGroupIcon className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Add Client</p>
              <p className="text-sm text-gray-600">Add a new client</p>
            </div>
          </Link>
          <Link
            to="/invoices"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <DocumentTextIcon className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">View Invoices</p>
              <p className="text-sm text-gray-600">Manage your invoices</p>
            </div>
          </Link>
          <a
            href="https://buy.stripe.com/5kQ4gzb0HdM31Ur1cz7kc00"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors"
          >
            <BanknotesIcon className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Upgrade Plan</p>
              <p className="text-sm text-gray-600">Get premium features</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
