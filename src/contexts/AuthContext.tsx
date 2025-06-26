import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface User extends SupabaseUser {
  name?: string;
  company?: string;
  subscription?: {
    plan: string;
    status: string;
    current_period_start: string;
    current_period_end: string;
  };
  profile?: {
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    logo?: string | null;
    invoice_settings?: {
      default_currency: string;
      tax_rate: number;
      invoice_prefix: string;
      next_invoice_number: number;
    };
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  loading: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  company?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user as User);
        setToken(session.access_token);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        if (session?.user) {
          setUser(session.user as User);
          setToken(session.access_token);
        } else {
          setUser(null);
          setToken(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Supabase auth error:', error);
        throw error;
      }

      if (data.user && data.session) {
        setUser(data.user as User);
        setToken(data.session.access_token);
        toast.success('Login successful!');
        return true;
      } else {
        throw new Error('No user data returned');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please check your credentials.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: { name: userData.name, company: userData.company }
        }
      });
      if (error) throw error;
      setUser(data.user as User);
      setToken(data.session?.access_token || null);
      toast.success('Registration successful! Please check your email to confirm.');
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
  };

  const updateProfile = async (_data: Partial<User>): Promise<boolean> => {
    toast.error('Profile update not implemented');
    return false;
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    updateProfile,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  // Always call the hook at the top level of your component, not inside a function/condition
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
