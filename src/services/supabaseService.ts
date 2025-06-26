import { supabase } from '@/integrations/supabase/client';

export interface Invoice {
  id: string;
  user_id: string;
  client_id?: string;
  client_name: string;
  client_email?: string;
  client_address?: string;
  invoice_number: string;
  issue_date: string;
  due_date?: string;
  description?: string;
  line_items: Array<{
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
  notes?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  paid_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  created_at: string;
  updated_at: string;
}

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

// Dashboard Service
export const getDashboardData = async (): Promise<DashboardData> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get all invoices for the user
  const { data: invoices, error: invoicesError } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', user.id);

  if (invoicesError) throw invoicesError;

  // Get all clients for the user
  const { data: clients, error: clientsError } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id);

  if (clientsError) throw clientsError;

  // Calculate dashboard metrics
  const totalInvoices = invoices?.length || 0;
  const totalClients = clients?.length || 0;

  const paidInvoices = invoices?.filter(inv => inv.status === 'paid') || [];
  const sentInvoices = invoices?.filter(inv => inv.status === 'sent') || [];
  const draftInvoices = invoices?.filter(inv => inv.status === 'draft') || [];
  const overdueInvoices = invoices?.filter(inv => {
    if (inv.status !== 'sent') return false;
    const dueDate = new Date(inv.due_date);
    return dueDate < new Date();
  }) || [];

  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);
  const pendingAmount = sentInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);
  const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);

  // This month calculations
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const thisMonthInvoices = invoices?.filter(inv => 
    new Date(inv.created_at) >= thisMonthStart
  ) || [];

  const lastMonthInvoices = invoices?.filter(inv => {
    const createdAt = new Date(inv.created_at);
    return createdAt >= lastMonthStart && createdAt <= lastMonthEnd;
  }) || [];

  const thisMonthRevenue = thisMonthInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + Number(inv.total), 0);

  const lastMonthRevenue = lastMonthInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + Number(inv.total), 0);

  const revenueChange = lastMonthRevenue > 0 
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : 0;

  const invoiceChange = lastMonthInvoices.length > 0 
    ? ((thisMonthInvoices.length - lastMonthInvoices.length) / lastMonthInvoices.length) * 100 
    : 0;

  // Recent invoices (last 5)
  const recentInvoices = invoices
    ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map(inv => ({
      id: inv.id,
      invoice_number: inv.invoice_number,
      client_name: inv.client_name,
      total: Number(inv.total),
      status: inv.status,
      created_at: inv.created_at,
      due_date: inv.due_date || ''
    })) || [];

  return {
    summary: {
      total_invoices: totalInvoices,
      total_clients: totalClients,
      total_revenue: totalRevenue,
      pending_amount: pendingAmount,
      overdue_amount: overdueAmount,
      overdue_count: overdueInvoices.length
    },
    status_breakdown: {
      draft: draftInvoices.length,
      sent: sentInvoices.length,
      paid: paidInvoices.length,
      overdue: overdueInvoices.length
    },
    this_month: {
      invoices: thisMonthInvoices.length,
      revenue: thisMonthRevenue,
      revenue_change: revenueChange,
      invoice_change: invoiceChange
    },
    recent_invoices: recentInvoices
  };
};

// Invoice Services
export const getInvoices = async (page = 1, limit = 10) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('invoices')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    invoices: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit)
  };
};

export const createInvoice = async (invoiceData: Partial<Invoice>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('invoices')
    .insert({
      ...invoiceData,
      user_id: user.id
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Client Services
export const getClients = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createClient = async (clientData: Partial<Client>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('clients')
    .insert({
      ...clientData,
      user_id: user.id
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};
