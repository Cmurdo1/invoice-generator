import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing')
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          company: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          country: string | null
          avatar_url: string | null
          subscription_plan: string
          subscription_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          company?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          country?: string | null
          avatar_url?: string | null
          subscription_plan?: string
          subscription_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          company?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          country?: string | null
          avatar_url?: string | null
          subscription_plan?: string
          subscription_status?: string
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          company: string | null
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          country: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email?: string | null
          phone?: string | null
          company?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          country?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          company?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          country?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          invoice_number: string
          client_name: string
          client_email: string | null
          client_address: string | null
          issue_date: string
          due_date: string
          description: string | null
          line_items: any
          subtotal: number
          tax_rate: number
          tax_amount: number
          total: number
          currency: string
          status: string
          notes: string | null
          sent_date: string | null
          paid_date: string | null
          payment_method: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id?: string | null
          invoice_number: string
          client_name: string
          client_email?: string | null
          client_address?: string | null
          issue_date: string
          due_date: string
          description?: string | null
          line_items: any
          subtotal: number
          tax_rate: number
          tax_amount: number
          total: number
          currency?: string
          status?: string
          notes?: string | null
          sent_date?: string | null
          paid_date?: string | null
          payment_method?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string | null
          invoice_number?: string
          client_name?: string
          client_email?: string | null
          client_address?: string | null
          issue_date?: string
          due_date?: string
          description?: string | null
          line_items?: any
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total?: number
          currency?: string
          status?: string
          notes?: string | null
          sent_date?: string | null
          paid_date?: string | null
          payment_method?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}