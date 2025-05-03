//frontend/src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import "./index.css";

// Create root
const root = createRoot(document.getElementById('root'));

// Render without PayPalScriptProvider
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

