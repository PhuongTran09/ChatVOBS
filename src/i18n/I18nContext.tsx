import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getTranslation } from './translations'
import type { Locale, TranslationKey } from './types'

const STORAGE_KEY = 'chatvobs-locale'

type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

function detectLocale(): Locale {
  const savedLocale = window.localStorage.getItem(STORAGE_KEY)
  if (savedLocale === 'en' || savedLocale === 'vi') {
    return savedLocale
  }

  return window.navigator.language.toLowerCase().startsWith('vi') ? 'vi' : 'en'
}

function formatMessage(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) {
    return template
  }

  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key]
    return value === undefined ? `{${key}}` : String(value)
  })
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(detectLocale)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale)
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      toggleLocale: () => setLocale((current) => (current === 'en' ? 'vi' : 'en')),
      t: (key, params) => formatMessage(getTranslation(locale, key), params),
    }),
    [locale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export { I18nContext }
