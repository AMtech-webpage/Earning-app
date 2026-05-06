import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
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

// If firestoreDatabaseId is "(default)", we should not pass it to getFirestore
const dbId = firebaseConfig.firestoreDatabaseId === '(default)' ? undefined : firebaseConfig.firestoreDatabaseId;
export const db = getFirestore(app, dbId); 
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Connection test - less aggressive
async function testConnection() {
  try {
    // Only test if we are not in a build environment
    if (typeof window !== 'undefined') {
      await getDocFromServer(doc(db, 'test', 'connection'));
      console.log("Firebase connection established successfully.");
    }
  } catch (error: any) {
    // We ignore 404/not-found but check for "offline" or "api-key-not-valid"
    const message = error?.message || String(error);
    if (message.includes('the client is offline')) {
      console.error("Firebase is offline. Please check your internet connection.");
    } else if (message.includes('auth/api-key-not-valid')) {
      console.error("Firebase API Key is invalid. Please check your firebase-applet-config.json.");
    } else {
      console.warn("Firebase connection test notice:", message);
    }
  }
}
testConnection();

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
