import { useState, useEffect } from "react";
import type { TerminalId, TerminalState } from "../types/terminal";

export function useTerminals() {
  const [activeTerminal, setActiveTerminal] = useState<TerminalId | null>(null);
  const [isRebooting, setIsRebooting] = useState(false);
  const [terminals, setTerminals] = useState<Record<TerminalId, TerminalState>>({
    music: {
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      pos: { x: 0, y: 0 },
      oldPos: { x: 0, y: 0 },
      zIndex: 100,
    },
    obs: {
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      pos: { x: 0, y: 0 },
      oldPos: { x: 0, y: 0 },
      zIndex: 101,
    },
  });

  const [dragging, setDragging] = useState<{
    id: TerminalId;
    startX: number;
    startY: number;
    posX: number;
    posY: number;
  } | null>(null);

  const bringToFront = (id: TerminalId) => {
    setActiveTerminal(id);
    setTerminals((prev) => {
      const maxZ = Math.max(prev.music.zIndex, prev.obs.zIndex);
      if (prev[id].zIndex >= maxZ && maxZ > 1) return prev;
      return {
        ...prev,
        [id]: { ...prev[id], zIndex: maxZ + 1 },
      };
    });
  };

  const toggleMinimize = (id: TerminalId) => {
    bringToFront(id);
    setTerminals((prev) => ({
      ...prev,
      [id]: { ...prev[id], isMinimized: !prev[id].isMinimized },
    }));
  };

  const toggleMaximize = (id: TerminalId) => {
    bringToFront(id);
    setTerminals((prev) => {
      const terminal = prev[id];
      if (terminal.isMaximized) {
        return {
          ...prev,
          [id]: {
            ...terminal,
            isMaximized: false,
            pos: terminal.oldPos,
          },
        };
      } else {
        return {
          ...prev,
          [id]: {
            ...terminal,
            isMaximized: true,
            isMinimized: false,
            oldPos: { ...terminal.pos },
            pos: { x: 0, y: 0 },
          },
        };
      }
    });
  };

  const closeTerminal = (id: TerminalId) => {
    if (activeTerminal === id) setActiveTerminal(null);
    setTerminals((prev) => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false },
    }));
  };

  const reopenTerminals = () => {
    setIsRebooting(true);
    // Simulate system reboot delay
    setTimeout(() => {
      setTerminals((prev) => ({
        music: { ...prev.music, isOpen: true },
        obs: { ...prev.obs, isOpen: true },
      }));
      setIsRebooting(false);
      setActiveTerminal("obs"); // Focus on one by default
    }, 1200);
  };

  const handleMouseDown = (id: TerminalId, e: React.MouseEvent) => {
    bringToFront(id);
    // Only drag from the header, not controls
    if ((e.target as HTMLElement).closest(".term-controls")) return;

    // Auto restore if dragging a maximized window
    if (terminals[id].isMaximized) {
      const restoredPos = terminals[id].oldPos;
      toggleMaximize(id);
      setDragging({
        id,
        startX: e.clientX - restoredPos.x,
        startY: e.clientY - restoredPos.y,
        posX: restoredPos.x,
        posY: restoredPos.y,
      });
      return;
    }

    setDragging({
      id,
      startX: e.clientX - terminals[id].pos.x,
      startY: e.clientY - terminals[id].pos.y,
      posX: terminals[id].pos.x,
      posY: terminals[id].pos.y,
    });
  };

  useEffect(() => {
    if (!dragging) return;

    const el = document.getElementById(dragging.id);
    let finalX = dragging.posX;
    let finalY = dragging.posY;

    const handleMouseMove = (e: MouseEvent) => {
      finalX = e.clientX - dragging.startX;
      finalY = e.clientY - dragging.startY;
      if (el) {
        el.style.transform = `translate3d(${finalX}px, ${finalY}px, 0)`;
      }
    };

    const handleMouseUp = () => {
      setTerminals((prev) => ({
        ...prev,
        [dragging.id]: {
          ...prev[dragging.id],
          pos: { x: finalX, y: finalY },
        },
      }));
      setDragging(null);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      finalX = touch.clientX - dragging.startX;
      finalY = touch.clientY - dragging.startY;
      if (el) {
        el.style.transform = `translate3d(${finalX}px, ${finalY}px, 0)`;
      }
    };

    const handleTouchEnd = () => {
      setTerminals((prev) => ({
        ...prev,
        [dragging.id]: {
          ...prev[dragging.id],
          pos: { x: finalX, y: finalY },
        },
      }));
      setDragging(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [dragging]);

  const isAnyTerminalClosed = !terminals.music.isOpen || !terminals.obs.isOpen;

  return {
    terminals,
    activeTerminal,
    dragging,
    isRebooting,
    isAnyTerminalClosed,
    bringToFront,
    toggleMinimize,
    toggleMaximize,
    closeTerminal,
    reopenTerminals,
    handleMouseDown,
  };
}
