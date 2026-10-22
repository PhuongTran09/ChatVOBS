import type { TranslateFn, TranslationKey } from '../i18n/types'

/**
 * The developer half of the home page. Everything here is a fact taken from the
 * repositories themselves: no proficiency percentages, no invented counts, because
 * a self-rated "90% Java" bar would be the same kind of fabrication as the fake
 * subscriber numbers the overlays just stopped showing.
 */

export const DEV_NAME = 'PHUONG TRAN'
/** Monogram shown when the avatar cannot load (offline OBS scene, blocked CDN). */
export const DEV_AVATAR = 'PT'
/**
 * GitHub's CDN for the account's own picture — a plain image request, no API key and
 * no rate limit. The numeric user id survives a username change; `?s=160` asks for
 * 160px into a 60px frame so it stays sharp on retina.
 */
export const DEV_AVATAR_URL = 'https://avatars.githubusercontent.com/u/181824252?s=160&v=4'

/** Plain names now that the chips carry brand marks: the '#' was hashtag styling. */
export const DEV_SIGNATURE_TAGS = ['Java', 'Python', 'TypeScript', 'React', 'Angular', 'PostgreSQL']

export const DEV_CONTACTS = {
  github: 'https://github.com/PhuongTran09',
}

export type DevProject = {
  id: 'oneforall' | 'storeya' | 'chatvobs' | 'adminvos'
  /** Proper nouns stay here instead of the locale files. */
  name: string
  /** The one-line "what is this" that sits under the name. */
  shortKey: TranslationKey
  /** `public` was checked against the GitHub API: a private remote 404s for a visitor. */
  repos: readonly { label: string; url: string; public: boolean }[]
  /** Only a URL that answers 200 today; a demo link that 404s is worse than none. */
  demo?: string
  stack: readonly string[]
  roleKey: TranslationKey
  summaryKey: TranslationKey
}

export const DEV_PROJECTS: readonly DevProject[] = [
  {
    id: 'oneforall',
    name: 'ONE FORALL',
    shortKey: 'dev.project.oneforall.short',
    repos: [
      { label: 'API', url: 'https://github.com/PhuongTran09/OneForAll', public: false },
    ],
    demo: 'https://oneforall.io.vn',
    stack: ['FastAPI', 'Pydantic v2', 'Celery', 'Redis', 'Supabase', 'FFmpeg', 'yt-dlp', 'BiRefNet', 'React 19', 'Vite'],
    roleKey: 'dev.project.oneforall.role',
    summaryKey: 'dev.project.oneforall.summary',
  },
  {
    id: 'storeya',
    name: 'STOREYA',
    shortKey: 'dev.project.storeya.short',
    repos: [{ label: 'MONOREPO', url: 'https://github.com/PhuongTran09/storeYa_s4', public: true }],
    stack: ['Java 17', 'Spring Boot 3.5', 'Spring Security', 'Keycloak', 'PostgreSQL', 'Redis', 'Angular 17', 'VNPay'],
    roleKey: 'dev.project.storeya.role',
    summaryKey: 'dev.project.storeya.summary',
  },
  {
    id: 'chatvobs',
    name: 'CHATVOBS',
    shortKey: 'dev.project.chatvobs.short',
    repos: [{ label: 'APP', url: 'https://github.com/PhuongTran09/ChatVOBS', public: true }],
    stack: ['React 19', 'TypeScript', 'Vite', 'Firebase', 'YouTube Data API', 'Cloudflare'],
    roleKey: 'dev.project.chatvobs.role',
    summaryKey: 'dev.project.chatvobs.summary',
  },
  {
    id: 'adminvos',
    name: 'ADMINVOS',
    shortKey: 'dev.project.adminvos.short',
    repos: [{ label: 'CONSOLE', url: 'https://github.com/PhuongTran09/AdminVos', public: false }],
    stack: ['React 19', 'TypeScript', 'Supabase', 'Firebase', 'i18next'],
    roleKey: 'dev.project.adminvos.role',
    summaryKey: 'dev.project.adminvos.summary',
  },
]

export type DevGroup = { titleKey: TranslationKey; tags: readonly string[] }

export const DEV_SKILL_GROUPS: readonly DevGroup[] = [
  {
    titleKey: 'dev.skills.backend',
    tags: ['Java 17', 'Spring Boot 3.5', 'Spring Data JPA', 'Spring Security', 'Python 3.12', 'FastAPI', 'Pydantic v2', 'REST API'],
  },
  {
    titleKey: 'dev.skills.frontend',
    tags: ['TypeScript', 'React 19', 'Angular 17', 'Vite', 'Tailwind', 'SCSS', 'useSyncExternalStore', 'RxJS'],
  },
  {
    titleKey: 'dev.skills.dataAuth',
    tags: ['PostgreSQL', 'Redis', 'Supabase', 'Firebase Firestore', 'Keycloak', 'OAuth2 / JWT', 'Cloudinary'],
  },
  {
    titleKey: 'dev.skills.asyncMedia',
    tags: ['Celery + beat', 'Server-Sent Events', 'FFmpeg', 'yt-dlp', 'Pillow', 'BiRefNet', 'vtracer'],
  },
]

export const DEV_TOOL_GROUPS: readonly DevGroup[] = [
  {
    titleKey: 'dev.tools.deploy',
    tags: ['Docker Compose', 'cloudflared', 'Cloudflare Workers', 'wrangler', 'Vercel'],
  },
  {
    titleKey: 'dev.tools.secrets',
    tags: ['Spring Security', 'JWT', 'OAuth2', 'Keycloak', 'Supabase Auth'],
  },
  {
    titleKey: 'dev.tools.ai',
    tags: ['Codex', 'Claude', 'Qwen', 'Angivity'],
  },
]

/** Derived, so a number on screen can never drift from the list it comes from. */
export const DEV_METRICS = {
  projects: DEV_PROJECTS.length,
  skillAreas: DEV_SKILL_GROUPS.length,
  publicRepos: DEV_PROJECTS.reduce(
    (total, project) => total + project.repos.filter((repo) => repo.public).length,
    0,
  ),
}

export type ResolvedProject = Omit<DevProject, 'shortKey' | 'roleKey' | 'summaryKey'> & {
  short: string
  role: string
  summary: string
}

export const getDeveloperProjects = (t: TranslateFn): readonly ResolvedProject[] =>
  DEV_PROJECTS.map((project) => ({
    ...project,
    short: t(project.shortKey),
    role: t(project.roleKey),
    summary: t(project.summaryKey),
  }))
