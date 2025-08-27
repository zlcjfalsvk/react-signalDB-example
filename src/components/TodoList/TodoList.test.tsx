import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TodoList } from './TodoList';
import type { Todo } from '../../types/todo';

describe('TodoList', () => {
  const mockTodos: Todo[] = [
    {
      id: '1',
      title: 'First Todo',
      description: 'First description',
      completed: false,
      priority: 'high',
      tags: ['work'],
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    {
      id: '2',
      title: 'Second Todo',
      description: 'Second description',
      completed: true,
      priority: 'medium',
      tags: ['personal'],
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
    },
    {
      id: '3',
      title: 'Third Todo',
      description: 'Third description',
      completed: false,
      priority: 'low',
      tags: ['hobby'],
      createdAt: new Date('2023-01-03'),
      updatedAt: new Date('2023-01-03'),
    },
  ];

  const mockHandlers = {
    onToggle: vi.fn(),
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
    onSort: vi.fn(),
    onBulkDelete: vi.fn(),
    onBulkToggle: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render list of todos', () => {
    render(<TodoList todos={mockTodos} {...mockHandlers} />);

    expect(screen.getByText('First Todo')).toBeInTheDocument();
    expect(screen.getByText('Second Todo')).toBeInTheDocument();
    expect(screen.getByText('Third Todo')).toBeInTheDocument();
  });

  it('should show todo count', () => {
    render(<TodoList todos={mockTodos} {...mockHandlers} />);

    expect(screen.getByText('3 todos')).toBeInTheDocument();
  });

  it('should show singular form for single todo', () => {
    render(<TodoList todos={[mockTodos[0]]} {...mockHandlers} />);

    expect(screen.getByText('1 todo')).toBeInTheDocument();
  });

  it('should show empty message when no todos', () => {
    render(<TodoList todos={[]} {...mockHandlers} emptyMessage="No tasks found" />);

    expect(screen.getByText('No tasks found')).toBeInTheDocument();
    expect(screen.getByText('📝')).toBeInTheDocument();
  });

  it('should show default empty message', () => {
    render(<TodoList todos={[]} {...mockHandlers} />);

    expect(screen.getByText('No todos found')).toBeInTheDocument();
  });

  it('should show sort controls when onSort is provided', () => {
    render(<TodoList todos={mockTodos} {...mockHandlers} />);

    expect(screen.getByText('Sort by:')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByTitle(/sort/i)).toBeInTheDocument();
  });

  it('should call onSort when sort option changes', async () => {
    const user = userEvent.setup();
    render(<TodoList todos={mockTodos} {...mockHandlers} sortBy="date" />);

    const sortSelect = screen.getByRole('combobox');
    await user.selectOptions(sortSelect, 'title');

    expect(mockHandlers.onSort).toHaveBeenCalledWith('title', 'desc');
  });

  it('should toggle sort direction when sort button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TodoList 
        todos={mockTodos} 
        {...mockHandlers} 
        sortBy="date" 
        sortDirection="desc" 
      />
    );

    const sortButton = screen.getByTitle(/sort ascending/i);
    await user.click(sortButton);

    expect(mockHandlers.onSort).toHaveBeenCalledWith('date', 'asc');
  });

  it('should show bulk actions when enabled', () => {
    render(<TodoList todos={mockTodos} {...mockHandlers} showBulkActions={true} />);

    expect(screen.getByText('Select')).toBeInTheDocument();
  });

  it('should enable selection mode when select button is clicked', async () => {
    const user = userEvent.setup();
    render(<TodoList todos={mockTodos} {...mockHandlers} showBulkActions={true} />);

    const selectButton = screen.getByText('Select');
    await user.click(selectButton);

    expect(screen.getByText('0 selected')).toBeInTheDocument();
    expect(screen.getByText('Select All')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should select all todos when Select All is clicked', async () => {
    const user = userEvent.setup();
    render(<TodoList todos={mockTodos} {...mockHandlers} showBulkActions={true} />);

    // Enter selection mode
    await user.click(screen.getByText('Select'));

    // Click Select All
    await user.click(screen.getByText('Select All'));

    expect(screen.getByText('3 selected')).toBeInTheDocument();
    expect(screen.getByText('Deselect All')).toBeInTheDocument();
  });

  it('should show bulk action buttons when items are selected', async () => {
    const user = userEvent.setup();
    render(<TodoList todos={mockTodos} {...mockHandlers} showBulkActions={true} />);

    // Enter selection mode and select all
    await user.click(screen.getByText('Select'));
    await user.click(screen.getByText('Select All'));

    expect(screen.getByText('Complete')).toBeInTheDocument();
    expect(screen.getByText('Activate')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should call onBulkToggle when Complete button is clicked', async () => {
    const user = userEvent.setup();
    render(<TodoList todos={mockTodos} {...mockHandlers} showBulkActions={true} />);

    // Enter selection mode and select all
    await user.click(screen.getByText('Select'));
    await user.click(screen.getByText('Select All'));

    // Click Complete
    await user.click(screen.getByText('Complete'));

    expect(mockHandlers.onBulkToggle).toHaveBeenCalledWith(['1', '2', '3'], true);
  });

  it('should call onBulkToggle when Activate button is clicked', async () => {
    const user = userEvent.setup();
    render(<TodoList todos={mockTodos} {...mockHandlers} showBulkActions={true} />);

    // Enter selection mode and select all
    await user.click(screen.getByText('Select'));
    await user.click(screen.getByText('Select All'));

    // Click Activate
    await user.click(screen.getByText('Activate'));

    expect(mockHandlers.onBulkToggle).toHaveBeenCalledWith(['1', '2', '3'], false);
  });

  it('should call onBulkDelete when Delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<TodoList todos={mockTodos} {...mockHandlers} showBulkActions={true} />);

    // Enter selection mode and select all
    await user.click(screen.getByText('Select'));
    await user.click(screen.getByText('Select All'));

    // Click Delete
    await user.click(screen.getByText('Delete'));

    expect(mockHandlers.onBulkDelete).toHaveBeenCalledWith(['1', '2', '3']);
  });

  it('should cancel selection mode when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<TodoList todos={mockTodos} {...mockHandlers} showBulkActions={true} />);

    // Enter selection mode
    await user.click(screen.getByText('Select'));

    // Cancel selection mode
    await user.click(screen.getByText('Cancel'));

    expect(screen.getByText('Select')).toBeInTheDocument();
    expect(screen.queryByText('0 selected')).not.toBeInTheDocument();
  });

  it('should not show virtualization info in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const manyTodos = Array.from({ length: 100 }, (_, i) => ({
      ...mockTodos[0],
      id: `${i}`,
      title: `Todo ${i}`,
    }));

    render(
      <TodoList 
        todos={manyTodos} 
        {...mockHandlers} 
        enableVirtualization={true} 
      />
    );

    expect(screen.queryByText(/virtualized/i)).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('should show virtualization info in development for large lists', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const manyTodos = Array.from({ length: 100 }, (_, i) => ({
      ...mockTodos[0],
      id: `${i}`,
      title: `Todo ${i}`,
    }));

    render(
      <TodoList 
        todos={manyTodos} 
        {...mockHandlers} 
        enableVirtualization={true} 
      />
    );

    expect(screen.getByText(/virtualized/i)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('should disable virtualization for small lists', () => {
    render(
      <TodoList 
        todos={mockTodos} 
        {...mockHandlers} 
        enableVirtualization={true} 
      />
    );

    // With only 3 todos, virtualization should not be enabled
    // (Component uses virtualization only for 50+ items)
    expect(screen.queryByText(/virtualized/i)).not.toBeInTheDocument();
  });

  it('should pass correct props to TodoItem components', () => {
    render(<TodoList todos={mockTodos} {...mockHandlers} />);

    // Each todo should be rendered with its data
    expect(screen.getByText('First Todo')).toBeInTheDocument();
    expect(screen.getByText('Second Todo')).toBeInTheDocument();
    expect(screen.getByText('Third Todo')).toBeInTheDocument();

    // Check that checkboxes are present (TodoItem should be rendered)
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
  });

  it('should handle empty todos array gracefully', () => {
    render(<TodoList todos={[]} {...mockHandlers} />);

    expect(screen.getByText('📝')).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('should show correct sort direction indicator', () => {
    render(
      <TodoList 
        todos={mockTodos} 
        {...mockHandlers} 
        sortDirection="asc" 
      />
    );

    expect(screen.getByTitle(/sort descending/i)).toBeInTheDocument();
    expect(screen.getByText('↑')).toBeInTheDocument();
  });

  it('should not show sort controls when onSort is not provided', () => {
    const { onSort, ...handlersWithoutSort } = mockHandlers;
    render(<TodoList todos={mockTodos} {...handlersWithoutSort} />);

    expect(screen.queryByText('Sort by:')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('should not show bulk actions when showBulkActions is false', () => {
    render(
      <TodoList 
        todos={mockTodos} 
        {...mockHandlers} 
        showBulkActions={false} 
      />
    );

    expect(screen.queryByText('Select')).not.toBeInTheDocument();
  });

  it('should handle individual todo item interactions', async () => {
    const user = userEvent.setup();
    render(<TodoList todos={mockTodos} {...mockHandlers} />);

    // Find and click the first todo's checkbox
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    expect(mockHandlers.onToggle).toHaveBeenCalledWith('1');
  });
});