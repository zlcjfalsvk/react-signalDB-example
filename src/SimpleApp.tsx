import React, { useState } from 'react';
import { Collection } from '@signaldb/core';
import localStorageAdapter from '@signaldb/localstorage';

// Simple Todo interface
interface SimpleTodo {
  id: string;
  title: string;
  completed: boolean;
}

// Create collection
const todosCollection = new Collection<SimpleTodo>({
  name: 'simple-todos',
  primaryKey: 'id',
  memory: localStorageAdapter('simple-todos'),
});

function SimpleApp() {
  const [title, setTitle] = useState('');
  const [todos, setTodos] = useState<SimpleTodo[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load todos
  React.useEffect(() => {
    const loadedTodos = todosCollection.find({}).fetch();
    setTodos(loadedTodos);
  }, [refreshKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      const newTodo: SimpleTodo = {
        id: Date.now().toString(),
        title: title.trim(),
        completed: false,
      };
      todosCollection.insert(newTodo);
      setTitle('');
      setRefreshKey(prev => prev + 1);
    }
  };

  const toggleTodo = (id: string) => {
    const todo = todosCollection.findOne({ id });
    if (todo) {
      todosCollection.updateOne({ id }, { $set: { completed: !todo.completed } });
      setRefreshKey(prev => prev + 1);
    }
  };

  const deleteTodo = (id: string) => {
    todosCollection.removeOne({ id });
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">SignalDB Todo App</h1>
        
        {/* Add Todo Form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a new todo..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>
        </form>

        {/* Todo List */}
        <div className="bg-white rounded-lg shadow">
          {todos.length === 0 ? (
            <p className="p-8 text-center text-gray-500">No todos yet. Add one above!</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {todos.map((todo) => (
                <li key={todo.id} className="p-4 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span
                    className={`flex-1 ${
                      todo.completed ? 'line-through text-gray-400' : 'text-gray-800'
                    }`}
                  >
                    {todo.title}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Stats */}
        <div className="mt-4 text-sm text-gray-600 text-center">
          Total: {todos.length} | Completed: {todos.filter(t => t.completed).length} | Active: {todos.filter(t => !t.completed).length}
        </div>
      </div>
    </div>
  );
}

export default SimpleApp;