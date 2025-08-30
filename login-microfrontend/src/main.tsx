import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createMicrofrontendAPI } from './utils'
import './index.css'
import App from './App.tsx'

// Create the API instance
const api = createMicrofrontendAPI();

// Expose the API globally for UMD usage
if (typeof window !== 'undefined') {
  window.LoginMicrofrontend = api;
}

// Render the app to the #root element if it exists
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

// Export the API for ES module usage
export default api;
