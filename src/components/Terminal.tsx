import { createPortal } from 'react-dom';
import type { ReactNode, MouseEvent, TouchEvent } from 'react';
import type { TerminalId, TerminalState } from '../types/terminal';
import './Terminals.css';

interface TerminalProps {
  id: TerminalId;
  title: string;
  terminalState: TerminalState;
  isActive: boolean;
  isDragging: boolean;
  onMouseDown: (e: MouseEvent) => void;
  onHeaderMouseDown: (e: MouseEvent) => void;
  onHeaderTouchStart: (e: TouchEvent) => void;
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
  onHeaderTouchStart,
  onHeaderDoubleClick,
  onMinimize,
  onMaximize,
  onClose,
  children,
  headClass = ''
}: TerminalProps) {
  if (!terminalState.isOpen) return null;

  const { isDetached, isMinimized, isMaximized, pos, zIndex } = terminalState;

  const className = [
    'cyber-terminal',
    isDetached ? 'detached' : 'docked',
    isMinimized ? 'minimized' : '',
    isMaximized ? 'maximized' : '',
    isDragging ? 'dragging' : '',
    isActive ? 'active' : '',
  ].filter(Boolean).join(' ');

  // Detached: position fixed via inline transform from top-left (0,0)
  // Docked: position static inside .term-slot, no transform
  const style = isDetached
    ? { transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`, zIndex }
    : { zIndex };

  const content = (
    <div
      id={id}
      className={className}
      style={style}
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
        onTouchStart={onHeaderTouchStart}
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

  // Detached or maximized → portal into body so it's truly fixed on screen
  if (isDetached || isMaximized) {
    return createPortal(content, document.body);
  }

  // Docked → render inline inside .term-slot
  return content;
}
