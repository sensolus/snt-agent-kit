import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { useSntUi } from '../SntUiProvider'
import en from './translations/en'
import nl from './translations/nl'
import fr from './translations/fr'
import de from './translations/de'
import es from './translations/es'

const kitTranslations = { en, nl, fr, de, es }

/** Map Sensolus language codes to BCP 47 locale tags for Intl API */
const localeMap = {
  en: 'en-GB',
  nl: 'nl-BE',
  fr: 'fr-BE',
  de: 'de-DE',
  es: 'es-ES',
}

const defaultPrefs = {
  language: 'en',
  timezone: 'Europe/Brussels',
  firstDayOfWeek: 'MONDAY',
  unitDistance: 'KILOMETER',
  unitTemperature: 'CELSIUS',
}

const LocaleContext = createContext(null)

/**
 * @param {object} [props.messages] - App-supplied translation keys, merged on
 *   top of the kit's built-in keys per language (app keys win on collision):
 *   <LocaleProvider messages={{ en: { 'home.title': 'My app' }, nl: { ... } }}>
 */
export function LocaleProvider({ children, messages = {} }) {
  const { api } = useSntUi()
  const [prefs, setPrefs] = useState(defaultPrefs)
  const [loading, setLoading] = useState(true)

  const translations = useMemo(() => {
    const merged = {}
    for (const lang of Object.keys(kitTranslations)) {
      merged[lang] = { ...kitTranslations[lang], ...(messages[lang] || {}) }
    }
    // Languages the kit doesn't know but the app supplies
    for (const lang of Object.keys(messages)) {
      if (!merged[lang]) merged[lang] = { ...kitTranslations.en, ...messages[lang] }
    }
    return merged
  }, [messages])

  useEffect(() => {
    let cancelled = false
    api.fetchLoginInfo()
      .then(data => {
        if (cancelled || !data) return
        setPrefs({
          language: data.language || 'en',
          timezone: data.timezone || 'Europe/Brussels',
          firstDayOfWeek: data.firstDayOfWeek || 'MONDAY',
          unitDistance: data.unitDistance || 'KILOMETER',
          unitTemperature: data.unitTemperature || 'CELSIUS',
        })
      })
      .catch(() => { /* keep defaults */ })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [api])

  const language = prefs.language
  const intlLocale = localeMap[language] || 'en-GB'

  const t = useCallback((key, ...args) => {
    const entry = translations[language]?.[key] ?? translations.en[key]
    if (typeof entry === 'function') return entry(...args)
    if (entry !== undefined) return entry
    if (import.meta.env.DEV) console.warn(`Missing translation: ${key}`)
    return key
  }, [language, translations])

  const value = useMemo(() => ({
    language,
    intlLocale,
    timezone: prefs.timezone,
    firstDayOfWeek: prefs.firstDayOfWeek,
    unitDistance: prefs.unitDistance,
    unitTemperature: prefs.unitTemperature,
    t,
    loading,
  }), [language, intlLocale, prefs, t, loading])

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}
