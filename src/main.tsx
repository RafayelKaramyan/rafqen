import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import '@fontsource-variable/manrope';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import { App } from './app';
import { initializeStore } from './lib/store';
import './styles.css';

initializeStore();
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter useTransitions={false}>
      <App />
    </HashRouter>
  </StrictMode>,
);
