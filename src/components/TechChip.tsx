import type { CSSProperties } from 'react';
import type { TechIcon } from '../data/techIcons';

interface TechChipProps {
  tag: string;
  icon: TechIcon;
}

/**
 * Shared by the skills, tools and project-stack chips so a brand mark cannot drift
 * in size or baseline between sections. The text next to it is the label, hence
 * aria-hidden on the svg.
 */
export function TechChip({ tag, icon }: TechChipProps) {
  return (
    <span
      className="dev-chip"
      style={icon.hex ? ({ '--tech-hex': icon.hex } as CSSProperties) : undefined}
    >
      <svg
        className="dev-chip-icon"
        viewBox="0 0 24 24"
        width="13"
        height="13"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
      >
        <path d={icon.path} />
      </svg>
      {tag}
    </span>
  );
}
