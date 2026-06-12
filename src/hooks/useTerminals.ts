import { useState, useEffect, useRef } from "react";
import type { TerminalId, TerminalState } from "../types/terminal";

export function useTerminals() {
  const [activeTerminal, setActiveTerminal] = useState<TerminalId | null>(null);
  const [isRebooting, setIsRebooting] = useState(false);
  const [terminals, setTerminals] = useState<Record<TerminalId, TerminalState>>(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 800;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 600;
    const termW = Math.min(480, vw * 0.9);
    // Music: left side
    const musicX = Math.max(16, (vw - termW * 2 - 24) / 2);
    const musicY = Math.max(80, vh * 0.12);
    // Obs: right side (or stacked on mobile)
    const obsX = Math.min(musicX + termW + 16, vw - termW - 16);
    const obsY = Math.max(80, vh * 0.12) + 20;
    return {
      music: {
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        isDetached: false,
        pos: { x: musicX, y: musicY },
        oldPos: { x: musicX, y: musicY },
        defaultPos: { x: musicX, y: musicY },
        zIndex: 1200,
      },
      obs: {
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        isDetached: false,
        pos: { x: obsX, y: obsY },
        oldPos: { x: obsX, y: obsY },
        defaultPos: { x: obsX, y: obsY },
        zIndex: 1201,
      },
    };
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
      // Cap at 2300 to stay below language switcher (3000) and loading overlay
      const nextZ = Math.min(maxZ + 1, 2300);
      if (prev[id].zIndex >= maxZ && maxZ > 1) return prev;
      return {
        ...prev,
        [id]: { ...prev[id], zIndex: nextZ },
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
            isDetached: true, // maximized always detached
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
      [id]: { ...prev[id], isOpen: false, isMaximized: false, isMinimized: false },
    }));
  };

  const reopenTerminals = () => {
    setIsRebooting(true);
    setTimeout(() => {
      setTerminals((prev) => ({
        music: { ...prev.music, isOpen: true, isDetached: false },
        obs: { ...prev.obs, isOpen: true, isDetached: false },
      }));
      setIsRebooting(false);
      setActiveTerminal("obs");
    }, 1200);
  };

  // Detach terminal from slot at its current viewport position
  const detachAt = (id: TerminalId, clientX: number, clientY: number) => {
    const el = document.getElementById(id);
    if (!el) return { startX: clientX, startY: clientY, posX: 0, posY: 0 };
    const rect = el.getBoundingClientRect();
    const posX = rect.left;
    const posY = rect.top;
    // Mark as detached with its current screen position
    setTerminals((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isDetached: true,
        pos: { x: posX, y: posY },
      },
    }));
    return {
      startX: clientX - posX,
      startY: clientY - posY,
      posX,
      posY,
    };
  };

  const handleMouseDown = (id: TerminalId, e: React.MouseEvent) => {
    bringToFront(id);
    if ((e.target as HTMLElement).closest(".term-controls")) return;

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

    if (!terminals[id].isDetached) {
      // First drag: detach from slot, grab current screen position
      const { startX, startY, posX, posY } = detachAt(id, e.clientX, e.clientY);
      setDragging({ id, startX, startY, posX, posY });
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

  const handleTouchDown = (id: TerminalId, e: React.TouchEvent) => {
    bringToFront(id);
    if ((e.target as HTMLElement).closest(".term-controls")) return;

    const touch = e.touches[0];

    if (terminals[id].isMaximized) {
      const restoredPos = terminals[id].oldPos;
      toggleMaximize(id);
      setDragging({
        id,
        startX: touch.clientX - restoredPos.x,
        startY: touch.clientY - restoredPos.y,
        posX: restoredPos.x,
        posY: restoredPos.y,
      });
      return;
    }

    if (!terminals[id].isDetached) {
      const { startX, startY, posX, posY } = detachAt(id, touch.clientX, touch.clientY);
      setDragging({ id, startX, startY, posX, posY });
      return;
    }

    setDragging({
      id,
      startX: touch.clientX - terminals[id].pos.x,
      startY: touch.clientY - terminals[id].pos.y,
      posX: terminals[id].pos.x,
      posY: terminals[id].pos.y,
    });
  };

  // Use a ref to hold the latest final position so event handlers always
  // read the current value without stale closures.
  const finalPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!dragging) return;

    const el = document.getElementById(dragging.id);
    finalPosRef.current = { x: dragging.posX, y: dragging.posY };

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX - dragging.startX;
      const y = e.clientY - dragging.startY;
      finalPosRef.current = { x, y };
      if (el) {
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    };

    const handleMouseUp = () => {
      const { x, y } = finalPosRef.current;
      setTerminals((prev) => ({
        ...prev,
        [dragging.id]: {
          ...prev[dragging.id],
          pos: { x, y },
        },
      }));
      setDragging(null);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const x = touch.clientX - dragging.startX;
      const y = touch.clientY - dragging.startY;
      finalPosRef.current = { x, y };
      if (el) {
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    };

    const handleTouchEnd = () => {
      const { x, y } = finalPosRef.current;
      setTerminals((prev) => ({
        ...prev,
        [dragging.id]: {
          ...prev[dragging.id],
          pos: { x, y },
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

  // Double-click header → snap back into slot
  const resetPosition = (id: TerminalId) => {
    setTerminals((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isDetached: false,
        isMinimized: false,
        isMaximized: false,
        pos: { ...prev[id].defaultPos },
      },
    }));
  };

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
    handleMouseDown,
    handleTouchDown,
    reopenTerminals,
    draggingId: dragging?.id || null,
    resetPosition,
  };
}
