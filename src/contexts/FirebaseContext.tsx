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
import { doc, onSnapshot, setDoc, serverTimestamp, getDoc, writeBatch, deleteDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import firebaseConfig from '@/firebase-applet-config.json';

interface UserProfile {
  uid: string;
  username: string;
  displayName?: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  coins: number;
  tier: string;
  stats?: {
    gamesPlayed: number;
    highestStreak: number;
    totalQuests: number;
    rank?: number;
  };
  referrerId?: string;
  referredBy?: string;
  referralCode?: string;
  referrerName?: string;
  hasWithdrawn?: boolean;
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
  securityInfo: { ip: string, country: string, isVpn: boolean } | null;
  signIn: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string, username: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  awardCoins: (amount: number, description: string) => Promise<void>;
  requestWithdrawal: (amount: number, method: string, details?: any) => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  checkUsernameAvailability: (username: string) => Promise<boolean>;
  clearAuthError: () => void;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [securityInfo, setSecurityInfo] = useState<{ ip: string, country: string, isVpn: boolean } | null>(null);

  // Fetch security info (IP/VPN)
  useEffect(() => {
    const fetchSecurity = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        setSecurityInfo({ 
          ip: data.ip, 
          country: data.country_name,
          isVpn: false // Simplified for demo, usually we'd check against a list or use a specialized service
        });
      } catch (e) {
        console.warn("Security check failed", e);
      }
    };
    fetchSecurity();
  }, []);

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
      try {
        setUser(firebaseUser);
        
        if (firebaseUser) {
          // Setup profile reference
          const profileRef = doc(db, 'users', firebaseUser.uid);
          
          // 1. First, check if profile exists on the backend & init if needed
          try {
            const response = await fetch(`/api/user/profile/${firebaseUser.uid}`);
            if (response.ok) {
              const { profile: backendProfile } = await response.json();
              console.log("Backend profile sync complete");
              
              // Apply stored referral if this is a first-time user
              const storedRef = localStorage.getItem('dgamers_ref');
              if (storedRef && storedRef !== firebaseUser.uid) {
                await fetch('/api/referral/apply', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ uid: firebaseUser.uid, referralCode: storedRef })
                });
                localStorage.removeItem('dgamers_ref');
              }
            }
          } catch (err) {
            console.error("Backend profile init failed", err);
          }

          // 2. Use onSnapshot for reactive profile loading
          const unsubProfile = onSnapshot(profileRef, async (docSnap) => {
            if (docSnap.exists()) {
              setProfile(docSnap.data() as UserProfile);
              setLoading(false); // Success!
            } else {
              // Profile doesn't exist yet, need to create it
              console.log("Profile does not exist, creating...");
              const referrerId = localStorage.getItem('dgamers_ref');
              let referrerUsername = null;

              if (referrerId && referrerId !== firebaseUser.uid) {
                try {
                  const refSnap = await getDoc(doc(db, 'users', referrerId));
                  if (refSnap.exists()) {
                    referrerUsername = refSnap.data().username;
                  }
                } catch (e) {
                  console.warn("Could not fetch referrer username", e);
                }
              }
              
              let baseUsername = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Gamer';
              if (baseUsername.length < 3) baseUsername = `${baseUsername}_player`;
              if (baseUsername.length > 32) baseUsername = baseUsername.substring(0, 32);

              const newProfile: any = {
                uid: firebaseUser.uid,
                username: baseUsername,
                displayName: firebaseUser.displayName || baseUsername,
                email: firebaseUser.email || '',
                avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${baseUsername}`,
                coins: 0,
                tier: 'bronze',
                stats: {
                  gamesPlayed: 0,
                  highestStreak: 0,
                  totalQuests: 0,
                  rank: Math.floor(Math.random() * 500) + 50
                },
                createdAt: serverTimestamp(),
                lastLoginAt: serverTimestamp(),
                isVerified: firebaseUser.emailVerified || false,
                country: 'Nigeria' 
              };

              if (referrerId && referrerId !== firebaseUser.uid) {
                newProfile.referrerId = referrerId;
                if (referrerUsername) {
                  newProfile.referrerName = referrerUsername;
                }
              }
              
              try {
                const batch = writeBatch(db);
                batch.set(profileRef, newProfile);
                batch.set(doc(db, 'usernames', baseUsername.toLowerCase()), { userId: firebaseUser.uid });
                await batch.commit();
                localStorage.removeItem('dgamers_ref');
              } catch (error) {
                console.error("Failed to create profile", error);
              }
            }
          }, (error: any) => {
            console.warn("Profile listener error", error);
            const isOffline = error?.message?.includes('offline') || error?.code === 'unavailable';
            if (isOffline) {
              setAuthError("Network issue: Unable to reach Firebase. Working in offline mode...");
            }
            // Even with error, we set loading to false so the user can see something
            setLoading(false);
          });

          // Store the unsubscribe function to clean up when auth state changes
          // or component unmounts. For a global provider, we just want to unsub previous one.
          return () => unsubProfile();
        } else {
          setProfile(null);
          setLoading(false);
        }
      } catch (err) {
        console.error("onAuthStateChanged error", err);
      } finally {
        setLoading(false);
      }
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
      } else if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        message = "Sign in was cancelled.";
      } else if (error.code === 'auth/network-request-failed') {
        message = "Network error. Please check your connection.";
      } else if (error.code === 'auth/operation-not-allowed') {
        message = `Google Sign-In is not enabled for Project ID: ${firebaseConfig.projectId}. Please enable it in the Authentication > Sign-in method tab. (Error: ${error.code})`;
      } else if (error.code === 'auth/unauthorized-domain') {
        message = `Domain not authorized. Please add ${window.location.host} to "Authorized domains" in your Firebase Console for project ${firebaseConfig.projectId}. (Error: ${error.code})`;
      } else {
        message = `${error.message} (${error.code})`;
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
      if (error.code === 'auth/operation-not-allowed') {
        message = `Authentication provider not enabled. Please enable Google and Email/Password in your Firebase Console for Project ID: ${firebaseConfig.projectId}. (Error: ${error.code})`;
      } else if (error.code === 'auth/unauthorized-domain') {
        message = `This domain is not authorized. Please add this URL to "Authorized domains" in your Firebase console: ${window.location.origin}. (Error: ${error.code})`;
      } else {
        message = `${error.message} (${error.code})`;
      }
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
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = "Invalid email or password.";
      } else if (error.code === 'auth/operation-not-allowed') {
        message = `Email/Password sign-in is not enabled for Project ID: ${firebaseConfig.projectId}. (Error: ${error.code})`;
      } else {
        message = `${error.message} (${error.code})`;
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
      const batch = writeBatch(db);

      // 1. Record the earning transaction for the user
      batch.set(activityRef, {
        userId: user.uid,
        amount: amount / 1000,
        coins: amount,
        type: 'earn',
        status: 'completed',
        description,
        createdAt: serverTimestamp()
      });

      // 2. Update user's balance
      batch.set(profileRef, {
        coins: (profile.coins || 0) + amount,
        lastLoginAt: serverTimestamp()
      }, { merge: true });

      // 3. Handle Referral Commission (10%)
      if (profile.referrerId) {
        const referralBonus = Math.floor(amount * 0.1);
        if (referralBonus > 0) {
          const referrerRef = doc(db, 'users', profile.referrerId);
          const referrerSnap = await getDoc(referrerRef);
          
          if (referrerSnap.exists()) {
            const referrerActivityRef = doc(db, `users/${profile.referrerId}/transactions`, crypto.randomUUID());
            
            // Record commission for referrer
            batch.set(referrerActivityRef, {
              userId: profile.referrerId,
              amount: referralBonus / 1000,
              coins: referralBonus,
              type: 'referral',
              status: 'completed',
              description: `Commission from ${profile.username}`,
              fromUser: profile.username,
              createdAt: serverTimestamp()
            });

            // Update referrer's balance
            batch.set(referrerRef, {
              coins: (referrerSnap.data().coins || 0) + referralBonus
            }, { merge: true });
          }
        }
      }

      await batch.commit();

    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/transactions`);
    }
  };

  const requestWithdrawal = async (amountInCoins: number, method: string, details: any = {}) => {
    if (!user || !profile) return;
    if (profile.coins < amountInCoins) throw new Error("Insufficient balance.");

    try {
      const response = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          amount: amountInCoins,
          method: method,
          details: details
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Withdrawal failed on server");
      }

      console.log("Withdrawal successfully processed by backend");
    } catch (error: any) {
      console.error("Withdrawal API error", error);
      throw error;
    }
  };

  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 3) return false;
    const ref = doc(db, 'usernames', username.toLowerCase());
    const snap = await getDoc(ref);
    return !snap.exists();
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user || !profile) return;

    try {
      const batch = writeBatch(db);
      const profileRef = doc(db, 'users', user.uid);

      // Handle username change
      if (data.username && data.username !== profile.username) {
        const available = await checkUsernameAvailability(data.username);
        if (!available) throw new Error("Username is already taken.");

        // Add new username entry
        batch.set(doc(db, 'usernames', data.username.toLowerCase()), { userId: user.uid });
        // Delete old username entry
        batch.delete(doc(db, 'usernames', profile.username.toLowerCase()));
      }

      batch.set(profileRef, { ...data, lastLoginAt: serverTimestamp() }, { merge: true });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  return (
    <FirebaseContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isAuthenticating, 
      authError, 
      securityInfo,
      signIn, 
      signUpWithEmail,
      signInWithEmail,
      logout, 
      awardCoins, 
      requestWithdrawal,
      updateProfileData,
      checkUsernameAvailability,
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
