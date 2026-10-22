import type { Locale } from '../i18n/types'

export type OverlayTheme = 'cyan' | 'magenta' | 'amber'

export const OVERLAY_ACCENT_COLORS: Record<OverlayTheme, string> = {
  cyan: '#00f0ff',
  magenta: '#ff0055',
  amber: '#ffaa00',
}

/** `?theme=` was unpacked with the same if-chain in four overlay pages. */
export function readOverlayTheme(raw: string | null | undefined): OverlayTheme {
  return raw === 'magenta' || raw === 'amber' ? raw : 'cyan'
}

/** Only the transition card animates a gradient, so it owns a wider theme set. */
export type TransitionTheme = OverlayTheme | 'rainbow'

export const TRANSITION_ACCENT_COLORS: Record<TransitionTheme, string> = {
  cyan: '#00f0ff',
  magenta: '#ff0055',
  amber: '#ffaa00',
  rainbow: '#00f0ff',
}

export const TRANSITION_ACCENT_GRADIENTS: Record<TransitionTheme, string> = {
  cyan: '#00f0ff',
  magenta: '#ff0055',
  amber: '#ffaa00',
  rainbow: 'linear-gradient(90deg, #00f0ff, #ff0055)',
}

export function readTransitionTheme(raw: string | null | undefined): TransitionTheme {
  return raw === 'rainbow' ? 'rainbow' : readOverlayTheme(raw)
}

/** Overlay routes read their config from the query string; each page rebuilt the parser. */
export function getOverlayParams(): URLSearchParams {
  return new URLSearchParams(window.location.search)
}

export function readOverlayLocale(raw: string | null): Locale | null {
  const normalized = raw?.toLowerCase()
  return normalized === 'en' || normalized === 'vi' ? normalized : null
}

/**
 * OBS browser sources are a separate browser profile whose `navigator.language` is not
 * the streamer's, so `?lang=` is how an overlay URL pins its language.
 *
 * Overlay copy shipped in Vietnamese, and an overlay URL already saved in a scene
 * collection has no `?lang=` — defaulting those to the browser locale would silently
 * flip a live stream's text to English, so an unmarked overlay stays Vietnamese.
 */
export function getOverlayLocale(): Locale | null {
  const params = getOverlayParams();
  if (!params.has('overlay')) return null;
  return readOverlayLocale(params.get('lang')) ?? 'vi';
}
