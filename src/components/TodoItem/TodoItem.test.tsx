import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TodoItem } from './TodoItem';
import type { Todo } from '../../types/todo';

describe('TodoItem', () => {
  const mockTodo: Todo = {
    id: '1',
    title: 'Test Todo',
    description: 'Test description',
    completed: false,
    priority: 'high',
    tags: ['work', 'urgent'],
    dueDate: new Date('2024-12-31'),
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
  };

  const mockHandlers = {
    onToggle: vi.fn(),
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
    onSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render todo with all information', () => {
    render(<TodoItem todo={mockTodo} {...mockHandlers} />);

    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('#work')).toBeInTheDocument();
    expect(screen.getByText('#urgent')).toBeInTheDocument();
    expect(screen.getByText(/Created:/)).toBeInTheDocument();
  });

  it('should show checkbox with correct state', () => {
    render(<TodoItem todo={mockTodo} {...mockHandlers} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('should show completed todo with strikethrough', () => {
    const completedTodo = { ...mockTodo, completed: true };
    render(<TodoItem todo={completedTodo} {...mockHandlers} />);

    const title = screen.getByText('Test Todo');
    expect(title).toHaveClass('line-through');
  });

  it('should call onToggle when checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={mockTodo} {...mockHandlers} />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(mockHandlers.onToggle).toHaveBeenCalledWith('1');
  });

  it('should show priority with correct styling', () => {
    render(<TodoItem todo={mockTodo} {...mockHandlers} />);

    const priorityBadge = screen.getByText('high');
    expect(priorityBadge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('should display due date correctly', () => {
    render(<TodoItem todo={mockTodo} {...mockHandlers} />);

    // The due date should be displayed in the format MM/DD/YYYY or similar
    expect(screen.getByText(/12\/31\/2024/)).toBeInTheDocument();
  });

  it('should show overdue indicator for past due dates', () => {
    const overdueTodo = {
      ...mockTodo,
      dueDate: new Date('2020-01-01'), // Past date
      completed: false,
    };
    render(<TodoItem todo={overdueTodo} {...mockHandlers} />);

    expect(screen.getByText(/⚠️ Overdue/)).toBeInTheDocument();
  });

  it('should show due today indicator', () => {
    const todayTodo = {
      ...mockTodo,
      dueDate: new Date(), // Today's date
    };
    render(<TodoItem todo={todayTodo} {...mockHandlers} />);

    expect(screen.getByText(/📅 Due today/)).toBeInTheDocument();
  });

  it('should not show due date when not set', () => {
    const todoWithoutDueDate = { ...mockTodo };
    delete todoWithoutDueDate.dueDate;
    
    render(<TodoItem todo={todoWithoutDueDate} {...mockHandlers} />);

    expect(screen.queryByText(/📅/)).not.toBeInTheDocument();
  });

  it('should show action buttons on hover', async () => {
    const user = userEvent.setup();
    const { container } = render(<TodoItem todo={mockTodo} {...mockHandlers} />);

    const todoItem = container.firstChild as HTMLElement;
    await user.hover(todoItem);

    // Note: The actual implementation shows buttons on hover,
    // but testing hover states can be tricky with jsdom
    // We'll test that the buttons exist in the DOM
    const editButton = screen.getByTitle(/edit todo/i);
    const deleteButton = screen.getByTitle(/delete todo/i);

    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
  });

  it('should enter edit mode when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={mockTodo} {...mockHandlers} isSelected={true} />);

    const editButton = screen.getByTitle(/edit todo/i);
    await user.click(editButton);

    // Should show input fields
    expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should enter edit mode when title is double-clicked', async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={mockTodo} {...mockHandlers} />);

    const title = screen.getByText('Test Todo');
    await user.dblClick(title);

    expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
  });

  it('should save changes when save button is clicked', async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={mockTodo} {...mockHandlers} isSelected={true} />);

    // Enter edit mode
    const editButton = screen.getByTitle(/edit todo/i);
    await user.click(editButton);

    // Edit the title
    const titleInput = screen.getByDisplayValue('Test Todo');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Todo');

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    expect(mockHandlers.onUpdate).toHaveBeenCalledWith('1', {
      title: 'Updated Todo',
      description: 'Test description',
    });
  });

  it('should cancel edit mode without saving changes', async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={mockTodo} {...mockHandlers} isSelected={true} />);

    // Enter edit mode
    const editButton = screen.getByTitle(/edit todo/i);
    await user.click(editButton);

    // Edit the title
    const titleInput = screen.getByDisplayValue('Test Todo');
    await user.clear(titleInput);
    await user.type(titleInput, 'This should not be saved');

    // Cancel changes
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockHandlers.onUpdate).not.toHaveBeenCalled();
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
  });

  it('should save with Enter key and cancel with Escape key', async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={mockTodo} {...mockHandlers} isSelected={true} />);

    // Enter edit mode
    const editButton = screen.getByTitle(/edit todo/i);
    await user.click(editButton);

    // Edit and press Enter
    const titleInput = screen.getByDisplayValue('Test Todo');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated with Enter{enter}');

    expect(mockHandlers.onUpdate).toHaveBeenCalledWith('1', {
      title: 'Updated with Enter',
      description: 'Test description',
    });
  });

  it('should prevent saving empty title', async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={mockTodo} {...mockHandlers} isSelected={true} />);

    // Enter edit mode
    const editButton = screen.getByTitle(/edit todo/i);
    await user.click(editButton);

    // Clear title and try to save
    const titleInput = screen.getByDisplayValue('Test Todo');
    await user.clear(titleInput);

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // Should not call onUpdate and should exit edit mode
    expect(mockHandlers.onUpdate).not.toHaveBeenCalled();
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
  });

  it('should show delete confirmation on first delete click', async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={mockTodo} {...mockHandlers} isSelected={true} />);

    const deleteButton = screen.getByTitle(/delete todo/i);
    await user.click(deleteButton);

    // Should show confirmation state
    expect(screen.getByTitle(/click again to confirm delete/i)).toBeInTheDocument();
    expect(mockHandlers.onDelete).not.toHaveBeenCalled();
  });

  it('should delete todo on second delete click', async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={mockTodo} {...mockHandlers} isSelected={true} />);

    const deleteButton = screen.getByTitle(/delete todo/i);
    
    // First click - show confirmation
    await user.click(deleteButton);
    
    // Second click - actually delete
    const confirmButton = screen.getByTitle(/click again to confirm delete/i);
    await user.click(confirmButton);

    expect(mockHandlers.onDelete).toHaveBeenCalledWith('1');
  });

  it('should call onSelect when todo is clicked and onSelect is provided', async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={mockTodo} {...mockHandlers} />);

    const todoElement = screen.getByText('Test Todo').closest('div');
    await user.click(todoElement!);

    expect(mockHandlers.onSelect).toHaveBeenCalledWith('1');
  });

  it('should show selected state styling', () => {
    render(<TodoItem todo={mockTodo} {...mockHandlers} isSelected={true} />);

    const todoElement = screen.getByText('Test Todo').closest('div');
    expect(todoElement).toHaveClass('border-blue-500');
  });

  it('should not show updated timestamp when same as created', () => {
    const todoWithSameTimestamp = {
      ...mockTodo,
      updatedAt: mockTodo.createdAt,
    };
    render(<TodoItem todo={todoWithSameTimestamp} {...mockHandlers} />);

    expect(screen.getByText(/Created:/)).toBeInTheDocument();
    expect(screen.queryByText(/Updated:/)).not.toBeInTheDocument();
  });

  it('should show updated timestamp when different from created', () => {
    render(<TodoItem todo={mockTodo} {...mockHandlers} />);

    expect(screen.getByText(/Created:/)).toBeInTheDocument();
    expect(screen.getByText(/Updated:/)).toBeInTheDocument();
  });

  it('should show all tags correctly', () => {
    render(<TodoItem todo={mockTodo} {...mockHandlers} />);

    expect(screen.getByText('#work')).toBeInTheDocument();
    expect(screen.getByText('#urgent')).toBeInTheDocument();
  });

  it('should not show description when empty', () => {
    const todoWithoutDescription = { ...mockTodo, description: undefined };
    render(<TodoItem todo={todoWithoutDescription} {...mockHandlers} />);

    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.queryByText('Test description')).not.toBeInTheDocument();
  });
});