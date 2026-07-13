import './App.css'
import { useState, useEffect } from 'react'
import { StreamerProfilePage } from './pages/HomePage'
import { ChatCustomizerPage } from './pages/ChatCustomizerPage'
import { QROverlayPage } from './pages/QROverlayPage'
import { ClockOverlayPage } from './pages/ClockOverlayPage'
import { SubOverlayPage } from './pages/SubOverlayPage'
import { TransitionOverlayPage } from './pages/TransitionOverlayPage'
import { SocialOverlayPage } from './pages/SocialOverlayPage'
import { CombinedOverlayPage } from './pages/CombinedOverlayPage'
import { LanguageSwitchFixed } from './components/LanguageSwitchFixed'
import { MiniMusicController } from './components/MiniMusicController'

function App() {
  const [screen, setScreen] = useState<'home' | 'chat'>('home')
  const [overlayType, setOverlayType] = useState<'qr' | 'clock' | 'sub' | 'transition' | 'social' | 'combined' | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const overlay = params.get('overlay');
    if (overlay === 'qr') {
      setOverlayType('qr');
    } else if (overlay === 'clock') {
      setOverlayType('clock');
    } else if (overlay === 'sub') {
      setOverlayType('sub');
    } else if (overlay === 'transition') {
      setOverlayType('transition');
    } else if (overlay === 'social') {
      setOverlayType('social');
    } else if (overlay === 'combined' || overlay === 'all') {
      setOverlayType('combined');
    }
  }, []);



  if (overlayType === 'qr') {
    return <QROverlayPage />;
  }

  if (overlayType === 'clock') {
    return <ClockOverlayPage />;
  }

  if (overlayType === 'sub') {
    return <SubOverlayPage />;
  }

  if (overlayType === 'transition') {
    return <TransitionOverlayPage />;
  }

  if (overlayType === 'social') {
    return <SocialOverlayPage />;
  }

  if (overlayType === 'combined') {
    return <CombinedOverlayPage />;
  }


  return (
    <>
      <LanguageSwitchFixed />
      {screen === 'chat' ? (
        <ChatCustomizerPage onBackHome={() => setScreen('home')} />
      ) : (
        <StreamerProfilePage onOpenChat={() => setScreen('chat')} />
      )}
      <MiniMusicController />
    </>
  )
}

export default App