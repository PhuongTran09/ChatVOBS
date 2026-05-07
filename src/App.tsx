import './App.css'
import { useState } from 'react'
import { StreamerProfilePage } from './pages/HomePage'
import { ChatCustomizerPage } from './pages/ChatCustomizerPage'

function App() {
  const [screen, setScreen] = useState<'home' |'chat'>('home')
  if (screen === 'chat') {
    return <ChatCustomizerPage onBackHome={() => setScreen('home')} />
  }

  return <StreamerProfilePage  onOpenChat={() => setScreen('chat')} />
}

export default App
