import React, { useState } from 'react';

function VerySimpleApp() {
  const [todos, setTodos] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, input.trim()]);
      setInput('');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Simple Todo App (No SignalDB)</h1>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          className="flex-1 px-4 py-2 border rounded-lg"
          placeholder="Add a todo..."
        />
        <button
          onClick={addTodo}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Add
        </button>
      </div>

      <div className="space-y-2">
        {todos.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No todos yet</p>
        ) : (
          todos.map((todo, index) => (
            <div key={index} className="p-4 bg-white rounded-lg shadow">
              {todo}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default VerySimpleApp;
