import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import WorkingTodoApp from './WorkingTodoApp.tsx';

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <WorkingTodoApp />
    </StrictMode>
  );
}
