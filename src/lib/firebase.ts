import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '@/firebase-applet-config.json';

if (!firebaseConfig || !firebaseConfig.apiKey) {
  console.error("Firebase configuration is missing or invalid. Check firebase-applet-config.json");
  throw new Error("Critical: Firebase configuration is missing or invalid.");
}

const firebaseConfigData = {
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
  measurementId: firebaseConfig.measurementId
};

const app = initializeApp(firebaseConfigData);

// If firestoreDatabaseId is "(default)", we should not pass it to initializeFirestore
const dbId = firebaseConfig.firestoreDatabaseId === '(default)' ? undefined : firebaseConfig.firestoreDatabaseId;

// Initialize Firestore with settings to resolve "offline" issues in iframes
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, // Forces long-polling (useful in many container/iframe setups)
}, dbId);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Simple connection check that doesn't spam the console if it fails
if (typeof window !== 'undefined') {
  getDocFromServer(doc(db, 'test', 'connection')).catch(() => {
    // Silently handle - we don't want to alert if user is just starting up
  });
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
