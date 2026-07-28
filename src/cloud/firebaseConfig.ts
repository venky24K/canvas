// Firebase & Google Cloud Identity Platform Configuration
// Initialized from root .env environment variables with official SDK instances
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBrYjnM8b7868C-Z2tmzo51kSLMPaq6bAY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'bloom-79d7a.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'bloom-79d7a',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'bloom-79d7a.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1022228413582',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1022228413582:web:d583468920ee214b54dddf',
};

export let firebaseApp: FirebaseApp | null = null;
export let firebaseAuth: Auth | null = null;
export let firestoreDb: Firestore | null = null;

try {
  firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  firebaseAuth = getAuth(firebaseApp);
  firestoreDb = getFirestore(firebaseApp);
} catch (error) {
  console.warn('⚠️ [GCP / Firebase] SDK Initialization notice (falling back to sandbox evaluation):', error);
}

// Log initialization status to dev tool console for immediate monitoring
export const logGcpConfigStatus = () => {
  const isConfigured = Boolean(firebaseApp && firebaseConfig.apiKey && firebaseConfig.projectId);
  if (isConfigured) {
    console.log(`🔥 [GCP Identity Platform & Firestore SDK] Active Project Bound: "${firebaseConfig.projectId}" (${firebaseConfig.authDomain})`);
  } else {
    console.log(`⚙️ [GCP Identity Platform] Running in local offline evaluation mode`);
  }
  return isConfigured;
};
