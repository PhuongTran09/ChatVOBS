import type { CustomizerValues } from "../types/customizer";

/**
 * Reverse of the generator: these names are emitted by `chatCssGenerator.ts`
 * and by the static part of `data/template.ts`. Renaming a CSS variable there
 * without renaming it here silently drops that setting on import.
 */
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

/** RGBA variables the generator computes from a color + an opacity pair. */
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
      if (colorMap[name]) {
        newValues[colorMap[name]] = val;
        return;
      }

      // Map Simple Colors (e.g. --fan-funding-*)
      if (name.startsWith('--') && (name.includes('color') || name.includes('accent'))) {
        const id = name.replace(/^--/, '');
        if (newValues[id] !== undefined) {
          newValues[id] = val;
          return;
        }
      }

      // Map RGBA variables back to Hex + Opacity
      const rgbaMatch = val.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/i);
      if (rgbaMatch) {
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

      // Map Numeric/Size Variables (px, ms, s)
      const numericMatch = val.match(/^([\d.]+)(px|ms|s)$/);
      if (numericMatch) {
        const id = name.replace(/^--/, '');
        newValues[id] = numericMatch[1];
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
