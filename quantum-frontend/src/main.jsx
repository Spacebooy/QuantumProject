import { LanguageProvider } from './i18n/language.js';
import './i18n/language.css';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './workbench.css'
import './theme.css'
import './auth.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider><App /></LanguageProvider>
  </StrictMode>,
)
