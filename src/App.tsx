import './App.css'
import { useState, useEffect } from 'react'
import { StreamerProfilePage } from './pages/HomePage'
import { ChatCustomizerPage } from './pages/ChatCustomizerPage'
import { QROverlayPage } from './pages/QROverlayPage'
import { ClockOverlayPage } from './pages/ClockOverlayPage'
import { LoadingOverlayPage } from './pages/LoadingOverlayPage'
import { SubOverlayPage } from './pages/SubOverlayPage'
import { TransitionOverlayPage } from './pages/TransitionOverlayPage'
import { EndStreamOverlayPage } from './pages/EndStreamOverlayPage'

function App() {
  const [screen, setScreen] = useState<'home' | 'chat'>('home')
  const [overlayType, setOverlayType] = useState<'qr' | 'clock' | 'loading' | 'sub' | 'transition' | 'end' | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const overlay = params.get('overlay');
    if (overlay === 'qr') {
      setOverlayType('qr');
    } else if (overlay === 'clock') {
      setOverlayType('clock');
    } else if (overlay === 'loading') {
      setOverlayType('loading');
    } else if (overlay === 'sub') {
      setOverlayType('sub');
    } else if (overlay === 'transition') {
      setOverlayType('transition');
    } else if (overlay === 'end') {
      setOverlayType('end');
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (overlayType === 'qr') {
    return <QROverlayPage />;
  }

  if (overlayType === 'clock') {
    return <ClockOverlayPage />;
  }

  if (overlayType === 'loading') {
    return <LoadingOverlayPage />;
  }

  if (overlayType === 'sub') {
    return <SubOverlayPage />;
  }

  if (overlayType === 'transition') {
    return <TransitionOverlayPage />;
  }

  if (overlayType === 'end') {
    return <EndStreamOverlayPage />;
  }


  return (
    <>
      {screen === 'chat' ? (
        <ChatCustomizerPage onBackHome={() => setScreen('home')} />
      ) : (
        <StreamerProfilePage onOpenChat={() => setScreen('chat')} />
      )}
    </>
  )
}

export default App