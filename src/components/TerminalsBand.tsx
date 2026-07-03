import { Terminal } from "./Terminal";
import { MusicPlayerBody } from "./MusicPlayerBody";
import { ObsSetupBody } from "./ObsSetupBody";
import type { TerminalId, TerminalState } from "../types/terminal";
import type { MouseEvent, TouchEvent } from "react";
import { useI18n } from "../i18n";
import "./TerminalsBand.css";

interface TerminalsBandProps {
  terminals: Record<TerminalId, TerminalState>;
  activeTerminal: TerminalId | null;
  draggingId: TerminalId | undefined;
  bringToFront: (id: TerminalId) => void;
  handleMouseDown: (id: TerminalId, e: MouseEvent) => void;
  handleTouchDown: (id: TerminalId, e: TouchEvent) => void;
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
  handleTouchDown,
  toggleMinimize,
  toggleMaximize,
  closeTerminal,
  resetPosition,
}: TerminalsBandProps) => {
  const { t } = useI18n();
  const isMusicDocked = terminals.music.isOpen && !terminals.music.isDetached;
  const isObsDocked = terminals.obs.isOpen && !terminals.obs.isDetached;
  const dockedCount = (isMusicDocked ? 1 : 0) + (isObsDocked ? 1 : 0);

  const isAnyOpen = terminals.music.isOpen || terminals.obs.isOpen;
  const isSingleDocked = dockedCount === 1;
  const isNoDocked = dockedCount === 0;

  return (
    <div 
      className={`cyber-split ${!isAnyOpen ? 'is-standby' : ''} ${isSingleDocked ? 'single-docked' : ''} ${isNoDocked && isAnyOpen ? 'no-docked' : ''}`} 
      id="activity" 
      style={{ marginTop: '20px' }}
    >
      {!isAnyOpen ? (
        <div className="terminal-standby">
          <div className="standby-content">
            <p className="standby-text">{t('system.standby')}</p>
            <p className="sys-text">{t('system.no_processes')}</p>
          </div>
        </div>
      ) : (
        <>
          {terminals.music.isOpen && (
            <div className={`term-slot ${terminals.music.isMinimized || terminals.music.isDetached ? 'is-collapsed' : ''}`}>
              <Terminal
                id="music"
                title="MUSIC_CHILL.exe"
                terminalState={terminals.music}
                isActive={activeTerminal === "music"}
                isDragging={draggingId === "music"}
                onMouseDown={() => bringToFront("music")}
                onHeaderMouseDown={(e) => handleMouseDown("music", e)}
                onHeaderTouchStart={(e) => handleTouchDown("music", e)}
                onHeaderDoubleClick={() => resetPosition("music")}
                onMinimize={() => toggleMinimize("music")}
                onMaximize={() => toggleMaximize("music")}
                onClose={() => closeTerminal("music")}
                headClass="head-green"
              >
                <MusicPlayerBody isOpen={terminals.music.isOpen} />
              </Terminal>
            </div>
          )}

          {terminals.obs.isOpen && (
            <div className={`term-slot ${terminals.obs.isMinimized || terminals.obs.isDetached ? 'is-collapsed' : ''}`}>
              <Terminal
                id="obs"
                title="OBS_SETUP.txt"
                terminalState={terminals.obs}
                isActive={activeTerminal === "obs"}
                isDragging={draggingId === "obs"}
                onMouseDown={() => bringToFront("obs")}
                onHeaderMouseDown={(e) => handleMouseDown("obs", e)}
                onHeaderTouchStart={(e) => handleTouchDown("obs", e)}
                onHeaderDoubleClick={() => resetPosition("obs")}
                onMinimize={() => toggleMinimize("obs")}
                onMaximize={() => toggleMaximize("obs")}
                onClose={() => closeTerminal("obs")}
                headClass="head-cyan"
              >
                <ObsSetupBody />
              </Terminal>
            </div>
          )}
        </>
      )}
    </div>
  );
};
