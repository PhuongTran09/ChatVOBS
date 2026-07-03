export type TerminalId = "music" | "obs";

export interface TerminalState {
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  isDetached: boolean;
  pos: { x: number; y: number };
  oldPos: { x: number; y: number };
  defaultPos: { x: number; y: number };
  zIndex: number;
}
