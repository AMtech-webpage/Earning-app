import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';

interface UserProfile {
  uid: string;
  username: string;
  email: string;
  coins: number;
  tier: string;
  referrerId?: string;
  createdAt: any;
  lastLoginAt: any;
  isVerified: boolean;
  country: string;
}

interface FirebaseContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticating: boolean;
  authError: string | null;
  signIn: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string, username: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  awardCoins: (amount: number, description: string) => Promise<void>;
  clearAuthError: () => void;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Capture referral code from URL early
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || params.get('referrer');
    if (ref) {
      localStorage.setItem('dgamers_ref', ref);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Listen to profile
        const profileRef = doc(db, 'users', firebaseUser.uid);
        
        // Check if profile exists, if not create it
        const snap = await getDoc(profileRef);
        if (!snap.exists()) {
          const referrerId = localStorage.getItem('dgamers_ref');
          
          let baseUsername = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Gamer';
          if (baseUsername.length < 3) baseUsername = `${baseUsername}_player`;
          if (baseUsername.length > 32) baseUsername = baseUsername.substring(0, 32);

          const newProfile: any = {
            uid: firebaseUser.uid,
            username: baseUsername,
            email: firebaseUser.email || '',
            coins: 0,
            tier: 'bronze',
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
            isVerified: firebaseUser.emailVerified || false,
            country: 'Nigeria' 
          };

          if (referrerId && referrerId !== firebaseUser.uid) {
            newProfile.referrerId = referrerId;
          }
          
          try {
            await setDoc(profileRef, newProfile);
            // Clear used ref
            localStorage.removeItem('dgamers_ref');
          } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, `users/${firebaseUser.uid}`);
          }
        } else {
          // Update last login
          try {
            await setDoc(profileRef, { lastLoginAt: serverTimestamp() }, { merge: true });
          } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, `users/${firebaseUser.uid}`);
          }
        }

        const unsubProfile = onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        });

        return () => unsubProfile();
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearAuthError = () => setAuthError(null);

  const signIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Sign in failed", error);
      let message = "An unexpected error occurred during sign in.";
      if (error.code === 'auth/popup-blocked') {
        message = "Login popup was blocked by your browser. Please allow popups for this site.";
      } else if (error.code === 'auth/cancelled-popup-request') {
        message = "Sign in was cancelled.";
      } else if (error.code === 'auth/network-request-failed') {
        message = "Network error. Please check your connection.";
      } else {
        message = error.message;
      }
      setAuthError(message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, username: string) => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      if (username.length < 3) throw new Error("Username must be at least 3 characters.");
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(cred.user, { displayName: username });
    } catch (error: any) {
      console.error("Sign up failed", error);
      let message = error.message;
      if (error.code === 'auth/email-already-in-use') message = "This email is already registered.";
      if (error.code === 'auth/weak-password') message = "Password should be at least 6 characters.";
      setAuthError(message);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      console.error("Sign in failed", error);
      let message = error.message;
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = "Invalid email or password.";
      }
      setAuthError(message);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out failed", error);
    }
  };

  const awardCoins = async (amount: number, description: string) => {
    if (!user || !profile) return;

    const profileRef = doc(db, 'users', user.uid);
    const activityRef = doc(db, `users/${user.uid}/transactions`, crypto.randomUUID());

    try {
      // 1. Record the earning transaction for the user
      await setDoc(activityRef, {
        userId: user.uid,
        amount: amount / 1000,
        coins: amount,
        type: 'earn',
        status: 'completed',
        description,
        createdAt: serverTimestamp()
      });

      // 2. Update user's balance
      await setDoc(profileRef, {
        coins: (profile.coins || 0) + amount,
        lastLoginAt: serverTimestamp()
      }, { merge: true });

    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/transactions`);
    }
  };

  return (
    <FirebaseContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isAuthenticating, 
      authError, 
      signIn, 
      signUpWithEmail,
      signInWithEmail,
      logout, 
      awardCoins, 
      clearAuthError 
    }}>
      {children}
    </FirebaseContext.Provider>
  );
};


export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
