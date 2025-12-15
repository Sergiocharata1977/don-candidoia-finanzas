// User Service - Firestore operations for user profiles
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { User, UserProfile } from '@/types/auth';

const COLLECTION = 'users';

export const UserService = {
  /**
   * Get user by ID
   */
  async getById(userId: string): Promise<User | null> {
    try {
      const docRef = doc(db, COLLECTION, userId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return null;
      }

      const data = snapshot.data();
      return {
        id: snapshot.id,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        currentOrganizationId: data.currentOrganizationId,
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
      };
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  /**
   * Create user profile
   */
  async create(
    userId: string,
    data: {
      email: string;
      displayName?: string;
      photoURL?: string;
    }
  ): Promise<User> {
    try {
      const docRef = doc(db, COLLECTION, userId);
      const now = new Date();

      const userData = {
        email: data.email,
        displayName: data.displayName || null,
        photoURL: data.photoURL || null,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      };

      await setDoc(docRef, userData);

      return {
        id: userId,
        ...userData,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   */
  async update(userId: string, data: Partial<UserProfile>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION, userId);

      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  /**
   * Set current organization for user
   */
  async setCurrentOrganization(
    userId: string,
    organizationId: string
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION, userId);

      await updateDoc(docRef, {
        currentOrganizationId: organizationId,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error setting current organization:', error);
      throw error;
    }
  },

  /**
   * Check if user exists
   */
  async exists(userId: string): Promise<boolean> {
    try {
      const docRef = doc(db, COLLECTION, userId);
      const snapshot = await getDoc(docRef);
      return snapshot.exists();
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  },
};
