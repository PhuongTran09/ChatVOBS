import type { en } from './locales/en'

export type Locale = 'en' | 'vi'

/**
 * `en` is the source of truth: adding a key there extends this union
 * automatically. `vi` is checked against it by `satisfies RecordTranslations`,
 * so en/vi parity is enforced by the compiler instead of by hand-maintaining a
 * list of key names.
 */
export type TranslationKey = keyof typeof en

export type RecordTranslations = Record<TranslationKey, string>

/** Lets a data module build translated copy without importing React. */
export type TranslateFn = (key: TranslationKey, params?: Record<string, string | number>) => string
