import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Todo } from '../types/todo';

// Mock the SignalDB modules before importing db
vi.mock('@signaldb/core', () => ({
  Collection: vi.fn().mockImplementation((options) => {
    const storage = new Map();
    return {
      name: options.name,
      insert: vi.fn((doc) => {
        storage.set(doc.id, doc);
        return doc;
      }),
      insertOne: vi.fn((doc) => {
        storage.set(doc.id, doc);
        return doc;
      }),
      findOne: vi.fn((selector) => {
        if (selector.id) {
          return storage.get(selector.id) || null;
        }
        return Array.from(storage.values())[0] || null;
      }),
      find: vi.fn(() => ({
        toArray: vi.fn(() => Array.from(storage.values())),
        onChange: vi.fn((callback) => {
          return () => {};
        }),
      })),
      updateOne: vi.fn((selector, update) => {
        const doc = storage.get(selector.id);
        if (doc && update.$set) {
          const updated = { ...doc, ...update.$set };
          storage.set(selector.id, updated);
        }
        return 1;
      }),
      remove: vi.fn((selector) => {
        if (selector && selector.id) {
          storage.delete(selector.id);
        } else {
          storage.clear();
        }
        return 1;
      }),
      createIndex: vi.fn(),
      memory: vi.fn(() => Array.from(storage.values())),
    };
  }),
}));

vi.mock('@signaldb/localstorage', () => ({
  default: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  })),
  createLocalStorageAdapter: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  })),
}));

vi.mock('@signaldb/react', () => ({
  createReactivityAdapter: vi.fn(() => ({
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  })),
  createUseReactivityHook: vi.fn(() => vi.fn()),
  useReactiveQuery: vi.fn(() => []),
  useReactiveCount: vi.fn(() => 0),
}));

// Now import the module after mocks are set up
const { todosCollection, initializeDatabase } = await import('./db');

describe('SignalDB Collection', () => {
  beforeEach(() => {
    // Clear the collection before each test
    todosCollection.remove({});
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up after each test
    todosCollection.remove({});
    localStorage.clear();
  });

  it('should initialize collection', () => {
    expect(todosCollection).toBeDefined();
    expect(todosCollection.name).toBe('todos');
  });

  it('should persist to localStorage', async () => {
    const todo: Omit<Todo, 'id'> = {
      title: 'Test Todo',
      description: 'Test Description',
      completed: false,
      priority: 'medium',
      tags: ['test'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const inserted = todosCollection.insert({ ...todo, id: '1' });
    expect(inserted).toBeDefined();

    // Check if it's persisted in localStorage
    const storedData = localStorage.getItem('todos');
    expect(storedData).toBeDefined();
    expect(storedData).toContain('Test Todo');
  });

  it('should trigger reactivity', async () => {
    let changeCount = 0;
    const unsubscribe = todosCollection.find({}).onChange(() => {
      changeCount++;
    });

    todosCollection.insert({
      id: '1',
      title: 'Test Todo',
      completed: false,
      priority: 'medium',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Wait for reactivity to trigger
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(changeCount).toBeGreaterThan(0);
    unsubscribe();
  });

  it('should handle concurrent updates', async () => {
    const todo = {
      id: '1',
      title: 'Test Todo',
      completed: false,
      priority: 'medium' as const,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    todosCollection.insert(todo);

    // Perform concurrent updates
    const update1 = todosCollection.updateOne(
      { id: '1' },
      { $set: { completed: true } }
    );
    const update2 = todosCollection.updateOne(
      { id: '1' },
      { $set: { priority: 'high' } }
    );

    await Promise.all([update1, update2]);

    const updated = todosCollection.findOne({ id: '1' });
    expect(updated).toBeDefined();
    expect(updated?.completed).toBe(true);
    expect(updated?.priority).toBe('high');
  });

  it('should initialize database with version management', () => {
    initializeDatabase();
    const version = localStorage.getItem('todos_db_version');
    expect(version).toBe('1');
  });
});
