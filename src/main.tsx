import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { I18nProvider } from './i18n'
import { getOverlayLocale } from './constants/overlay'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider initialLocale={getOverlayLocale() ?? undefined}>
      <App />
    </I18nProvider>
  </StrictMode>,
)
