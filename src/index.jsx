import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css'; // We'll use our own global CSS
import App from './App.jsx'; // We will use the App.jsx file

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
