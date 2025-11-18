import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './Login.css'
import App from './Login.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
