import React, { useState, useCallback } from 'react';
import type { Todo, TodoFormData, Priority } from '../../types/todo';

interface TodoFormProps {
  onSubmit: (data: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel?: () => void;
  initialData?: Partial<Todo>;
  submitLabel?: string;
  isLoading?: boolean;
}

interface FormErrors {
  title?: string;
  description?: string;
  priority?: string;
  tags?: string;
  dueDate?: string;
}

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'text-green-600' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'high', label: 'High', color: 'text-red-600' },
];

export function TodoForm({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = 'Add Todo',
  isLoading = false,
}: TodoFormProps) {
  const [formData, setFormData] = useState<TodoFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'medium',
    tags: initialData?.tags?.join(', ') || '',
    dueDate: initialData?.dueDate
      ? new Date(
          initialData.dueDate.getTime() -
            initialData.dueDate.getTimezoneOffset() * 60000
        )
          .toISOString()
          .split('T')[0]
      : '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback(
    (name: keyof TodoFormData, value: string): string | undefined => {
      switch (name) {
        case 'title':
          if (!value.trim()) return 'Title is required';
          if (value.trim().length < 3)
            return 'Title must be at least 3 characters';
          if (value.trim().length > 100)
            return 'Title must be less than 100 characters';
          return undefined;

        case 'description':
          if (value && value.length > 500)
            return 'Description must be less than 500 characters';
          return undefined;

        case 'priority':
          if (!PRIORITY_OPTIONS.find((p) => p.value === value))
            return 'Invalid priority';
          return undefined;

        case 'tags':
          if (value) {
            const tags = value
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean);
            if (tags.length > 10) return 'Maximum 10 tags allowed';
            if (tags.some((tag) => tag.length > 20))
              return 'Each tag must be less than 20 characters';
          }
          return undefined;

        case 'dueDate':
          if (value) {
            const date = new Date(value);
            if (isNaN(date.getTime())) return 'Invalid date format';
            if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
              return 'Due date cannot be in the past';
            }
          }
          return undefined;

        default:
          return undefined;
      }
    },
    []
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof TodoFormData>).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  const handleInputChange = useCallback(
    (name: keyof TodoFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [errors]
  );

  const handleBlur = useCallback(
    (name: keyof TodoFormData) => {
      setTouched((prev) => ({ ...prev, [name]: true }));

      const error = validateField(name, formData[name]);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [formData, validateField]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      // Mark all fields as touched
      setTouched({
        title: true,
        description: true,
        priority: true,
        tags: true,
        dueDate: true,
      });

      if (!validateForm()) {
        return;
      }

      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
        .filter((tag, index, arr) => arr.indexOf(tag) === index); // Remove duplicates

      const todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'> = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority as Priority,
        tags,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        completed: initialData?.completed || false,
      };

      onSubmit(todoData);
    },
    [formData, validateForm, onSubmit, initialData?.completed]
  );

  const handleReset = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      tags: '',
      dueDate: '',
    });
    setErrors({});
    setTouched({});
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-6 rounded-lg shadow-sm border"
    >
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            onBlur={() => handleBlur('title')}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              touched.title && errors.title
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
            placeholder="Enter todo title..."
            disabled={isLoading}
          />
          {touched.title && errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            onBlur={() => handleBlur('description')}
            onKeyDown={(e) => {
              if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              touched.description && errors.description
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
            placeholder="Optional description..."
            disabled={isLoading}
          />
          {touched.description && errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Priority and Due Date Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Priority */}
          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Priority
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              onBlur={() => handleBlur('priority')}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                touched.priority && errors.priority
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              disabled={isLoading}
            >
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {touched.priority && errors.priority && (
              <p className="mt-1 text-sm text-red-600">{errors.priority}</p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label
              htmlFor="dueDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              onBlur={() => handleBlur('dueDate')}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                touched.dueDate && errors.dueDate
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {touched.dueDate && errors.dueDate && (
              <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
            )}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label
            htmlFor="tags"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tags
          </label>
          <input
            type="text"
            id="tags"
            value={formData.tags}
            onChange={(e) => handleInputChange('tags', e.target.value)}
            onBlur={() => handleBlur('tags')}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              touched.tags && errors.tags ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter tags separated by commas..."
            disabled={isLoading}
          />
          {touched.tags && errors.tags && (
            <p className="mt-1 text-sm text-red-600">{errors.tags}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Separate multiple tags with commas (max 10 tags)
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Saving...' : submitLabel}
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={isLoading}
          className="flex-1 sm:flex-none bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Reset
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 sm:flex-none text-gray-600 py-2 px-4 rounded-md hover:bg-gray-100 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
