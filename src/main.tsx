import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './lib/auth'
import { I18nProvider } from './lib/i18n'
import { CandidatesProvider } from './lib/candidates'
import 'flag-icons/css/flag-icons.min.css'
import './index.css'

// StrictMode is intentionally omitted: react-leaflet v4 re-initialises its
// map container on the double-mount StrictMode performs in dev, which throws
// "Map container is already initialized". Re-enable once migrated to v5.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <I18nProvider>
      <AuthProvider>
        <CandidatesProvider>
          <App />
        </CandidatesProvider>
      </AuthProvider>
    </I18nProvider>
  </BrowserRouter>,
)
