import { useState, useCallback, useMemo, useRef, useEffect } from 'react';

import type { FilterOptions, FilterStatus, Priority } from '../../types/todo';

interface TodoFilterProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableTags: string[];
  todoCount?: {
    total: number;
    active: number;
    completed: number;
  };
  onReset?: () => void;
  compact?: boolean;
}

const STATUS_OPTIONS: { value: FilterStatus; label: string; icon: string }[] = [
  { value: 'all', label: 'All', icon: '📝' },
  { value: 'active', label: 'Active', icon: '⚡' },
  { value: 'completed', label: 'Completed', icon: '✅' },
];

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'text-green-600' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'high', label: 'High', color: 'text-red-600' },
];

export function TodoFilter({
  filters,
  onFiltersChange,
  availableTags,
  todoCount,
  onReset,
  compact = false,
}: TodoFilterProps) {
  const [searchValue, setSearchValue] = useState(filters.searchTerm || '');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showDateRange, setShowDateRange] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!compact);

  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  // Handle search input with debouncing
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        onFiltersChange({
          ...filters,
          searchTerm: value.trim() || undefined,
        });
      }, 300);
    },
    [filters, onFiltersChange]
  );

  // Handle status filter
  const handleStatusChange = useCallback(
    (status: FilterStatus) => {
      onFiltersChange({
        ...filters,
        status: status === 'all' ? undefined : status,
      });
    },
    [filters, onFiltersChange]
  );

  // Handle priority filter
  const handlePriorityChange = useCallback(
    (priority: Priority | '') => {
      onFiltersChange({
        ...filters,
        priority: priority || undefined,
      });
    },
    [filters, onFiltersChange]
  );

  // Handle tag selection
  const handleTagToggle = useCallback(
    (tag: string) => {
      const currentTags = filters.tags || [];
      const newTags = currentTags.includes(tag)
        ? currentTags.filter((t) => t !== tag)
        : [...currentTags, tag];

      onFiltersChange({
        ...filters,
        tags: newTags.length > 0 ? newTags : undefined,
      });
    },
    [filters, onFiltersChange]
  );

  // Handle date range changes
  const handleDateRangeChange = useCallback(
    (field: 'start' | 'end', value: string) => {
      if (!value) {
        if (field === 'start' && filters.dateRange?.end) {
          onFiltersChange({
            ...filters,
            dateRange: undefined,
          });
        } else if (field === 'end' && filters.dateRange?.start) {
          onFiltersChange({
            ...filters,
            dateRange: undefined,
          });
        }
        return;
      }

      const date = new Date(value);
      const currentRange = filters.dateRange;

      let newRange: { start: Date; end: Date } | undefined;

      if (field === 'start') {
        if (currentRange?.end) {
          newRange = { start: date, end: currentRange.end };
        } else {
          // Set end to start of next day
          const endDate = new Date(date);
          endDate.setDate(endDate.getDate() + 1);
          newRange = { start: date, end: endDate };
        }
      } else {
        if (currentRange?.start) {
          newRange = { start: currentRange.start, end: date };
        } else {
          // Set start to beginning of selected day
          const startDate = new Date(date);
          startDate.setHours(0, 0, 0, 0);
          newRange = { start: startDate, end: date };
        }
      }

      onFiltersChange({
        ...filters,
        dateRange: newRange,
      });
    },
    [filters, onFiltersChange]
  );

  // Handle reset filters
  const handleReset = useCallback(() => {
    setSearchValue('');
    onFiltersChange({});
    onReset?.();
  }, [onFiltersChange, onReset]);

  // Close tag dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tagDropdownRef.current &&
        !tagDropdownRef.current.contains(event.target as Node)
      ) {
        setShowTagDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.searchTerm ||
      filters.status ||
      filters.priority ||
      (filters.tags && filters.tags.length > 0) ||
      filters.dateRange
    );
  }, [filters]);

  // Format date for input
  const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return '';
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .split('T')[0];
  };

  if (compact && !isExpanded) {
    return (
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search todos..."
                className="pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg
                className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Quick status filters */}
            <div className="flex bg-gray-100 rounded-md">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    (filters.status || 'all') === option.value
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {option.icon} {option.label}
                  {todoCount && option.value !== 'all' && (
                    <span className="ml-1">
                      (
                      {option.value === 'active'
                        ? todoCount.active
                        : todoCount.completed}
                      )
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Expand button */}
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="text-sm text-red-600 hover:text-red-800 focus:ring-2 focus:ring-red-500 rounded px-2 py-1"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsExpanded(true)}
              className="text-gray-600 hover:text-gray-800 focus:ring-2 focus:ring-gray-500 rounded p-1"
              title="Show more filters"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm space-y-4">
      {compact && (
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-gray-900">Filters</h3>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-gray-600 hover:text-gray-800 focus:ring-2 focus:ring-gray-500 rounded p-1"
            title="Show fewer filters"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Search
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by title, description, or tags..."
            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <svg
            className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              className={`flex items-center gap-1 px-3 py-2 rounded-md border transition-colors ${
                (filters.status || 'all') === option.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span>{option.icon}</span>
              <span>{option.label}</span>
              {todoCount && option.value !== 'all' && (
                <span className="text-xs">
                  (
                  {option.value === 'active'
                    ? todoCount.active
                    : todoCount.completed}
                  )
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Priority and Date Range Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            value={filters.priority || ''}
            onChange={(e) =>
              handlePriorityChange(e.target.value as Priority | '')
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Priorities</option>
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} Priority
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <button
            onClick={() => setShowDateRange(!showDateRange)}
            className={`w-full px-3 py-2 border rounded-md text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              showDateRange || filters.dateRange
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            {filters.dateRange
              ? `${formatDateForInput(filters.dateRange.start)} - ${formatDateForInput(filters.dateRange.end)}`
              : 'Select date range...'}
          </button>
        </div>
      </div>

      {/* Date Range Inputs */}
      {showDateRange && (
        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-md">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              From
            </label>
            <input
              type="date"
              value={formatDateForInput(filters.dateRange?.start)}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              To
            </label>
            <input
              type="date"
              value={formatDateForInput(filters.dateRange?.end)}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* Tags */}
      {availableTags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="relative" ref={tagDropdownRef}>
            <button
              onClick={() => setShowTagDropdown(!showTagDropdown)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-left bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {filters.tags && filters.tags.length > 0
                ? `${filters.tags.length} tag${filters.tags.length > 1 ? 's' : ''} selected`
                : 'Select tags...'}
              <svg
                className="absolute right-3 top-3 h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showTagDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
                {availableTags.map((tag) => (
                  <label
                    key={tag}
                    className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.tags?.includes(tag) || false}
                      onChange={() => handleTagToggle(tag)}
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">#{tag}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Selected tags display */}
          {filters.tags && filters.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {filters.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  #{tag}
                  <button
                    onClick={() => handleTagToggle(tag)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Remove tag filter"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {hasActiveFilters && (
        <div className="pt-3 border-t">
          <button
            onClick={handleReset}
            className="w-full px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 focus:ring-2 focus:ring-red-500 rounded-md transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
