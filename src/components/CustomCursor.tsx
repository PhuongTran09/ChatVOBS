import { useEffect, useState, useRef } from 'react';
import './CustomCursor.css';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [type, setType] = useState<'default' | 'pointer' | 'link' | 'click'>('default');
  const [isVisible, setIsVisible] = useState(false);
  
  const mousePos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const updateCursor = () => {
      if (cursorRef.current) {
        // Direct DOM update for zero lag
        cursorRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0)`;
      }
      requestAnimationFrame(updateCursor);
    };

    const updateType = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const isLink = target.closest('a');
      const isPointer = target.closest('button, .cyber-btn, [role="button"], .song-item, .plat-tag, .ctrl, .cyber-switch-btn, .toggle-thumb');

      if (isLink) setType('link');
      else if (isPointer) setType('pointer');
      else setType('default');
    };

    const handleMouseDown = () => setType('click');
    const handleMouseUp = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isLink = target?.closest('a');
      const isPointer = target?.closest('button, .cyber-btn, [role="button"], .song-item, .plat-tag, .ctrl, .cyber-switch-btn, .toggle-thumb');
      
      if (isLink) setType('link');
      else if (isPointer) setType('pointer');
      else setType('default');
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', updateType as any);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp as any);
    
    const animId = requestAnimationFrame(updateCursor);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', updateType as any);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp as any);
      cancelAnimationFrame(animId);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div 
      ref={cursorRef}
      className={`custom-cursor-container ${type}`}
    >
      <div className="cursor-inner">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          {/* DEFAULT / BASE TRIANGLE */}
          <path className="cursor-shape" d="M3 3L21 12L3 21V3Z" fill="black" strokeWidth="2" />
          
          {/* POINTER / TARGET CIRCLE */}
          {type === 'pointer' && <circle cx="12" cy="12" r="3" className="cursor-accent" />}
          
          {/* LINK / X MARK */}
          {type === 'link' && <path d="M10 10L14 14M14 10L10 14" className="cursor-accent" strokeWidth="2" strokeLinecap="round" />}
          
          {/* CLICK / CONFIRM MARK */}
          {type === 'click' && <path d="M12 12L16 16M16 8L12 12" className="cursor-accent" strokeWidth="2" />}
          
          {/* DECORATIVE LINE FOR DEFAULT */}
          {type === 'default' && <path d="M7 8V16" className="cursor-accent" strokeWidth="1" />}
        </svg>
      </div>
      <div className="cursor-glow" />
    </div>
  );
}
