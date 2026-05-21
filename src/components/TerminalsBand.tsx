import { Terminal } from "./Terminal";
import { MusicPlayerBody } from "./MusicPlayerBody";
import { ObsSetupBody } from "./ObsSetupBody";
import type { TerminalId, TerminalState } from "../types/terminal";
import type { MouseEvent } from "react";
import { useI18n } from "../i18n";
import "./TerminalsBand.css";

interface TerminalsBandProps {
  terminals: Record<TerminalId, TerminalState>;
  activeTerminal: TerminalId | null;
  draggingId: TerminalId | undefined;
  bringToFront: (id: TerminalId) => void;
  handleMouseDown: (id: TerminalId, e: MouseEvent) => void;
  toggleMinimize: (id: TerminalId) => void;
  toggleMaximize: (id: TerminalId) => void;
  closeTerminal: (id: TerminalId) => void;
  resetPosition: (id: TerminalId) => void;
}

export const TerminalsBand = ({
  terminals,
  activeTerminal,
  draggingId,
  bringToFront,
  handleMouseDown,
  toggleMinimize,
  toggleMaximize,
  closeTerminal,
  resetPosition,
}: TerminalsBandProps) => {
  const { t } = useI18n();
  const isAnyOpen = terminals.music.isOpen || terminals.obs.isOpen;

  return (
    <section className={`cyber-section cyber-split ${!isAnyOpen ? 'is-standby' : ''}`} id="activity">
      {!isAnyOpen ? (
        <div className="terminal-standby">
          <div className="standby-content">
            <p className="standby-text">{t('system.standby')}</p>
            <p className="sys-text">{t('system.no_processes')}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="term-slot">
            <Terminal
              id="music"
              title="MUSIC_CHILL.exe"
              terminalState={terminals.music}
              isActive={activeTerminal === "music"}
              isDragging={draggingId === "music"}
              onMouseDown={() => bringToFront("music")}
              onHeaderMouseDown={(e) => handleMouseDown("music", e)}
              onHeaderDoubleClick={() => resetPosition("music")}
              onMinimize={() => toggleMinimize("music")}
              onMaximize={() => toggleMaximize("music")}
              onClose={() => closeTerminal("music")}
              headClass="head-green"
            >
              <MusicPlayerBody />
            </Terminal>
          </div>

          <div className="term-slot">
            <Terminal
              id="obs"
              title="OBS_SETUP.txt"
              terminalState={terminals.obs}
              isActive={activeTerminal === "obs"}
              isDragging={draggingId === "obs"}
              onMouseDown={() => bringToFront("obs")}
              onHeaderMouseDown={(e) => handleMouseDown("obs", e)}
              onHeaderDoubleClick={() => resetPosition("obs")}
              onMinimize={() => toggleMinimize("obs")}
              onMaximize={() => toggleMaximize("obs")}
              onClose={() => closeTerminal("obs")}
              headClass="head-cyan"
            >
              <ObsSetupBody />
            </Terminal>
          </div>
        </>
      )}
    </section>
  );
};
