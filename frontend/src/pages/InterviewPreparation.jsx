import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function InterviewPreparation() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const [isNavbarVisible, setIsNavbarVisible] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } finally {
      logout();
      localStorage.clear();
      navigate('/login');
    }
  };

  return (
    <div style={styles.workspace}>
      
      {/* PROFESSIONAL MAROON TRIGGER LINE */}
      <div 
        style={styles.navbarTriggerLine} 
        onMouseEnter={() => setIsNavbarVisible(true)}
      />

      {/* DYNAMIC SIDEBAR - ONLY SEEN ON HOVER */}
      <aside 
        style={{
          ...styles.sidebar, 
          width: isNavbarVisible ? '280px' : '0px',
          visibility: isNavbarVisible ? 'visible' : 'hidden',
          opacity: isNavbarVisible ? 1 : 0
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
          <Link to="/chatbot" style={styles.sideNavLink}>Chatbot</Link>
          <Link to="/interview" style={styles.sideNavLinkActive}>Interview Preparation</Link>

          <div style={styles.accountTabTrigger} onClick={() => setIsAccountOpen(!isAccountOpen)}>
            <span>Account</span>
            <span style={{ transform: isAccountOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }}>▼</span>
          </div>

          {isAccountOpen && (
            <div style={styles.nestedMenu}>
              <Link to="/change-username" style={styles.nestedLink}>Change Username</Link>
              <Link to="/change-password" style={styles.nestedLink}>Change Password</Link>
              <Link to="/subscription" style={styles.nestedLink}>Subscription Plan</Link>
              <button style={styles.logoutTrigger} onClick={() => setShowLogoutModal(true)}>
                Sign Out
              </button>
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
      <main
        style={{
          ...styles.mainContent,
          paddingLeft: isNavbarVisible ? '320px' : '60px'
        }}
      >
        <div style={styles.launchCard}>
          <div style={styles.badge}>Coming Soon</div>
          <h1 style={styles.launchTitle}>Launch in Progress</h1>
          <p style={styles.launchText}>
            We are currently perfecting our AI simulation engine. This feature will be launching soon 🚀
          </p>
          <button style={styles.maroonBtn} onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </button>
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
  workspace: { display: 'flex', minHeight: '100vh', width: '100%', background: '#030303', color: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif', overflowX: 'hidden', position: 'relative' },
  navbarTriggerLine: { position: 'fixed', left: 0, top: 0, bottom: 0, width: '8px', zIndex: 150, background: 'rgba(255, 255, 255, 0.08)', cursor: 'pointer' },
  sidebar: { background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', padding: '32px 24px 200px 24px', position: 'fixed', left: 0, top: 0, height: '100vh', zIndex: 200, transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease', overflow: 'hidden' },
  sidebarHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', whiteSpace: 'nowrap', cursor: 'pointer' },
  logoBox: { minWidth: '40px', height: '40px', background: '#ffffff', borderRadius: '8px', color: '#030303', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 },
  brandName: { fontWeight: 700, fontSize: '1rem', color: '#ffffff' },
  sideNav: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, whiteSpace: 'nowrap' },
  sideNavLink: { textDecoration: 'none', color: '#888888', padding: '10px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 500 },
  sideNavLinkActive: { textDecoration: 'none', color: '#ffffff', background: 'rgba(255, 255, 255, 0.08)', padding: '10px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, border: '1px solid rgba(255, 255, 255, 0.12)' },
  accountTabTrigger: { cursor: 'pointer', color: '#888888', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: 500 },
  nestedMenu: { display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '16px', marginBottom: '8px', borderLeft: '1px solid rgba(255, 255, 255, 0.08)', marginLeft: '12px' },
  nestedLink: { textDecoration: 'none', color: '#666666', padding: '8px 8px', fontSize: '12px' },
  logoutTrigger: { width: '100%', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px 12px', borderRadius: '6px', cursor: 'pointer', color: '#ef4444', fontWeight: 600, fontSize: '13px', marginTop: '8px', textAlign: 'left' },
  premiumDivider: { fontSize: '10px', fontWeight: 700, color: '#555555', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '24px', marginBottom: '8px', paddingLeft: '12px' },
  premiumLink: { textDecoration: 'none', color: '#ffffff', padding: '10px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)' },
  badge: { fontSize: '9px', background: '#ffffff', color: '#030303', padding: '2px 6px', borderRadius: '3px' },
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', padding: '60px 80px', transition: 'padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 },
  launchCard: { background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '60px', borderRadius: '20px', textAlign: 'center', maxWidth: '600px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)' },
  launchTitle: { fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px', letterSpacing: '-0.02em' },
  launchText: { color: '#888888', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px', fontWeight: 400 },
  maroonBtn: { background: '#ffffff', color: '#030303', border: 'none', padding: '12px 32px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '13px', letterSpacing: '-0.02em' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(3, 3, 3, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 300 },
  modal: { background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '40px', borderRadius: '16px', width: '380px', textAlign: 'center' },
  modalTitle: { marginBottom: '12px', fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' },
  modalText: { color: '#888888', fontSize: '13px', marginBottom: '24px', fontWeight: 400 },
  modalActions: { display: 'flex', gap: '12px' },
  confirmBtn: { flex: 1, background: '#ef4444', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '13px' },
  cancelBtn: { flex: 1, background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }
};
