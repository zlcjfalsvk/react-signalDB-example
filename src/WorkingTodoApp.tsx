import React, { useState } from 'react';
import { Collection } from '@signaldb/core';
import createLocalStorageAdapter from '@signaldb/localstorage';
import { createUseReactivityHook } from '@signaldb/react';
import { effect } from '@maverick-js/signals';
import maverickjsReactivityAdapter from '@signaldb/maverickjs';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

// Create useReactivity hook for React integration
const useReactivity = createUseReactivityHook(effect);

// Create SignalDB collection for todos with localStorage persistence
const todosCollection = new Collection<Todo>({ 
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

function WorkingTodoApp() {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Get todos from SignalDB collection with reactivity
  const todos = useReactivity(() => todosCollection.find({}).fetch(), []);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      const newTodo: Todo = {
        id: Date.now().toString(),
        title: title.trim(),
        completed: false,
        priority,
        createdAt: new Date(),
      };
      todosCollection.insert(newTodo);
      setTitle('');
    }
  };

  const toggleTodo = (id: string) => {
    const todo = todosCollection.findOne({ id });
    if (todo) {
      todosCollection.updateOne({ id }, { $set: { completed: !todo.completed } });
    }
  };

  const deleteTodo = (id: string) => {
    todosCollection.removeOne({ id });
  };

  const clearCompleted = () => {
    todosCollection.removeMany({ completed: true });
  };

  const stats = {
    total: todos.length,
    completed: todos.filter((t) => t.completed).length,
    active: todos.filter((t) => !t.completed).length,
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700',
  };

  // Sort todos by: Priority (High->Low) -> Created Date (Desc) -> Title (ASC)
  const sortTodos = (todosToSort: Todo[]): Todo[] => {
    return [...todosToSort].sort((a, b) => {
      // First sort by priority (high -> low)
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then sort by created date (desc - newest first)
      const aDate = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const bDate = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      const aTime = aDate.getTime();
      const bTime = bDate.getTime();
      const dateDiff = bTime - aTime;
      if (dateDiff !== 0) return dateDiff;
      
      // Finally sort by title (asc)
      return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
    });
  };

  // Apply sorting to todos for display
  const sortedTodos = sortTodos(todos);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📝 Todo App</h1>
          <p className="text-gray-600">Manage your tasks efficiently</p>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-800">
                {stats.total}
              </div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {stats.completed}
              </div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.active}
              </div>
              <div className="text-sm text-gray-500">Active</div>
            </div>
          </div>
          {stats.total > 0 && (
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1 text-center">
                {Math.round((stats.completed / stats.total) * 100)}% Complete
              </p>
            </div>
          )}
        </div>

        {/* Add Todo Form */}
        <form
          onSubmit={addTodo}
          className="bg-white rounded-xl shadow-md p-6 mb-6"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What needs to be done?
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter a task..."
                autoFocus
              />
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as 'low' | 'medium' | 'high')
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <button
                type="submit"
                className="px-8 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors mt-6"
              >
                Add Todo
              </button>
            </div>
          </div>
        </form>

        {/* Todo List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {todos.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">✨</div>
              <p className="text-gray-500 text-lg">No todos yet!</p>
              <p className="text-gray-400 text-sm mt-2">
                Add your first task above
              </p>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-gray-200">
                {sortedTodos.map((todo) => (
                  <li
                    key={todo.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`${
                              todo.completed
                                ? 'line-through text-gray-400'
                                : 'text-gray-800'
                            }`}
                          >
                            {todo.title}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${priorityColors[todo.priority]}`}
                          >
                            {todo.priority}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {todo.createdAt instanceof Date ? todo.createdAt.toLocaleDateString() : new Date(todo.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              {stats.completed > 0 && (
                <div className="p-4 bg-gray-50 border-t">
                  <button
                    onClick={clearCompleted}
                    className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Clear {stats.completed} completed item
                    {stats.completed !== 1 ? 's' : ''}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkingTodoApp;
