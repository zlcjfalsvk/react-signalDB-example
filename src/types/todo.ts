export type Priority = 'low' | 'medium' | 'high';
export type FilterStatus = 'all' | 'active' | 'completed';
export type SortBy = 'date' | 'priority' | 'title';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  tags: string[];
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FilterOptions {
  status?: FilterStatus;
  priority?: Priority;
  searchTerm?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface TodoStats {
  total: number;
  completed: number;
  active: number;
  completionRate: number;
  todayAdded: number;
  overdueCount: number;
}

export interface TodoFormData {
  title: string;
  description: string;
  priority: Priority;
  tags: string;
  dueDate: string;
}
