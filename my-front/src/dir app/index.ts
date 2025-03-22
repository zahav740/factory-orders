import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../../../frontend_new2/App';

console.log('Starting React app...');
const container = document.getElementById('root');
if (!container) {
  console.error('Container #root not found!');
} else {
  console.log('Container found, rendering...');
  const root = createRoot(container);
  root.render(
    React.createElement(App)
  );
  console.log('Render complete');
}