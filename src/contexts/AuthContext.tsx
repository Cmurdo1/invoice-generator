import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  role: string;
  subscription: {
    plan: string;
    status: string;
    current_period_start: string;
    current_period_end: string;
  };
  profile: {
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    logo: string | null;
    invoice_settings: {
      default_currency: string;
      tax_rate: number;
      invoice_prefix: string;
      next_invoice_number: number;
    };
  };
  created_at: string;
  updated_at: string;
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

// Mock user data for static build
const MOCK_USER: User = {
  id: 'user-123',
  email: 'demo@example.com',
  name: 'Demo User',
  company: 'Demo Company',
  role: 'admin',
  subscription: {
    plan: 'premium',
    status: 'active',
    current_period_start: '2025-01-01',
    current_period_end: '2025-12-31'
  },
  profile: {
    phone: '+1234567890',
    address: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zip: '94105',
    country: 'USA',
    logo: null,
    invoice_settings: {
      default_currency: 'USD',
      tax_rate: 8.5,
      invoice_prefix: 'INV',
      next_invoice_number: 1001
    }
  },
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(MOCK_USER);
  const [token, setToken] = useState<string | null>('mock-token-123');
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    setUser(MOCK_USER);
    setToken('mock-token-123');
    toast.success('Login successful! (Demo Mode)');
    return true;
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setUser(MOCK_USER);
    setToken('mock-token-123');
    toast.success('Registration successful! (Demo Mode)');
    return true;
  };

  const logout = () => {
    setUser(MOCK_USER); // Keep user logged in for demo
    toast.success('Logged out successfully (Demo Mode)');
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (user) {
      setUser({ ...user, ...data });
      toast.success('Profile updated successfully (Demo Mode)');
      return true;
    }
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

export default AuthContext;
