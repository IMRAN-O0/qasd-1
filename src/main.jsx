import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { registerPWA } from './services/pwaService.js';

// Register PWA only in production
if (import.meta.env.PROD) {
  registerPWA();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
