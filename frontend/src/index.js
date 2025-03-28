//frontend/src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import App from './App';
import "./index.css";

// Only use createRoot - Delete the ReactDOM.render call
const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// For PayPal integration when needed:
/*
root.render(
  <React.StrictMode>
    <PayPalScriptProvider options={{ "client-id": "your-paypal-client-id", currency: "USD" }}>
      <App />
    </PayPalScriptProvider>
  </React.StrictMode>
);
*/

