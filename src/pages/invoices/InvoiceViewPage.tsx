import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  PencilIcon,
  PaperAirplaneIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  client_address: string;
  issue_date: string;
  due_date: string;
  description: string;
  line_items: Array<{
    id: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  currency: string;
  status: string;
  notes: string;
  created_at: string;
  sent_date?: string;
  paid_date?: string;
}

const InvoiceViewPage: React.FC = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchInvoice();
    }
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/invoices/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInvoice(data);
      } else {
        toast.error('Invoice not found');
      }
    } catch (error) {
      console.error('Failed to fetch invoice:', error);
      toast.error('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvoice = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/invoices/${id}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Invoice sent successfully');
        fetchInvoice();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to send invoice');
      }
    } catch (error) {
      console.error('Failed to send invoice:', error);
      toast.error('Failed to send invoice');
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/invoices/${id}/pay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payment_method: 'manual' }),
      });

      if (response.ok) {
        toast.success('Invoice marked as paid');
        fetchInvoice();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to mark invoice as paid');
      }
    } catch (error) {
      console.error('Failed to mark invoice as paid:', error);
      toast.error('Failed to mark invoice as paid');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice?.currency || 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
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

  if (loading) {
    return <LoadingSpinner text="Loading invoice..." />;
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Invoice not found</p>
        <Link to="/invoices" className="text-green-600 hover:text-green-700 font-medium">
          Back to Invoices
        </Link>
      </div>
    );
  }

  const isOverdue = invoice.status === 'sent' && new Date(invoice.due_date) < new Date();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice {invoice.invoice_number}</h1>
          <div className="flex items-center space-x-3 mt-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              getStatusColor(isOverdue ? 'overdue' : invoice.status)
            }`}>
              {isOverdue ? 'Overdue' : invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-600">Created {formatDate(invoice.created_at)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.print()}
            className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-95"
          >
            <PrinterIcon className="w-4 h-4 mr-2" />
            Print
          </button>
          
          {invoice.status === 'draft' && (
            <button
              onClick={handleSendInvoice}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-95"
            >
              <PaperAirplaneIcon className="w-4 h-4 mr-2" />
              Send Invoice
            </button>
          )}
          
          {(invoice.status === 'sent' || isOverdue) && (
            <button
              onClick={handleMarkAsPaid}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-95"
            >
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              Mark as Paid
            </button>
          )}
          
          <Link
            to={`/invoices/${invoice.id}/edit`}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-95"
          >
            <PencilIcon className="w-4 h-4 mr-2" />
            Edit
          </Link>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8">
          {/* Company and Client Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">From:</h3>
              <div className="text-gray-700">
                <p className="font-medium">{user?.name}</p>
                {user?.company && <p>{user.company}</p>}
                <p>{user?.profile?.address}</p>
                <p>{user?.profile?.city}, {user?.profile?.state} {user?.profile?.zip}</p>
                {user?.profile?.country && <p>{user.profile.country}</p>}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">To:</h3>
              <div className="text-gray-700">
                <p className="font-medium">{invoice.client_name}</p>
                {invoice.client_email && <p>{invoice.client_email}</p>}
                {invoice.client_address && (
                  <div className="whitespace-pre-line">{invoice.client_address}</div>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-3 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Invoice Number</p>
              <p className="font-semibold text-gray-900">{invoice.invoice_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Issue Date</p>
              <p className="font-semibold text-gray-900">{formatDate(invoice.issue_date)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Due Date</p>
              <p className={`font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                {formatDate(invoice.due_date)}
              </p>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Description</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Qty</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Rate</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoice.line_items.map((item, index) => (
                    <tr key={item.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                      <td className="px-4 py-3 text-gray-900">{item.description}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(item.rate)}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="animate-fade-in">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.tax_rate > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Tax ({invoice.tax_rate}%):</span>
                  <span className="animate-fade-in" style={{ animationDelay: '100ms' }}>{formatCurrency(invoice.tax_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2">
                <span>Total:</span>
                <span
                  className="animate-count-up"
                  style={{ ['--count' as any]: invoice.total } as React.CSSProperties}
                >
                  {formatCurrency(invoice.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Notes:</h4>
              <p className="text-gray-700 whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceViewPage;
