import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SubscriptionPlan() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isNavbarVisible, setIsNavbarVisible] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/auth/logout', { method: 'POST', credentials: 'include' });
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
          <Link to="/interview" style={styles.sideNavLink}>Interview Preparation</Link>
          
          <div style={styles.accountTabTrigger} onClick={() => setIsAccountOpen(!isAccountOpen)}>
            <span>Account</span>
            <span style={{ transform: isAccountOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }}>▼</span>
          </div>
          
          {isAccountOpen && (
            <div style={styles.nestedMenu}>
              <Link to="/change-username" style={styles.nestedLink}>Change Username</Link>
              <Link to="/change-password" style={styles.nestedLink}>Change Password</Link>
              <Link to="/subscription" style={styles.nestedLinkActive}>Subscription Plan</Link>
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

      {/* MAIN WORKSPACE */}
      <main style={{
        ...styles.mainContent,
        paddingLeft: isNavbarVisible ? '320px' : '60px'
      }}>
        <header style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>Subscription Plan</h1>
            <p style={styles.subText}>Manage your subscription and billing</p>
          </div>
        </header>

        <div style={styles.planCard}>
          <div style={styles.badge}>Active</div>
          <h3 style={styles.planTitle}>Professional Tier</h3>
          <p style={styles.planDesc}>
            You currently have full access to the AI Resume Lab and Interview Chatbot.
          </p>
          
          <div style={styles.featuresList}>
            <div style={styles.featureItem}>
              <span style={styles.checkmark}>✓</span>
              <span>Resume Analysis & ATS Optimization</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.checkmark}>✓</span>
              <span>AI Interview Chatbot</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.checkmark}>✓</span>
              <span>Interview Preparation Tools</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.checkmark}>✓</span>
              <span>Priority Support</span>
            </div>
          </div>

          <button style={styles.maroonBtn} onClick={() => navigate('/dashboard')}>
            Back to Dashboard
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
  workspace: { display: 'flex', minHeight: '100vh', width: '100vw', fontFamily: "'Inter', sans-serif", overflowX: 'hidden' },
  
  navbarTriggerLine: { position: 'fixed', left: 0, top: 0, bottom: 0, width: '12px', zIndex: 150, background: 'linear-gradient(180deg, #FF8C00 0%, #A4C639 100%)', cursor: 'pointer' },
  
  sidebar: { background: 'rgba(26, 26, 26, 0.5)', backdropFilter: 'blur(12px)', borderRight: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', padding: '32px 24px 200px 24px', position: 'fixed', left: 0, top: 0, height: '100vh', zIndex: 200, transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease', overflow: 'hidden' },
  
  sidebarHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', whiteSpace: 'nowrap', cursor: 'pointer' },
  logoBox: { minWidth: '34px', height: '34px', background: 'linear-gradient(135deg, #FF8C00 0%, #A4C639 100%)', borderRadius: '8px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 },
  brandName: { fontWeight: 700, fontSize: '1.2rem', color: '#d1d5db' },
  
  sideNav: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, whiteSpace: 'nowrap' },
  sideNavLink: { textDecoration: 'none', color: '#9ca3af', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 500 },
  sideNavLinkActive: { textDecoration: 'none', color: '#A4C639', background: 'rgba(164, 198, 57, 0.12)', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, border: '1px solid rgba(164, 198, 57, 0.2)' },
  accountTabTrigger: { cursor: 'pointer', color: '#9ca3af', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 500 },
  nestedMenu: { display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '24px', marginBottom: '8px', borderLeft: '2px solid rgba(164, 198, 57, 0.2)', marginLeft: '16px' },
  nestedLink: { textDecoration: 'none', color: '#6b7280', padding: '8px 12px', fontSize: '13px' },
  nestedLinkActive: { textDecoration: 'none', color: '#FF8C00', padding: '8px 12px', fontSize: '13px', fontWeight: 600 },
  
  premiumDivider: { fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '32px', marginBottom: '8px', paddingLeft: '16px' },
  premiumLink: { textDecoration: 'none', color: '#FF8C00', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 140, 0, 0.12)', border: '1px solid rgba(255, 140, 0, 0.2)' },
  badge: { fontSize: '10px', background: '#FF8C00', color: '#1a1a1a', padding: '2px 6px', borderRadius: '4px' },
  
  logoutTrigger: { width: '100%', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', color: '#ef4444', fontWeight: 600, fontSize: '14px', marginTop: '8px', textAlign: 'left' },
  
  mainContent: { flex: 1, padding: '48px 60px', display: 'flex', flexDirection: 'column', transition: 'padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' },
  topBar: { display: 'flex', justifyContent: 'space-between', marginBottom: '32px' },
  pageTitle: { fontSize: '1.8rem', fontWeight: 800, color: '#d1d5db', margin: 0 },
  subText: { color: '#9ca3af', fontSize: '14px', marginTop: '4px' },
  
  planCard: { background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(12px)', borderRadius: '24px', padding: '40px', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)', maxWidth: '600px' },
  planTitle: { fontSize: '1.5rem', fontWeight: 700, color: '#d1d5db', marginBottom: '16px', marginTop: '12px' },
  planDesc: { color: '#9ca3af', fontSize: '14px', lineHeight: '1.6', marginBottom: '32px' },
  featuresList: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' },
  featureItem: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#d1d5db' },
  checkmark: { color: '#22c55e', fontWeight: 700, fontSize: '18px' },
  maroonBtn: { width: '100%', padding: '14px', borderRadius: '12px', background: '#FF8C00', border: 'none', color: '#1a1a1a', fontWeight: 600, cursor: 'pointer', fontSize: '16px' },

  overlay: { position: 'fixed', inset: 0, background: 'rgba(15, 15, 15, 0.7)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 300 },
  modal: { background: 'rgba(26, 26, 26, 0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '40px', borderRadius: '24px', width: '380px', textAlign: 'center' },
  modalTitle: { marginBottom: '12px', fontSize: '1.5rem', fontWeight: 800, color: '#d1d5db' },
  modalText: { color: '#9ca3af', fontSize: '14px', marginBottom: '24px' },
  modalActions: { display: 'flex', gap: '12px' },
  confirmBtn: { flex: 1, background: '#ef4444', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' },
  cancelBtn: { flex: 1, background: 'rgba(164, 198, 57, 0.15)', border: '1px solid rgba(164, 198, 57, 0.3)', color: '#A4C639', padding: '14px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }
};
