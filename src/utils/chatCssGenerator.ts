import { template } from "../data/template";
import { mustacheRegex } from "../data/regex";
import type { CustomizerValues } from "../types/customizer";

const getColorWithAlpha = (color: string, opacity: number | string) => {
  let c = color.substring(1);
  if (c.length === 3) {
    c = c.split('').map(char => char + char).join('');
  }
  return `rgba(${parseInt(c.substring(0, 2), 16)},${parseInt(
    c.substring(2, 4),
    16
  )},${parseInt(c.substring(4, 6), 16)},${opacity})`;
};

/** Emit `<id>-val` as "1"/"0" for each of these checkbox ids. */
const BOOLEAN_VAR_IDS = [
  "show-outlines",
  "show-avatars",
  "show-timestamps",
  "show-badges",
  "show-colon",
  "message-newline",
  "use-gradient-backgrounds",
  "show-fan-funding-background",
  "show-ticker",
  "show-everything",
  "animation-in",
  "animation-out",
  "animation-slide",
  "animation-reverse",
];

/** `[callback id, value id, value used when the field is 0]`. The fallbacks are
 *  per-field data, not a rule: author/timestamp fall back to a length, the rest
 *  to `normal`. */
const LINE_HEIGHT_CSS: [string, string, string][] = [
  ["author-line-height-css", "author-line-height", "20px"],
  ["message-line-height-css", "message-line-height", "normal"],
  ["timestamp-line-height-css", "timestamp-line-height", "16px"],
  ["fan-funding-first-line-line-height-css", "fan-funding-first-line-line-height", "normal"],
  ["fan-funding-second-line-line-height-css", "fan-funding-second-line-line-height", "normal"],
  ["super-chat-content-line-height-css", "super-chat-content-line-height", "normal"],
];

/** `[callback id, color id, opacity id]` for every computed rgba() variable. */
const RGBA_CSS: [string, string, string][] = [
  ["message-background-base", "message-background-color", "message-background-opacity"],
  ["message-bg-color-css", "message-background-color", "message-background-opacity"],
  ["author-bg-color-css", "author-background-color", "author-background-opacity"],
  ["author-owner-bg-color-css", "author-owner-background-color", "author-owner-background-opacity"],
  ["author-moderator-bg-color-css", "author-moderator-background-color", "author-moderator-background-opacity"],
  ["author-member-bg-color-css", "author-member-background-color", "author-member-background-opacity"],
  ["owner-message-background-base", "owner-message-background-color", "owner-message-background-opacity"],
  ["moderator-message-background-base", "moderator-message-background-color", "moderator-message-background-opacity"],
  ["member-message-background-base", "member-message-background-color", "member-message-background-opacity"],
];

const GRADIENT_BACKGROUND =
  "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)";

const GRADIENT_ROLE_KEYS = ["background-owner", "background-moderator", "background-member"];

