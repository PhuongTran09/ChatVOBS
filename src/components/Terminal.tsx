import type { ReactNode, MouseEvent } from 'react';
import type { TerminalId, TerminalState } from '../types/terminal';
import './Terminals.css';

interface TerminalProps {
  id: TerminalId;
  title: string;
  terminalState: TerminalState;
  isActive: boolean;
  isDragging: boolean;
  onMouseDown: (e: MouseEvent) => void;
  onHeaderMouseDown: (e: any) => void; // Using any for combined Mouse/Touch events
  onHeaderDoubleClick?: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  children: ReactNode;
  headClass?: string;
}

export function Terminal({
  id,
  title,
  terminalState,
  isActive,
  isDragging,
  onMouseDown,
  onHeaderMouseDown,
  onHeaderDoubleClick,
  onMinimize,
  onMaximize,
  onClose,
  children,
  headClass = ''
}: TerminalProps) {
  if (!terminalState.isOpen) return null;

  // Handler for touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    // Prevent scrolling when dragging
    const touch = e.touches[0];
    const syntheticEvent = {
      target: e.target,
      clientX: touch.clientX,
      clientY: touch.clientY,
      closest: (selector: string) => (e.target as HTMLElement).closest(selector)
    };
    onHeaderMouseDown(syntheticEvent);
  };

  return (
    <div 
      id={id}
      className={`cyber-terminal ${terminalState.isMinimized ? 'minimized' : ''} ${terminalState.isMaximized ? 'maximized' : ''} ${isDragging ? 'dragging' : ''} ${isActive ? 'active' : ''}`}
      style={{ 
        transform: `translate(${terminalState.pos.x}px, ${terminalState.pos.y}px)`,
        zIndex: terminalState.zIndex
      }}
      onMouseDown={onMouseDown}
    >
      {/* 3D DECORATIVE LAYERS */}
      <div className="terminal-glitch-line" />
      <div className="terminal-scanline" />
      <div className="terminal-corner-top-left" />
      <div className="terminal-corner-bottom-right" />
      
      <div 
        className={`term-head ${headClass}`} 
        onMouseDown={onHeaderMouseDown}
        onTouchStart={handleTouchStart}
        onDoubleClick={onHeaderDoubleClick}
      >
        <div className="head-label">
          <span className="head-dot" />
          <span>{title}</span>
        </div>
        <div className="term-controls">
          <span className="ctrl minimize" onClick={(e) => { e.stopPropagation(); onMinimize(); }} />
          <span className="ctrl maximize" onClick={(e) => { e.stopPropagation(); onMaximize(); }} />
          <span className="ctrl close" onClick={(e) => { e.stopPropagation(); onClose(); }} />
        </div>
      </div>
      <div className="terminal-content-wrapper">
        {children}
      </div>
    </div>
  );
}
