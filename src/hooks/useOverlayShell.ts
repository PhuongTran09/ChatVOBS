import { useEffect, useState } from 'react';
import {
  OVERLAY_ACCENT_COLORS,
  TRANSITION_ACCENT_COLORS,
  TRANSITION_ACCENT_GRADIENTS,
  getOverlayParams,
  readOverlayTheme,
  readTransitionTheme,
  type OverlayTheme,
  type TransitionTheme,
} from '../constants/overlay';

/**
 * Every overlay page added this body class on mount and removed it on unmount;
 * the rule itself now lives in `styles/overlay.css`.
 */
export function useOverlayMode(): void {
  useEffect(() => {
    document.body.classList.add('overlay-mode');

    return () => {
      document.body.classList.remove('overlay-mode');
    };
  }, []);
}

/** `?theme=` plus the accent colour it maps to. Runs in the same first commit as before. */
export function useOverlayTheme(): { theme: OverlayTheme; accentColor: string } {
  const [theme, setTheme] = useState<OverlayTheme>('cyan');

  useEffect(() => {
    setTheme(readOverlayTheme(getOverlayParams().get('theme')?.toLowerCase() ?? null));
  }, []);

  return { theme, accentColor: OVERLAY_ACCENT_COLORS[theme] };
}

/** Same `?theme=` source, plus the gradient only the transition card renders. */
export function useTransitionTheme(): {
  theme: TransitionTheme;
  accentColor: string;
  accentGradient: string;
} {
  const [theme, setTheme] = useState<TransitionTheme>('cyan');

  useEffect(() => {
    setTheme(readTransitionTheme(getOverlayParams().get('theme')?.toLowerCase()));
  }, []);

  return {
    theme,
    accentColor: TRANSITION_ACCENT_COLORS[theme],
    accentGradient: TRANSITION_ACCENT_GRADIENTS[theme],
  };
}
