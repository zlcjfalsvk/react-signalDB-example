import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TodoStats } from './TodoStats';
import type { TodoStats as TodoStatsType, Priority } from '../../types/todo';

describe('TodoStats', () => {
  const mockStats: TodoStatsType = {
    total: 10,
    completed: 6,
    active: 4,
    completionRate: 60.0,
    todayAdded: 2,
    overdueCount: 1,
  };

  const mockPriorityStats: Record<Priority, number> = {
    high: 3,
    medium: 4,
    low: 3,
  };

  const mockTagStats = {
    work: 5,
    personal: 3,
    urgent: 2,
    hobby: 1,
  };

  const defaultProps = {
    stats: mockStats,
    priorityStats: mockPriorityStats,
    tagStats: mockTagStats,
  };

  describe('compact mode', () => {
    it('should render compact statistics correctly', () => {
      render(<TodoStats {...defaultProps} compact={true} />);

      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('60.0%')).toBeInTheDocument();

      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Complete')).toBeInTheDocument();
    });

    it('should not show detailed sections in compact mode', () => {
      render(<TodoStats {...defaultProps} compact={true} />);

      expect(
        screen.queryByText('Priority Distribution')
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Most Used Tags')).not.toBeInTheDocument();
    });
  });

  describe('full mode', () => {
    it('should render overview cards', () => {
      render(<TodoStats {...defaultProps} />);

      expect(screen.getByText('Total Todos')).toBeInTheDocument();
      expect(screen.getAllByText('Completed')[0]).toBeInTheDocument(); // Multiple instances - title and in description
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Added Today')).toBeInTheDocument();

      // Check that the numbers are displayed (may appear multiple times)
      expect(screen.getAllByText('10')[0]).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should show overdue alert when there are overdue todos', () => {
      render(<TodoStats {...defaultProps} />);

      expect(screen.getByText('1 overdue todo')).toBeInTheDocument();
      expect(screen.getByText('⚠️')).toBeInTheDocument();
      expect(
        screen.getByText(/some todos have passed their due date/i)
      ).toBeInTheDocument();
    });

    it('should show multiple overdue alert correctly', () => {
      const statsWithMultipleOverdue = {
        ...mockStats,
        overdueCount: 3,
      };

      render(<TodoStats {...defaultProps} stats={statsWithMultipleOverdue} />);

      expect(screen.getByText('3 overdue todos')).toBeInTheDocument();
    });

    it('should not show overdue alert when no overdue todos', () => {
      const statsWithoutOverdue = {
        ...mockStats,
        overdueCount: 0,
      };

      render(<TodoStats {...defaultProps} stats={statsWithoutOverdue} />);

      expect(screen.queryByText(/overdue todo/i)).not.toBeInTheDocument();
      expect(screen.queryByText('⚠️')).not.toBeInTheDocument();
    });

    it('should render priority distribution section', () => {
      render(<TodoStats {...defaultProps} showCharts={true} />);

      expect(screen.getByText('Priority Distribution')).toBeInTheDocument();
      expect(screen.getByText('High Priority')).toBeInTheDocument();
      expect(screen.getByText('Medium Priority')).toBeInTheDocument();
      expect(screen.getByText('Low Priority')).toBeInTheDocument();
    });

    it('should render completion progress section', () => {
      render(<TodoStats {...defaultProps} showCharts={true} />);

      expect(screen.getByText('Completion Progress')).toBeInTheDocument();
      expect(screen.getByText('60.0%')).toBeInTheDocument();
      expect(screen.getByText('Overall completion')).toBeInTheDocument();
    });

    it('should render top tags section when tags exist', () => {
      render(<TodoStats {...defaultProps} />);

      expect(screen.getByText('Most Used Tags')).toBeInTheDocument();
      expect(screen.getByText('#work')).toBeInTheDocument();
      expect(screen.getByText('#personal')).toBeInTheDocument();
      expect(screen.getByText('#urgent')).toBeInTheDocument();
      expect(screen.getByText('#hobby')).toBeInTheDocument();
    });

    it('should limit top tags to 5', () => {
      const manyTagStats = {
        tag1: 10,
        tag2: 9,
        tag3: 8,
        tag4: 7,
        tag5: 6,
        tag6: 5,
        tag7: 4,
        tag8: 3,
      };

      render(<TodoStats {...defaultProps} tagStats={manyTagStats} />);

      expect(screen.getByText('#tag1')).toBeInTheDocument();
      expect(screen.getByText('#tag5')).toBeInTheDocument();
      expect(screen.getByText('And 3 more tags...')).toBeInTheDocument();
      expect(screen.queryByText('#tag8')).not.toBeInTheDocument();
    });

    it('should not show top tags section when no tags', () => {
      render(<TodoStats {...defaultProps} tagStats={{}} />);

      expect(screen.queryByText('Most Used Tags')).not.toBeInTheDocument();
    });

    it('should render productivity insights', () => {
      render(<TodoStats {...defaultProps} />);

      expect(screen.getByText('💡 Productivity Insights')).toBeInTheDocument();
      expect(screen.getByText("Today's Activity")).toBeInTheDocument();
      expect(screen.getByText('Recommendations')).toBeInTheDocument();
    });

    it('should not show charts when showCharts is false', () => {
      render(<TodoStats {...defaultProps} showCharts={false} />);

      expect(
        screen.queryByText('Priority Distribution')
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Completion Progress')).not.toBeInTheDocument();
    });
  });

  describe('completion rate colors', () => {
    it('should show green color for high completion rate', () => {
      const highCompletionStats = {
        ...mockStats,
        completionRate: 85.0,
      };

      render(<TodoStats {...defaultProps} stats={highCompletionStats} />);

      const completionText = screen.getByText('85.0%');
      expect(completionText).toHaveClass('text-green-600');
    });

    it('should show yellow color for medium completion rate', () => {
      const mediumCompletionStats = {
        ...mockStats,
        completionRate: 65.0,
      };

      render(<TodoStats {...defaultProps} stats={mediumCompletionStats} />);

      const completionText = screen.getByText('65.0%');
      expect(completionText).toHaveClass('text-yellow-600');
    });

    it('should show red color for low completion rate', () => {
      const lowCompletionStats = {
        ...mockStats,
        completionRate: 30.0,
      };

      render(<TodoStats {...defaultProps} stats={lowCompletionStats} />);

      const completionText = screen.getByText('30.0%');
      expect(completionText).toHaveClass('text-red-600');
    });
  });

  describe('productivity insights', () => {
    it('should show completion rate insight', () => {
      render(<TodoStats {...defaultProps} />);

      // The completion rate appears in the description of the StatCard
      const completionRateElements = screen.getAllByText(
        /60.0% completion rate/i
      );
      expect(completionRateElements.length).toBeGreaterThan(0);
    });

    it('should show overdue items warning when present', () => {
      render(<TodoStats {...defaultProps} />);

      expect(screen.getByText(/1 overdue item/i)).toBeInTheDocument();
    });

    it('should show focus recommendation for low completion rate', () => {
      const lowCompletionStats = {
        ...mockStats,
        completionRate: 40.0,
      };

      render(<TodoStats {...defaultProps} stats={lowCompletionStats} />);

      expect(
        screen.getByText(/focus on completing existing todos/i)
      ).toBeInTheDocument();
    });

    it('should show task breakdown recommendation for high priority items', () => {
      const highPriorityStats = {
        high: 8,
        medium: 1,
        low: 1,
      };

      render(<TodoStats {...defaultProps} priorityStats={highPriorityStats} />);

      expect(
        screen.getByText(/consider breaking down high-priority tasks/i)
      ).toBeInTheDocument();
    });

    it('should show overdue recommendation when overdue todos exist', () => {
      render(<TodoStats {...defaultProps} />);

      expect(
        screen.getByText(/review and update overdue todos/i)
      ).toBeInTheDocument();
    });

    it('should show celebration message when all todos are completed', () => {
      const allCompletedStats = {
        ...mockStats,
        active: 0,
        completed: 10,
        completionRate: 100,
      };

      render(<TodoStats {...defaultProps} stats={allCompletedStats} />);

      expect(
        screen.getByText(/great job! all todos completed!/i)
      ).toBeInTheDocument();
    });
  });

  describe('donut chart', () => {
    it('should show "No data" when no todos exist', () => {
      const emptyStats = {
        total: 0,
        completed: 0,
        active: 0,
        completionRate: 0,
        todayAdded: 0,
        overdueCount: 0,
      };

      const emptyPriorityStats = {
        high: 0,
        medium: 0,
        low: 0,
      };

      render(
        <TodoStats
          stats={emptyStats}
          priorityStats={emptyPriorityStats}
          tagStats={{}}
          showCharts={true}
        />
      );

      // When stats.total is 0, the DonutChart shows "No data"
      // The DonutChart is rendered within the Priority Distribution section
      expect(screen.getByText('Priority Distribution')).toBeInTheDocument();
      expect(screen.getByText('No data')).toBeInTheDocument();
    });

    it('should show total count in center of donut chart', () => {
      render(<TodoStats {...defaultProps} showCharts={true} />);

      // Should show total count in the donut chart center
      expect(screen.getByText('Total')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle zero completion rate', () => {
      const zeroCompletionStats = {
        ...mockStats,
        completed: 0,
        completionRate: 0,
      };

      render(<TodoStats {...defaultProps} stats={zeroCompletionStats} />);

      expect(screen.getByText('0.0%')).toBeInTheDocument();
    });

    it('should handle 100% completion rate', () => {
      const fullCompletionStats = {
        ...mockStats,
        active: 0,
        completed: 10,
        completionRate: 100,
      };

      render(<TodoStats {...defaultProps} stats={fullCompletionStats} />);

      expect(screen.getByText('100.0%')).toBeInTheDocument();
    });

    it('should handle single todo correctly', () => {
      const singleTodoStats = {
        total: 1,
        completed: 0,
        active: 1,
        completionRate: 0,
        todayAdded: 1,
        overdueCount: 0,
      };

      render(<TodoStats {...defaultProps} stats={singleTodoStats} />);

      expect(screen.getByText('All todos created')).toBeInTheDocument();
      expect(screen.getByText('Pending todos')).toBeInTheDocument();
    });
  });
});
