import { useCallback } from 'react';
import type {
  Collection,
  BaseItem,
  SortSpecifier,
  Selector,
  Modifier,
} from '@signaldb/core';

import { useReactivity } from '../lib/db';

export interface UseSignalDBOptions<T extends BaseItem> {
  collection: Collection<T>;
  selector?: Selector<T>;
  options?: {
    sort?: SortSpecifier<T>;
    limit?: number;
    skip?: number;
  };
}

export interface UseSignalDBReturn<T extends BaseItem> {
  // Data access
  data: T[];
  count: number;
  isLoading: boolean;

  // CRUD operations
  findOne: (selector: Selector<T>) => T | undefined;
  insert: (doc: Omit<T, 'id'>) => string;
  updateOne: (selector: Selector<T>, update: Partial<T>) => number;
  updateMany: (selector: Selector<T>, update: Partial<T>) => number;
  removeOne: (selector: Selector<T>) => number;
  removeMany: (selector: Selector<T>) => number;

  // Utilities
  refresh: () => void;
  exists: (selector: Selector<T>) => boolean;
}

/**
 * Generic hook for interacting with SignalDB collections
 * Provides reactive data access and common CRUD operations
 */
export function useSignalDB<T extends BaseItem>({
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
    (findSelector: Selector<T>): T | undefined => {
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
    (updateSelector: Selector<T>, update: Partial<T>): number => {
      // Add updatedAt field if it exists in the type
      const updateWithTimestamp = {
        ...update,
        ...('updatedAt' in update || !update ? { updatedAt: new Date() } : {}),
      } as Partial<T>;

      return collection.updateOne(updateSelector, {
        $set: updateWithTimestamp,
      } as Modifier<T>);
    },
    [collection]
  );

  const updateMany = useCallback(
    (updateSelector: Selector<T>, update: Partial<T>): number => {
      // Add updatedAt field if it exists in the type
      const updateWithTimestamp = {
        ...update,
        ...('updatedAt' in update || !update ? { updatedAt: new Date() } : {}),
      } as Partial<T>;

      return collection.updateMany(updateSelector, {
        $set: updateWithTimestamp,
      } as Modifier<T>);
    },
    [collection]
  );

  const removeOne = useCallback(
    (removeSelector: Selector<T>): number => {
      return collection.removeOne(removeSelector);
    },
    [collection]
  );

  const removeMany = useCallback(
    (removeSelector: Selector<T>): number => {
      return collection.removeMany(removeSelector);
    },
    [collection]
  );

  const exists = useCallback(
    (existsSelector: Selector<T>): boolean => {
      return collection.findOne(existsSelector) !== undefined;
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
