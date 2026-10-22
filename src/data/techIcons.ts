import {
  siAngular,
  siCelery,
  siClaude,
  siCloudflare,
  siCloudflareworkers,
  siCloudinary,
  siDocker,
  siFastapi,
  siFirebase,
  siFfmpeg,
  siI18next,
  siKeycloak,
  siOpenjdk,
  siPostgresql,
  siPython,
  siPydantic,
  siQwen,
  siReact,
  siRedis,
  siSass,
  siSpring,
  siSpringboot,
  siSpringsecurity,
  siSupabase,
  siTailwindcss,
  siTypescript,
  siVercel,
  siVite,
  siYoutube,
} from 'simple-icons'
import type { SimpleIcon } from 'simple-icons'
export const FALLBACK_ICON = { path: 'M12 2 22 12 12 22 2 12z', hex: '' }

const BRAND: Record<string, SimpleIcon> = {
  'Angular 17': siAngular,
  Angular: siAngular,
  'Celery + beat': siCelery,
  Celery: siCelery,
  Claude: siClaude,
  'Cloudflare Workers': siCloudflareworkers,
  Cloudflare: siCloudflare,
  Cloudinary: siCloudinary,
  'Docker Compose': siDocker,
  FastAPI: siFastapi,
  'Firebase Firestore': siFirebase,
  Firebase: siFirebase,
  FFmpeg: siFfmpeg,
  i18next: siI18next,
  'Java 17': siOpenjdk,
  Java: siOpenjdk,
  Keycloak: siKeycloak,
  PostgreSQL: siPostgresql,
  'Python 3.12': siPython,
  Python: siPython,
  'Pydantic v2': siPydantic,
  Qwen: siQwen,
  'React 19': siReact,
  React: siReact,
  Redis: siRedis,
  SCSS: siSass,
  'Spring Boot 3.5': siSpringboot,
  'Spring Data JPA': siSpring,
  'Spring Security': siSpringsecurity,
  'Supabase Auth': siSupabase,
  Supabase: siSupabase,
  Tailwind: siTailwindcss,
  TypeScript: siTypescript,
  useSyncExternalStore: siReact,
  'YouTube Data API': siYoutube,
  cloudflared: siCloudflare,
  Vercel: siVercel,
  Vite: siVite,
  wrangler: siCloudflare,
}

export type TechIcon = { path: string; hex: string }

/**
 * A few marks are near-black by brand (OpenJDK, Vercel, Angular, GitHub) and would be
 * invisible here, so those chips keep the cyan glow instead of their own colour.
 */
function readableHex(hex: string): string {
  const value = Number.parseInt(hex, 16)
  const luminance =
    (0.2126 * ((value >> 16) & 255) + 0.7152 * ((value >> 8) & 255) + 0.0722 * (value & 255)) / 255
  return luminance < 0.25 ? '' : `#${hex}`
}

export function getTechIcon(tag: string): TechIcon {
  const icon = BRAND[tag]
  if (!icon) return FALLBACK_ICON
  return { path: icon.path, hex: readableHex(icon.hex) }
}
