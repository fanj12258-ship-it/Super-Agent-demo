import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../../workbench/css/overlay-scrollbar.css'
import '../../../workbench/js/overlay-scrollbar.js'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
