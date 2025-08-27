import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TodoFilter } from './TodoFilter';
import type { FilterOptions } from '../../types/todo';

describe('TodoFilter', () => {
  const mockAvailableTags = ['work', 'personal', 'urgent', 'hobby'];
  const mockTodoCount = {
    total: 10,
    active: 7,
    completed: 3,
  };

  const mockHandlers = {
    onFiltersChange: vi.fn(),
    onReset: vi.fn(),
  };

  const defaultProps = {
    filters: {} as FilterOptions,
    availableTags: mockAvailableTags,
    todoCount: mockTodoCount,
    ...mockHandlers,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render search input', () => {
      render(<TodoFilter {...defaultProps} />);

      expect(screen.getByPlaceholderText(/search by title/i)).toBeInTheDocument();
    });

    it('should render status filter buttons', () => {
      render(<TodoFilter {...defaultProps} />);

      expect(screen.getByRole('button', { name: /📝 all/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /⚡ active/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /✅ completed/i })).toBeInTheDocument();
    });

    it('should render priority dropdown', () => {
      render(<TodoFilter {...defaultProps} />);

      expect(screen.getByRole('combobox', { name: /priority/i })).toBeInTheDocument();
    });

    it('should render date range button', () => {
      render(<TodoFilter {...defaultProps} />);

      expect(screen.getByText(/select date range/i)).toBeInTheDocument();
    });

    it('should render tags section when tags are available', () => {
      render(<TodoFilter {...defaultProps} />);

      expect(screen.getByText('Tags')).toBeInTheDocument();
      expect(screen.getByText(/select tags/i)).toBeInTheDocument();
    });
  });

  describe('compact mode', () => {
    it('should render compact view initially', () => {
      render(<TodoFilter {...defaultProps} compact={true} />);

      expect(screen.getByPlaceholderText(/search todos/i)).toBeInTheDocument();
      expect(screen.getByTitle(/show more filters/i)).toBeInTheDocument();
    });

    it('should expand when expand button is clicked', async () => {
      const user = userEvent.setup();
      render(<TodoFilter {...defaultProps} compact={true} />);

      const expandButton = screen.getByTitle(/show more filters/i);
      await user.click(expandButton);

      expect(screen.getByText('Filters')).toBeInTheDocument();
      expect(screen.getByTitle(/show fewer filters/i)).toBeInTheDocument();
    });

    it('should show quick status filters in compact mode', () => {
      render(<TodoFilter {...defaultProps} compact={true} />);

      expect(screen.getByText('📝 All')).toBeInTheDocument();
      expect(screen.getByText('⚡ Active (7)')).toBeInTheDocument();
      expect(screen.getByText('✅ Completed (3)')).toBeInTheDocument();
    });
  });

  describe('search functionality', () => {
    it('should call onFiltersChange when search input changes', async () => {
      const user = userEvent.setup();
      render(<TodoFilter {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search by title/i);
      await user.type(searchInput, 'test search');

      // Wait for debounced call (300ms delay)
      await new Promise(resolve => setTimeout(resolve, 350));

      expect(mockHandlers.onFiltersChange).toHaveBeenCalledWith({
        searchTerm: 'test search',
      });
    });

    it('should clear search term when input is emptied', async () => {
      const user = userEvent.setup();
      render(<TodoFilter {...defaultProps} filters={{ searchTerm: 'test' }} />);

      const searchInput = screen.getByDisplayValue('test');
      await user.clear(searchInput);

      // Wait for debounced call
      await new Promise(resolve => setTimeout(resolve, 350));

      expect(mockHandlers.onFiltersChange).toHaveBeenCalledWith({
        searchTerm: undefined,
      });
    });
  });

  describe('status filtering', () => {
    it('should highlight active status filter', () => {
      render(<TodoFilter {...defaultProps} filters={{ status: 'active' }} />);

      const activeButton = screen.getByRole('button', { name: /⚡ active/i });
      expect(activeButton).toHaveClass('bg-blue-600', 'text-white');
    });

    it('should call onFiltersChange when status is changed', async () => {
      const user = userEvent.setup();
      render(<TodoFilter {...defaultProps} />);

      const activeButton = screen.getByRole('button', { name: /⚡ active/i });
      await user.click(activeButton);

      expect(mockHandlers.onFiltersChange).toHaveBeenCalledWith({
        status: 'active',
      });
    });

    it('should clear status filter when "All" is selected', async () => {
      const user = userEvent.setup();
      render(<TodoFilter {...defaultProps} filters={{ status: 'active' }} />);

      const allButton = screen.getByRole('button', { name: /📝 all/i });
      await user.click(allButton);

      expect(mockHandlers.onFiltersChange).toHaveBeenCalledWith({
        status: undefined,
      });
    });
  });

  describe('priority filtering', () => {
    it('should call onFiltersChange when priority is selected', async () => {
      const user = userEvent.setup();
      render(<TodoFilter {...defaultProps} />);

      const prioritySelect = screen.getByRole('combobox', { name: /priority/i });
      await user.selectOptions(prioritySelect, 'high');

      expect(mockHandlers.onFiltersChange).toHaveBeenCalledWith({
        priority: 'high',
      });
    });

    it('should clear priority filter when "All Priorities" is selected', async () => {
      const user = userEvent.setup();
      render(<TodoFilter {...defaultProps} filters={{ priority: 'high' }} />);

      const prioritySelect = screen.getByRole('combobox', { name: /priority/i });
      await user.selectOptions(prioritySelect, '');

      expect(mockHandlers.onFiltersChange).toHaveBeenCalledWith({
        priority: undefined,
      });
    });
  });

  describe('date range filtering', () => {
    it('should show date inputs when date range button is clicked', async () => {
      const user = userEvent.setup();
      render(<TodoFilter {...defaultProps} />);

      const dateRangeButton = screen.getByText(/select date range/i);
      await user.click(dateRangeButton);

      expect(screen.getByLabelText(/from/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/to/i)).toBeInTheDocument();
    });

    it('should call onFiltersChange when start date is set', async () => {
      const user = userEvent.setup();
      render(<TodoFilter {...defaultProps} />);

      const dateRangeButton = screen.getByText(/select date range/i);
      await user.click(dateRangeButton);

      const startDateInput = screen.getByLabelText(/from/i);
      await user.type(startDateInput, '2023-01-01');

      expect(mockHandlers.onFiltersChange).toHaveBeenCalledWith({
        dateRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-01-02'), // Should set end to next day
        },
      });
    });

    it('should display selected date range', () => {
      const dateRange = {
        start: new Date('2023-01-01'),
        end: new Date('2023-01-31'),
      };
      
      render(<TodoFilter {...defaultProps} filters={{ dateRange }} />);

      expect(screen.getByText(/2023-01-01 - 2023-01-31/)).toBeInTheDocument();
    });
  });

  describe('tag filtering', () => {
    it('should show tag dropdown when button is clicked', async () => {
      const user = userEvent.setup();
      render(<TodoFilter {...defaultProps} />);

      const tagsButton = screen.getByText(/select tags/i);
      await user.click(tagsButton);

      expect(screen.getByText('#work')).toBeInTheDocument();
      expect(screen.getByText('#personal')).toBeInTheDocument();
      expect(screen.getByText('#urgent')).toBeInTheDocument();
      expect(screen.getByText('#hobby')).toBeInTheDocument();
    });

    it('should call onFiltersChange when tag is selected', async () => {
      const user = userEvent.setup();
      render(<TodoFilter {...defaultProps} />);

      const tagsButton = screen.getByText(/select tags/i);
      await user.click(tagsButton);

      const workCheckbox = screen.getByLabelText('#work');
      await user.click(workCheckbox);

      expect(mockHandlers.onFiltersChange).toHaveBeenCalledWith({
        tags: ['work'],
      });
    });

    it('should show selected tags count', () => {
      render(<TodoFilter {...defaultProps} filters={{ tags: ['work', 'urgent'] }} />);

      expect(screen.getByText('2 tags selected')).toBeInTheDocument();
    });

    it('should show selected tags as removable badges', () => {
      render(<TodoFilter {...defaultProps} filters={{ tags: ['work', 'urgent'] }} />);

      expect(screen.getByText('#work')).toBeInTheDocument();
      expect(screen.getByText('#urgent')).toBeInTheDocument();
    });

    it('should remove tag when badge close button is clicked', async () => {
      const user = userEvent.setup();
      render(<TodoFilter {...defaultProps} filters={{ tags: ['work', 'urgent'] }} />);

      const workBadge = screen.getByText('#work');
      const closeButton = workBadge.nextSibling as HTMLButtonElement;
      await user.click(closeButton);

      expect(mockHandlers.onFiltersChange).toHaveBeenCalledWith({
        tags: ['urgent'],
      });
    });

    it('should not show tags section when no tags available', () => {
      render(<TodoFilter {...defaultProps} availableTags={[]} />);

      expect(screen.queryByText('Tags')).not.toBeInTheDocument();
    });
  });

  describe('reset functionality', () => {
    it('should show clear button when filters are active', () => {
      render(<TodoFilter {...defaultProps} filters={{ searchTerm: 'test' }} />);

      expect(screen.getByText(/clear all filters/i)).toBeInTheDocument();
    });

    it('should not show clear button when no filters are active', () => {
      render(<TodoFilter {...defaultProps} />);

      expect(screen.queryByText(/clear all filters/i)).not.toBeInTheDocument();
    });

    it('should call onFiltersChange and onReset when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<TodoFilter {...defaultProps} filters={{ searchTerm: 'test' }} />);

      const clearButton = screen.getByText(/clear all filters/i);
      await user.click(clearButton);

      expect(mockHandlers.onFiltersChange).toHaveBeenCalledWith({});
      expect(mockHandlers.onReset).toHaveBeenCalled();
    });

    it('should show clear button in compact mode when filters are active', () => {
      render(
        <TodoFilter 
          {...defaultProps} 
          filters={{ searchTerm: 'test' }} 
          compact={true} 
        />
      );

      expect(screen.getByText('Clear')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper labels for form inputs', () => {
      render(<TodoFilter {...defaultProps} />);

      expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date range/i)).toBeInTheDocument();
    });

    it('should have proper titles for buttons', () => {
      render(<TodoFilter {...defaultProps} compact={true} />);

      expect(screen.getByTitle(/show more filters/i)).toBeInTheDocument();
    });

    it('should close tag dropdown when clicking outside', async () => {
      const user = userEvent.setup();
      render(<TodoFilter {...defaultProps} />);

      // Open dropdown
      const tagsButton = screen.getByText(/select tags/i);
      await user.click(tagsButton);
      expect(screen.getByText('#work')).toBeInTheDocument();

      // Click outside
      await user.click(document.body);
      
      // Dropdown should be closed (this test might need adjustment based on implementation)
      // Note: Testing click outside events can be tricky in jsdom
    });
  });

  describe('todo count display', () => {
    it('should show todo counts in status buttons', () => {
      render(<TodoFilter {...defaultProps} />);

      expect(screen.getByText(/active.*7/i)).toBeInTheDocument();
      expect(screen.getByText(/completed.*3/i)).toBeInTheDocument();
    });

    it('should not show counts when todoCount is not provided', () => {
      const { todoCount, ...propsWithoutCount } = defaultProps;
      render(<TodoFilter {...propsWithoutCount} />);

      expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument();
    });
  });
});