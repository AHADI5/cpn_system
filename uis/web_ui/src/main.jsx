// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppTheme from './theme/AppTheme.jsx';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppTheme>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppTheme>
  </React.StrictMode>
);