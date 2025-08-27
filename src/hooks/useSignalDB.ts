import { useCallback } from 'react';
import type { Collection } from '@signaldb/core';
import { useReactivity } from '../lib/db';

export interface UseSignalDBOptions<T> {
  collection: Collection<T>;
  selector?: object;
  options?: {
    sort?: object;
    limit?: number;
    skip?: number;
  };
}

export interface UseSignalDBReturn<T> {
  // Data access
  data: T[];
  count: number;
  isLoading: boolean;

  // CRUD operations
  findOne: (selector: object) => T | null;
  insert: (doc: Omit<T, 'id'>) => string;
  updateOne: (selector: object, update: Partial<T>) => number;
  updateMany: (selector: object, update: Partial<T>) => number;
  removeOne: (selector: object) => number;
  removeMany: (selector: object) => number;

  // Utilities
  refresh: () => void;
  exists: (selector: object) => boolean;
}

/**
 * Generic hook for interacting with SignalDB collections
 * Provides reactive data access and common CRUD operations
 */
export function useSignalDB<T extends { id: string }>({
  collection,
  selector = {},
  options = {},
}: UseSignalDBOptions<T>): UseSignalDBReturn<T> {
  // Reactive data using useReactivity
  const data = useReactivity(() => {
    return collection.find(selector, options).fetch();
  });

  const count = useReactivity(() => {
    return collection.find(selector).count();
  });

  const isLoading = false; // SignalDB is synchronous
  const refresh = useCallback(() => {
    // Force re-render by updating the collection
    collection.find(selector).fetch();
  }, [collection, selector]);

  // CRUD operations
  const findOne = useCallback(
    (findSelector: object): T | null => {
      return collection.findOne(findSelector);
    },
    [collection]
  );

  const insert = useCallback(
    (doc: Omit<T, 'id'>): string => {
      const id = generateId();
      const docWithId = { ...doc, id } as T;
      collection.insert(docWithId);
      return id;
    },
    [collection]
  );

  const updateOne = useCallback(
    (updateSelector: object, update: Partial<T>): number => {
      const updateDoc = {
        ...update,
        updatedAt: new Date(),
      };
      return collection.updateOne(updateSelector, { $set: updateDoc });
    },
    [collection]
  );

  const updateMany = useCallback(
    (updateSelector: object, update: Partial<T>): number => {
      const updateDoc = {
        ...update,
        updatedAt: new Date(),
      };
      return collection.updateMany(updateSelector, { $set: updateDoc });
    },
    [collection]
  );

  const removeOne = useCallback(
    (removeSelector: object): number => {
      return collection.removeOne(removeSelector);
    },
    [collection]
  );

  const removeMany = useCallback(
    (removeSelector: object): number => {
      return collection.removeMany(removeSelector);
    },
    [collection]
  );

  const exists = useCallback(
    (existsSelector: object): boolean => {
      return collection.findOne(existsSelector) !== null;
    },
    [collection]
  );

  // Return object
  return {
    data: data || [],
    count: count || 0,
    isLoading,
    findOne,
    insert,
    updateOne,
    updateMany,
    removeOne,
    removeMany,
    refresh,
    exists,
  };
}

/**
 * Simple ID generator
 */
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
