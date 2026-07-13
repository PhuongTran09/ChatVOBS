import { useState, useEffect, useMemo } from 'react'
import '../styles/HomePage.css'
import { subscribeToActiveDonates, subscribeToMedia, subscribeToActiveSongs, type MediaDoc, type DonateMethod } from '../services'
import { Header } from '../components/Header'
import { Hero } from '../components/Hero'
import { FeatureCards } from '../components/FeatureCards'
import { SystemOverlays } from '../components/SystemOverlays'
import { InitialLoadingOverlay } from '../components/InitialLoadingOverlay'
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
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [dataLoaded, setDataLoaded] = useState({
    donates: false,
    media: false,
    songs: false,
  })

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

  // Calculate target progress based on actual loaded data sources
  const targetProgress = useMemo(() => {
    let loadedCount = 0;
    if (dataLoaded.donates) loadedCount++;
    if (dataLoaded.media) loadedCount++;
    if (dataLoaded.songs) loadedCount++;

    if (loadedCount === 0) return 15; // Core booting state
    if (loadedCount === 1) return 45; // First data stream connected
    if (loadedCount === 2) return 75; // Second data stream connected
    return 100; // All data streams loaded
  }, [dataLoaded]);

  // Smoothly interpolate the progress counter to match targetProgress
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= targetProgress) {
          // If we reached target, keep it there, wait for updates
          return prev;
        }
        // Increment smoothly (exponential easing toward target)
        const diff = targetProgress - prev;
        const step = Math.max(1, Math.floor(diff * 0.12));
        return Math.min(prev + step, 100);
      });
    }, 25);

    return () => clearInterval(interval);
  }, [targetProgress]);

  // Lock body scroll when loading or when any terminal is maximized and open
  useEffect(() => {
    const isAnyMaximized = Object.values(terminals).some((t) => t.isOpen && t.isMaximized);
    if (isInitialLoading || isAnyMaximized) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100%';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
    };
  }, [terminals, isInitialLoading]);

  const [donateMethods, setDonateMethods] = useState<DonateMethod[]>([])
  const [activeDonateIdx, setActiveDonateIdx] = useState(0)

  useEffect(() => {
    const unsubscribe = subscribeToActiveDonates(
      (list) => {
        setDonateMethods(list)
        setActiveDonateIdx(0)
        setDataLoaded((prev) => ({ ...prev, donates: true }));
      },
      (err) => {
        console.error('Failed to load active donates:', err)
        setDataLoaded((prev) => ({ ...prev, donates: true }));
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
        setDataLoaded((prev) => ({ ...prev, media: true }));
      },
      (err) => {
        console.error('Failed to load media:', err)
        setDataLoaded((prev) => ({ ...prev, media: true }));
      }
    );
    return () => unsubscribe();
  }, [])

  // Subscribe to active songs for loading status
  useEffect(() => {
    const unsubscribe = subscribeToActiveSongs(
      () => {
        setDataLoaded((prev) => ({ ...prev, songs: true }));
      },
      (err) => {
        console.error('Failed to load songs in tracker:', err);
        setDataLoaded((prev) => ({ ...prev, songs: true }));
      }
    );
    return () => unsubscribe();
  }, []);

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

      <InitialLoadingOverlay
        isInitialLoading={isInitialLoading}
        loadingProgress={loadingProgress}
        onUnlock={() => setIsInitialLoading(false)}
      />

      <SystemOverlays
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