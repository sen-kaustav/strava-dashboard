import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/outfit/400.css';
import '@fontsource/outfit/600.css';
import '@fontsource/outfit/700.css';
import './styles/app.css';
import App from './App.jsx';

// iOS Safari ignores user-scalable=no; block its pinch gesture explicitly.
document.addEventListener('gesturestart', (e) => e.preventDefault());

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
