import { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import './ChatEditorSection.css';

interface ChatEditorSectionProps {
  onOpenChat?: () => void;
}

export function ChatEditorSection({ onOpenChat }: ChatEditorSectionProps) {
  const { t } = useI18n();
  const [messages, setMessages] = useState([
    { id: 1, user: 'DevStreamer', text: 'Chào mừng các bạn đến với luồng stream!', role: 'owner' },
    { id: 2, user: 'CyberFan', text: 'Chat overlay nhìn ngầu quá anh ơi 😎', role: 'viewer' },
    { id: 3, user: 'CodeLive', text: 'CSS này có nặng không ạ?', role: 'viewer' },
  ]);

  // Simulate incoming messages for the jumping effect
  useEffect(() => {
    const newMessages = [
      { id: 4, user: 'System', text: '0-lag CSS, tối ưu hoàn toàn cho OBS!', role: 'mod' },
      { id: 5, user: 'NeonRider', text: 'Quá mượt! Làm sao để cài đặt vậy?', role: 'viewer' },
      { id: 6, user: 'DevStreamer', text: 'Bấm nút "OPEN CHAT EDITOR" để lấy code nhé!', role: 'owner' },
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
          { id: Date.now(), user: 'CyberFan', text: 'Ủa nó tự lặp lại kìa haha', role: 'viewer' },
          { id: Date.now() + 1, user: 'System', text: 'Đang chạy demo animation đó 🚀', role: 'mod' },
          { id: Date.now() + 2, user: 'NeonRider', text: 'Tuyệt vời, để mình thử cài luôn.', role: 'viewer' },
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
          <span className="badge badge-primary" style={{ marginBottom: '15px', display: 'inline-block' }}>STREAM OVERLAYS</span>
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
                <span className="msg-text">{msg.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
