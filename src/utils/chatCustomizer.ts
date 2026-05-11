import { template } from "../data/template";
import { mustacheRegex } from "../data/regex";
import type { CustomizerValues } from "../types/customizer";

const getColorWithAlpha = (color: string, opacity: number | string) => {
  const c = color.substring(1);
  return `rgba(${parseInt(c.substring(0, 2), 16)},${parseInt(
    c.substring(2, 4),
    16
  )},${parseInt(c.substring(4, 6), 16)},${opacity})`;
};

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
    let style = "opacity: 0;";
    if (isChecked("animation-slide")) {
      style += ` transform: translateX(${slide(-1)}px);`;
    }
    return style;
  };

  const outStyle = () => {
    let style = "opacity: 0;";
    if (isChecked("animation-slide")) {
      style += ` transform: translateX(${slide(1)}px);`;
    }
    return style;
  };

  const callbacks: Record<string, (id?: string) => string> = {
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

    "show-outlines-val": () => (isChecked("show-outlines") ? "1" : "0"),

    "show-avatars": (id?: string) =>
      !isChecked(id!) ? "display: none !important;" : "",

    "show-avatars-val": () => (isChecked("show-avatars") ? "1" : "0"),

    "show-timestamps": (id?: string) =>
      !isChecked(id!) ? "display: none !important;" : "display: inline !important;",

    "show-timestamps-val": () => (isChecked("show-timestamps") ? "1" : "0"),

    "show-badges": (id?: string) =>
      !isChecked(id!) ? "display: none !important;" : "",

    "show-badges-val": () => (isChecked("show-badges") ? "1" : "0"),

    "show-colon-val": () => (isChecked("show-colon") ? "1" : "0"),

    "message-newline-val": () => (isChecked("message-newline") ? "1" : "0"),

    "use-gradient-backgrounds-val": () => (isChecked("use-gradient-backgrounds") ? "1" : "0"),

    "show-fan-funding-background-val": () => (isChecked("show-fan-funding-background") ? "1" : "0"),

    "show-ticker-val": () => (isChecked("show-ticker") ? "1" : "0"),

    "show-everything-val": () => (isChecked("show-everything") ? "1" : "0"),

    "animation-in-val": () => (isChecked("animation-in") ? "1" : "0"),

    "animation-out-val": () => (isChecked("animation-out") ? "1" : "0"),

    "animation-slide-val": () => (isChecked("animation-slide") ? "1" : "0"),

    "animation-reverse-val": () => (isChecked("animation-reverse") ? "1" : "0"),

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

    "author-line-height-css": () => {
      const value = getValue("author-line-height");
      return Number(value) === 0 ? "20px" : `${value}px`;
    },

    "message-line-height-css": () => {
      const value = getValue("message-line-height");
      return Number(value) === 0 ? "normal" : `${value}px`;
    },

    "timestamp-line-height-css": () => {
      const value = getValue("timestamp-line-height");
      return Number(value) === 0 ? "16px" : `${value}px`;
    },

    "fan-funding-first-line-line-height-css": () => {
      const value = getValue("fan-funding-first-line-line-height");
      return Number(value) === 0 ? "normal" : `${value}px`;
    },

    "fan-funding-second-line-line-height-css": () => {
      const value = getValue("fan-funding-second-line-line-height");
      return Number(value) === 0 ? "normal" : `${value}px`;
    },

    "super-chat-content-line-height-css": () => {
      const value = getValue("super-chat-content-line-height");
      return Number(value) === 0 ? "normal" : `${value}px`;
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

    "message-background-base": () =>
      getColorWithAlpha(
        String(getValue("message-background-color")),
        String(getValue("message-background-opacity"))
      ),

    "message-bg-color-css": () =>
      getColorWithAlpha(
        String(getValue("message-background-color")),
        String(getValue("message-background-opacity"))
      ),

    "author-bg-color-css": () =>
      getColorWithAlpha(
        String(getValue("author-background-color")),
        String(getValue("author-background-opacity"))
      ),

    "author-owner-bg-color-css": () =>
      getColorWithAlpha(
        String(getValue("author-owner-background-color")),
        String(getValue("author-owner-background-opacity"))
      ),

    "author-moderator-bg-color-css": () =>
      getColorWithAlpha(
        String(getValue("author-moderator-background-color")),
        String(getValue("author-moderator-background-opacity"))
      ),

    "author-member-bg-color-css": () =>
      getColorWithAlpha(
        String(getValue("author-member-background-color")),
        String(getValue("author-member-background-opacity"))
      ),

    "owner-message-background-base": () =>
      getColorWithAlpha(
        String(getValue("owner-message-background-color")),
        String(getValue("owner-message-background-opacity"))
      ),

    "moderator-message-background-base": () =>
      getColorWithAlpha(
        String(getValue("moderator-message-background-color")),
        String(getValue("moderator-message-background-opacity"))
      ),

    "member-message-background-base": () =>
      getColorWithAlpha(
        String(getValue("member-message-background-color")),
        String(getValue("member-message-background-opacity"))
      ),

    "background-owner": () =>
      isChecked("use-gradient-backgrounds")
        ? "linear-gradient(to right, var(--color-white), var(--color-owner-accent))"
        : "var(--color-owner-accent)",

    "background-moderator": () =>
      isChecked("use-gradient-backgrounds")
        ? "linear-gradient(to right, var(--color-moderator-accent), var(--color-muted-panel))"
        : "var(--color-moderator-accent)",

    "background-member": () =>
      isChecked("use-gradient-backgrounds")
        ? "linear-gradient(to right, var(--color-member-light) 25%, var(--color-white) 75%, var(--color-member-light) 100%)"
        : "var(--color-member-light)",

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
        runningTime += inTime;
        keyframes.push(`${(runningTime / time) * 100}% { opacity: 1; transform: none;}`);
      }

      if (aout) {
        runningTime += waitTime;
        keyframes.push(`${(runningTime / time) * 100}% { opacity: 1; transform: none;}`);
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
        `  animation: anim ${time}ms;`,
        "  animation-fill-mode: forwards;",
        "}",
        "",
      ].join("\n");
    },
  };

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

