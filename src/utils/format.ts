import type { Locale } from '../i18n/types'

const DATE_PARTS = { day: '2-digit', month: '2-digit', year: 'numeric' } as const
const WEEKDAY_PARTS = { weekday: 'short' } as const

const MAX_FRACTION_DIGITS = 2
const MAGNITUDE_SUFFIXES = ['', 'K', 'M', 'B', 'T'] as const

const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>()
const numberFormatters = new Map<Locale, Intl.NumberFormat>()

function getDateTimeFormat(locale: Locale, key: string, options: Intl.DateTimeFormatOptions) {
  const cacheKey = `${locale}|${key}`
  let formatter = dateTimeFormatters.get(cacheKey)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options)
    dateTimeFormatters.set(cacheKey, formatter)
  }
  return formatter
}

function getCompactNumberFormat(locale: Locale) {
  let formatter = numberFormatters.get(locale)
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: MAX_FRACTION_DIGITS })
    numberFormatters.set(locale, formatter)
  }
  return formatter
}

function roundTo(value: number, digits: number) {
  return Number(value.toFixed(digits))
}

/**
 * `12530` -> `12.53K` (en) / `12,53K` (vi).
 *
 * Deliberately not `Intl.NumberFormat(locale, { notation: 'compact' })`: CLDR
 * Vietnamese abbreviates thousands as "N" (nghìn), so a streamer audience would
 * see `12,5N`. The K/M/B letters are broadcast convention and stay fixed here —
 * only the decimal separator follows the locale.
 */
export function formatCompactCount(value: number, locale: Locale): string {
  const safe = Number.isFinite(value) ? value : 0
  const absolute = Math.abs(safe)

  let tier = 0
  while (tier < MAGNITUDE_SUFFIXES.length - 1 && absolute >= 1000 ** (tier + 1)) tier += 1

  let scaled = roundTo(safe / 1000 ** tier, MAX_FRACTION_DIGITS)
  const highestTier = MAGNITUDE_SUFFIXES.length - 1
  if (Math.abs(scaled) >= 1000 && tier < highestTier) {
    tier += 1
    scaled = roundTo(safe / 1000 ** tier, MAX_FRACTION_DIGITS)
  }

  return `${getCompactNumberFormat(locale).format(scaled)}${MAGNITUDE_SUFFIXES[tier]}`
}

/** Day-first `dd<sep>mm<sep>yyyy`, the shape every overlay in this app already uses. */
export function formatDayFirstDate(date: Date | string, locale: Locale, separator = '.'): string {
  const parsed = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(parsed.getTime())) return typeof date === 'string' ? date : ''

  const parts = getDateTimeFormat(locale, 'date', DATE_PARTS).formatToParts(parsed)
  const find = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''

  return [find('day'), find('month'), find('year')].join(separator)
}

/** `Sun` (en) / `CN` (vi), upper-cased for the overlay's label styling. */
export function formatWeekdayShort(date: Date, locale: Locale): string {
  const weekday = getDateTimeFormat(locale, 'weekday', WEEKDAY_PARTS).format(date)
  return weekday.toLocaleUpperCase(locale)
}

/** Derived from the viewer's machine, so the clock overlay never claims a wrong offset. */
export function formatUtcOffset(reference: Date): string {
  const totalMinutes = -reference.getTimezoneOffset()
  const absolute = Math.abs(totalMinutes)
  const hours = Math.floor(absolute / 60)
  const minutes = absolute % 60
  const sign = totalMinutes < 0 ? '-' : '+'
  return `UTC${sign}${hours}${minutes === 0 ? '' : `:${String(minutes).padStart(2, '0')}`}`
}
