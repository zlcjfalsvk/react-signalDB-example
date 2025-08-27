import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Todo, Priority } from '../../types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'bg-green-100 text-green-800 border-green-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  high: 'bg-red-100 text-red-800 border-red-300',
};

const PRIORITY_INDICATORS: Record<Priority, string> = {
  low: 'bg-green-400',
  medium: 'bg-yellow-400',
  high: 'bg-red-400',
};

export function TodoItem({
  todo,
  onToggle,
  onUpdate,
  onDelete,
  isSelected = false,
  onSelect,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(
    todo.description || ''
  );
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus title input when entering edit mode
  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = useCallback(() => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setIsEditing(true);
  }, [todo.title, todo.description]);

  const handleSaveEdit = useCallback(() => {
    const trimmedTitle = editTitle.trim();
    const trimmedDescription = editDescription.trim();

    if (!trimmedTitle) {
      // Reset to original values if title is empty
      setEditTitle(todo.title);
      setEditDescription(todo.description || '');
      setIsEditing(false);
      return;
    }

    const hasChanges =
      trimmedTitle !== todo.title ||
      trimmedDescription !== (todo.description || '');

    if (hasChanges) {
      onUpdate(todo.id, {
        title: trimmedTitle,
        description: trimmedDescription || undefined,
      });
    }

    setIsEditing(false);
  }, [
    editTitle,
    editDescription,
    todo.title,
    todo.description,
    todo.id,
    onUpdate,
  ]);

  const handleCancelEdit = useCallback(() => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setIsEditing(false);
  }, [todo.title, todo.description]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSaveEdit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancelEdit();
      }
    },
    [handleSaveEdit, handleCancelEdit]
  );

  const handleToggle = useCallback(() => {
    onToggle(todo.id);
  }, [todo.id, onToggle]);

  const handleDelete = useCallback(() => {
    if (showConfirmDelete) {
      onDelete(todo.id);
      setShowConfirmDelete(false);
    } else {
      setShowConfirmDelete(true);
    }
  }, [todo.id, onDelete, showConfirmDelete]);

  const handleSelect = useCallback(() => {
    if (onSelect) {
      onSelect(todo.id);
    }
  }, [todo.id, onSelect]);

  const formatDate = (date: Date | undefined): string => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };

  const isOverdue =
    todo.dueDate && !todo.completed && todo.dueDate < new Date();
  const isDueToday =
    todo.dueDate &&
    new Date(todo.dueDate).toDateString() === new Date().toDateString();

  return (
    <div
      className={`group relative bg-white border rounded-lg p-4 transition-all duration-200 ${
        isSelected
          ? 'border-blue-500 shadow-md'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      } ${todo.completed ? 'opacity-75' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowConfirmDelete(false);
      }}
      onClick={handleSelect}
    >
      {/* Priority indicator */}
      <div
        className={`absolute left-0 top-0 w-1 h-full rounded-l-lg ${PRIORITY_INDICATORS[todo.priority]}`}
      />

      <div className="flex items-start gap-3 ml-2">
        {/* Checkbox */}
        <div className="flex-shrink-0 pt-1">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={handleToggle}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Content */}
        <div className="flex-grow min-w-0">
          {isEditing ? (
            <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
              <input
                ref={titleInputRef}
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Todo title..."
              />
              <textarea
                ref={descriptionTextareaRef}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Description (optional)..."
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 focus:ring-2 focus:ring-green-500"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Title */}
              <h3
                className={`text-sm font-medium cursor-pointer hover:text-blue-600 transition-colors ${
                  todo.completed
                    ? 'line-through text-gray-500'
                    : 'text-gray-900'
                }`}
                onDoubleClick={handleStartEdit}
              >
                {todo.title}
              </h3>

              {/* Description */}
              {todo.description && (
                <p
                  className={`mt-1 text-sm cursor-pointer hover:text-blue-600 transition-colors ${
                    todo.completed
                      ? 'line-through text-gray-400'
                      : 'text-gray-600'
                  }`}
                  onDoubleClick={handleStartEdit}
                >
                  {todo.description}
                </p>
              )}

              {/* Meta information */}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                {/* Priority badge */}
                <span
                  className={`px-2 py-1 rounded-full border ${PRIORITY_COLORS[todo.priority]}`}
                >
                  {todo.priority}
                </span>

                {/* Due date */}
                {todo.dueDate && (
                  <span
                    className={`px-2 py-1 rounded-full ${
                      isOverdue
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : isDueToday
                          ? 'bg-orange-100 text-orange-800 border border-orange-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                  >
                    {isOverdue
                      ? '⚠️ Overdue'
                      : isDueToday
                        ? '📅 Due today'
                        : `📅 ${formatDate(todo.dueDate)}`}
                  </span>
                )}

                {/* Tags */}
                {todo.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Timestamps */}
              <div className="mt-2 text-xs text-gray-400">
                Created: {formatDate(todo.createdAt)}
                {todo.updatedAt &&
                  todo.updatedAt.getTime() !== todo.createdAt.getTime() && (
                    <span className="ml-2">
                      Updated: {formatDate(todo.updatedAt)}
                    </span>
                  )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {!isEditing && (isHovered || isSelected) && (
          <div
            className="flex-shrink-0 flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Edit button */}
            <button
              onClick={handleStartEdit}
              className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 transition-colors"
              title="Edit todo (double-click on text also works)"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>

            {/* Delete button */}
            <button
              onClick={handleDelete}
              className={`p-1 rounded-full focus:ring-2 focus:ring-red-500 transition-colors ${
                showConfirmDelete
                  ? 'text-red-600 bg-red-50 hover:bg-red-100'
                  : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
              }`}
              title={
                showConfirmDelete
                  ? 'Click again to confirm delete'
                  : 'Delete todo'
              }
            >
              {showConfirmDelete ? (
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
