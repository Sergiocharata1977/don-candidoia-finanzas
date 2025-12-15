// Organization Service - Multi-tenant organization management
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import {
  Organization,
  OrganizationSettings,
  Member,
  MemberRole,
} from '@/types/organization';

const COLLECTION = 'organizations';

export const OrganizationService = {
  /**
   * Create a new organization
   * Also creates the creator as owner member
   */
  async create(
    name: string,
    creatorId: string,
    creatorEmail: string,
    creatorName?: string
  ): Promise<Organization> {
    try {
      const orgRef = doc(collection(db, COLLECTION));
      const now = new Date();

      const orgData = {
        name,
        createdBy: creatorId,
        settings: {
          timezone: 'America/Argentina/Buenos_Aires',
          currency: 'ARS',
          language: 'es',
          features: {
            accounting: true,
            roadmap: true,
          },
        } as OrganizationSettings,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      };

      // Create organization
      await setDoc(orgRef, orgData);

      // Create owner member
      const memberRef = doc(
        db,
        `${COLLECTION}/${orgRef.id}/members`,
        creatorId
      );
      await setDoc(memberRef, {
        userId: creatorId,
        email: creatorEmail,
        displayName: creatorName || null,
        photoURL: null,
        role: 'owner' as MemberRole,
        status: 'active',
        joinedAt: Timestamp.fromDate(now),
      });

      return {
        id: orgRef.id,
        name,
        createdBy: creatorId,
        settings: orgData.settings,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  },

  /**
   * Get organization by ID
   */
  async getById(orgId: string): Promise<Organization | null> {
    try {
      const docRef = doc(db, COLLECTION, orgId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return null;
      }

      const data = snapshot.data();
      return {
        id: snapshot.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        logoUrl: data.logoUrl,
        settings: data.settings,
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
      };
    } catch (error) {
      console.error('Error getting organization:', error);
      throw error;
    }
  },

  /**
   * Update organization
   */
  async update(orgId: string, data: Partial<Organization>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION, orgId);

      // Remove fields that shouldn't be updated directly
      const { id, createdAt, createdBy, ...updateData } = data;

      await updateDoc(docRef, {
        ...updateData,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error updating organization:', error);
      throw error;
    }
  },

  /**
   * Delete organization
   * Note: This should also clean up members, invitations, and all data
   */
  async delete(orgId: string): Promise<void> {
    try {
      // TODO: Implement cascade delete for all subcollections
      const docRef = doc(db, COLLECTION, orgId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting organization:', error);
      throw error;
    }
  },

  /**
   * Get all organizations for a user
   */
  async getByUserId(userId: string): Promise<Organization[]> {
    try {
      // First, get all member documents for this user
      const organizations: Organization[] = [];

      // Query all organizations and check membership
      // Note: This is not optimal for large datasets
      // Consider using a user-organizations subcollection for better performance
      const orgsSnapshot = await getDocs(collection(db, COLLECTION));

      for (const orgDoc of orgsSnapshot.docs) {
        const memberRef = doc(db, `${COLLECTION}/${orgDoc.id}/members`, userId);
        const memberSnapshot = await getDoc(memberRef);

        if (memberSnapshot.exists()) {
          const data = orgDoc.data();
          organizations.push({
            id: orgDoc.id,
            name: data.name,
            slug: data.slug,
            description: data.description,
            logoUrl: data.logoUrl,
            settings: data.settings,
            createdBy: data.createdBy,
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
          });
        }
      }

      return organizations;
    } catch (error) {
      console.error('Error getting user organizations:', error);
      throw error;
    }
  },
};
