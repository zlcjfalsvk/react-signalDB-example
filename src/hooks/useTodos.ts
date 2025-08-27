import { useCallback, useMemo } from 'react';
import { todosCollection } from '../lib/db';
import { useSignalDB } from './useSignalDB';
import type { 
  Todo, 
  FilterOptions, 
  TodoStats, 
  SortBy, 
  Priority,
  FilterStatus 
} from '../types/todo';

export interface UseTodosOptions {
  filter?: FilterOptions;
  sortBy?: SortBy;
  sortDirection?: 'asc' | 'desc';
  limit?: number;
}

export interface UseTodosReturn {
  // Data
  todos: Todo[];
  filteredTodos: Todo[];
  totalCount: number;
  isLoading: boolean;
  
  // CRUD operations
  createTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateTodo: (id: string, update: Partial<Todo>) => boolean;
  deleteTodo: (id: string) => boolean;
  toggleTodo: (id: string) => boolean;
  
  // Filtering and searching
  filterTodos: (filter: FilterOptions) => Todo[];
  searchTodos: (searchTerm: string) => Todo[];
  sortTodos: (todos: Todo[], sortBy: SortBy, direction?: 'asc' | 'desc') => Todo[];
  
  // Statistics
  getTodoStats: () => TodoStats;
  getTagStats: () => Record<string, number>;
  getPriorityStats: () => Record<Priority, number>;
  
  // Bulk operations
  clearCompleted: () => number;
  clearAll: () => number;
  markAllCompleted: () => number;
  markAllActive: () => number;
  
  // Utilities
  getTodoById: (id: string) => Todo | null;
  getTodosByTag: (tag: string) => Todo[];
  getTodosByPriority: (priority: Priority) => Todo[];
  getOverdueTodos: () => Todo[];
  getTodosForToday: () => Todo[];
  refresh: () => void;
}

