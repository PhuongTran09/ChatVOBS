export const youtubeChatThemeCss = `
  :host {
  --color-transparent: rgba(251,65,65,0);
  --color-white: #ffffff;
  --color-message-text: #ffffff;
  --color-black: #000000;
  --color-primary: #cccccc;
  --color-owner: #ffd600;
  --color-badge-bg: #f2f2f2;
  --color-timestamp: #999999;
  --color-owner-badge: #ffd600;
  --color-moderator-badge: #5e84f1;
  --color-member-badge: #0f9d58;
  --color-channel-name: #cccccc;
  --color-owner-accent: rgba(255,214,0,0.81);
  --color-moderator-accent: rgba(94,132,241,1);
  --color-muted-panel: rgba(204,204,204,0);
  --color-member-light: rgba(15,157,88,0.73);
  --message-bg-color: rgba(204,204,204,0);
  --author-bg-color: rgba(255,255,255,0);
  --author-owner-bg-color: rgba(255,214,0,0);
  --author-moderator-bg-color: rgba(94,132,241,0);
  --author-member-bg-color: rgba(34,236,139,0);
  --background-owner: var(--color-owner-accent);
  --background-moderator: var(--color-moderator-accent);
  --background-member: var(--color-member-light);
}

body {
  overflow: hidden;
  background-color: var(--color-transparent);
}

yt-live-chat-renderer,
yt-live-chat-text-message-renderer,
yt-live-chat-text-message-renderer[is-highlighted],
yt-live-chat-text-message-renderer[author-type="owner"],
yt-live-chat-text-message-renderer[author-type="owner"][is-highlighted],
yt-live-chat-text-message-renderer[author-type="moderator"],
yt-live-chat-text-message-renderer[author-type="moderator"][is-highlighted],
yt-live-chat-text-message-renderer[author-type="member"],
yt-live-chat-text-message-renderer[author-type="member"][is-highlighted],
yt-live-chat-ticker-renderer {
  background-color: transparent !important;
}

yt-live-chat-renderer * {
  
  line-height: normal !important;
}

yt-live-chat-item-list-renderer #items,
yt-live-chat-item-scroller {
  overflow: hidden !important;
}

yt-live-chat-text-message-renderer #content,
yt-live-chat-legacy-paid-message-renderer #content {
  overflow: initial !important;
  border: 0px solid #ffffff !important;
  border-radius: 0px !important;
  box-sizing: border-box !important;
}

yt-live-chat-text-message-renderer {
  animation: chat_bounce 0.5s ease-out forwards;
}

yt-live-chat-text-message-renderer,
yt-live-chat-legacy-paid-message-renderer,
yt-live-chat-paid-message-renderer #header {
  padding-left: 4px !important;
  padding-right: 4px !important;
}

yt-live-chat-author-badge-renderer {
  background-color: var(--color-badge-bg) !important;
}

yt-live-chat-author-badge-renderer[type="moderator"],
yt-live-chat-author-badge-renderer[type="member"] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

yt-live-chat-text-message-renderer #author-badges {
  display: none !important;
  vertical-align: text-top !important;
}

yt-live-chat-text-message-renderer #author-photo img,
yt-live-chat-paid-message-renderer #author-photo img,
yt-live-chat-legacy-paid-message-renderer #author-photo img {
  object-fit: cover !important;
  display: none !important;
}

yt-live-chat-text-message-renderer #author-photo,
yt-live-chat-paid-message-renderer #author-photo,
yt-live-chat-legacy-paid-message-renderer #author-photo,
yt-live-chat-ticker-paid-message-item-renderer #fake-avatar {
  
  background-color: red !important;
  width: 24px !important;
  height: 24px !important;
  min-width: 24px !important;
  border-radius: 50% !important;
  border: 0px solid #ffffff !important;
  padding: 0px !important;
  box-sizing: border-box !important;
  margin: 0px 6px 0px 0px !important;
}

yt-live-chat-text-message-renderer #timestamp {
  
  color: var(--color-timestamp) !important;
  line-height: 16px !important;
}

yt-live-chat-text-message-renderer #author-name {
  color: var(--color-channel-name) !important;
  font-family: "Changa One" !important;
  font-size: 20px !important;
  background: var(--author-bg-color) !important;
  background-size: 200% 100%;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 20px !important;
  padding: 0px !important;
  border: 0px solid #ffffff !important;
  border-radius: 0px !important;
  margin: 0px 0px 0px 0px !important;
  box-sizing: border-box !important;
}

yt-live-chat-text-message-renderer #author-name::after {
  content: ':' !important;
  margin-left: 0px;
}

/* ROLE SPECIFIC COLORS - AUTHOR NAME */
yt-live-chat-text-message-renderer[author-type="owner"] #author-name,
yt-live-chat-text-message-renderer #author-name[type="owner"] {
  color: var(--color-owner-badge) !important;
  background: var(--author-owner-bg-color) !important;
  font-family: "Changa One" !important;
}

yt-live-chat-text-message-renderer[author-type="moderator"] #author-name,
yt-live-chat-text-message-renderer #author-name[type="moderator"] {
  color: var(--color-moderator-badge) !important;
  background: var(--author-moderator-bg-color) !important;
  font-family: "Changa One" !important;
}

yt-live-chat-text-message-renderer[author-type="member"] #author-name,
yt-live-chat-text-message-renderer #author-name[type="member"] {
  color: var(--color-member-badge) !important;
  background: var(--author-member-bg-color) !important;
  font-family: "Changa One" !important;
}

yt-live-chat-text-message-renderer #author-name[author-type="owner"]::before,
yt-live-chat-text-message-renderer #author-name.owner::before {
  display: none !important;
  background-color: transparent !important;
}

/* ROLE SPECIFIC COLORS - MESSAGE BUBBLE */
yt-live-chat-text-message-renderer #message {
  color: var(--color-message-text) !important;
  font-family: "Imprima" !important;
  font-size: 18px !important;
  background: var(--message-bg-color);
  text-align: left;
  white-space: normal !important;
  display: block !important;
  user-select: none;
  line-height: normal !important;
  letter-spacing: normal !important;
  padding: 0px !important;
  border: 0px solid #ffffff !important;
  border-radius: 0px !important;
  margin: 0px 0px 0px 0px !important;
  box-sizing: border-box !important;
}

yt-live-chat-text-message-renderer #message * {
  color: var(--color-message-text) !important;
  font-family: "Imprima" !important;
  font-size: 18px !important;
  line-height: normal !important;
  letter-spacing: normal !important;
}


yt-live-chat-text-message-renderer[author-type="owner"] #message {
  background: var(--background-owner) !important;
  color: var(--color-message-text) !important;
}

yt-live-chat-text-message-renderer[author-type="moderator"] #message {
  background: var(--background-moderator) !important;
}

yt-live-chat-text-message-renderer[author-type="member"] #message,
yt-live-chat-text-message-renderer:has(yt-live-chat-author-badge-renderer[type="moderator"]):has(yt-live-chat-author-badge-renderer[type="member"]) #message {
  background: var(--background-member) !important;
  background-size: 200% 100%;
  background-position: 0 0;
  animation: shimmer 2s linear infinite;
}

yt-live-chat-paid-message-renderer #author-name,
yt-live-chat-paid-message-renderer #author-name *,
yt-live-chat-legacy-paid-message-renderer #event-text,
yt-live-chat-legacy-paid-message-renderer #event-text *,
yt-live-chat-paid-message-renderer #purchase-amount,
yt-live-chat-paid-message-renderer #purchase-amount *,
yt-live-chat-legacy-paid-message-renderer #detail-text,
yt-live-chat-legacy-paid-message-renderer #detail-text *,
yt-live-chat-paid-message-renderer #content,
yt-live-chat-paid-message-renderer #content *,
yt-live-chat-ticker-paid-message-item-renderer,
yt-live-chat-ticker-paid-message-item-renderer *,
yt-live-chat-ticker-sponsor-item-renderer,
yt-live-chat-ticker-sponsor-item-renderer * {
  color: var(--color-white) !important;
}

yt-live-chat-paid-message-renderer,
yt-live-chat-legacy-paid-message-renderer {
  margin: 4px 0 !important;
}

yt-live-chat-legacy-paid-message-renderer {
  background-color: var(--color-member-badge) !important;
  margin: 4px 0 !important;
}

yt-live-chat-text-message-renderer a,
yt-live-chat-legacy-paid-message-renderer a {
  text-decoration: none !important;
}

yt-live-chat-ticker-renderer {
  box-shadow: none !important;
}
yt-live-chat-ticker-renderer {
  display: none !important;
}

@keyframes anim {
0% { opacity: 0; }
100% { opacity: 1; transform: none;}
}

yt-live-chat-text-message-renderer,
yt-live-chat-legacy-paid-message-renderer {
  animation: anim 200ms;
  animation-fill-mode: forwards;
}


yt-live-chat-item-list-renderer #items yt-live-chat-text-message-renderer:nth-last-of-type(n+4),
yt-live-chat-text-message-renderer[is-deleted],
yt-live-chat-text-message-renderer[is-deleted] *,
yt-live-chat-legacy-paid-message-renderer[is-deleted],
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
yt-live-chat-text-message-renderer yt-icon,
yt-live-chat-text-message-renderer yt-live-chat-author-chip-renderer,
yt-button-view-model {
  display: none !important;
}

@keyframes chat_bounce {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }

  60% {
    transform: translateY(-5px);
    opacity: 1;
  }

  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }

  100% {
    background-position: -100% 0;
  }
}
`;