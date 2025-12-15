// Roadmap Service - Kanban board card management
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import {
  RoadmapCard,
  CardStatus,
  CreateCardData,
  UpdateCardData,
} from '@/types/roadmap';

const ORGANIZATIONS_COLLECTION = 'organizations';
const CARDS_SUBCOLLECTION = 'roadmap_cards';

export const RoadmapService = {
  /**
   * Get all cards for an organization
   */
  async getAll(orgId: string): Promise<RoadmapCard[]> {
    try {
      const cardsRef = collection(
        db,
        `${ORGANIZATIONS_COLLECTION}/${orgId}/${CARDS_SUBCOLLECTION}`
      );
      const q = query(cardsRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          orgId,
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          assignedTo: data.assignedTo,
          assignedToName: data.assignedToName,
          assignedToPhoto: data.assignedToPhoto,
          labels: data.labels || [],
          dueDate:
            data.dueDate?.toDate?.() ||
            (data.dueDate ? new Date(data.dueDate) : undefined),
          estimatedHours: data.estimatedHours,
          createdBy: data.createdBy,
          createdByName: data.createdByName,
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
          completedAt:
            data.completedAt?.toDate?.() ||
            (data.completedAt ? new Date(data.completedAt) : undefined),
          order: data.order,
        };
      });
    } catch (error) {
      console.error('Error getting roadmap cards:', error);
      throw error;
    }
  },

  /**
   * Get cards by status
   */
  async getByStatus(orgId: string, status: CardStatus): Promise<RoadmapCard[]> {
    try {
      const cardsRef = collection(
        db,
        `${ORGANIZATIONS_COLLECTION}/${orgId}/${CARDS_SUBCOLLECTION}`
      );
      const q = query(
        cardsRef,
        where('status', '==', status),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          orgId,
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          assignedTo: data.assignedTo,
          assignedToName: data.assignedToName,
          assignedToPhoto: data.assignedToPhoto,
          labels: data.labels || [],
          dueDate: data.dueDate?.toDate?.(),
          estimatedHours: data.estimatedHours,
          createdBy: data.createdBy,
          createdByName: data.createdByName,
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
          completedAt: data.completedAt?.toDate?.(),
          order: data.order,
        };
      });
    } catch (error) {
      console.error('Error getting cards by status:', error);
      throw error;
    }
  },

  /**
   * Get a single card
   */
  async getById(orgId: string, cardId: string): Promise<RoadmapCard | null> {
    try {
      const cardRef = doc(
        db,
        `${ORGANIZATIONS_COLLECTION}/${orgId}/${CARDS_SUBCOLLECTION}`,
        cardId
      );
      const snapshot = await getDoc(cardRef);

      if (!snapshot.exists()) {
        return null;
      }

      const data = snapshot.data();
      return {
        id: snapshot.id,
        orgId,
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        assignedTo: data.assignedTo,
        assignedToName: data.assignedToName,
        assignedToPhoto: data.assignedToPhoto,
        labels: data.labels || [],
        dueDate: data.dueDate?.toDate?.(),
        estimatedHours: data.estimatedHours,
        createdBy: data.createdBy,
        createdByName: data.createdByName,
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
        completedAt: data.completedAt?.toDate?.(),
        order: data.order,
      };
    } catch (error) {
      console.error('Error getting card:', error);
      throw error;
    }
  },

  /**
   * Create a new card
   */
  async create(
    orgId: string,
    data: CreateCardData,
    creatorId: string,
    creatorName: string
  ): Promise<RoadmapCard> {
    try {
      const cardsRef = collection(
        db,
        `${ORGANIZATIONS_COLLECTION}/${orgId}/${CARDS_SUBCOLLECTION}`
      );
      const now = new Date();

      // Get max order for the target status
      const status = data.status || 'backlog';
      const existingCards = await this.getByStatus(orgId, status);
      const maxOrder = existingCards.reduce(
        (max, card) => Math.max(max, card.order),
        0
      );

      const cardData = {
        title: data.title,
        description: data.description || '',
        status,
        priority: data.priority || 'medium',
        assignedTo: data.assignedTo || undefined,
        assignedToName: undefined,
        assignedToPhoto: undefined,
        labels: data.labels || [],
        dueDate: data.dueDate ? Timestamp.fromDate(data.dueDate) : null,
        estimatedHours: data.estimatedHours || undefined,
        createdBy: creatorId,
        createdByName: creatorName,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
        completedAt: undefined,
        order: maxOrder + 1,
      };

      const docRef = await addDoc(cardsRef, cardData);

      return {
        id: docRef.id,
        orgId,
        ...cardData,
        dueDate: data.dueDate,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      console.error('Error creating card:', error);
      throw error;
    }
  },

  /**
   * Update a card
   */
  async update(
    orgId: string,
    cardId: string,
    data: UpdateCardData
  ): Promise<void> {
    try {
      const cardRef = doc(
        db,
        `${ORGANIZATIONS_COLLECTION}/${orgId}/${CARDS_SUBCOLLECTION}`,
        cardId
      );

      const updateData: Record<string, unknown> = {
        ...data,
        updatedAt: Timestamp.fromDate(new Date()),
      };

      // Convert dates to Timestamps
      if (data.dueDate) {
        updateData.dueDate = Timestamp.fromDate(data.dueDate);
      }
      if (data.completedAt) {
        updateData.completedAt = Timestamp.fromDate(data.completedAt);
      }

      await updateDoc(cardRef, updateData);
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    }
  },

  /**
   * Move card to new status
   */
  async moveCard(
    orgId: string,
    cardId: string,
    newStatus: CardStatus,
    newOrder: number
  ): Promise<void> {
    try {
      const cardRef = doc(
        db,
        `${ORGANIZATIONS_COLLECTION}/${orgId}/${CARDS_SUBCOLLECTION}`,
        cardId
      );

      const updateData: Record<string, unknown> = {
        status: newStatus,
        order: newOrder,
        updatedAt: Timestamp.fromDate(new Date()),
      };

      // Mark as completed if moved to done
      if (newStatus === 'done') {
        updateData.completedAt = Timestamp.fromDate(new Date());
      }

      await updateDoc(cardRef, updateData);
    } catch (error) {
      console.error('Error moving card:', error);
      throw error;
    }
  },

  /**
   * Reorder cards within a column
   */
  async reorderCards(
    orgId: string,
    cardOrders: { id: string; order: number }[]
  ): Promise<void> {
    try {
      const batch = writeBatch(db);
      const now = Timestamp.fromDate(new Date());

      for (const { id, order } of cardOrders) {
        const cardRef = doc(
          db,
          `${ORGANIZATIONS_COLLECTION}/${orgId}/${CARDS_SUBCOLLECTION}`,
          id
        );
        batch.update(cardRef, { order, updatedAt: now });
      }

      await batch.commit();
    } catch (error) {
      console.error('Error reordering cards:', error);
      throw error;
    }
  },

  /**
   * Delete a card
   */
  async delete(orgId: string, cardId: string): Promise<void> {
    try {
      const cardRef = doc(
        db,
        `${ORGANIZATIONS_COLLECTION}/${orgId}/${CARDS_SUBCOLLECTION}`,
        cardId
      );
      await deleteDoc(cardRef);
    } catch (error) {
      console.error('Error deleting card:', error);
      throw error;
    }
  },
};
