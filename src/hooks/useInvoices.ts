import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id?: string;
  invoice_number: string;
  client_name: string;
  client_email?: string;
  client_address?: string;
  issue_date: string;
  due_date: string;
  description?: string;
  line_items: LineItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes?: string;
  sent_date?: string;
  paid_date?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

export const useInvoices = (filters?: { status?: string; search?: string }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: invoices = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['invoices', user?.id, filters],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(`invoice_number.ilike.%${filters.search}%,client_name.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Invoice[];
    },
    enabled: !!user,
  });

  const createInvoice = useMutation({
    mutationFn: async (invoiceData: Omit<Invoice, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('invoices')
        .insert([{ ...invoiceData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create invoice');
    },
  });

  const updateInvoice = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Invoice> & { id: string }) => {
      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update invoice');
    },
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete invoice');
    },
  });

  const sendInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('invoices')
        .update({ 
          status: 'sent', 
          sent_date: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice sent successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send invoice');
    },
  });

  const markAsPaid = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('invoices')
        .update({ 
          status: 'paid', 
          paid_date: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice marked as paid');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to mark invoice as paid');
    },
  });

  return {
    invoices,
    isLoading,
    error,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    sendInvoice,
    markAsPaid,
  };
};

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Invoice;
    },
    enabled: !!id,
  });
};