export function parseCssToValues(css: string, currentValues: CustomizerValues): CustomizerValues {
  const newValues = { ...currentValues };

  // Parse ALL CSS Variables in :root or :host
  const rootMatch = css.match(/:root\s*{([^}]+)}/i) || css.match(/:host\s*{([^}]+)}/i);
  if (rootMatch) {
    const vars = rootMatch[1];
    
    // 1. Parse Simple Variables (--color-*, --outline-size, etc.)
    const varLines = vars.split(';').map(line => line.trim()).filter(line => line.includes(':'));
    
    varLines.forEach(line => {
      const parts = line.split(':');
      const name = parts[0].trim();
      const val = parts.slice(1).join(':').trim();
      
      // Map --sw-* to boolean checkboxes
      if (name.startsWith('--sw-')) {
        const id = name.replace('--sw-', '');
        newValues[id] = val === '1';
        return;
      }

      // Map --color-* (excluding RGBA computed ones)
      const colorMap: Record<string, string> = {
        "--color-white": "message-color",
        "--color-message-text": "message-text-color",
        "--color-black": "outline-color",
        "--color-timestamp": "timestamp-color",
        "--color-owner-badge": "author-owner-color",
        "--color-moderator-badge": "author-moderator-color",
        "--color-member-badge": "author-member-color",
        "--color-channel-name": "author-color",
        "--content-border-color": "content-border-color",
        "--avatar-border-color": "avatar-border-color",
        "--author-border-color": "author-border-color",
        "--message-border-color": "message-border-color",
        "--outline-color-val": "outline-color",
      };
      if (colorMap[name]) {
        newValues[colorMap[name]] = val;
        return;
      }

      // Map RGBA variables back to Hex + Opacity
      const rgbaMatch = val.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/i);
      if (rgbaMatch) {
        const rgbaVarMap: Record<string, [string, string]> = {
          "--message-bg-color": ["message-background-color", "message-background-opacity"],
          "--author-bg-color": ["author-background-color", "author-background-opacity"],
          "--author-owner-bg-color": ["author-owner-background-color", "author-owner-background-opacity"],
          "--author-moderator-bg-color": ["author-moderator-background-color", "author-moderator-background-opacity"],
          "--author-member-bg-color": ["author-member-background-color", "author-member-background-opacity"],
          "--color-transparent": ["background-color", "background-opacity"],
          "--color-owner-accent": ["owner-message-background-color", "owner-message-background-opacity"],
          "--color-moderator-accent": ["moderator-message-background-color", "moderator-message-background-opacity"],
          "--color-member-light": ["member-message-background-color", "member-message-background-opacity"],
        };
        if (rgbaVarMap[name]) {
          const [colorId, opacityId] = rgbaVarMap[name];
          const r = parseInt(rgbaMatch[1]).toString(16).padStart(2, '0');
          const g = parseInt(rgbaMatch[2]).toString(16).padStart(2, '0');
          const b = parseInt(rgbaMatch[3]).toString(16).padStart(2, '0');
          newValues[colorId] = `#${r}${g}${b}`;
          newValues[opacityId] = rgbaMatch[4];
          return;
        }
      }

      // Map Numeric/Size Variables
      const sizeMatch = val.match(/^(\d+)px$/);
      if (sizeMatch) {
        const id = name.replace(/^--/, '');
        newValues[id] = sizeMatch[1];
        return;
      }

      // Map Line Heights
      if (name.endsWith('-line-height-val')) {
        const id = name.replace('-line-height-val', '').replace(/^--/, '') + '-line-height';
        newValues[id] = val.replace('px', '');
        if (val === 'normal') newValues[id] = '0';
        return;
      }

      // Map Fonts
      if (name.endsWith('-font-family')) {
        const id = name.replace(/^--/, '');
        newValues[id] = val.replace(/["']/g, '');
        return;
      }
    });
  }

  return newValues;
}
