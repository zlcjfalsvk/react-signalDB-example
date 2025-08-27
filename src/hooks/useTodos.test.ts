import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTodos } from './useTodos';
import { useSignalDB } from './useSignalDB';
import { todosCollection } from '../lib/db';
import type { Todo, FilterOptions } from '../types/todo';

// Mock dependencies
vi.mock('./useSignalDB');
vi.mock('../lib/db', () => ({
  todosCollection: {
    updateMany: vi.fn(),
  },
}));

describe('useTodos', () => {
  let mockUseSignalDB: vi.Mock;

  const mockTodos: Todo[] = [
    {
      id: '1',
      title: 'Test Todo 1',
      description: 'First test todo',
      completed: false,
      priority: 'high',
      tags: ['work', 'urgent'],
      dueDate: new Date('2024-12-31'),
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    {
      id: '2',
      title: 'Test Todo 2',
      description: 'Second test todo',
      completed: true,
      priority: 'medium',
      tags: ['personal'],
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
    },
    {
      id: '3',
      title: 'Overdue Todo',
      description: 'This todo is overdue',
      completed: false,
      priority: 'low',
      tags: ['personal'],
      dueDate: new Date('2023-01-01'), // Past date
      createdAt: new Date('2023-01-03'),
      updatedAt: new Date('2023-01-03'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseSignalDB = vi.mocked(useSignalDB) as vi.Mock;

    mockUseSignalDB.mockReturnValue({
      data: mockTodos,
      count: mockTodos.length,
      isLoading: false,
      findOne: vi.fn(
        (selector: { id: string }) =>
          mockTodos.find((todo) => todo.id === selector.id) || null
      ),
      insert: vi.fn().mockReturnValue('new-id'),
      updateOne: vi.fn().mockReturnValue(1),
      updateMany: vi.fn().mockReturnValue(2),
      removeOne: vi.fn().mockReturnValue(1),
      removeMany: vi.fn().mockReturnValue(2),
      refresh: vi.fn(),
      exists: vi.fn(),
    });
  });

  describe('basic functionality', () => {
    it('should return todos and basic data', () => {
      const { result } = renderHook(() => useTodos());

      expect(result.current.todos).toEqual(mockTodos);
      expect(result.current.totalCount).toBe(3);
      expect(result.current.isLoading).toBe(false);
    });

    it('should filter todos with search term', () => {
      const { result } = renderHook(() =>
        useTodos({ filter: { searchTerm: 'urgent' } })
      );

      const filtered = result.current.filteredTodos;
      expect(filtered).toHaveLength(1);
      expect(filtered[0].tags).toContain('urgent');
    });

    it('should handle empty search term', () => {
      const { result } = renderHook(() =>
        useTodos({ filter: { searchTerm: '' } })
      );

      expect(result.current.filteredTodos).toEqual(mockTodos);
    });
  });

  describe('CRUD operations', () => {
    it('should create todo', () => {
      const mockInsert = vi.fn().mockReturnValue('new-id');
      mockUseSignalDB.mockReturnValue({
        ...mockUseSignalDB(),
        insert: mockInsert,
      });

      const { result } = renderHook(() => useTodos());

      const todoData = {
        title: 'New Todo',
        description: 'A new todo item',
        completed: false,
        priority: 'medium' as const,
        tags: ['test'],
        dueDate: new Date('2024-01-01'),
      };

      act(() => {
        result.current.createTodo(todoData);
      });

      expect(mockInsert).toHaveBeenCalledWith({
        ...todoData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should update todo', () => {
      const mockUpdateOne = vi.fn().mockReturnValue(1);
      mockUseSignalDB.mockReturnValue({
        ...mockUseSignalDB(),
        updateOne: mockUpdateOne,
      });

      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.updateTodo('1', { title: 'Updated Title' });
      });

      expect(mockUpdateOne).toHaveBeenCalledWith(
        { id: '1' },
        { title: 'Updated Title' }
      );
    });

    it('should delete todo', () => {
      const mockRemoveOne = vi.fn().mockReturnValue(1);
      mockUseSignalDB.mockReturnValue({
        ...mockUseSignalDB(),
        removeOne: mockRemoveOne,
      });

      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.deleteTodo('1');
      });

      expect(mockRemoveOne).toHaveBeenCalledWith({ id: '1' });
    });

    it('should toggle todo completion', () => {
      const mockFindOne = vi.fn().mockReturnValue(mockTodos[0]);
      const mockUpdateOne = vi.fn().mockReturnValue(1);

      mockUseSignalDB.mockReturnValue({
        ...mockUseSignalDB(),
        findOne: mockFindOne,
        updateOne: mockUpdateOne,
      });

      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.toggleTodo('1');
      });

      expect(mockFindOne).toHaveBeenCalledWith({ id: '1' });
      expect(mockUpdateOne).toHaveBeenCalledWith(
        { id: '1' },
        { completed: true } // Toggle from false to true
      );
    });
  });

  describe('filtering and searching', () => {
    it('should filter by status', () => {
      const { result } = renderHook(() => useTodos());

      const activeOnly = result.current.filterTodos({ status: 'active' });
      expect(activeOnly).toHaveLength(2);
      expect(activeOnly.every((todo) => !todo.completed)).toBe(true);

      const completedOnly = result.current.filterTodos({ status: 'completed' });
      expect(completedOnly).toHaveLength(1);
      expect(completedOnly.every((todo) => todo.completed)).toBe(true);
    });

    it('should filter by priority', () => {
      const { result } = renderHook(() => useTodos());

      const highPriority = result.current.filterTodos({ priority: 'high' });
      expect(highPriority).toHaveLength(1);
      expect(highPriority[0].priority).toBe('high');
    });

    it('should filter by tags', () => {
      const { result } = renderHook(() => useTodos());

      const workTodos = result.current.filterTodos({ tags: ['work'] });
      expect(workTodos).toHaveLength(1);
      expect(workTodos[0].tags).toContain('work');
    });

    it('should search todos by title and description', () => {
      const { result } = renderHook(() => useTodos());

      const searchResults = result.current.searchTodos('first');
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].description).toContain('First');
    });

    it('should sort todos by different criteria', () => {
      const { result } = renderHook(() => useTodos());

      // Sort by title ascending
      const sortedByTitle = result.current.sortTodos(mockTodos, 'title', 'asc');
      expect(sortedByTitle[0].title).toBe('Overdue Todo');

      // Sort by priority descending
      const sortedByPriority = result.current.sortTodos(
        mockTodos,
        'priority',
        'desc'
      );
      expect(sortedByPriority[0].priority).toBe('high');
    });
  });

  describe('statistics', () => {
    it('should calculate todo stats', () => {
      // Set up mock with today's date for testing
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15'));

      const { result } = renderHook(() => useTodos());

      const stats = result.current.getTodoStats();

      expect(stats.total).toBe(3);
      expect(stats.completed).toBe(1);
      expect(stats.active).toBe(2);
      expect(stats.completionRate).toBeCloseTo(33.33, 2);
      expect(stats.overdueCount).toBe(1); // Only Todo 3 (2023-01-01) is overdue as it's before 2024-01-15

      vi.useRealTimers();
    });

    it('should calculate tag stats', () => {
      const { result } = renderHook(() => useTodos());

      const tagStats = result.current.getTagStats();

      expect(tagStats).toEqual({
        work: 1,
        urgent: 1,
        personal: 2,
      });
    });

    it('should calculate priority stats', () => {
      const { result } = renderHook(() => useTodos());

      const priorityStats = result.current.getPriorityStats();

      expect(priorityStats).toEqual({
        high: 1,
        medium: 1,
        low: 1,
      });
    });
  });

  describe('bulk operations', () => {
    it('should clear completed todos', () => {
      const mockRemoveMany = vi.fn().mockReturnValue(1);
      mockUseSignalDB.mockReturnValue({
        ...mockUseSignalDB(),
        removeMany: mockRemoveMany,
      });

      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.clearCompleted();
      });

      expect(mockRemoveMany).toHaveBeenCalledWith({ completed: true });
    });

    it('should clear all todos', () => {
      const mockRemoveMany = vi.fn().mockReturnValue(3);
      mockUseSignalDB.mockReturnValue({
        ...mockUseSignalDB(),
        removeMany: mockRemoveMany,
      });

      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.clearAll();
      });

      expect(mockRemoveMany).toHaveBeenCalledWith({});
    });

    it('should mark all todos as completed', () => {
      const mockUpdateMany = vi.mocked(todosCollection.updateMany);
      mockUpdateMany.mockReturnValue(2);

      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.markAllCompleted();
      });

      expect(mockUpdateMany).toHaveBeenCalledWith(
        { completed: false },
        { $set: { completed: true, updatedAt: expect.any(Date) } }
      );
    });
  });

  describe('utility functions', () => {
    it('should get todo by id', () => {
      const mockFindOne = vi.fn().mockReturnValue(mockTodos[0]);
      mockUseSignalDB.mockReturnValue({
        ...mockUseSignalDB(),
        findOne: mockFindOne,
      });

      const { result } = renderHook(() => useTodos());

      const todo = result.current.getTodoById('1');

      expect(mockFindOne).toHaveBeenCalledWith({ id: '1' });
      expect(todo).toEqual(mockTodos[0]);
    });

    it('should get todos by tag', () => {
      const { result } = renderHook(() => useTodos());

      const personalTodos = result.current.getTodosByTag('personal');

      expect(personalTodos).toHaveLength(2);
      expect(
        personalTodos.every((todo) => todo.tags.includes('personal'))
      ).toBe(true);
    });

    it('should get todos by priority', () => {
      const { result } = renderHook(() => useTodos());

      const mediumTodos = result.current.getTodosByPriority('medium');

      expect(mediumTodos).toHaveLength(1);
      expect(mediumTodos[0].priority).toBe('medium');
    });

    it('should get overdue todos', () => {
      // Set specific date for testing
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-15')); // Set future date so both past dates are overdue

      const { result } = renderHook(() => useTodos());

      const overdueTodos = result.current.getOverdueTodos();

      // Both Todo 1 (2024-12-31) and Todo 3 (2023-01-01) are overdue from 2025-01-15
      expect(overdueTodos).toHaveLength(2);
      expect(overdueTodos.some((todo) => todo.title === 'Overdue Todo')).toBe(
        true
      );

      vi.useRealTimers();
    });

    it('should get todos for today', () => {
      // Mock a todo with today's due date
      const todayTodo: Todo = {
        ...mockTodos[0],
        dueDate: new Date(), // Today
      };

      mockUseSignalDB.mockReturnValue({
        ...mockUseSignalDB(),
        data: [todayTodo],
      });

      const { result } = renderHook(() => useTodos());

      const todayTodos = result.current.getTodosForToday();

      expect(todayTodos).toHaveLength(1);
    });
  });

  describe('filter options handling', () => {
    it('should build correct selector for filters', () => {
      const filters: FilterOptions = {
        status: 'active',
        priority: 'high',
        tags: ['work'],
        dateRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-12-31'),
        },
      };

      renderHook(() => useTodos({ filter: filters }));

      expect(mockUseSignalDB).toHaveBeenCalledWith({
        collection: expect.any(Object),
        selector: {
          completed: false,
          priority: 'high',
          tags: { $in: ['work'] },
          createdAt: {
            $gte: filters.dateRange!.start,
            $lte: filters.dateRange!.end,
          },
        },
        options: {
          sort: { createdAt: -1 },
          limit: undefined,
        },
      });
    });
  });
});
