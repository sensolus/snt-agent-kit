/**
 * @sensolus/snt-agent-kit — public API.
 * Widget code is merged from @sensolus/snt-ui v0.2.x (snt-ui was the upstream
 * source; once snt-ui is retired this package is the master copy).
 *
 * Usage in an app:
 *   import '@sensolus/snt-agent-kit/theme.css'
 *   import { SntUiProvider, LocaleProvider, SntButton, useLocale } from '@sensolus/snt-agent-kit'
 *
 * Wrap your app in <SntUiProvider api={...} navigate={...}> to inject the
 * backend adapter (defaults to same-origin /api/*) and router navigation.
 */
import './styles/snt-theme.css'

// Adapter context (backend + navigation injection)
export { SntUiProvider, useSntUi } from './SntUiProvider'

// Widgets + colors
export * from './widgets/index.js'

// i18n framework (LocaleProvider, useLocale, formatters)
export * from './i18n/index.js'
