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
  onHeaderMouseDown: (e: MouseEvent) => void;
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
  onMinimize,
  onMaximize,
  onClose,
  children,
  headClass = ''
}: TerminalProps) {
  if (!terminalState.isOpen) return null;

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
      <div className={`term-head ${headClass}`} onMouseDown={onHeaderMouseDown}>
        <span>{title}</span>
        <div className="term-controls">
          <span className="ctrl minimize" onClick={(e) => { e.stopPropagation(); onMinimize(); }} />
          <span className="ctrl maximize" onClick={(e) => { e.stopPropagation(); onMaximize(); }} />
          <span className="ctrl close" onClick={(e) => { e.stopPropagation(); onClose(); }} />
        </div>
      </div>
      {!terminalState.isMinimized && children}
    </div>
  );
}
