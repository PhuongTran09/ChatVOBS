import './App.css'
import { useState, useEffect } from 'react'
import { StreamerProfilePage } from './pages/HomePage'
import { ChatCustomizerPage } from './pages/ChatCustomizerPage'
import { QROverlayPage } from './pages/QROverlayPage'
import { LanguageSwitchFixed } from './components/LanguageSwitchFixed'

function App() {
  const [screen, setScreen] = useState<'home' | 'chat'>('home')
  const [isOverlay, setIsOverlay] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('overlay') === 'qr') {
      setIsOverlay(true);
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

  if (isOverlay) {
    return <QROverlayPage />;
  }

  return (
    <>
      <LanguageSwitchFixed />
      {screen === 'chat' ? (
        <ChatCustomizerPage onBackHome={() => setScreen('home')} />
      ) : (
        <StreamerProfilePage onOpenChat={() => setScreen('chat')} />
      )}
    </>
  )
}

export default App

