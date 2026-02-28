// import React from 'react';
// import { createRoot } from 'react-dom/client';
// import App from './App';

// const container = document.getElementById('root');
// if (!container) {
//   // Create a root element if it doesn't exist (helps in some dev setups)
//   const rootEl = document.createElement('div');
//   rootEl.id = 'root';
//   document.body.appendChild(rootEl);
// }

// const root = createRoot(document.getElementById('root'));
// root.render(<App />);
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/midnight-grain.css';

const container = document.getElementById('root') || (() => {
  const rootEl = document.createElement('div');
  rootEl.id = 'root';
  document.body.appendChild(rootEl);
  return rootEl;
})();

createRoot(container).render(<App />);
