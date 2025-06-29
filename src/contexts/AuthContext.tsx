import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../Config/firebase';
import {
  signUpWithEmail,
  signInWithEmail,
  signOutUser,
  convertFirebaseUser,
  User,
  RegisterData
} from '@/services/authService';

// User interface is now imported from authService

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  loading: boolean;
}

// RegisterData interface is now imported from authService

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Convert Firebase user to our User interface
        const userData = convertFirebaseUser(firebaseUser);
        setUser(userData);

        // Get the ID token for API calls
        try {
          const idToken = await firebaseUser.getIdToken();
          setToken(idToken);
        } catch (error) {
          console.error('Error getting ID token:', error);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { user: userData, error } = await signInWithEmail(email, password);

      if (error) {
        toast.error(error);
        return false;
      }

      if (userData) {
        toast.success('Login successful!');
        return true;
      } else {
        toast.error('Login failed. Please try again.');
        return false;
      }
    } catch (error: any) {
      toast.error('Login failed. Please check your credentials.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setLoading(true);
    try {
      const { user: newUser, error } = await signUpWithEmail(userData);

      if (error) {
        toast.error(error);
        return false;
      }

      if (newUser) {
        toast.success('Registration successful!');
        return true;
      } else {
        toast.error('Registration failed. Please try again.');
        return false;
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await signOutUser();
      if (error) {
        toast.error(error);
      } else {
        setUser(null);
        setToken(null);
        toast.success('Logged out successfully');
      }
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
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
