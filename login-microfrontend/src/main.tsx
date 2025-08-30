import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initializeMicrofrontend, createMicrofrontendAPI } from './utils'
import './index.css'
import App from './App.tsx'

// Initialize microfrontend API and expose it globally
initializeMicrofrontend();

// Render the app to the #root element if it exists
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

// Export the microfrontend API for direct imports
export { createMicrofrontendAPI }
