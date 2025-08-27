import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
// import App from './App.tsx'
// import TestApp from './TestApp.tsx'
// import SimpleApp from './SimpleApp.tsx'
// import BasicApp from './BasicApp.tsx'
// import VerySimpleApp from './VerySimpleApp.tsx'
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
