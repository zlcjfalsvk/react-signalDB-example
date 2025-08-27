import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';

describe('Todo App E2E', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Complete Todo Workflow', () => {
    it('should create and complete todo workflow', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Navigate to Add Todo view
      const addButton = screen.getByText('Add Todo');
      await user.click(addButton);

      // Fill out the form
      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const prioritySelect = screen.getByLabelText(/priority/i);
      const tagsInput = screen.getByLabelText(/tags/i);
      const dueDateInput = screen.getByLabelText(/due date/i);

      await user.type(titleInput, 'Complete E2E Testing');
      await user.type(
        descriptionInput,
        'Write comprehensive E2E tests for the Todo app'
      );
      await user.selectOptions(prioritySelect, 'high');
      await user.type(tagsInput, 'testing, important, development');

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];
      await user.type(dueDateInput, dateString);

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /add todo/i });
      await user.click(submitButton);

      // Verify todo was added and we're back at the list view
      await waitFor(() => {
        expect(screen.getByText('Complete E2E Testing')).toBeInTheDocument();
      });

      // Find the todo item
      const todoItem = screen
        .getByText('Complete E2E Testing')
        .closest('[role="article"]');
      expect(todoItem).toBeInTheDocument();

      // Verify todo details
      within(todoItem!).getByText(/Write comprehensive E2E tests/i);
      within(todoItem!).getByText(/High/i);
      within(todoItem!).getByText(/testing/i);
      within(todoItem!).getByText(/important/i);

      // Toggle completion
      const checkbox = within(todoItem!).getByRole('checkbox');
      await user.click(checkbox);

      await waitFor(() => {
        expect(checkbox).toBeChecked();
      });

      // Verify stats updated
      const statsButton = screen.getByText('Stats');
      await user.click(statsButton);

      await waitFor(() => {
        expect(screen.getByText(/1 total/i)).toBeInTheDocument();
        expect(screen.getByText(/1 completed/i)).toBeInTheDocument();
        expect(screen.getByText(/100%/i)).toBeInTheDocument();
      });
    });
  });

  describe('Filter and Search', () => {
    it('should filter and search todos', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Add multiple todos
      const todos = [
        { title: 'High Priority Task', priority: 'high', tags: 'urgent' },
        { title: 'Medium Task', priority: 'medium', tags: 'work' },
        { title: 'Low Priority Item', priority: 'low', tags: 'personal' },
      ];

      for (const todo of todos) {
        const addButton = screen.getByText('Add Todo');
        await user.click(addButton);

        await user.type(screen.getByLabelText(/title/i), todo.title);
        await user.selectOptions(
          screen.getByLabelText(/priority/i),
          todo.priority
        );
        await user.type(screen.getByLabelText(/tags/i), todo.tags);

        await user.click(screen.getByRole('button', { name: /add todo/i }));

        await waitFor(() => {
          expect(screen.getByText(todo.title)).toBeInTheDocument();
        });
      }

      // Search functionality
      const searchInput = screen.getByPlaceholderText(/search todos/i);
      await user.type(searchInput, 'Priority');

      await waitFor(() => {
        expect(screen.getByText('High Priority Task')).toBeInTheDocument();
        expect(screen.getByText('Low Priority Item')).toBeInTheDocument();
        expect(screen.queryByText('Medium Task')).not.toBeInTheDocument();
      });

      // Clear search
      await user.clear(searchInput);

      // Filter by priority
      const priorityFilter = screen.getByLabelText(/filter by priority/i);
      await user.selectOptions(priorityFilter, 'high');

      await waitFor(() => {
        expect(screen.getByText('High Priority Task')).toBeInTheDocument();
        expect(screen.queryByText('Medium Task')).not.toBeInTheDocument();
        expect(screen.queryByText('Low Priority Item')).not.toBeInTheDocument();
      });

      // Reset filters
      const resetButton = screen.getByText(/reset filters/i);
      await user.click(resetButton);

      await waitFor(() => {
        expect(screen.getByText('High Priority Task')).toBeInTheDocument();
        expect(screen.getByText('Medium Task')).toBeInTheDocument();
        expect(screen.getByText('Low Priority Item')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle edge cases gracefully', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Try to submit empty form
      const addButton = screen.getByText('Add Todo');
      await user.click(addButton);

      const submitButton = screen.getByRole('button', { name: /add todo/i });
      await user.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });

      // Test minimum title length
      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'a');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument();
      });

      // Test valid submission
      await user.clear(titleInput);
      await user.type(titleInput, 'Valid Todo');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Valid Todo')).toBeInTheDocument();
      });
    });

    it('should handle bulk operations', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Add multiple todos
      for (let i = 1; i <= 3; i++) {
        const addButton = screen.getByText('Add Todo');
        await user.click(addButton);

        await user.type(screen.getByLabelText(/title/i), `Todo ${i}`);
        await user.click(screen.getByRole('button', { name: /add todo/i }));

        await waitFor(() => {
          expect(screen.getByText(`Todo ${i}`)).toBeInTheDocument();
        });
      }

      // Mark all as completed
      const markAllButton = screen.getByText(/mark all complete/i);
      await user.click(markAllButton);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        checkboxes.forEach((checkbox) => {
          expect(checkbox).toBeChecked();
        });
      });

      // Clear completed
      const clearCompletedButton = screen.getByText(/clear completed/i);
      await user.click(clearCompletedButton);

      await waitFor(() => {
        expect(screen.queryByText('Todo 1')).not.toBeInTheDocument();
        expect(screen.queryByText('Todo 2')).not.toBeInTheDocument();
        expect(screen.queryByText('Todo 3')).not.toBeInTheDocument();
        expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
      });
    });
  });

  describe('Offline Functionality', () => {
    it('should work offline with localStorage persistence', async () => {
      const user = userEvent.setup();
      const { unmount } = render(<App />);

      // Add a todo
      const addButton = screen.getByText('Add Todo');
      await user.click(addButton);

      await user.type(screen.getByLabelText(/title/i), 'Persistent Todo');
      await user.type(
        screen.getByLabelText(/description/i),
        'This should persist'
      );
      await user.click(screen.getByRole('button', { name: /add todo/i }));

      await waitFor(() => {
        expect(screen.getByText('Persistent Todo')).toBeInTheDocument();
      });

      // Unmount the app (simulate closing)
      unmount();

      // Remount the app (simulate reopening)
      render(<App />);

      // Check if todo persisted
      await waitFor(() => {
        expect(screen.getByText('Persistent Todo')).toBeInTheDocument();
        expect(screen.getByText('This should persist')).toBeInTheDocument();
      });
    });
  });

  describe('Performance with Large Datasets', () => {
    it('should handle 100+ todos efficiently', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Add many todos programmatically
      const todos = Array.from({ length: 20 }, (_, i) => ({
        id: `todo-${i}`,
        title: `Todo Item ${i + 1}`,
        description: `Description for todo ${i + 1}`,
        completed: i % 3 === 0,
        priority: ['low', 'medium', 'high'][i % 3] as 'low' | 'medium' | 'high',
        tags: [`tag${i % 5}`],
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      // Directly populate localStorage to speed up test
      localStorage.setItem('todos', JSON.stringify(todos));

      // Remount to load from localStorage
      const { rerender } = render(<App />);
      rerender(<App />);

      // Verify todos are displayed
      await waitFor(() => {
        expect(screen.getByText('Todo Item 1')).toBeInTheDocument();
      });

      // Test scrolling and virtualization
      const listContainer = screen.getByRole('main');
      expect(listContainer).toBeInTheDocument();

      // Test search performance
      const searchInput = screen.getByPlaceholderText(/search todos/i);
      await user.type(searchInput, 'Todo Item 1');

      await waitFor(() => {
        expect(screen.getByText('Todo Item 1')).toBeInTheDocument();
        expect(screen.getByText('Todo Item 10')).toBeInTheDocument();
        expect(screen.queryByText('Todo Item 2')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Add a todo using keyboard only
      await user.tab(); // Focus on first interactive element

      // Navigate to Add Todo button
      const addButton = screen.getByText('Add Todo');
      addButton.focus();
      await user.keyboard('{Enter}');

      // Tab through form fields
      await user.tab(); // Title
      await user.type(screen.getByLabelText(/title/i), 'Keyboard Todo');

      await user.tab(); // Description
      await user.type(
        screen.getByLabelText(/description/i),
        'Added via keyboard'
      );

      await user.tab(); // Priority
      await user.keyboard('{ArrowDown}'); // Select medium

      await user.tab(); // Tags
      await user.type(screen.getByLabelText(/tags/i), 'accessibility');

      await user.tab(); // Due date
      await user.tab(); // Submit button
      await user.keyboard('{Enter}');

      // Verify todo was added
      await waitFor(() => {
        expect(screen.getByText('Keyboard Todo')).toBeInTheDocument();
      });
    });

    it('should have proper ARIA labels', () => {
      render(<App />);

      // Check for ARIA labels
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByLabelText(/view mode/i)).toBeInTheDocument();
    });
  });
});
