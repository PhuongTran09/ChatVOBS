import { useEffect, useMemo, useState } from "react";

type Values = Record<string, any>;

export function useChatPreview(
  values: Values,
  generateStyle: (v: Values) => string,
  callbacks: Record<string, (id?: string) => string>,
  isChecked: (id: string) => boolean
) {
  const [lastChangedId, setLastChangedId] = useState("");
  const [previewStyle, setPreviewStyle] = useState("");
  const [animationTick, setAnimationTick] = useState(0);

  const cssOutput = useMemo(() => generateStyle(values), [values]);

  useEffect(() => {
    const exampleStyle =
      cssOutput + "#fakebody {" + callbacks["root-transparent"]() + "}";

    const isAnimationUpdate =
      lastChangedId.includes("animation") || animationTick > 0;

    let timeoutId: number | undefined;

    if (isAnimationUpdate) {
      let style = "";

      if (isChecked("animation-in")) {
        style = ""; // m thay bằng logic animation thật
      }

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
  }, [cssOutput, lastChangedId, animationTick]);

  return {
    cssOutput,
    previewStyle,
    setLastChangedId,
    setAnimationTick,
  };
}