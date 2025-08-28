import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import WorkingTodoApp from './WorkingTodoApp.tsx';

console.log('Main.tsx is loading...');

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <WorkingTodoApp />
    </StrictMode>
  );
  console.log('React app rendered');
} else {
  console.error('Root element not found!');
}
