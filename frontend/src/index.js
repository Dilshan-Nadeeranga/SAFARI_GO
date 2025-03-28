// frontend/src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import App from './App';
import "./index.css";

// Get the root DOM element
const container = document.getElementById('root');

// Create root and render App
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <PayPalScriptProvider options={{ "client-id": "your-paypal-client-id", currency: "USD" }}>
      <App />
    </PayPalScriptProvider>
  </React.StrictMode>
);