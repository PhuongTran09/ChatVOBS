import { createContext, useMemo, type ReactNode } from 'react'
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
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, 'en')
    document.documentElement.lang = 'en'
  }

  const value = useMemo<I18nContextValue>(
    () => ({
      locale: 'en',
      setLocale: () => {},
      toggleLocale: () => {},
      t: (key, params) => formatMessage(getTranslation('en', key), params),
    }),
    [],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export { I18nContext }
