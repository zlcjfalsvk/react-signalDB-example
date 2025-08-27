import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
  // Clear localStorage
  localStorage.clear();
  // Clear sessionStorage
  sessionStorage.clear();
});
