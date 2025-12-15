// Member Service - Manage organization members and invitations
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import {
  Member,
  MemberRole,
  Invitation,
  InvitationStatus,
} from '@/types/organization';

const ORGANIZATIONS_COLLECTION = 'organizations';

export const MemberService = {
  /**
   * Get all members of an organization
   */
  async getMembers(orgId: string): Promise<Member[]> {
    try {
      const membersRef = collection(
        db,
        `${ORGANIZATIONS_COLLECTION}/${orgId}/members`
      );
      const q = query(membersRef, orderBy('joinedAt', 'desc'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          orgId,
          userId: data.userId,
          email: data.email,
          displayName: data.displayName,
          photoURL: data.photoURL,
          role: data.role,
          status: data.status,
          joinedAt: data.joinedAt?.toDate?.() || new Date(data.joinedAt),
          invitedBy: data.invitedBy,
        };
      });
    } catch (error) {
      console.error('Error getting members:', error);
      throw error;
    }
  },

  /**
   * Get a single member
   */
  async getMember(orgId: string, userId: string): Promise<Member | null> {
    try {
      const memberRef = doc(
        db,
        `${ORGANIZATIONS_COLLECTION}/${orgId}/members`,
        userId
      );
      const snapshot = await getDoc(memberRef);

      if (!snapshot.exists()) {
        return null;
      }

      const data = snapshot.data();
      return {
        id: snapshot.id,
        orgId,
        userId: data.userId,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        role: data.role,
        status: data.status,
        joinedAt: data.joinedAt?.toDate?.() || new Date(data.joinedAt),
        invitedBy: data.invitedBy,
      };
    } catch (error) {
      console.error('Error getting member:', error);
      throw error;
    }
  },

  /**
   * Add a member to organization
   */
  async addMember(
    orgId: string,
    userId: string,
    data: {
      email: string;
      displayName?: string;
      photoURL?: string;
      role: MemberRole;
      invitedBy?: string;
    }
  ): Promise<Member> {
    try {
      const memberRef = doc(
        db,
        `${ORGANIZATIONS_COLLECTION}/${orgId}/members`,
        userId
      );
      const now = new Date();

      const memberData = {
        userId,
        email: data.email,
        displayName: data.displayName || null,
        photoURL: data.photoURL || null,
        role: data.role,
        status: 'active' as const,
        joinedAt: Timestamp.fromDate(now),
        invitedBy: data.invitedBy,
      };

      await setDoc(memberRef, memberData);

      return {
        id: userId,
        orgId,
        ...memberData,
        joinedAt: now,
      };
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  },

  /**
   * Update member role
   */
  async updateRole(
    orgId: string,
    userId: string,
    newRole: MemberRole
  ): Promise<void> {
    try {
      const memberRef = doc(
        db,
        `${ORGANIZATIONS_COLLECTION}/${orgId}/members`,
        userId
      );
      await updateDoc(memberRef, { role: newRole });
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  },

  /**
   * Remove member from organization
   */
  async removeMember(orgId: string, userId: string): Promise<void> {
    try {
      const memberRef = doc(
        db,
        `${ORGANIZATIONS_COLLECTION}/${orgId}/members`,
        userId
      );
      await deleteDoc(memberRef);
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  },

  // ============================================
  // INVITATIONS
  // ============================================

  /**
   * Create invitation
   */
  async createInvitation(
    orgId: string,
    data: {
      email: string;
      role: MemberRole;
      invitedBy: string;
      invitedByName: string;
    }
  ): Promise<Invitation> {
    try {
      const invitationsRef = collection(
        db,
        `${ORGANIZATIONS_COLLECTION}/${orgId}/invitations`
      );
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const invitationData = {
        email: data.email.toLowerCase(),
        role: data.role,
        status: 'pending' as InvitationStatus,
        invitedBy: data.invitedBy,
        invitedByName: data.invitedByName,
        createdAt: Timestamp.fromDate(now),
        expiresAt: Timestamp.fromDate(expiresAt),
      };

      const docRef = await addDoc(invitationsRef, invitationData);

      return {
        id: docRef.id,
        orgId,
        ...invitationData,
        createdAt: now,
        expiresAt,
      };
    } catch (error) {
      console.error('Error creating invitation:', error);
      throw error;
    }
  },

  /**
   * Get pending invitations for an organization
   */
  async getInvitations(orgId: string): Promise<Invitation[]> {
    try {
      const invitationsRef = collection(
        db,
        `${ORGANIZATIONS_COLLECTION}/${orgId}/invitations`
      );
      const q = query(
        invitationsRef,
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          orgId,
          email: data.email,
          role: data.role,
          status: data.status,
          invitedBy: data.invitedBy,
          invitedByName: data.invitedByName,
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
          expiresAt: data.expiresAt?.toDate?.() || new Date(data.expiresAt),
        };
      });
    } catch (error) {
      console.error('Error getting invitations:', error);
      throw error;
    }
  },

  /**
   * Accept invitation
   */
  async acceptInvitation(
    orgId: string,
    invitationId: string,
    userId: string,
    userData: {
      email: string;
      displayName?: string;
      photoURL?: string;
    }
  ): Promise<void> {
    try {
      // Get invitation
      const invitationRef = doc(
        db,
        `${ORGANIZATIONS_COLLECTION}/${orgId}/invitations`,
        invitationId
      );
      const invitationSnap = await getDoc(invitationRef);

      if (!invitationSnap.exists()) {
        throw new Error('Invitation not found');
      }

      const invitation = invitationSnap.data();

      // Check if expired
      const expiresAt =
        invitation.expiresAt?.toDate?.() || new Date(invitation.expiresAt);
      if (expiresAt < new Date()) {
        throw new Error('Invitation has expired');
      }

      // Add as member
      await this.addMember(orgId, userId, {
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        role: invitation.role,
        invitedBy: invitation.invitedBy,
      });

      // Update invitation status
      await updateDoc(invitationRef, {
        status: 'accepted',
        acceptedAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  },

  /**
   * Cancel/delete invitation
   */
  async cancelInvitation(orgId: string, invitationId: string): Promise<void> {
    try {
      const invitationRef = doc(
        db,
        `${ORGANIZATIONS_COLLECTION}/${orgId}/invitations`,
        invitationId
      );
      await deleteDoc(invitationRef);
    } catch (error) {
      console.error('Error canceling invitation:', error);
      throw error;
    }
  },
};
