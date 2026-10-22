export type OverlayTheme = 'cyan' | 'magenta' | 'amber'

export const OVERLAY_ACCENT_COLORS: Record<OverlayTheme, string> = {
  cyan: '#00f0ff',
  magenta: '#ff0055',
  amber: '#ffaa00',
}

/** `?theme=` was unpacked with the same if-chain in four overlay pages. */
export function readOverlayTheme(raw: string | null): OverlayTheme {
  return raw === 'magenta' || raw === 'amber' ? raw : 'cyan'
}

/** Overlay routes read their config from the query string; each page rebuilt the parser. */
export function getOverlayParams(): URLSearchParams {
  return new URLSearchParams(window.location.search)
}
