//frontend/src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import App from './App';
import ReactDOM from "react-dom";
import "./index.css";

ReactDOM.render(<App />, document.getElementById("root"));

const root = createRoot(document.getElementById('root'));
//in the public/index.html mentioned root is the above root
root.render(
  <React.StrictMode>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>

    <App />
  </React.StrictMode>
);
  //paypal
/*ReactDOM.render(
  <PayPalScriptProvider options={{ "client-id": "your-paypal-client-id", currency: "USD" }}>
    <App />
  </PayPalScriptProvider>,
  document.getElementById('root')
);*/