export function createChatCustomizerHelpers(values: CustomizerValues) {
  let currentValues = values;

  const getValue = (id: string): string | number | boolean => {
    if (Object.prototype.hasOwnProperty.call(currentValues, id)) {
      return currentValues[id];
    }
    return id;
  };

  const isChecked = (id: string): boolean => !!currentValues[id];

  const textShadow = (x: number, y: number): string =>
    `${x}px ${y}px var(--color-black)`;

  const slide = (scalar: number) =>
    (isChecked("animation-reverse") ? -16 : 16) * scalar;

  const inStyle = () => {
    let style = "opacity: 0; filter: brightness(2);";
    if (isChecked("animation-slide")) {
      style += ` transform: translateX(${slide(-2)}px) skewX(-15deg);`;
    }
    return style;
  };

  const outStyle = () => {
    let style = "opacity: 0; filter: brightness(0.5);";
    if (isChecked("animation-slide")) {
      style += ` transform: translateX(${slide(2)}px) skewX(15deg);`;
    }
    return style;
  };

  const callbacks: Record<string, (id?: string) => string> = {
    "imports": () => {
      const fontIds = [
        "author-font-family",
        "author-owner-font-family",
        "author-moderator-font-family",
        "author-member-font-family",
        "message-font-family",
        "timestamp-font-family",
        "fan-funding-first-line-font-family",
        "fan-funding-second-line-font-family",
        "super-chat-content-font-family",
      ];
      const usedFonts = new Set<string>();
      fontIds.forEach((id) => {
        const font = String(getValue(id));
        if (font) usedFonts.add(font);
      });

      return Array.from(usedFonts)
        .map(
          (font) =>
            `@import url("https://fonts.googleapis.com/css?family=${font.replace(
              / /g,
              "+"
            )}");`
        )
        .join("\n");
    },

    "show-outlines": (id?: string) => {
      if (isChecked(id!)) {
        const size = Number(getValue("outline-size"));
        if (size === 0) {
          return "";
        }

        const shadow: string[] = [];
        for (let x = -size; x <= size; x += Math.ceil(size / 4)) {
          for (let y = -size; y <= size; y += Math.ceil(size / 4)) {
            shadow.push(textShadow(x, y));
          }
        }
        return `text-shadow: ${shadow.join(",")};`;
      }
      return "";
    },

    "show-avatars": (id?: string) =>
      !isChecked(id!) ? "display: none !important;" : "",

    "show-timestamps": (id?: string) =>
      !isChecked(id!) ? "display: none !important;" : "display: inline !important;",

    "show-badges": (id?: string) =>
      !isChecked(id!) ? "display: none !important;" : "",

    "show-colon": () => {
      if (isChecked("show-colon")) {
        return [
          "",
          "yt-live-chat-text-message-renderer #author-name::after {",
          "  content: ':' !important;",
          `  margin-left: ${getValue("outline-size")}px;`,
          "}",
        ].join("\n");
      }
      return [
        "",
        "yt-live-chat-text-message-renderer #author-name::after {",
        "  content: none !important;",
        "  display: none !important;",
        "}",
      ].join("\n");
    },

    "message-newline": () =>
      isChecked("message-newline")
        ? [
            "",
            "yt-live-chat-text-message-renderer #message {",
            "  display: block !important;",
            "}",
          ].join("\n")
        : "",

    "show-fan-funding-background": () =>
      isChecked("show-fan-funding-background")
        ? [
            "background-color: var(--color-member-badge) !important;",
            "  margin: 4px 0 !important;",
          ].join("\n")
        : [
            "background-color: transparent !important;",
            "  box-shadow: none !important;",
            "  margin: 0 !important;",
          ].join("\n"),

    "background-color": () =>
      `background-color: ${getColorWithAlpha(
        String(getValue("background-color")),
        String(getValue("background-opacity"))
      )};`,

    "root-transparent": () =>
      getColorWithAlpha(
        String(getValue("background-color")),
        String(getValue("background-opacity"))
      ),

    "badge-background-color": () => "#f2f2f2",

    "shimmer-animation": () =>
      isChecked("use-gradient-backgrounds")
        ? [
            "  background-size: 200% 100% !important;",
            "  animation: shimmer 2s linear infinite !important;",
          ].join("\n")
        : "",

    "ticker": () => {
      let ret = "";
      if (!isChecked("show-ticker")) {
        ret += [
          "yt-live-chat-ticker-renderer {",
          "  display: none !important;",
          "}",
          "",
        ].join("\n");
      }
      if (!isChecked("show-everything")) {
        ret += [
          "yt-live-chat-item-list-renderer {",
          "  display: none !important;",
          "}",
          "",
        ].join("\n");
      }
      return ret;
    },

    "animations": () => {
      const ain = isChecked("animation-in");
      const aout = isChecked("animation-out");
      if (!ain && !aout) {
        return "";
      }

      const inTime = Number(getValue("animation-in-time"));
      const waitTime = Number(getValue("animation-wait-time")) * 1000;
      const outTime = Number(getValue("animation-out-time"));

      let time = 0;
      if (ain) {
        time += inTime;
      }
      if (aout) {
        time += waitTime;
        time += outTime;
      }

      const keyframes: string[] = [];
      let runningTime = 0;

      if (ain) {
        keyframes.push(`0% { ${inStyle()} }`);
        // Mid-point glitch
        keyframes.push(`${((runningTime + inTime * 0.7) / time) * 100}% { transform: translateX(${slide(0.2)}px) skewX(2deg); opacity: 1; filter: brightness(1.2); }`);
        runningTime += inTime;
        keyframes.push(`${(runningTime / time) * 100}% { opacity: 1; transform: none; filter: brightness(1); }`);
      }

      if (aout) {
        runningTime += waitTime;
        keyframes.push(`${(runningTime / time) * 100}% { opacity: 1; transform: none; filter: brightness(1); }`);
        runningTime += outTime;
        keyframes.push(`${(runningTime / time) * 100}% { ${outStyle()} }`);
      }

      return [
        "@keyframes anim {",
        ...keyframes,
        "}",
        "",
        "yt-live-chat-text-message-renderer,",
        "yt-live-chat-legacy-paid-message-renderer {",
        `  animation: anim ${time}ms cubic-bezier(0.2, 0.8, 0.2, 1);`,
        "  animation-fill-mode: forwards;",
        "}",
        "",
      ].join("\n");
    },
  };

  BOOLEAN_VAR_IDS.forEach((id) => {
    callbacks[`${id}-val`] = () => (isChecked(id) ? "1" : "0");
  });

  LINE_HEIGHT_CSS.forEach(([callbackId, valueId, zeroFallback]) => {
    callbacks[callbackId] = () => {
      const value = getValue(valueId);
      return Number(value) === 0 ? zeroFallback : `${value}px`;
    };
  });

  RGBA_CSS.forEach(([callbackId, colorId, opacityId]) => {
    callbacks[callbackId] = () =>
      getColorWithAlpha(String(getValue(colorId)), String(getValue(opacityId)));
  });

  GRADIENT_ROLE_KEYS.forEach((callbackId) => {
    callbacks[callbackId] = () =>
      isChecked("use-gradient-backgrounds") ? GRADIENT_BACKGROUND : "none";
  });

  const generateStyle = (values: CustomizerValues) => {
    currentValues = values;

    return template.replace(mustacheRegex, (match) => {
      const id = match.substring(2, match.length - 2);
      if (callbacks[id]) return callbacks[id](id);
      return String(getValue(id));
    });
  };

  return { callbacks, isChecked, generateStyle };
}
