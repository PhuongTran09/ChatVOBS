import { useEffect, useMemo, useState } from "react";
import type { CustomizerValues } from "../types/customizer";

export function useChatPreview(
  values: CustomizerValues,
  generateStyle: (v: CustomizerValues) => string,
  callbacks: Record<string, (id?: string) => string>,
  isChecked: (id: string) => boolean
) {
  const [lastChangedId, setLastChangedId] = useState("");
  const [previewStyle, setPreviewStyle] = useState("");
  const [animationTick, setAnimationTick] = useState(0);

  const cssOutput = useMemo(() => generateStyle(values), [values, generateStyle]);

  useEffect(() => {
    // Chuyển đổi selector cho phù hợp với Shadow DOM
    const processedCss = cssOutput
      .replace(/:root/g, ":host")
      .replace(/body/g, ".shadow-root-container");

    const rootTransparent = callbacks["root-transparent"]();

    const exampleStyle =
      processedCss +
      ":host { background-color: " +
      rootTransparent +
      " !important; }";

    const isAnimationUpdate =
      lastChangedId.includes("animation") || animationTick > 0;

    let timeoutId: number | undefined;

    if (isAnimationUpdate) {
      const style = ""; // placeholder

      setPreviewStyle(
        exampleStyle +
          `yt-live-chat-text-message-renderer,
           yt-live-chat-legacy-paid-message-renderer {
             animation: none !important;
             ${style}
           }`
      );

      timeoutId = window.setTimeout(() => {
        setPreviewStyle(
          exampleStyle +
            `yt-live-chat-text-message-renderer,
             yt-live-chat-legacy-paid-message-renderer {
               animation-delay: 200ms;
             }`
        );
      }, 1);
    } else {
      setPreviewStyle(
        exampleStyle +
          `yt-live-chat-text-message-renderer,
           yt-live-chat-legacy-paid-message-renderer {
             animation: none !important;
           }`
      );
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [cssOutput, lastChangedId, animationTick, callbacks, isChecked]);

  return {
    cssOutput,
    previewStyle,
    setLastChangedId,
    setAnimationTick,
  };
}
