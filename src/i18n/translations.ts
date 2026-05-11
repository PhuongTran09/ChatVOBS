import type { Locale, TranslationKey } from './types'
import { en } from './locales/en'
import { vi } from './locales/vi'

export type RecordTranslations = Record<TranslationKey, string>

const translations: Record<Locale, RecordTranslations> = {
  en,
  vi,
}

export function getTranslation(locale: Locale, key: TranslationKey): string {
  return translations[locale][key]
}
