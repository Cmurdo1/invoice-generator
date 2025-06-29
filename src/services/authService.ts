import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import { auth } from '../Config/firebase';

export interface User {
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

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  company?: string;
}

// Convert Firebase User to our User interface
export const convertFirebaseUser = (firebaseUser: FirebaseUser): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: firebaseUser.displayName || '',
    company: '',
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
};

// Sign up with email and password
export const signUpWithEmail = async (userData: RegisterData): Promise<{ user?: User; error?: string }> => {
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth, 
      userData.email, 
      userData.password
    );
    
    // Update the user's display name
    if (userData.name) {
      await updateProfile(userCredential.user, {
        displayName: userData.name
      });
    }
    
    const user = convertFirebaseUser(userCredential.user);
    user.name = userData.name;
    user.company = userData.company || '';
    
    return { user };
  } catch (error: any) {
    console.error('Sign up error:', error);
    return { error: error.message };
  }
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string): Promise<{ user?: User; error?: string }> => {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = convertFirebaseUser(userCredential.user);
    return { user };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return { error: error.message };
  }
};

// Sign out
export const signOutUser = async (): Promise<{ error?: string }> => {
  try {
    await signOut(auth);
    return {};
  } catch (error: any) {
    console.error('Sign out error:', error);
    return { error: error.message };
  }
};

// Get current user
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

// Update user profile
export const updateUserProfile = async (updates: { displayName?: string }): Promise<{ error?: string }> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { error: 'No user logged in' };
    }
    
    await updateProfile(user, updates);
    return {};
  } catch (error: any) {
    console.error('Update profile error:', error);
    return { error: error.message };
  }
};
