import './App.css'
import { useState } from 'react'
import { HomePage } from './pages/HomePage'
import { ChatCustomizerPage } from './pages/ChatCustomizerPage'

function App() {
  const [screen, setScreen] = useState<'home' |'chat'>('home')
  if (screen === 'chat') {
    return <ChatCustomizerPage onBackHome={() => setScreen('home')} />
  }

  return <HomePage  onOpenChat={() => setScreen('chat')} />
}

export default App
