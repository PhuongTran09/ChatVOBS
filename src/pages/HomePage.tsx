import { useState, useEffect } from 'react'
import '../styles/HomePage.css'
import { Header } from '../components/Header'
import { Hero } from '../components/Hero'
import { FeatureCards } from '../components/FeatureCards'
import { SystemOverlays } from '../components/SystemOverlays'
import { DonateSection } from '../components/DonateSection'
import { PhotoGallery } from '../components/PhotoGallery'
import { SocialSchedule } from '../components/SocialSchedule'
import { ImageModal } from '../components/ImageModal'
import { FloatingButtons } from '../components/FloatingButtons'
import { TerminalsBand } from '../components/TerminalsBand'
import { useTerminals } from '../hooks/useTerminals'

export function StreamerProfilePage({
  onOpenChat,
}: {
  onOpenFonts?: () => void
  onOpenChat?: () => void
}) {
  const [profileMode, setProfileMode] = useState<'streamer' | 'developer'>('streamer')
  const [selectedImage, setSelectedImage] = useState<{ src: string; name: string } | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  const {
    terminals,
    activeTerminal,
    dragging,
    isRebooting,
    isAnyTerminalClosed,
    bringToFront,
    toggleMinimize,
    toggleMaximize,
    closeTerminal,
    reopenTerminals,
    handleMouseDown,
    resetPosition,
  } = useTerminals()
  
  // Initial loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const donateMethods = [
    {
      id: 'playerduo',
      name: 'PLAYERDUO',
      url: 'https://playerduo.net/example',
      color: 'var(--magenta)',
      btnClass: 'outline-magenta'
    },
    {
      id: 'wescan',
      name: 'WESCAN',
      url: 'https://wescan.vn/example',
      color: 'var(--magenta)',
      btnClass: 'outline-magenta'
    }
  ]
  const [activeDonateIdx, setActiveDonateIdx] = useState(0)

  const nextDonate = () => {
    setActiveDonateIdx((prev) => (prev + 1) % donateMethods.length)
  }

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const galleryItems = [
    { id: 1, src: "https://picsum.photos/id/1/1200/900", thumb: "https://picsum.photos/id/1/400/300", name: "CHAT_THEME_01.PNG", date: "10.05.2026" },
    { id: 2, src: "https://picsum.photos/id/2/1200/900", thumb: "https://picsum.photos/id/2/400/300", name: "NEON_PREVIEW.PNG", date: "09.05.2026" },
    { id: 3, src: "https://picsum.photos/id/3/1200/900", thumb: "https://picsum.photos/id/3/400/300", name: "GLASS_EFFECT.PNG", date: "08.05.2026" },
    { id: 4, src: "https://picsum.photos/id/4/1200/900", thumb: "https://picsum.photos/id/4/400/300", name: "SETUP_OBS.PNG", date: "07.05.2026" },
  ]

  return (
    <main className={`cyber-home mode-${profileMode}`}>
      <Header 
        profileMode={profileMode} 
        setProfileMode={setProfileMode} 
      />

      <Hero 
        profileMode={profileMode} 
        onOpenChat={onOpenChat} 
      />

      <FeatureCards />

      <SystemOverlays 
        isInitialLoading={isInitialLoading} 
        isRebooting={isRebooting} 
      />

      <TerminalsBand
        terminals={terminals}
        activeTerminal={activeTerminal}
        draggingId={dragging?.id}
        bringToFront={bringToFront}
        handleMouseDown={handleMouseDown}
        toggleMinimize={toggleMinimize}
        toggleMaximize={toggleMaximize}
        closeTerminal={closeTerminal}
        resetPosition={resetPosition}
      />

      <PhotoGallery 
        galleryItems={galleryItems} 
        setSelectedImage={setSelectedImage} 
      />

      <SocialSchedule />

      <DonateSection 
        donateMethods={donateMethods} 
        activeDonateIdx={activeDonateIdx} 
        nextDonate={nextDonate} 
      />

      <ImageModal 
        selectedImage={selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />

      <FloatingButtons 
        showScrollTop={showScrollTop} 
        scrollToTop={scrollToTop} 
        isAnyTerminalClosed={isAnyTerminalClosed} 
        reopenTerminals={reopenTerminals} 
      />
      </main>
      )
      }