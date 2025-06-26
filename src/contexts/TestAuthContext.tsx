import React, { createContext, useContext, useState } from 'react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
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

export const TestAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Simulate login delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a test user
      const testUser: User = {
        id: 'test-user-123',
        email: email,
        name: 'Test User',
        company: 'Test Company',
        subscription: {
          plan: 'free',
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        profile: {
          phone: '',
          address: '',
          city: '',
          state: '',
          zip: '',
          country: '',
          logo: null,
          invoice_settings: {
            default_currency: 'USD',
            tax_rate: 0,
            invoice_prefix: 'INV',
            next_invoice_number: 1
          }
        }
      };

      setUser(testUser);
      setToken('test-token-123');
      toast.success('🧪 Login successful! (Test Mode - Any credentials work)');
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setLoading(true);
    try {
      // Simulate registration delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const testUser: User = {
        id: 'test-user-123',
        email: userData.email,
        name: userData.name,
        company: userData.company || '',
        subscription: {
          plan: 'free',
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        profile: {
          phone: '',
          address: '',
          city: '',
          state: '',
          zip: '',
          country: '',
          logo: null,
          invoice_settings: {
            default_currency: 'USD',
            tax_rate: 0,
            invoice_prefix: 'INV',
            next_invoice_number: 1
          }
        }
      };

      setUser(testUser);
      setToken('test-token-123');
      toast.success('Registration successful! (Test Mode)');
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error('Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (_data: Partial<User>): Promise<boolean> => {
    toast.error('Profile update not implemented in test mode');
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
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
