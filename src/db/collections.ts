import { Collection } from '@signaldb/core';
import createLocalStorageAdapter from '@signaldb/localstorage';
import maverickjsReactivityAdapter from '@signaldb/maverickjs';

import { Todo, Folder } from '../types/folder';

// Create SignalDB collection for todos with localStorage persistence
export const todosCollection = new Collection<Todo>({ 
  name: 'todos',
  reactivity: maverickjsReactivityAdapter,
  persistence: createLocalStorageAdapter('working-todos', {
    serialize: (items) => JSON.stringify(items.map(item => ({
      ...item,
      createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt
    }))),
    deserialize: (itemsString) => {
      const parsed = JSON.parse(itemsString);
      return parsed.map((item: Todo) => ({
        ...item,
        createdAt: new Date(item.createdAt)
      }));
    },
  })
});

// Create SignalDB collection for folders with localStorage persistence
export const foldersCollection = new Collection<Folder>({ 
  name: 'folders',
  reactivity: maverickjsReactivityAdapter,
  persistence: createLocalStorageAdapter('folders', {
    serialize: (items) => JSON.stringify(items.map(item => ({
      ...item,
      createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt,
      updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : item.updatedAt
    }))),
    deserialize: (itemsString) => {
      const parsed = JSON.parse(itemsString);
      return parsed.map((item: Folder) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      }));
    },
  })
});

// Initialize root folder if not exists
const initializeRootFolder = () => {
  const rootFolder = foldersCollection.findOne({ id: 'root' });
  if (!rootFolder) {
    foldersCollection.insert({
      id: 'root',
      name: 'Root',
      color: '#6B7280',
      parentId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
};

// Initialize on module load
initializeRootFolder();