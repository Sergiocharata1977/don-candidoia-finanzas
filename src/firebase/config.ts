// Firebase Client SDK Configuration
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate configuration
const missingFields = [];
if (!firebaseConfig.apiKey) missingFields.push('NEXT_PUBLIC_FIREBASE_API_KEY');
if (!firebaseConfig.authDomain) missingFields.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
if (!firebaseConfig.projectId) missingFields.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');

if (missingFields.length > 0) {
  console.error('⚠️ Firebase configuration is missing required fields:');
  console.error('Missing:', missingFields.join(', '));
  console.error('📋 Steps to fix:');
  console.error('1. Go to Firebase Console > Project Settings > General > Your apps');
  console.error('2. Copy the firebaseConfig values');
  console.error('3. Create/update .env.local with the values (see .env.example)');
  console.error('4. Restart the dev server');
}

// Initialize Firebase (singleton pattern)
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics disabled temporarily (enable when app is more stable)
// To enable: uncomment the code below and enable Analytics in Firebase Console
export const analytics = null;
// export const analytics =
//   typeof window !== 'undefined'
//     ? isSupported().then(yes => (yes ? getAnalytics(app) : null))
//     : null;

export default app;
