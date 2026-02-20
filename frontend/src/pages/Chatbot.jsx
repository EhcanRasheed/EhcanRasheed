import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Chatbot() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: 'I am your HireCraft Interview Mentor. Ask me any question related to your interview.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const renderContent = (text) => {
    if (typeof text !== 'string') return text;
    const parts = text.split(/(\*\*[\s\S]*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      logout();
      localStorage.clear();
      navigate('/login');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    const userText = input.trim();
    const history = messages.slice(1).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content 
    }));

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsProcessing(true);

    try {
      const res = await fetch('http://localhost:3000/chatbot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: userText, history }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessages(prev => [...prev, { role: 'bot', content: data.message || 'Error communicating with AI.' }]);
        return;
      }
      setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: 'Network error. Please try again.' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={styles.workspace}>
      {/* PROFESSIONAL MAROON TRIGGER LINE */}
      <div 
        style={styles.navbarTriggerLine} 
        onMouseEnter={() => setIsNavbarVisible(true)} 
      />

      {/* DYNAMIC SIDEBAR */}
      <aside
        style={{
          ...styles.sidebar,
          width: isNavbarVisible ? '280px' : '0px',
          visibility: isNavbarVisible ? 'visible' : 'hidden',
          opacity: isNavbarVisible ? 1 : 0,
        }}
        onMouseLeave={() => {
          setIsNavbarVisible(false);
          setIsAccountOpen(false);
        }}
      >
        <div style={styles.sidebarHeader} onClick={() => navigate('/dashboard')}>
          <div style={styles.logoBox}>HC</div>
          <span style={styles.brandName}>HireCraft</span>
        </div>

        <nav style={styles.sideNav}>
          <Link to="/dashboard" style={styles.sideNavLink}>Home</Link>
          <Link to="/resume" style={styles.sideNavLink}>Resume Lab</Link>
          <Link to="/chatbot" style={styles.sideNavLinkActive}>Interview Helper</Link>
          <Link to="/interview" style={styles.sideNavLink}>Interview Preparation</Link>

          <div style={styles.accountTabTrigger} onClick={() => setIsAccountOpen(!isAccountOpen)}>
            <span>Account</span>
            <span style={{ transform: isAccountOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }}>▼</span>
          </div>

          {isAccountOpen && (
            <div style={styles.nestedMenu}>
              <Link to="/change-username" style={styles.nestedLink}>Change Username</Link>
              <Link to="/change-password" style={styles.nestedLink}>Change Password</Link>
              <Link to="/subscription" style={styles.nestedLink}>Subscription Plan</Link>
              <button style={styles.logoutTrigger} onClick={() => setShowLogoutModal(true)}>Sign Out</button>
            </div>
          )}

          <div style={styles.premiumDivider}>Enterprise Tier</div>
          <Link to="/hiring-ease" style={styles.premiumLink}>
            <span>Hiring Ease</span>
            <span style={styles.badge}>Pro</span>
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ ...styles.mainContent, paddingLeft: isNavbarVisible ? '320px' : '60px' }}>
        <header style={styles.topBar}>
          <h1 style={styles.pageTitle}>HireCraft Interview Mentor</h1>
          <p style={styles.subText}>Practical AI guidance for your next big opportunity.</p>
        </header>

        <div style={styles.chatCard}>
          <div style={styles.messagesArea}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '20px' }}>
                <div style={{ ...styles.bubble, ...(m.role === 'user' ? styles.userBubble : styles.botBubble) }}>
                  {renderContent(m.content)}
                </div>
                <span style={styles.timestamp}>{m.role === 'user' ? 'You' : 'HireCraft Mentor'}</span>
              </div>
            ))}
            {isProcessing && <div style={styles.processingIndicator}>AI is thinking...</div>}
            <div ref={bottomRef} />
          </div>

          <div style={styles.inputWrapper}>
            <input
              style={styles.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask an interview question..."
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button style={styles.maroonBtnChat} onClick={sendMessage}>Send</button>
          </div>
        </div>
      </main>

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Sign Out?</h2>
            <p style={styles.modalText}>Are you sure you want to end your session?</p>
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setShowLogoutModal(false)}>Stay</button>
              <button style={styles.confirmBtn} onClick={handleLogout}>Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  workspace: { display: 'flex', minHeight: '100vh', width: '100%', background: '#f8fafc', color: '#1e293b', fontFamily: "'Inter', sans-serif", overflowX: 'hidden' },
  navbarTriggerLine: { position: 'fixed', left: 0, top: 0, bottom: 0, width: '12px', zIndex: 150, background: '#800000', cursor: 'pointer' },
  sidebar: { background: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '32px 24px 200px 24px', position: 'fixed', left: 0, top: 0, height: '100vh', zIndex: 200, transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease', overflow: 'hidden' },
  sidebarHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', whiteSpace: 'nowrap', cursor: 'pointer' },
  logoBox: { minWidth: '34px', height: '34px', background: '#0f172a', borderRadius: '8px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 },
  brandName: { fontWeight: 700, fontSize: '1.2rem', color: '#0f172a' },
  sideNav: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, whiteSpace: 'nowrap' },
  sideNavLink: { textDecoration: 'none', color: '#64748b', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 500 },
  sideNavLinkActive: { textDecoration: 'none', color: '#0f172a', background: '#f1f5f9', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600 },
  accountTabTrigger: { cursor: 'pointer', color: '#64748b', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 500 },
  nestedMenu: { display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '24px', marginBottom: '8px', borderLeft: '2px solid #f1f5f9', marginLeft: '16px' },
  nestedLink: { textDecoration: 'none', color: '#94a3b8', padding: '8px 12px', fontSize: '13px' },
  logoutTrigger: { width: '100%', background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', color: '#dc2626', fontWeight: 600, fontSize: '13px', marginTop: '8px', textAlign: 'left' },
  premiumDivider: { fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '32px', marginBottom: '8px', paddingLeft: '16px' },
  premiumLink: { textDecoration: 'none', color: '#800000', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff5f5' },
  badge: { fontSize: '10px', background: '#800000', color: '#fff', padding: '2px 6px', borderRadius: '4px' },
  mainContent: { flex: 1, padding: '48px 60px', transition: 'padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' },
  topBar: { marginBottom: '32px' },
  pageTitle: { fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' },
  subText: { color: '#64748b', fontSize: '14px', marginTop: '6px' },
  chatCard: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', display: 'flex', flexDirection: 'column', height: '70vh', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
  messagesArea: { flex: 1, padding: '32px', overflowY: 'auto' },
  bubble: { padding: '14px 18px', borderRadius: '14px', maxWidth: '75%', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' },
  userBubble: { background: '#800000', color: '#fff' },
  botBubble: { background: '#f1f5f9', color: '#1e293b', fontWeight: 400 },
  timestamp: { fontSize: '11px', color: '#94a3b8', marginTop: '6px' },
  processingIndicator: { fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', paddingLeft: '32px' },
  inputWrapper: { display: 'flex', gap: '16px', padding: '20px 32px', borderTop: '1px solid #f1f5f9' },
  input: { flex: 1, padding: '12px 20px', borderRadius: '25px', border: '1px solid #d1d5db', background: '#f8fafc', outline: 'none' },
  maroonBtnChat: { background: '#800000', color: '#fff', border: 'none', padding: '0 28px', borderRadius: '25px', fontWeight: 600, cursor: 'pointer' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 300 },
  modal: { background: '#fff', padding: '40px', borderRadius: '24px', width: '380px', textAlign: 'center' },
  modalTitle: { marginBottom: '12px', fontSize: '1.5rem', fontWeight: 800 },
  modalText: { color: '#64748b', fontSize: '14px', marginBottom: '24px' },
  modalActions: { display: 'flex', gap: '12px' },
  confirmBtn: { flex: 1, background: '#ef4444', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' },
  cancelBtn: { flex: 1, background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' },
};