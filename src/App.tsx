import './App.css'
import { useState } from 'react'
import { StreamerProfilePage } from './pages/HomePage'
import { ChatCustomizerPage } from './pages/ChatCustomizerPage'
import { LanguageSwitchFixed } from './components/LanguageSwitchFixed'

function App() {
  const [screen, setScreen] = useState<'home' |'chat'>('home')
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
