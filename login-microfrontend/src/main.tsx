import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initializeMicrofrontend } from './utils'
import './index.css'
import App from './App.tsx'

// Initialize microfrontend API
initializeMicrofrontend();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
