import React, { useMemo } from 'react';

import type { TodoStats, Priority } from '../../types/todo';

interface TodoStatsProps {
  stats: TodoStats;
  priorityStats: Record<Priority, number>;
  tagStats: Record<string, number>;
  compact?: boolean;
  showCharts?: boolean;
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({
  title,
  value,
  icon,
  color,
  description,
  trend,
}: StatCardProps) {
  return (
    <div className={`${color} rounded-lg p-4 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {description && (
            <p className="text-xs opacity-60 mt-1">{description}</p>
          )}
        </div>
        <div className="text-3xl opacity-50">{icon}</div>
      </div>
      {trend && (
        <div
          className={`flex items-center mt-2 text-xs ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}
        >
          <span>{trend.isPositive ? '↑' : '↓'}</span>
          <span className="ml-1">{Math.abs(trend.value)}%</span>
          <span className="ml-1 opacity-75">from last week</span>
        </div>
      )}
    </div>
  );
}

interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
  showPercentage?: boolean;
}

function ProgressBar({
  label,
  value,
  max,
  color,
  showPercentage = true,
}: ProgressBarProps) {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-gray-600">
          {value}
          {showPercentage && max > 0 && ` (${percentage.toFixed(1)}%)`}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
}

function DonutChart({ data, size = 120, thickness = 12 }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 rounded-full"
        style={{ width: size, height: size }}
      >
        <span className="text-gray-400 text-sm">No data</span>
      </div>
    );
  }

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let currentAngle = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={thickness}
        />
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
          const strokeDashoffset = -((currentAngle / 100) * circumference);
          currentAngle += percentage;

          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color.replace('bg-', '').replace('-500', '')}
              strokeWidth={thickness}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300"
            />
          );
        })}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold">{total}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
      </div>
    </div>
  );
}

export function TodoStats({
  stats,
  priorityStats,
  tagStats,
  compact = false,
  showCharts = true,
}: TodoStatsProps) {
  // Calculate completion rate color
  const completionColor = useMemo(() => {
    if (stats.completionRate >= 80) return 'text-green-600';
    if (stats.completionRate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }, [stats.completionRate]);

  // Prepare priority chart data
  const priorityChartData = useMemo(
    () => [
      { label: 'High', value: priorityStats.high, color: '#dc2626' },
      { label: 'Medium', value: priorityStats.medium, color: '#d97706' },
      { label: 'Low', value: priorityStats.low, color: '#059669' },
    ],
    [priorityStats]
  );

  // Get top tags
  const topTags = useMemo(() => {
    return Object.entries(tagStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [tagStats]);

  if (compact) {
    return (
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.total}
            </div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.completed}
            </div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.active}
            </div>
            <div className="text-xs text-gray-500">Active</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${completionColor}`}>
              {stats.completionRate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Todos"
          value={stats.total}
          icon="📝"
          color="bg-blue-50 border border-blue-200 text-blue-900"
          description="All todos created"
        />

        <StatCard
          title="Completed"
          value={stats.completed}
          icon="✅"
          color="bg-green-50 border border-green-200 text-green-900"
          description={`${stats.completionRate.toFixed(1)}% completion rate`}
        />

        <StatCard
          title="Active"
          value={stats.active}
          icon="⚡"
          color="bg-orange-50 border border-orange-200 text-orange-900"
          description="Pending todos"
        />

        <StatCard
          title="Added Today"
          value={stats.todayAdded}
          icon="📅"
          color="bg-purple-50 border border-purple-200 text-purple-900"
          description="New todos today"
        />
      </div>

      {/* Alert for overdue todos */}
      {stats.overdueCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-medium text-red-900">
                {stats.overdueCount} overdue todo
                {stats.overdueCount > 1 ? 's' : ''}
              </p>
              <p className="text-sm text-red-700">
                Some todos have passed their due date and need attention
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts and Progress */}
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Priority Distribution */}
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">
              Priority Distribution
            </h3>
            <div className="flex items-center justify-between">
              <div className="space-y-3 flex-1">
                <ProgressBar
                  label="High Priority"
                  value={priorityStats.high}
                  max={stats.total}
                  color="bg-red-500"
                />
                <ProgressBar
                  label="Medium Priority"
                  value={priorityStats.medium}
                  max={stats.total}
                  color="bg-yellow-500"
                />
                <ProgressBar
                  label="Low Priority"
                  value={priorityStats.low}
                  max={stats.total}
                  color="bg-green-500"
                />
              </div>
              {stats.total > 0 && (
                <div className="ml-8">
                  <DonutChart data={priorityChartData} size={100} />
                </div>
              )}
            </div>
          </div>

          {/* Completion Progress */}
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">
              Completion Progress
            </h3>
            <div className="space-y-4">
              {/* Overall progress */}
              <div className="text-center">
                <div className={`text-4xl font-bold ${completionColor}`}>
                  {stats.completionRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  Overall completion
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
              </div>

              {/* Progress breakdown */}
              <div className="grid grid-cols-2 gap-4 text-center mt-4">
                <div>
                  <div className="text-lg font-semibold text-green-600">
                    {stats.completed}
                  </div>
                  <div className="text-xs text-gray-500">Completed</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-orange-600">
                    {stats.active}
                  </div>
                  <div className="text-xs text-gray-500">Remaining</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Tags */}
      {topTags.length > 0 && (
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Most Used Tags</h3>
          <div className="space-y-3">
            {topTags.map(([tag, count]) => (
              <ProgressBar
                key={tag}
                label={`#${tag}`}
                value={count}
                max={Math.max(...Object.values(tagStats))}
                color="bg-blue-500"
                showPercentage={false}
              />
            ))}
          </div>

          {Object.keys(tagStats).length > 5 && (
            <p className="text-xs text-gray-500 mt-3">
              And {Object.keys(tagStats).length - 5} more tags...
            </p>
          )}
        </div>
      )}

      {/* Productivity Insights */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          💡 Productivity Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Today's Activity</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• {stats.todayAdded} new todos added</li>
              <li>• {stats.completionRate.toFixed(1)}% completion rate</li>
              {stats.overdueCount > 0 && (
                <li className="text-red-600">
                  • {stats.overdueCount} overdue items
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">Recommendations</h4>
            <ul className="space-y-1 text-gray-600">
              {stats.completionRate < 50 && (
                <li>• Focus on completing existing todos</li>
              )}
              {priorityStats.high >
                priorityStats.medium + priorityStats.low && (
                <li>• Consider breaking down high-priority tasks</li>
              )}
              {stats.overdueCount > 0 && (
                <li>• Review and update overdue todos</li>
              )}
              {stats.active === 0 && stats.completed > 0 && (
                <li>🎉 Great job! All todos completed!</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
