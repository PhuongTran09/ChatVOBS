import React from 'react';
import './SystemOverlays.css';

interface SystemOverlaysProps {
  isInitialLoading: boolean;
  isRebooting: boolean;
}

export function SystemOverlays({ isInitialLoading, isRebooting }: SystemOverlaysProps) {
  return (
    <>
      {/* INITIAL SYSTEM BOOT OVERLAY */}
      {isInitialLoading && (
        <div className="reboot-overlay initial-boot">
          <div className="reboot-content">
            <div className="reboot-glitch" data-text="BOOTING_SYSTEM...">BOOTING_SYSTEM...</div>
            <div className="reboot-bar">
              <div className="reboot-fill" style={{ animationDuration: '2.5s' }}></div>
            </div>
            <div className="reboot-logs">
              <p className="log-entry">{'>'} INITIALIZING CORE...</p>
              <p className="log-entry delay-1" style={{ animationDelay: '0.6s' }}>{'>'} LOADING OVERLAYS...</p>
              <p className="log-entry delay-2" style={{ animationDelay: '1.2s' }}>{'>'} ESTABLISHING CONNECTION...</p>
              <p className="log-entry" style={{ animationDelay: '1.8s', opacity: 0, animationFillMode: 'forwards' }}>{'>'} SYSTEM READY.</p>
            </div>
          </div>
        </div>
      )}

      {/* SYSTEM REBOOT OVERLAY */}
      {isRebooting && (
        <div className="reboot-overlay">
          <div className="reboot-content">
            <div className="reboot-glitch" data-text="SYSTEM_REBOOTING...">SYSTEM_REBOOTING...</div>
            <div className="reboot-bar">
              <div className="reboot-fill"></div>
            </div>
            <div className="reboot-logs">
              <p className="log-entry">{'>'} LOADING KERNEL...</p>
              <p className="log-entry delay-1">{'>'} MOUNTING FILE SYSTEMS...</p>
              <p className="log-entry delay-2">{'>'} STARTING CYBER_CORE.EXE...</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
