'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  QueryConstraint,
  DocumentData,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/config';

interface UseFirestoreOptions {
  realtime?: boolean;
  limitCount?: number;
}

interface UseFirestoreResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}

/**
 * Generic Firestore collection hook
 *
 * @example
 * const { data: cards, loading } = useFirestoreCollection<RoadmapCard>(
 *   `organizations/${orgId}/roadmap_cards`,
 *   [where('status', '==', 'todo')],
 *   { realtime: true }
 * );
 */
export function useFirestoreCollection<T extends DocumentData>(
  path: string,
  constraints: QueryConstraint[] = [],
  options: UseFirestoreOptions = {}
): UseFirestoreResult<T> {
  const { realtime = true, limitCount } = options;
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const collectionRef = collection(db, path);
    const queryConstraints = [...constraints];

    if (limitCount) {
      queryConstraints.push(limit(limitCount));
    }

    const q = query(collectionRef, ...queryConstraints);

    if (realtime) {
      // Real-time listener
      const unsubscribe = onSnapshot(
        q,
        snapshot => {
          const docs = snapshot.docs.map(doc => {
            const docData = doc.data();
            // Convert Timestamps to Dates
            const converted: Record<string, unknown> = { id: doc.id };
            for (const [key, value] of Object.entries(docData)) {
              if (value instanceof Timestamp) {
                converted[key] = value.toDate();
              } else {
                converted[key] = value;
              }
            }
            return converted as T;
          });
          setData(docs);
          setLoading(false);
        },
        err => {
          console.error(`Firestore error for ${path}:`, err);
          setError(err as Error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      // One-time fetch
      import('firebase/firestore').then(({ getDocs }) => {
        getDocs(q)
          .then(snapshot => {
            const docs = snapshot.docs.map(doc => {
              const docData = doc.data();
              const converted: Record<string, unknown> = { id: doc.id };
              for (const [key, value] of Object.entries(docData)) {
                if (value instanceof Timestamp) {
                  converted[key] = value.toDate();
                } else {
                  converted[key] = value;
                }
              }
              return converted as T;
            });
            setData(docs);
            setLoading(false);
          })
          .catch(err => {
            console.error(`Firestore error for ${path}:`, err);
            setError(err as Error);
            setLoading(false);
          });
      });
    }
  }, [path, refreshKey, realtime, limitCount, JSON.stringify(constraints)]);

  return { data, loading, error, refresh };
}

// Re-export query helpers for convenience
export { where, orderBy, limit } from 'firebase/firestore';
