import React from "react";
import { Terminal } from "./Terminal";
import { MusicPlayerBody } from "./MusicPlayerBody";
import { ObsSetupBody } from "./ObsSetupBody";
import type { TerminalId, TerminalState } from "../types/terminal";
import "./TerminalsBand.css";

interface TerminalsBandProps {
  terminals: Record<TerminalId, TerminalState>;
  activeTerminal: TerminalId | null;
  draggingId: TerminalId | undefined;
  bringToFront: (id: TerminalId) => void;
  handleMouseDown: (id: TerminalId, e: React.MouseEvent) => void;
  toggleMinimize: (id: TerminalId) => void;
  toggleMaximize: (id: TerminalId) => void;
  closeTerminal: (id: TerminalId) => void;
}

export const TerminalsBand: React.FC<TerminalsBandProps> = ({
  terminals,
  activeTerminal,
  draggingId,
  bringToFront,
  handleMouseDown,
  toggleMinimize,
  toggleMaximize,
  closeTerminal,
}) => {
  return (
    <section className="cyber-split" id="activity">
      <Terminal
        id="music"
        title="MUSIC_CHILL.exe"
        terminalState={terminals.music}
        isActive={activeTerminal === "music"}
        isDragging={draggingId === "music"}
        onMouseDown={() => bringToFront("music")}
        onHeaderMouseDown={(e) => handleMouseDown("music", e)}
        onMinimize={() => toggleMinimize("music")}
        onMaximize={() => toggleMaximize("music")}
        onClose={() => closeTerminal("music")}
        headClass="head-green"
      >
        <MusicPlayerBody />
      </Terminal>

      <Terminal
        id="obs"
        title="OBS_SETUP.txt"
        terminalState={terminals.obs}
        isActive={activeTerminal === "obs"}
        isDragging={draggingId === "obs"}
        onMouseDown={() => bringToFront("obs")}
        onHeaderMouseDown={(e) => handleMouseDown("obs", e)}
        onMinimize={() => toggleMinimize("obs")}
        onMaximize={() => toggleMaximize("obs")}
        onClose={() => closeTerminal("obs")}
        headClass="head-cyan"
      >
        <ObsSetupBody />
      </Terminal>
    </section>
  );
};
