import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
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
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Convert Firebase user to our User interface
        const userData = convertFirebaseUser(firebaseUser);
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await signInWithEmail(email, password);

      if (error) {
        return { error };
      }

      return {};
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true);

      const userData: RegisterData = {
        name: fullName || '',
        email,
        password,
        company: ''
      };

      const { error } = await signUpWithEmail(userData);

      if (error) {
        return { error };
      }

      return {};
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await signOutUser();
      if (error) {
        console.error('Sign out error:', error);
      } else {
        // Force page reload for clean state
        window.location.href = '/auth';
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
