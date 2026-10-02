import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA Service Worker with aggressive update and cache cleanup
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // Automatically claim and reload with latest assets
    updateSW(true);
  },
  onRegisteredSW(_swUrl, registration) {
    if (registration) {
      // Force immediate check for updated worker
      registration.update();
    }
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
