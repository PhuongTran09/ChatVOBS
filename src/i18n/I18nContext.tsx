import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getTranslation, translate } from './translations'
import type { Locale, TranslationKey } from './types'
import { formatCompactCount, formatDayFirstDate, formatWeekdayShort } from '../utils/format'

const STORAGE_KEY = 'chatvobs-locale'

type Formatters = {
  compact: (value: number) => string
  date: (value: Date | string, separator?: string) => string
  weekday: (value: Date) => string
}

type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
  tDynamic: (key: string, params?: Record<string, string | number>) => string
  fmt: Formatters
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

function detectLocale(override?: Locale): Locale {
  if (override) return override
  if (typeof window === 'undefined') return 'en'
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

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: ReactNode
  initialLocale?: Locale
}) {
  const [locale, setLocale] = useState<Locale>(() => detectLocale(initialLocale))

  useEffect(() => {
    if (typeof window === 'undefined') return
    document.documentElement.lang = locale
    // An overlay URL is authored by the streamer; it must not overwrite the
    // language the site visitor picked in their own language switcher.
    if (!initialLocale) {
      window.localStorage.setItem(STORAGE_KEY, locale)
    }
  }, [locale, initialLocale])

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      toggleLocale: () => setLocale((current) => (current === 'en' ? 'vi' : 'en')),
      t: (key, params) => formatMessage(getTranslation(locale, key), params),
      tDynamic: (key, params) => formatMessage(translate(locale, key), params),
      fmt: {
        compact: (count) => formatCompactCount(count, locale),
        date: (date, separator) => formatDayFirstDate(date, locale, separator),
        weekday: (date) => formatWeekdayShort(date, locale),
      },
    }),
    [locale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export { I18nContext }
