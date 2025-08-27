import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { TodoItem } from '../TodoItem';
import type { Todo, SortBy } from '../../types/todo';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
  sortBy?: SortBy;
  sortDirection?: 'asc' | 'desc';
  onSort?: (sortBy: SortBy, direction: 'asc' | 'desc') => void;
  enableVirtualization?: boolean;
  itemHeight?: number;
  containerHeight?: number;
  emptyMessage?: string;
  showBulkActions?: boolean;
  onBulkDelete?: (ids: string[]) => void;
  onBulkToggle?: (ids: string[], completed: boolean) => void;
}

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'date', label: 'Date Created' },
  { value: 'title', label: 'Title' },
  { value: 'priority', label: 'Priority' },
];

export function TodoList({
  todos,
  onToggle,
  onUpdate,
  onDelete,
  sortBy = 'date',
  sortDirection = 'desc',
  onSort,
  enableVirtualization = true,
  itemHeight = 120,
  containerHeight = 600,
  emptyMessage = 'No todos found',
  showBulkActions = true,
  onBulkDelete,
  onBulkToggle,
}: TodoListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Calculate visible items for virtualization
  const itemsToRender = useMemo(() => {
    if (!enableVirtualization || todos.length < 50) {
      return todos.map((todo, index) => ({ todo, index }));
    }

    const buffer = 5; // Render extra items for smooth scrolling
    const startIndex = Math.max(0, visibleRange.start - buffer);
    const endIndex = Math.min(todos.length - 1, visibleRange.end + buffer);

    return todos.slice(startIndex, endIndex + 1).map((todo, i) => ({
      todo,
      index: startIndex + i,
    }));
  }, [todos, visibleRange, enableVirtualization]);

  // Handle scroll for virtualization
  const handleScroll = useCallback(() => {
    if (!enableVirtualization || !containerRef.current) return;

    const scrollTop = containerRef.current.scrollTop;
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      todos.length - 1,
      visibleStart + Math.ceil(containerHeight / itemHeight) - 1
    );

    setVisibleRange({ start: visibleStart, end: visibleEnd });
  }, [itemHeight, containerHeight, todos.length, enableVirtualization]);

  // Initialize visible range
  useEffect(() => {
    if (enableVirtualization) {
      const initialEnd = Math.min(
        todos.length - 1,
        Math.ceil(containerHeight / itemHeight) - 1
      );
      setVisibleRange({ start: 0, end: initialEnd });
    }
  }, [todos.length, itemHeight, containerHeight, enableVirtualization]);

  // Handle sorting
  const handleSort = useCallback(
    (newSortBy: SortBy) => {
      if (!onSort) return;

      const newDirection =
        sortBy === newSortBy && sortDirection === 'desc' ? 'asc' : 'desc';
      onSort(newSortBy, newDirection);
    },
    [sortBy, sortDirection, onSort]
  );

  // Selection handlers
  const handleItemSelect = useCallback(
    (id: string) => {
      if (!isSelectionMode) return;

      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    },
    [isSelectionMode]
  );

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === todos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(todos.map((todo) => todo.id)));
    }
  }, [todos, selectedIds.size]);

  const handleBulkAction = useCallback(
    (action: 'delete' | 'complete' | 'activate') => {
      const ids = Array.from(selectedIds);
      if (ids.length === 0) return;

      switch (action) {
        case 'delete':
          onBulkDelete?.(ids);
          break;
        case 'complete':
          onBulkToggle?.(ids, true);
          break;
        case 'activate':
          onBulkToggle?.(ids, false);
          break;
      }

      setSelectedIds(new Set());
    },
    [selectedIds, onBulkDelete, onBulkToggle]
  );

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  }, []);

  // Calculate virtual list properties
  const totalHeight = enableVirtualization ? todos.length * itemHeight : 'auto';
  const offsetY = enableVirtualization ? visibleRange.start * itemHeight : 0;

  if (todos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">📝</div>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with sorting and bulk actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Sort controls */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {todos.length} todo{todos.length !== 1 ? 's' : ''}
          </span>

          {onSort && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value as SortBy)}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() =>
                  onSort(sortBy, sortDirection === 'asc' ? 'desc' : 'asc')
                }
                className="p-1 text-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-blue-500 rounded"
                title={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          )}
        </div>

        {/* Selection and bulk actions */}
        {showBulkActions && (
          <div className="flex items-center gap-2">
            {isSelectionMode ? (
              <>
                <span className="text-sm text-gray-600">
                  {selectedIds.size} selected
                </span>

                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800 focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                >
                  {selectedIds.size === todos.length
                    ? 'Deselect All'
                    : 'Select All'}
                </button>

                {selectedIds.size > 0 && (
                  <>
                    <button
                      onClick={() => handleBulkAction('complete')}
                      className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 focus:ring-2 focus:ring-green-500"
                    >
                      Complete
                    </button>

                    <button
                      onClick={() => handleBulkAction('activate')}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                    >
                      Activate
                    </button>

                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 focus:ring-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  </>
                )}

                <button
                  onClick={clearSelection}
                  className="text-sm text-gray-600 hover:text-gray-800 focus:ring-2 focus:ring-gray-500 rounded px-2 py-1"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsSelectionMode(true)}
                className="text-sm text-gray-600 hover:text-gray-800 focus:ring-2 focus:ring-gray-500 rounded px-2 py-1"
              >
                Select
              </button>
            )}
          </div>
        )}
      </div>

      {/* Todo list */}
      <div
        ref={containerRef}
        className={`relative overflow-auto ${
          enableVirtualization ? `h-${Math.round(containerHeight / 16)}` : ''
        }`}
        style={enableVirtualization ? { height: containerHeight } : undefined}
        onScroll={handleScroll}
      >
        <div
          ref={listRef}
          className="relative"
          style={{
            height: totalHeight,
            paddingTop: offsetY,
          }}
        >
          <div className="space-y-3">
            {itemsToRender.map(({ todo, index }) => (
              <div
                key={todo.id}
                className={`transition-all duration-200 ${
                  isSelectionMode ? 'cursor-pointer' : ''
                }`}
                style={
                  enableVirtualization
                    ? {
                        minHeight: itemHeight,
                        marginBottom:
                          index === itemsToRender.length - 1 ? 0 : 12,
                      }
                    : undefined
                }
              >
                <TodoItem
                  todo={todo}
                  onToggle={onToggle}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  isSelected={selectedIds.has(todo.id)}
                  onSelect={isSelectionMode ? handleItemSelect : undefined}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Virtual scrolling info (dev only) */}
      {enableVirtualization &&
        process.env.NODE_ENV === 'development' &&
        todos.length > 50 && (
          <div className="text-xs text-gray-400 text-center">
            Showing {itemsToRender.length} of {todos.length} items (virtualized:{' '}
            {visibleRange.start + 1}-
            {Math.min(visibleRange.end + 1, todos.length)})
          </div>
        )}
    </div>
  );
}
