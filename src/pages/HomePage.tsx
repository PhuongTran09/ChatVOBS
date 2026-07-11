import { useState, useEffect, useMemo } from 'react'
import '../styles/HomePage.css'
import { subscribeToActiveDonates, subscribeToMedia, type MediaDoc, type DonateMethod } from '../services'
import { Header } from '../components/Header'
import { Hero } from '../components/Hero'
import { FeatureCards } from '../components/FeatureCards'
import { SystemOverlays } from '../components/SystemOverlays'
import { DonateSection } from '../components/DonateSection'
import { PhotoGallery } from '../components/PhotoGallery'
import { SocialSchedule } from '../components/SocialSchedule'
import { SocialNews } from '../components/SocialNews'
import { ImageModal } from '../components/ImageModal'
import { FloatingButtons } from '../components/FloatingButtons'
import { TerminalsBand } from '../components/TerminalsBand'
import { useTerminals } from '../hooks/useTerminals'
import { ChatEditorSection } from '../components/ChatEditorSection'
import { Footer } from '../components/Footer'
import { useI18n } from '../i18n'

export function StreamerProfilePage({
  onOpenChat,
}: {
  onOpenFonts?: () => void
  onOpenChat?: () => void
}) {
  const { t } = useI18n()
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
    handleTouchDown,
    resetPosition,
  } = useTerminals()

  // Initial loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Lock body scroll when any terminal is maximized and open
  useEffect(() => {
    const isAnyMaximized = Object.values(terminals).some((t) => t.isOpen && t.isMaximized);
    if (isAnyMaximized) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [terminals]);

  const [donateMethods, setDonateMethods] = useState<DonateMethod[]>([])
  const [activeDonateIdx, setActiveDonateIdx] = useState(0)

  useEffect(() => {
    const unsubscribe = subscribeToActiveDonates(
      (list) => {
        setDonateMethods(list)
        setActiveDonateIdx(0)
      },
      (err) => {
        console.error('Failed to load active donates:', err)
      }
    )
    return () => unsubscribe()
  }, [])

  const nextDonate = () => {
    if (donateMethods.length === 0) return
    setActiveDonateIdx((prev) => (prev + 1) % donateMethods.length)
  }

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setShowScrollTop(window.scrollY > 400)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const [mediaItems, setMediaItems] = useState<MediaDoc[]>([])

  useEffect(() => {
    const unsubscribe = subscribeToMedia(
      (list) => {
        setMediaItems(list)
      },
      (err) => {
        console.error('Failed to load media:', err)
      }
    );
    return () => unsubscribe();
  }, [])

  const galleryItems = useMemo(() => {
    return mediaItems.map(item => ({
      id: item.id,
      src: item.url,
      thumb: item.url,
      name: item.name,
      date: item.uploadedDate
    }));
  }, [mediaItems]);

  return (
    <main className={`cyber-home mode-${profileMode}`}>
      <Header
        profileMode={profileMode}
        setProfileMode={setProfileMode}
      />

      {profileMode === 'streamer' && (
        <section className="cyber-hero" id="overview">
          <Hero
            profileMode={profileMode}
            onOpenChat={onOpenChat}
          />

          <FeatureCards />
        </section>
      )}

      <SystemOverlays
        isInitialLoading={isInitialLoading}
        isRebooting={isRebooting}
      />
      {profileMode === 'streamer' ? (
        <>
          <section className="cyber-section" id="overlays-activity" style={{ zIndex: 0 }}>
            <ChatEditorSection onOpenChat={onOpenChat} />
            <TerminalsBand
              terminals={terminals}
              activeTerminal={activeTerminal}
              draggingId={dragging?.id}
              bringToFront={bringToFront}
              handleMouseDown={handleMouseDown}
              handleTouchDown={handleTouchDown}
              toggleMinimize={toggleMinimize}
              toggleMaximize={toggleMaximize}
              closeTerminal={closeTerminal}
              resetPosition={resetPosition}
            />
          </section>

          <section className="cyber-section" id="social-hub">
            <div style={{ textAlign: 'left', marginBottom: '25px' }}>
              <span className="badge badge-primary">{t('badge.social_hub')}</span>
            </div>
            <SocialSchedule />
            
            <SocialNews />
            
            <PhotoGallery
              galleryItems={galleryItems}
              setSelectedImage={setSelectedImage}
            />
          </section>
          <section className="cyber-section" id="donate" style={{ position: 'relative', zIndex: 1 }}>
          <DonateSection
            donateMethods={donateMethods}
            activeDonateIdx={activeDonateIdx}
            nextDonate={nextDonate}
          />
          </section>
        </>
      ) : (
        <section className="cyber-section coming-soon-section">
          <div className="coming-soon-container">
            <div className="panel-scanline" />
            <div className="panel-corner-tl" />
            <div className="panel-corner-br" />
            <h1 className="glitch-text" data-text="COMING SOON">COMING SOON</h1>
            <p className="sys-text" style={{ color: 'var(--cyan)' }}>&gt; ACCESSING_DEVELOPER_PORTAL.log</p>
            <p className="sys-text blink-text" style={{ color: 'var(--magenta)' }}>&gt; UNDER_CONSTRUCTION_... [SYSTEM_STANDBY]</p>
          </div>
        </section>
      )}

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

      <Footer />
    </main>
  )
}