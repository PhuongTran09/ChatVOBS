import { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import './ChatEditorSection.css';

interface ChatEditorSectionProps {
  onOpenChat?: () => void;
}

export function ChatEditorSection({ onOpenChat }: ChatEditorSectionProps) {
  const { t } = useI18n();
  const [messages, setMessages] = useState([
    { id: 1, user: 'DevStreamer', textKey: 'mock.chat.msg1', role: 'owner' },
    { id: 2, user: 'CyberFan', textKey: 'mock.chat.msg2', role: 'viewer' },
    { id: 3, user: 'CodeLive', textKey: 'mock.chat.msg3', role: 'viewer' },
  ]);

  // Simulate incoming messages for the jumping effect
  useEffect(() => {
    const newMessages = [
      { id: 4, user: 'System', textKey: 'mock.chat.msg4', role: 'mod' },
      { id: 5, user: 'NeonRider', textKey: 'mock.chat.msg5', role: 'viewer' },
      { id: 6, user: 'DevStreamer', textKey: 'mock.chat.msg6', role: 'owner' },
    ];
    let counter = 0;
    
    const interval = setInterval(() => {
      if (counter < newMessages.length) {
        const nextMsg = newMessages[counter];
        setMessages(prev => [...prev.slice(1), nextMsg]);
        counter++;
      } else {
        counter = 0; // Loop the demo
        setMessages([
          { id: Date.now(), user: 'CyberFan', textKey: 'mock.chat.msg7', role: 'viewer' },
          { id: Date.now() + 1, user: 'System', textKey: 'mock.chat.msg8', role: 'mod' },
          { id: Date.now() + 2, user: 'NeonRider', textKey: 'mock.chat.msg9', role: 'viewer' },
        ]);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="chat-editor-section">
      <div className="chat-editor-grid">
        {/* Left Column: Content */}
        <div className="chat-editor-info">
          <span className="badge badge-primary" style={{ marginBottom: '15px', display: 'inline-block' }}>{t('badge.stream_overlays')}</span>
          {/* <h2 className="glitch-text" data-text={t('nav.overlays')}>
            {t('nav.overlays')}
          </h2> */}
          <p className="sys-text description" dangerouslySetInnerHTML={{ __html: t('nav.overlays.desc') }} />
          <button type="button" className="cyber-btn primary-cyan large-btn" onClick={onOpenChat}>
            {t('hero.primary') || 'OPEN CHAT EDITOR'}
          </button>
        </div>

        {/* Right Column: Animated Chat Mockup */}
        <div className="chat-editor-mockup">
          <div className="term-head head-cyan" style={{ borderBottom: '1px solid var(--cyan-dim)', cursor: 'default' }}>
            <div className="head-label">
              <span className="head-dot" style={{ background: 'var(--cyan)', boxShadow: '0 0 8px var(--cyan)' }}></span>
              <span>LIVE_CHAT_PREVIEW.exe</span>
            </div>
            <div className="term-controls">
              <span className="ctrl minimize"></span>
              <span className="ctrl maximize"></span>
              <span className="ctrl close"></span>
            </div>
          </div>
          <div className="mockup-body">
            {messages.map((msg) => (
              <div key={msg.id} className={`mockup-msg ${msg.role}`}>
                <span className="msg-user">{msg.user}:</span>
                <span className="msg-text">{t(msg.textKey as Parameters<typeof t>[0])}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
