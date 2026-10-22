import './App.css'
import './styles/overlay.css'
import { lazy, Suspense, useState } from 'react'
import type { ComponentType } from 'react'
import { LanguageSwitchFixed } from './components/LanguageSwitchFixed'
import { MiniMusicController } from './components/MiniMusicController'
import { getOverlayParams } from './constants/overlay'

// An OBS browser source and the chat customizer are separate products that used to ship
// inside the home page's chunk: one file every surface had to download and parse. The home
// page is split too, otherwise the entry chunk would still carry its hero, terminals,
// gallery, Firestore client and icon pack into the clock overlay, which needs none of them.
// App.css keeps `body` black, so the gap between entry and chunk paints dark, not white.
const StreamerProfilePage = lazy(() =>
  import('./pages/StreamerProfilePage').then((m) => ({ default: m.StreamerProfilePage }))
)
const ChatCustomizerPage = lazy(() =>
  import('./pages/ChatCustomizerPage').then((m) => ({ default: m.ChatCustomizerPage }))
)
const QROverlayPage = lazy(() =>
  import('./pages/QROverlayPage').then((m) => ({ default: m.QROverlayPage }))
)
const ClockOverlayPage = lazy(() =>
  import('./pages/ClockOverlayPage').then((m) => ({ default: m.ClockOverlayPage }))
)
const SubOverlayPage = lazy(() =>
  import('./pages/SubOverlayPage').then((m) => ({ default: m.SubOverlayPage }))
)
const TransitionOverlayPage = lazy(() =>
  import('./pages/TransitionOverlayPage').then((m) => ({ default: m.TransitionOverlayPage }))
)
const SocialOverlayPage = lazy(() =>
  import('./pages/SocialOverlayPage').then((m) => ({ default: m.SocialOverlayPage }))
)
const CombinedOverlayPage = lazy(() =>
  import('./pages/CombinedOverlayPage').then((m) => ({ default: m.CombinedOverlayPage }))
)

const OVERLAY_PAGES: Record<string, ComponentType> = {
  qr: QROverlayPage,
  clock: ClockOverlayPage,
  sub: SubOverlayPage,
  transition: TransitionOverlayPage,
  social: SocialOverlayPage,
  combined: CombinedOverlayPage,
  all: CombinedOverlayPage,
}

/**
 * Resolved while the state is initialised rather than in an effect: as a `useEffect` this
 * chose the route *after* the home page had already rendered, so every browser source
 * booted the full profile page — subscriptions, boot overlay and all — before swapping.
 */
function readOverlayPage(): ComponentType | null {
  const overlay = getOverlayParams().get('overlay')
  return overlay ? OVERLAY_PAGES[overlay] ?? null : null
}

function App() {
  const [screen, setScreen] = useState<'home' | 'chat'>('home')
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [OverlayPage] = useState(readOverlayPage)

  // Transparent fallback: a source that has not arrived yet should show nothing, not a frame.
  if (OverlayPage) {
    return (
      <Suspense fallback={null}>
        <OverlayPage />
      </Suspense>
    )
  }

  return (
    <>
      <LanguageSwitchFixed />
      {screen === 'chat' ? (
        <Suspense fallback={null}>
          <ChatCustomizerPage onBackHome={() => setScreen('home')} />
        </Suspense>
      ) : (
        <Suspense fallback={null}>
          <StreamerProfilePage
            onOpenChat={() => setScreen('chat')}
            isInitialLoading={isInitialLoading}
            setIsInitialLoading={setIsInitialLoading}
          />
        </Suspense>
      )}
      <MiniMusicController />
    </>
  )
}

export default App
