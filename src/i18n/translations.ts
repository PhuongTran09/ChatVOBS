import type { Locale, RecordTranslations, TranslationKey } from './types'
import { en } from './locales/en'
import { vi } from './locales/vi'

const translations: Record<Locale, RecordTranslations> = {
  en,
  vi,
}

export function getTranslation(locale: Locale, key: TranslationKey): string {
  return translations[locale][key]
}

/**
 * Lookup for keys that are assembled at runtime (control field ids,
 * Firestore-authored schedule keys) and therefore can't be a `TranslationKey`.
 * Falls back to `en`, then to the key itself, so a missing translation shows up
 * as readable text instead of blank UI.
 */
const warnedKeys = new Set<string>()

export function translate(locale: Locale, key: string): string {
  const table = translations[locale] as Record<string, string | undefined>
  const value = table[key] ?? (locale === 'en' ? undefined : (translations.en as Record<string, string | undefined>)[key])
  if (value !== undefined) return value
  if (import.meta.env.DEV) {
    const miss = `${locale}:${key}`
    if (!warnedKeys.has(miss)) {
      warnedKeys.add(miss)
      console.warn(`[i18n] missing key "${key}" for locale "${locale}"`)
    }
  }
  return key
}
