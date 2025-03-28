// frontend/src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import "./index.css";

// Get the root DOM element
const container = document.getElementById('root');

// Create root and render App
const root = createRoot(container);

root.render(
  <React.StrictMode>
    
      <App />
    
  </React.StrictMode>
);