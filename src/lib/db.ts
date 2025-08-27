import { Collection } from '@signaldb/core';
import localStorageAdapter from '@signaldb/localstorage';
import { createUseReactivityHook } from '@signaldb/react';
import type { Todo } from '../types/todo';

// Create the useReactivity hook
export const useReactivity = createUseReactivityHook();

// Create the todos collection
export const todosCollection = new Collection<Todo>({
  name: 'todos',
  primaryKey: 'id',
  memory: localStorageAdapter('todos'),
});

// Initialize indexes for better query performance
todosCollection.createIndex({ priority: 1 });
todosCollection.createIndex({ completed: 1 });
todosCollection.createIndex({ createdAt: -1 });
todosCollection.createIndex({ dueDate: 1 });
todosCollection.createIndex({ tags: 1 });

// Migration logic for version management
const STORAGE_VERSION_KEY = 'todos_db_version';
const CURRENT_VERSION = 1;

export function initializeDatabase() {
  const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
  const version = storedVersion ? parseInt(storedVersion, 10) : 0;

  if (version < CURRENT_VERSION) {
    // Perform migrations if needed
    if (version === 0) {
      // Initial setup - no migration needed
      console.log('Initializing SignalDB for the first time');
    }

    // Update version
    localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION.toString());
  }
}

// Initialize database on module load
initializeDatabase();
