// Firebase Auth helpers
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile as firebaseUpdateProfile,
} from 'firebase/auth';
import { auth } from './config';

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Sign up with email and password
export const signUp = async (
  email: string,
  password: string,
  displayName?: string
) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  // Update display name if provided
  if (displayName && userCredential.user) {
    await firebaseUpdateProfile(userCredential.user, { displayName });
  }

  return userCredential;
};

// Sign in with Google
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account',
  });
  return signInWithPopup(auth, provider);
};

// Sign out
export const signOut = async () => {
  return firebaseSignOut(auth);
};

// Send password reset email
export const resetPassword = async (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

// Update user profile
export const updateProfile = async (
  user: FirebaseUser,
  data: { displayName?: string; photoURL?: string }
) => {
  return firebaseUpdateProfile(user, data);
};

// Auth state change listener
export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

// Type export
export type { FirebaseUser };
