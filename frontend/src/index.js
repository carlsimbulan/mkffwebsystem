import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Siguraduhing tama ang folder name mo (bootstrap vs boostrap)
// Base sa iyong screenshots, ito ang tamang path:
import './bootstrap/css/bootstrap.min.css';
import './bootstrap/js/bootstrap.bundle.min.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();