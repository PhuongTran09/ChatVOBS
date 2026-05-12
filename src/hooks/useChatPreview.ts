import { useEffect, useMemo, useState } from "react";
import type { CustomizerValues } from "../types/customizer";

export function useChatPreview(
  values: CustomizerValues,
  generateStyle: (v: CustomizerValues) => string,
  callbacks: Record<string, (id?: string) => string>
) {
  const [lastChangedId, setLastChangedId] = useState("");
  const [animationTick, setAnimationTick] = useState(0);
  const [isResetting, setIsResetting] = useState(false);
  const [prevDeps, setPrevDeps] = useState({ lastChangedId, animationTick });

  // Adjust state when dependencies change during render to avoid cascading renders in useEffect
  if (
    lastChangedId !== prevDeps.lastChangedId ||
    animationTick !== prevDeps.animationTick
  ) {
    setPrevDeps({ lastChangedId, animationTick });
    const isAnimationUpdate =
      lastChangedId.includes("animation") || animationTick > 0;
    if (isAnimationUpdate) {
      setIsResetting(true);
    }
  }

  const cssOutput = useMemo(() => generateStyle(values), [values, generateStyle]);

  const basePreviewStyle = useMemo(() => {
    // Chuyển đổi selector cho phù hợp với Shadow DOM
    const processedCss = cssOutput
      .replace(/:root/g, ":host")
      .replace(/body/g, ".shadow-root-container");

    const rootTransparent = callbacks["root-transparent"]();

    return (
      processedCss +
      ":host { background-color: " +
      rootTransparent +
      " !important; }"
    );
  }, [cssOutput, callbacks]);

  useEffect(() => {
    if (isResetting) {
      const timeoutId = window.setTimeout(() => {
        setIsResetting(false);
      }, 10);
      return () => clearTimeout(timeoutId);
    }
  }, [isResetting]);

  const previewStyle = useMemo(() => {
    const isAnimationUpdate =
      lastChangedId.includes("animation") || animationTick > 0;

    const animationOverride =
      !isAnimationUpdate || isResetting
        ? "animation: none !important;"
        : "animation-delay: 200ms;";

    return (
      basePreviewStyle +
      `yt-live-chat-text-message-renderer,
       yt-live-chat-legacy-paid-message-renderer {
         ${animationOverride}
       }`
    );
  }, [basePreviewStyle, isResetting, lastChangedId, animationTick]);

  return {
    cssOutput,
    previewStyle,
    setLastChangedId,
    setAnimationTick,
  };
}
