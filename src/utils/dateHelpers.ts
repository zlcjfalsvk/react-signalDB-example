export function formatDate(date: Date | undefined): string {
  if (!date) return '';
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

export function parseDate(dateString: string): Date | undefined {
  if (!dateString) return undefined;
  
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? undefined : date;
}

export function isOverdue(dueDate: Date | undefined): boolean {
  if (!dueDate) return false;
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  return due < now;
}

export function isToday(date: Date): boolean {
  const today = new Date();
  const compareDate = new Date(date);
  
  return (
    compareDate.getFullYear() === today.getFullYear() &&
    compareDate.getMonth() === today.getMonth() &&
    compareDate.getDate() === today.getDate()
  );
}

export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Tomorrow';
  if (diffInDays === -1) return 'Yesterday';
  if (diffInDays > 0 && diffInDays <= 7) return `In ${diffInDays} days`;
  if (diffInDays < 0 && diffInDays >= -7) return `${Math.abs(diffInDays)} days ago`;
  
  return formatDate(date);
}