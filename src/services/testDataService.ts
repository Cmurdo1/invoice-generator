// Test data service for when Supabase is having issues
export interface DashboardData {
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

export const getTestDashboardData = async (): Promise<DashboardData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
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
  };
};

export const getTestClients = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [];
};

export const getTestInvoices = async (page = 1, limit = 10) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    invoices: [],
    total: 0,
    page,
    limit,
    totalPages: 0
  };
};
