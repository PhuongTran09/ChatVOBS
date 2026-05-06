import { mustacheRegex, template } from "../data/chatCustomizerData";

type Values = Record<string, any>;

const getColorWithAlpha = (color: string, opacity: number | string) => {
  const c = color.substring(1);
  return `rgba(${parseInt(c.substring(0, 2), 16)},${parseInt(
    c.substring(2, 4),
    16
  )},${parseInt(c.substring(4, 6), 16)},${opacity})`;
};

export function createChatCustomizerHelpers(values: Values) {
  let currentValues = values;

  const getValue = (id: string): any => {
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
        const size = getValue("outline-size");
        if (size == 0) {
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
      isChecked(id!) ? "display: inline !important;" : "",

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

    "author-line-height": (id?: string) => {
      const value = getValue(id!);
      return Number(value) === 0 ? "20px" : `${value}px`;
    },

    "message-line-height": (id?: string) => {
      const value = getValue(id!);
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
        getValue("background-color"),
        getValue("background-opacity")
      )};`,

    "root-transparent": () =>
      getColorWithAlpha(
        getValue("background-color"),
        getValue("background-opacity")
      ),

    "badge-background-color": () => "#f2f2f2",

    "message-background-base": () => getValue("message-background-color"),

    "owner-message-background-base": () =>
      getValue("owner-message-background-color"),

    "moderator-message-background-base": () =>
      getValue("moderator-message-background-color"),

    "member-message-background-base": () =>
      getValue("member-message-background-color"),

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

  const generateStyle = (values: Values) => {
    currentValues = values;

    return template.replace(mustacheRegex, (match) => {
      const id = match.substring(2, match.length - 2);
      if (callbacks[id]) return callbacks[id](id);
      return getValue(id);
    });
  };

  return { callbacks, isChecked, generateStyle };
}