export function useTodos(options: UseTodosOptions = {}): UseTodosReturn {
  const { filter = {}, sortBy = 'createdAt', sortDirection = 'desc', limit } = options;
  
  // Build selector based on filters
  const selector = useMemo(() => {
    const sel: any = {};
    
    if (filter.status === 'active') {
      sel.completed = false;
    } else if (filter.status === 'completed') {
      sel.completed = true;
    }
    
    if (filter.priority) {
      sel.priority = filter.priority;
    }
    
    if (filter.tags && filter.tags.length > 0) {
      sel.tags = { $in: filter.tags };
    }
    
    if (filter.dateRange) {
      sel.createdAt = {
        $gte: filter.dateRange.start,
        $lte: filter.dateRange.end,
      };
    }
    
    return sel;
  }, [filter]);

  // Sort options
  const sortOptions = useMemo(() => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    return { [sortBy]: direction };
  }, [sortBy, sortDirection]);

  // Use the generic SignalDB hook
  const {
    data: todos,
    count: totalCount,
    isLoading,
    insert,
    updateOne,
    removeOne,
    removeMany,
    findOne,
    refresh,
  } = useSignalDB({
    collection: todosCollection,
    selector,
    options: {
      sort: sortOptions,
      limit,
    },
  });

  // Apply additional filtering for search term
  const filteredTodos = useMemo(() => {
    if (!filter.searchTerm) return todos;
    
    const searchTerm = filter.searchTerm.toLowerCase();
    return todos.filter(todo =>
      todo.title.toLowerCase().includes(searchTerm) ||
      todo.description?.toLowerCase().includes(searchTerm) ||
      todo.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }, [todos, filter.searchTerm]);

  // CRUD operations
  const createTodo = useCallback((todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const now = new Date();
    const todo: Omit<Todo, 'id'> = {
      ...todoData,
      createdAt: now,
      updatedAt: now,
    };
    return insert(todo);
  }, [insert]);

  const updateTodo = useCallback((id: string, update: Partial<Todo>): boolean => {
    const result = updateOne({ id }, update);
    return result > 0;
  }, [updateOne]);

  const deleteTodo = useCallback((id: string): boolean => {
    const result = removeOne({ id });
    return result > 0;
  }, [removeOne]);

  const toggleTodo = useCallback((id: string): boolean => {
    const todo = findOne({ id });
    if (!todo) return false;
    
    const result = updateOne({ id }, { completed: !todo.completed });
    return result > 0;
  }, [findOne, updateOne]);

  // Filtering and searching functions
  const filterTodos = useCallback((filterOptions: FilterOptions): Todo[] => {
    let filtered = todos;

    // Filter by status
    if (filterOptions.status === 'active') {
      filtered = filtered.filter(todo => !todo.completed);
    } else if (filterOptions.status === 'completed') {
      filtered = filtered.filter(todo => todo.completed);
    }

    // Filter by priority
    if (filterOptions.priority) {
      filtered = filtered.filter(todo => todo.priority === filterOptions.priority);
    }

    // Filter by tags
    if (filterOptions.tags && filterOptions.tags.length > 0) {
      filtered = filtered.filter(todo =>
        filterOptions.tags!.some(tag => todo.tags.includes(tag))
      );
    }

    // Filter by search term
    if (filterOptions.searchTerm) {
      const searchTerm = filterOptions.searchTerm.toLowerCase();
      filtered = filtered.filter(todo =>
        todo.title.toLowerCase().includes(searchTerm) ||
        todo.description?.toLowerCase().includes(searchTerm) ||
        todo.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Filter by date range
    if (filterOptions.dateRange) {
      filtered = filtered.filter(todo =>
        todo.createdAt >= filterOptions.dateRange!.start &&
        todo.createdAt <= filterOptions.dateRange!.end
      );
    }

    return filtered;
  }, [todos]);

  const searchTodos = useCallback((searchTerm: string): Todo[] => {
    const term = searchTerm.toLowerCase();
    return todos.filter(todo =>
      todo.title.toLowerCase().includes(term) ||
      todo.description?.toLowerCase().includes(term) ||
      todo.tags.some(tag => tag.toLowerCase().includes(term))
    );
  }, [todos]);

  const sortTodos = useCallback((todosToSort: Todo[], sortField: SortBy, direction: 'asc' | 'desc' = 'desc'): Todo[] => {
    return [...todosToSort].sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortField) {
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3 };
          aVal = priorityOrder[a.priority];
          bVal = priorityOrder[b.priority];
          break;
        case 'date':
        default:
          aVal = a.createdAt.getTime();
          bVal = b.createdAt.getTime();
          break;
      }
      
      if (direction === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  }, []);

  // Statistics
  const getTodoStats = useCallback((): TodoStats => {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const active = total - completed;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayAdded = todos.filter(todo => 
      todo.createdAt >= today && todo.createdAt < tomorrow
    ).length;
    
    const now = new Date();
    const overdueCount = todos.filter(todo => 
      !todo.completed && todo.dueDate && todo.dueDate < now
    ).length;

    return {
      total,
      completed,
      active,
      completionRate,
      todayAdded,
      overdueCount,
    };
  }, [todos]);

  const getTagStats = useCallback((): Record<string, number> => {
    const tagCounts: Record<string, number> = {};
    
    todos.forEach(todo => {
      todo.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    return tagCounts;
  }, [todos]);

  const getPriorityStats = useCallback((): Record<Priority, number> => {
    const priorityCounts: Record<Priority, number> = {
      low: 0,
      medium: 0,
      high: 0,
    };
    
    todos.forEach(todo => {
      priorityCounts[todo.priority]++;
    });
    
    return priorityCounts;
  }, [todos]);

  // Bulk operations
  const clearCompleted = useCallback((): number => {
    return removeMany({ completed: true });
  }, [removeMany]);

  const clearAll = useCallback((): number => {
    return removeMany({});
  }, [removeMany]);

  const markAllCompleted = useCallback((): number => {
    return todosCollection.updateMany({ completed: false }, { $set: { completed: true, updatedAt: new Date() } });
  }, []);

  const markAllActive = useCallback((): number => {
    return todosCollection.updateMany({ completed: true }, { $set: { completed: false, updatedAt: new Date() } });
  }, []);

  // Utility functions
  const getTodoById = useCallback((id: string): Todo | null => {
    return findOne({ id });
  }, [findOne]);

  const getTodosByTag = useCallback((tag: string): Todo[] => {
    return todos.filter(todo => todo.tags.includes(tag));
  }, [todos]);

  const getTodosByPriority = useCallback((priority: Priority): Todo[] => {
    return todos.filter(todo => todo.priority === priority);
  }, [todos]);

  const getOverdueTodos = useCallback((): Todo[] => {
    const now = new Date();
    return todos.filter(todo => 
      !todo.completed && todo.dueDate && todo.dueDate < now
    );
  }, [todos]);

  const getTodosForToday = useCallback((): Todo[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return todos.filter(todo =>
      todo.dueDate && todo.dueDate >= today && todo.dueDate < tomorrow
    );
  }, [todos]);

  return {
    // Data
    todos,
    filteredTodos,
    totalCount,
    isLoading,
    
    // CRUD operations
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    
    // Filtering and searching
    filterTodos,
    searchTodos,
    sortTodos,
    
    // Statistics
    getTodoStats,
    getTagStats,
    getPriorityStats,
    
    // Bulk operations
    clearCompleted,
    clearAll,
    markAllCompleted,
    markAllActive,
    
    // Utilities
    getTodoById,
    getTodosByTag,
    getTodosByPriority,
    getOverdueTodos,
    getTodosForToday,
    refresh,
  };
}