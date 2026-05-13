export const youtubeChatThemeCss = `
  :host {
  --color-transparent: rgba(0,0,0,0);
  --color-white: #ffffff;
  --color-message-text: #e0e0e0;
  --color-black: #050508;
  --color-primary: #0ff;
  --color-owner: #f0f;
  --color-moderator: #0f0;
  --color-member: #0ff;
  
  --color-bg-msg: rgba(5, 5, 8, 0.85);
  --color-border-msg: rgba(0, 255, 255, 0.2);
  
  --font-mono: 'Share Tech Mono', monospace;
  --font-main: 'Inter', sans-serif;
  
  --color-timestamp: rgba(255, 255, 255, 0.3);
}

body {
  overflow: hidden;
  background-color: var(--color-transparent);
}

yt-live-chat-renderer,
yt-live-chat-text-message-renderer,
yt-live-chat-item-list-renderer #items,
yt-live-chat-item-scroller {
  background-color: transparent !important;
  overflow: hidden !important;
}

yt-live-chat-text-message-renderer {
  padding: 10px 14px !important;
  margin: 8px 4px !important;
  background: var(--color-bg-msg) !important;
  position: relative !important;
  animation: slideInCyber 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards !important;
  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px) !important;
  border: 1px solid var(--color-border-msg) !important;
  border-left: 4px solid var(--color-primary) !important;
  box-sizing: border-box !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5) !important;
}

yt-live-chat-text-message-renderer[author-type="owner"] {
  border-left-color: var(--color-owner) !important;
  border-right: 1px solid rgba(255, 0, 255, 0.2) !important;
  box-shadow: inset 5px 0 20px rgba(255, 0, 255, 0.1) !important;
}

yt-live-chat-text-message-renderer[author-type="moderator"] {
  border-left-color: var(--color-moderator) !important;
  border-right: 1px solid rgba(0, 255, 0, 0.2) !important;
  box-shadow: inset 5px 0 20px rgba(0, 255, 0, 0.1) !important;
}

yt-live-chat-text-message-renderer[author-type="member"] {
  border-left-color: var(--color-member) !important;
  border-right: 1px solid rgba(0, 255, 255, 0.2) !important;
  box-shadow: inset 5px 0 20px rgba(0, 255, 255, 0.1) !important;
}

yt-live-chat-text-message-renderer #content {
  overflow: visible !important;
  display: flex !important;
  flex-direction: column !important;
}

yt-live-chat-text-message-renderer #author-name {
  color: var(--color-primary) !important;
  font-family: var(--font-mono) !important;
  font-size: 14px !important;
  font-weight: bold !important;
  text-transform: uppercase !important;
  letter-spacing: 1.5px !important;
  margin-bottom: 4px !important;
  background: transparent !important;
  text-shadow: 0 0 8px currentColor !important;
}

yt-live-chat-text-message-renderer[author-type="owner"] #author-name { color: var(--color-owner) !important; }
yt-live-chat-text-message-renderer[author-type="moderator"] #author-name { color: var(--color-moderator) !important; }
yt-live-chat-text-message-renderer[author-type="member"] #author-name { color: var(--color-member) !important; }

yt-live-chat-text-message-renderer #message {
  color: var(--color-message-text) !important;
  font-family: var(--font-main) !important;
  font-size: 16px !important;
  line-height: 1.5 !important;
  background: transparent !important;
  padding: 0 !important;
  margin: 0 !important;
}

yt-live-chat-text-message-renderer #timestamp {
  position: absolute !important;
  top: 6px !important;
  right: 14px !important;
  color: var(--color-timestamp) !important;
  font-family: var(--font-mono) !important;
  font-size: 10px !important;
}

/* Hide Unwanted Elements */
yt-live-chat-header-renderer,
yt-live-chat-message-input-renderer,
yt-live-chat-ticker-renderer,
yt-live-chat-mode-change-message-renderer,
yt-live-chat-viewer-engagement-message-renderer,
yt-live-chat-restricted-participation-renderer,
yt-live-chat-action-panel-renderer,
yt-live-chat-banner-manager,
yt-live-chat-moderation-message-renderer,
yt-live-chat-membership-only-mode-message-renderer,
yt-live-chat-message-prompt-renderer,
yt-live-chat-subscription-message-renderer,
yt-live-chat-pinned-message-renderer,
yt-live-chat-paid-message-renderer,
yt-live-chat-paid-sticker-renderer,
yt-live-chat-legacy-paid-message-renderer,
yt-live-chat-legacy-paid-sticker-renderer,
yt-reaction-control-panel-overlay,
yt-reaction-control-panel-overlay-view-model,
yt-reaction-control-panel-view-model,
yt-live-chat-renderer #action-panel,
yt-live-chat-renderer #input,
yt-live-chat-text-message-renderer #author-photo,
yt-live-chat-text-message-renderer #author-badges,
yt-live-chat-text-message-renderer yt-icon,
yt-live-chat-text-message-renderer yt-live-chat-author-chip-renderer,
yt-button-view-model {
  display: none !important;
}

@keyframes slideInCyber {
  0% { transform: translateX(-30px) skewX(-15deg); opacity: 0; filter: brightness(2); }
  70% { transform: translateX(5px) skewX(2deg); opacity: 1; filter: brightness(1.2); }
  100% { transform: translateX(0) skewX(0); opacity: 1; filter: brightness(1); }
}

/* Decorative scanline and digital noise effect */
yt-live-chat-text-message-renderer::after {
  content: "" !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  background: 
    linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%),
    linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02)) !important;
  background-size: 100% 4px, 3px 100% !important;
  pointer-events: none !important;
  opacity: 0.3 !important;
  z-index: 1 !important;
}

/* Hover glitch effect */
yt-live-chat-text-message-renderer:hover {
  border-color: var(--color-primary) !important;
  background: rgba(10, 15, 25, 0.9) !important;
}

@keyframes shimmer {
  0% { background-position: -100% 0; }
  100% { background-position: 100% 0; }
}

yt-live-chat-text-message-renderer[author-type="owner"],
yt-live-chat-text-message-renderer[author-type="moderator"],
yt-live-chat-text-message-renderer[author-type="member"] {
  background-image: linear-gradient(90deg, 
    var(--color-bg-msg), 
    rgba(255, 255, 255, 0.05), 
    var(--color-bg-msg)
  ) !important;
  background-size: 200% 100% !important;
  animation: shimmer 3s linear infinite !important;
}
`;
