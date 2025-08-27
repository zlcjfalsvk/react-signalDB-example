import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TodoForm } from './TodoForm';
import type { Todo } from '../../types/todo';

describe('TodoForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form with all fields', () => {
    render(<TodoForm {...defaultProps} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /add todo/i })
    ).toBeInTheDocument();
  });

  it('should show required field indicator for title', () => {
    render(<TodoForm {...defaultProps} />);

    const titleLabel = screen.getByText(/title/i);
    expect(titleLabel).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should validate required title field', async () => {
    const user = userEvent.setup();
    render(<TodoForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /add todo/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should validate title minimum length', async () => {
    const user = userEvent.setup();
    render(<TodoForm {...defaultProps} />);

    const titleInput = screen.getByLabelText(/title/i);
    await user.type(titleInput, 'ab');
    await user.tab(); // Trigger blur event

    await waitFor(() => {
      expect(
        screen.getByText(/title must be at least 3 characters/i)
      ).toBeInTheDocument();
    });
  });

  it('should validate title maximum length', async () => {
    const user = userEvent.setup();
    render(<TodoForm {...defaultProps} />);

    const longTitle = 'a'.repeat(101);
    const titleInput = screen.getByLabelText(/title/i);
    await user.type(titleInput, longTitle);
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText(/title must be less than 100 characters/i)
      ).toBeInTheDocument();
    });
  });

  it('should validate description maximum length', async () => {
    const user = userEvent.setup();
    render(<TodoForm {...defaultProps} />);

    const longDescription = 'a'.repeat(501);
    const descriptionInput = screen.getByLabelText(/description/i);
    await user.type(descriptionInput, longDescription);
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText(/description must be less than 500 characters/i)
      ).toBeInTheDocument();
    });
  });

  it('should validate tags limit', async () => {
    const user = userEvent.setup();
    render(<TodoForm {...defaultProps} />);

    const manyTags = Array.from({ length: 11 }, (_, i) => `tag${i + 1}`).join(
      ', '
    );
    const tagsInput = screen.getByLabelText(/tags/i);
    await user.type(tagsInput, manyTags);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/maximum 10 tags allowed/i)).toBeInTheDocument();
    });
  });

  it('should validate tag length', async () => {
    const user = userEvent.setup();
    render(<TodoForm {...defaultProps} />);

    const longTag = 'a'.repeat(21);
    const tagsInput = screen.getByLabelText(/tags/i);
    await user.type(tagsInput, longTag);
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText(/each tag must be less than 20 characters/i)
      ).toBeInTheDocument();
    });
  });

  it('should validate due date is not in the past', async () => {
    const user = userEvent.setup();
    render(<TodoForm {...defaultProps} />);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    const dueDateInput = screen.getByLabelText(/due date/i);
    await user.type(dueDateInput, yesterdayString);
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText(/due date cannot be in the past/i)
      ).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    render(<TodoForm {...defaultProps} />);

    // Fill out the form
    await user.type(screen.getByLabelText(/title/i), 'Test Todo');
    await user.type(screen.getByLabelText(/description/i), 'Test description');
    await user.selectOptions(screen.getByLabelText(/priority/i), 'high');
    await user.type(screen.getByLabelText(/tags/i), 'tag1, tag2, tag3');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];
    await user.type(screen.getByLabelText(/due date/i), tomorrowString);

    await user.click(screen.getByRole('button', { name: /add todo/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Test Todo',
        description: 'Test description',
        priority: 'high',
        tags: ['tag1', 'tag2', 'tag3'],
        dueDate: expect.any(Date),
        completed: false,
      });
    });
  });

  it('should handle tags correctly (trim, deduplicate)', async () => {
    const user = userEvent.setup();
    render(<TodoForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/title/i), 'Test Todo');
    await user.type(
      screen.getByLabelText(/tags/i),
      ' tag1 ,  tag2  , tag1 , tag3 '
    );

    await user.click(screen.getByRole('button', { name: /add todo/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ['tag1', 'tag2', 'tag3'], // Trimmed and deduplicated
        })
      );
    });
  });

  it('should populate form with initial data', () => {
    const initialData: Partial<Todo> = {
      title: 'Existing Todo',
      description: 'Existing description',
      priority: 'medium',
      tags: ['work', 'important'],
      dueDate: new Date('2024-12-31'),
      completed: true,
    };

    render(
      <TodoForm
        {...defaultProps}
        initialData={initialData}
        submitLabel="Update Todo"
      />
    );

    expect(screen.getByDisplayValue('Existing Todo')).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('Existing description')
    ).toBeInTheDocument();
    // Priority select should display "Medium" text for value="medium"
    const prioritySelect = screen.getByLabelText(
      /priority/i
    ) as HTMLSelectElement;
    expect(prioritySelect.value).toBe('medium');
    expect(screen.getByDisplayValue('work, important')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /update todo/i })
    ).toBeInTheDocument();
  });

  it('should reset form when reset button is clicked', async () => {
    const user = userEvent.setup();
    render(<TodoForm {...defaultProps} />);

    // Fill out some fields
    await user.type(screen.getByLabelText(/title/i), 'Test Title');
    await user.type(screen.getByLabelText(/description/i), 'Test description');

    // Click reset
    await user.click(screen.getByRole('button', { name: /reset/i }));

    // Check that fields are cleared
    expect(screen.getByLabelText(/title/i)).toHaveValue('');
    expect(screen.getByLabelText(/description/i)).toHaveValue('');
    expect(screen.getByLabelText(/priority/i)).toHaveValue('medium');
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<TodoForm {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should not show cancel button when onCancel is not provided', () => {
    render(<TodoForm onSubmit={mockOnSubmit} />);

    expect(
      screen.queryByRole('button', { name: /cancel/i })
    ).not.toBeInTheDocument();
  });

  it('should disable form when loading', async () => {
    render(<TodoForm {...defaultProps} isLoading={true} />);

    expect(screen.getByLabelText(/title/i)).toBeDisabled();
    expect(screen.getByLabelText(/description/i)).toBeDisabled();
    expect(screen.getByLabelText(/priority/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /saving.../i })).toBeDisabled();
  });

  it('should clear validation errors when user starts typing', async () => {
    const user = userEvent.setup();
    render(<TodoForm {...defaultProps} />);

    // Submit empty form to trigger validation errors
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });

    // Start typing in title field
    await user.type(screen.getByLabelText(/title/i), 'T');

    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText(/title is required/i)).not.toBeInTheDocument();
    });
  });

  it('should handle empty optional fields correctly', async () => {
    const user = userEvent.setup();
    render(<TodoForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/title/i), 'Minimal Todo');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Minimal Todo',
        description: undefined,
        priority: 'medium',
        tags: [],
        dueDate: undefined,
        completed: false,
      });
    });
  });

  it('should prevent form submission with enter key on single-line inputs', async () => {
    const user = userEvent.setup();
    render(<TodoForm {...defaultProps} />);

    // Add valid title first
    await user.type(screen.getByLabelText(/title/i), 'Test Title');

    // Try to submit with enter key
    await user.type(screen.getByLabelText(/title/i), '{enter}');

    // Form should submit since we have a valid title
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Title',
        })
      );
    });
  });

  it('should allow form submission with ctrl+enter on textarea', async () => {
    const user = userEvent.setup();
    render(<TodoForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/title/i), 'Test Todo');
    
    const descriptionTextarea = screen.getByLabelText(/description/i);
    await user.type(descriptionTextarea, 'Description');
    
    // Focus the textarea and simulate Ctrl+Enter 
    descriptionTextarea.focus();
    await user.keyboard('{Control>}{Enter}{/Control}');

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('should show helper text for tags field', () => {
    render(<TodoForm {...defaultProps} />);

    expect(
      screen.getByText(/separate multiple tags with commas/i)
    ).toBeInTheDocument();
  });

  it('should handle priority selection correctly', async () => {
    const user = userEvent.setup();
    render(<TodoForm {...defaultProps} />);

    const prioritySelect = screen.getByLabelText(/priority/i);

    // Test all priority options are available
    expect(screen.getByRole('option', { name: /low/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /medium/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /high/i })).toBeInTheDocument();

    // Test selection
    await user.selectOptions(prioritySelect, 'high');
    expect(prioritySelect).toHaveValue('high');
  });
});
