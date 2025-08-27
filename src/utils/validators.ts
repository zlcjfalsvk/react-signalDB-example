export function validateTitle(title: string): string | null {
  if (!title.trim()) {
    return 'Title is required';
  }
  
  if (title.trim().length < 2) {
    return 'Title must be at least 2 characters long';
  }
  
  if (title.length > 100) {
    return 'Title must be less than 100 characters';
  }
  
  return null;
}

export function validateDescription(description: string): string | null {
  if (description.length > 500) {
    return 'Description must be less than 500 characters';
  }
  
  return null;
}

export function validateTags(tags: string[]): string | null {
  if (tags.length > 10) {
    return 'Maximum 10 tags allowed';
  }
  
  for (const tag of tags) {
    if (tag.length > 20) {
      return 'Each tag must be less than 20 characters';
    }
    
    if (!/^[a-zA-Z0-9-_]+$/.test(tag)) {
      return 'Tags can only contain letters, numbers, hyphens, and underscores';
    }
  }
  
  return null;
}

export function parseTags(tagsString: string): string[] {
  if (!tagsString.trim()) {
    return [];
  }
  
  return tagsString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .filter((tag, index, self) => self.indexOf(tag) === index); // Remove duplicates
}

export function validateDueDate(dueDate: string): string | null {
  if (!dueDate) {
    return null; // Due date is optional
  }
  
  const date = new Date(dueDate);
  
  if (isNaN(date.getTime())) {
    return 'Invalid date format';
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const minDate = new Date(today);
  minDate.setFullYear(minDate.getFullYear() - 1);
  
  const maxDate = new Date(today);
  maxDate.setFullYear(maxDate.getFullYear() + 10);
  
  if (date < minDate) {
    return 'Date cannot be more than 1 year in the past';
  }
  
  if (date > maxDate) {
    return 'Date cannot be more than 10 years in the future';
  }
  
  return null;
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, ''); // Remove HTML tags
}