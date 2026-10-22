import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '../styles/TransitionOverlayPage.css';
import { getChannelStats } from '../services';
import type { YouTubeStats } from '../services';
import { getOverlayParams } from '../constants/overlay';
import { CHANNEL_DISPLAY_NAME, CHANNEL_HANDLE } from '../constants/branding';
import { useOverlayMode, useTransitionTheme } from '../hooks/useOverlayShell';
import { OverlayDecor } from '../components/OverlayDecor';
import { useI18n } from '../i18n';

const FALLBACK_AVATAR = '/assets/images/obs-mockup.png';

export function TransitionOverlayPage() {
  const { t } = useI18n();
  const { theme, accentColor, accentGradient } = useTransitionTheme();
  const [ytStats, setYtStats] = useState<YouTubeStats | null>(null);
  const [pollInterval, setPollInterval] = useState<number>(60); // Poll every 60s by default (saves quota)
  const [simulate, setSimulate] = useState<boolean>(false);
  const [simulatedSubs, setSimulatedSubs] = useState<number | null>(null);

  // URL configurations
  const [customSubs, setCustomSubs] = useState<number | null>(null);
  const [handle, setHandle] = useState<string>(CHANNEL_HANDLE);
  const [customName, setCustomName] = useState<string | null>(null);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);

  // Call to action animation sequence states
  const [animate, setAnimate] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isBelled, setIsBelled] = useState<boolean>(false);
  const [ringBell, setRingBell] = useState<boolean>(false);
  const [loop, setLoop] = useState<boolean>(true);
  const [loopTime, setLoopTime] = useState<number>(50); // Loop every 50 seconds by default
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [showLike, setShowLike] = useState<boolean>(false);

  // One array instead of six named timer refs: the sequence always replaces the whole timeline.
  const sequenceTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearSequenceTimers = useCallback(() => {
    for (const timer of sequenceTimersRef.current) clearTimeout(timer);
    sequenceTimersRef.current = [];
  }, []);

  const prevSubsRef = useRef<number>(0);

  useOverlayMode();

  // Run the animated timeline sequence
  const triggerFullSequence = useCallback(() => {
    clearSequenceTimers();

    // Reset all sub-animation states immediately
    setAnimate(false);
    setIsSubscribed(false);
    setIsBelled(false);
    setRingBell(false);
    setIsLiked(false);
    setShowLike(false);

    // Delay setting animate to true slightly to let React render the "false" state
    // so the browser sees a DOM update and triggers the CSS animation again.
    sequenceTimersRef.current.push(
      setTimeout(() => {
        setAnimate(true);

        // Timeline for the cursor clicking simulation:
        // 2.7s: Cursor clicks SUBSCRIBE button
        sequenceTimersRef.current.push(
          setTimeout(() => setIsSubscribed(true), 2700),
          // 4.5s: Cursor clicks Bell icon (bell rings)
          setTimeout(() => {
            setIsBelled(true);
            setRingBell(true);
          }, 4500),
          // 5.5s: Stop bell ringing wiggle and trigger Like button sliding up
          setTimeout(() => {
            setRingBell(false);
            setShowLike(true);
          }, 5500),
          // 6.5s: Cursor clicks LIKE button
          setTimeout(() => setIsLiked(true), 6500),
        );
      }, 50),
    );
  }, [clearSequenceTimers]);

  useEffect(() => {
    // Parse search parameters
    const params = getOverlayParams();
    const subsParam = params.get('subs');
    const handleParam = params.get('handle') || params.get('channelId');
    const pollParam = params.get('poll') || params.get('interval');
    const simulateParam = params.get('simulate');
    const nameParam = params.get('name');
    const avatarParam = params.get('avatar');
    const loopParam = params.get('loop');
    const loopTimeParam = params.get('looptime') || params.get('loop_interval');

    if (subsParam) {
      const parsedSubs = parseInt(subsParam, 10);
      if (!isNaN(parsedSubs) && parsedSubs >= 0) setCustomSubs(parsedSubs);
    }

    if (handleParam) setHandle(handleParam);
    if (nameParam) setCustomName(nameParam);
    if (avatarParam) setCustomAvatar(avatarParam);

    if (pollParam) {
      const parsedPoll = parseInt(pollParam, 10);
      if (!isNaN(parsedPoll) && parsedPoll > 0) setPollInterval(parsedPoll);
    }

    if (simulateParam === 'true') {
      setSimulate(true);
    }

    if (loopParam === 'false') {
      setLoop(false);
    }

    if (loopTimeParam) {
      const parsedLoopTime = parseInt(loopTimeParam, 10);
      if (!isNaN(parsedLoopTime) && parsedLoopTime >= 5) setLoopTime(parsedLoopTime);
    }

    // Start initial sequence
    triggerFullSequence();

    return clearSequenceTimers;
  }, [triggerFullSequence, clearSequenceTimers]);

  // Fetch Channel statistics
  useEffect(() => {
    // If custom sub count is provided or if we are simulating, do not fetch API
    if (customSubs !== null || simulate) {
      return;
    }

    let cancelled = false;

    async function fetchStats(bypassCache: boolean) {
      const statsData = await getChannelStats(handle, { bypassCache });
      if (statsData && !cancelled) setYtStats(statsData);
    }

    fetchStats(false);

    const intervalId = setInterval(() => {
      fetchStats(true);
    }, pollInterval * 1000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [handle, pollInterval, customSubs, simulate]);

  // Null means the count is unknown, so the card shows a placeholder instead of an invented number
  const subscriberCount = useMemo(() => {
    if (simulate && simulatedSubs !== null) return simulatedSubs;
    if (customSubs !== null) return customSubs;
    if (ytStats && !ytStats.hiddenSubscriberCount) return ytStats.subscriberCount;
    return null;
  }, [simulate, simulatedSubs, customSubs, ytStats]);

  // Handle simulation changes
  useEffect(() => {
    if (!simulate) return;

    const baseSubs = customSubs ?? (ytStats ? ytStats.subscriberCount : 0);

    if (simulatedSubs === null) {
      setSimulatedSubs(baseSubs);
      prevSubsRef.current = baseSubs;
    }

    const timer = setInterval(() => {
      setSimulatedSubs((prev) => {
        if (prev === null) return baseSubs;
        // 40% chance to gain 1 sub
        return Math.random() > 0.6 ? prev + 1 : prev;
      });
    }, 8000);

    return () => clearInterval(timer);
  }, [simulate, ytStats, customSubs, simulatedSubs]);

  // Watch subscriber count change to trigger a notification popup
  useEffect(() => {
    if (subscriberCount !== null && subscriberCount > 0 && subscriberCount !== prevSubsRef.current) {
      triggerFullSequence();
      prevSubsRef.current = subscriberCount;
    }
  }, [subscriberCount, triggerFullSequence]);

  // Loop control
  useEffect(() => {
    if (!loop) return;

    const intervalId = setInterval(() => {
      triggerFullSequence();
    }, loopTime * 1000);

    return () => clearInterval(intervalId);
  }, [loop, loopTime, triggerFullSequence]);

  const displayName = customName || ytStats?.title || CHANNEL_DISPLAY_NAME;
  const displayAvatar = customAvatar || ytStats?.thumbnailUrl || FALLBACK_AVATAR;

  return (
    <div className="transition-overlay-container">
      <div
        className={`yato-transition-card theme-${theme} ${animate ? 'animate-in' : ''}`}
        style={{
          '--accent-color': accentColor,
          '--accent-gradient': accentGradient,
        } as React.CSSProperties}
      >
        {/* Cyber overlays */}
        <div className="scanline-overlay" />
        <div className="cyber-grid-overlay" />

        {/* Decorative corner elements */}
        <OverlayDecor />

        {/* Profile / Greeting Block */}
        <div className="badge-side">
          <div className="avatar-mini-frame">
            <img src={displayAvatar} alt={displayName} className="avatar-mini-img" />
          </div>
          <div className="profile-text">
            <div className="channel-title">{displayName.toUpperCase()}</div>
            <div key={showLike ? 'like' : 'sub'} className="cta-subtitle cta-text-animate">
              {showLike ? t('overlay.cta.likePrompt') : t('overlay.cta.subscribePrompt')}
            </div>
          </div>
        </div>

        <div className="v-divider" />

        {/* Right Side: Interactive buttons click sequence */}
        <div className="interactive-side">
          {/* Group 1: Subscribe & Bell */}
          <div className={`btn-group sub-bell-group ${showLike ? 'hide' : ''}`}>
            {/* Subscribe Button */}
            <button className={`sub-btn ${isSubscribed ? 'subscribed' : ''}`}>
              {isSubscribed ? (
                <>
                  <svg className="check-icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  {t('overlay.cta.subscribed')}
                </>
              ) : (
                t('overlay.cta.subscribe')
              )}
            </button>

            {/* Bell Icon Button */}
            <button className={`bell-btn ${isBelled ? 'active' : ''} ${ringBell ? 'ring' : ''}`}>
              {isBelled ? (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6.5-7.79V11c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v3.21L4.35 15.6c-.39.39-.35 1.02.1 1.35.15.11.34.17.53.17h14.04c.55 0 1-.45 1-1 0-.19-.06-.38-.17-.53L18.5 14.21z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
                </svg>
              )}
            </button>
          </div>

          {/* Group 2: Like & Dislike */}
          <div className={`btn-group like-dislike-group ${showLike ? 'show' : ''}`}>
            {/* Like Button */}
            <button className={`like-btn ${isLiked ? 'active' : ''}`}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
              </svg>
            </button>

            {/* Dislike / Unlike Button */}
            <button className="dislike-btn">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
              </svg>
            </button>

            {/* Share Button */}
            <button className="share-btn">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M14 9V5l7 7-7 7v-4.1c-5 0-8.5 1.6-11 5.1 1-5 4-10 11-11z"/>
              </svg>
            </button>
          </div>

          {/* Animated Cursor Pointer SVG */}
          <div className="cursor-hand">
            <svg viewBox="0 0 470.773 470.773" width="28" height="28" fill="currentColor">
              <path d="M416.579,156.286c-18.778,0-34,15.222-34,34h-10V154c0-18.778-15.222-34-34-34c-18.778,0-34,15.222-34,34v36.286h-10v-69.429c0-18.778-15.222-34-34-34c-18.778,0-34,15.222-34,34v69.429h-10V34c0-18.778-15.222-34-34-34c-18.778,0-34,15.222-34,34v277.861h-10L85.017,196.998c-7.936-17.02-28.166-24.381-45.184-16.445c-17.018,7.936-24.381,28.165-16.445,45.184l114.262,245.037h277.212l4.142-8.31c1.289-2.587,31.574-64.054,31.574-124.431V190.286C450.579,171.508,435.356,156.286,416.579,156.286z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
