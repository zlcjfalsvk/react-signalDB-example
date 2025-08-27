import { useState, useMemo, useCallback } from 'react';
import { useTodos } from './hooks';
import { TodoList, TodoForm, TodoFilter, TodoStats } from './components';

import type { FilterOptions, SortBy, Todo } from './types/todo';

type ViewMode = 'list' | 'stats' | 'add';

function App() {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Use the todos hook with current filters and sorting
  const {
    filteredTodos,
    isLoading,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    getTodoStats,
    getTagStats,
    getPriorityStats,
    clearCompleted,
    clearAll,
    markAllCompleted,
    markAllActive,
    getOverdueTodos,
    refresh,
  } = useTodos({
    filter: filters,
    sortBy,
    sortDirection,
  });

  // Get statistics
  const stats = useMemo(() => getTodoStats(), [getTodoStats]);
  const tagStats = useMemo(() => getTagStats(), [getTagStats]);
  const priorityStats = useMemo(() => getPriorityStats(), [getPriorityStats]);
  const availableTags = useMemo(() => Object.keys(tagStats), [tagStats]);
  const overdueTodos = useMemo(() => getOverdueTodos(), [getOverdueTodos]);

  // Todo counts for filter display
  const todoCount = useMemo(
    () => ({
      total: stats.total,
      active: stats.active,
      completed: stats.completed,
    }),
    [stats]
  );

  // Handlers
  const handleCreateTodo = useCallback(
    (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
      createTodo(todoData);
      setViewMode('list');
    },
    [createTodo]
  );

  const handleSort = useCallback(
    (newSortBy: SortBy, direction: 'asc' | 'desc') => {
      setSortBy(newSortBy);
      setSortDirection(direction);
    },
    []
  );

  const handleBulkDelete = useCallback(
    (ids: string[]) => {
      ids.forEach((id) => deleteTodo(id));
    },
    [deleteTodo]
  );

  const handleBulkToggle = useCallback(
    (ids: string[], completed: boolean) => {
      ids.forEach((id) => {
        updateTodo(id, { completed });
      });
    },
    [updateTodo]
  );

  const handleResetFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Quick actions
  const handleQuickAction = useCallback(
    (action: string) => {
      switch (action) {
        case 'clear-completed':
          clearCompleted();
          break;
        case 'clear-all':
          if (
            confirm(
              'Are you sure you want to delete all todos? This action cannot be undone.'
            )
          ) {
            clearAll();
          }
          break;
        case 'mark-all-completed':
          markAllCompleted();
          break;
        case 'mark-all-active':
          markAllActive();
          break;
        case 'refresh':
          refresh();
          break;
      }
    },
    [clearCompleted, clearAll, markAllCompleted, markAllActive, refresh]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and title */}
            <div className="flex items-center">
              <div className="text-2xl mr-3">📝</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  SignalDB Todo
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Powered by SignalDB React
                </p>
              </div>
            </div>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                📋 Todos ({stats.total})
              </button>

              <button
                onClick={() => setViewMode('stats')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'stats'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                📊 Stats
              </button>

              <button
                onClick={() => setViewMode('add')}
                className={`px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors ${
                  viewMode === 'add'
                    ? 'ring-2 ring-green-500 ring-offset-2'
                    : ''
                }`}
              >
                ➕ Add Todo
              </button>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => {
                    setViewMode('list');
                    setShowMobileMenu(false);
                  }}
                  className={`px-3 py-2 rounded-md text-sm font-medium text-left transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  📋 Todos ({stats.total})
                </button>

                <button
                  onClick={() => {
                    setViewMode('stats');
                    setShowMobileMenu(false);
                  }}
                  className={`px-3 py-2 rounded-md text-sm font-medium text-left transition-colors ${
                    viewMode === 'stats'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  📊 Stats
                </button>

                <button
                  onClick={() => {
                    setViewMode('add');
                    setShowMobileMenu(false);
                  }}
                  className="px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium text-left hover:bg-green-700"
                >
                  ➕ Add Todo
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Overdue Todos Alert */}
      {overdueTodos.length > 0 && viewMode === 'list' && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 mt-4 sm:mx-6 lg:mx-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Warning:</strong> You have {overdueTodos.length} overdue
                todo{overdueTodos.length > 1 ? 's' : ''} that need attention.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {viewMode === 'add' && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Create New Todo
              </h2>
              <p className="text-gray-600 mt-1">
                Add a new task to your todo list
              </p>
            </div>

            <TodoForm
              onSubmit={handleCreateTodo}
              onCancel={() => setViewMode('list')}
              submitLabel="Create Todo"
              isLoading={isLoading}
            />
          </div>
        )}

        {viewMode === 'stats' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Todo Statistics
              </h2>
              <p className="text-gray-600 mt-1">
                Overview of your productivity and progress
              </p>
            </div>

            <TodoStats
              stats={stats}
              priorityStats={priorityStats}
              tagStats={tagStats}
              showCharts={true}
            />
          </div>
        )}

        {viewMode === 'list' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <TodoStats
                stats={stats}
                priorityStats={priorityStats}
                tagStats={tagStats}
                compact={true}
              />
            </div>

            {/* Filters */}
            <TodoFilter
              filters={filters}
              onFiltersChange={setFilters}
              availableTags={availableTags}
              todoCount={todoCount}
              onReset={handleResetFilters}
              compact={true}
            />

            {/* Quick Actions */}
            {stats.total > 0 && (
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Quick Actions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {stats.completed > 0 && (
                    <button
                      onClick={() => handleQuickAction('clear-completed')}
                      className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200 focus:ring-2 focus:ring-orange-500"
                    >
                      🗑️ Clear Completed ({stats.completed})
                    </button>
                  )}

                  {stats.active > 0 && (
                    <button
                      onClick={() => handleQuickAction('mark-all-completed')}
                      className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 focus:ring-2 focus:ring-green-500"
                    >
                      ✅ Complete All ({stats.active})
                    </button>
                  )}

                  {stats.completed > 0 && (
                    <button
                      onClick={() => handleQuickAction('mark-all-active')}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 focus:ring-2 focus:ring-blue-500"
                    >
                      ↩️ Reopen All ({stats.completed})
                    </button>
                  )}

                  <button
                    onClick={() => handleQuickAction('refresh')}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 focus:ring-2 focus:ring-gray-500"
                  >
                    🔄 Refresh
                  </button>

                  {stats.total > 0 && (
                    <button
                      onClick={() => handleQuickAction('clear-all')}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 focus:ring-2 focus:ring-red-500"
                    >
                      🗑️ Clear All
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Todo List */}
            <div className="bg-white border rounded-lg shadow-sm">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading todos...</span>
                </div>
              ) : (
                <div className="p-6">
                  <TodoList
                    todos={filteredTodos}
                    onToggle={toggleTodo}
                    onUpdate={updateTodo}
                    onDelete={deleteTodo}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    enableVirtualization={filteredTodos.length > 50}
                    showBulkActions={true}
                    onBulkDelete={handleBulkDelete}
                    onBulkToggle={handleBulkToggle}
                    emptyMessage={
                      Object.keys(filters).length > 0 || filters.searchTerm
                        ? 'No todos match your current filters'
                        : "No todos yet! Click 'Add Todo' to get started."
                    }
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500">
            <p>
              Built with ❤️ using{' '}
              <a
                href="https://signaldb.js.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                SignalDB
              </a>{' '}
              and React • {stats.total} todos •{' '}
              {stats.completionRate.toFixed(1)}% complete
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
