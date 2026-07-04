import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { SntUiProvider } from '@sensolus/snt-agent-kit'
import { LocaleProvider, messages } from './i18n'
import { AppConfigProvider } from './AppConfigContext'
import { Home } from './pages/Home'
import { OrganisationDetail } from './pages/OrganisationDetail'

// SntUiProvider decouples kit widgets from the router and backend:
// pass `navigate` (and optionally `api`) so widgets like SntPageHeader work.
// LocaleProvider sits inside it so it fetches login info via the api adapter.
function AppShell() {
  const navigate = useNavigate()
  return (
    <SntUiProvider navigate={navigate}>
      <LocaleProvider messages={messages}>
        <AppConfigProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/organisation/:id" element={<OrganisationDetail />} />
          </Routes>
        </AppConfigProvider>
      </LocaleProvider>
    </SntUiProvider>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App
