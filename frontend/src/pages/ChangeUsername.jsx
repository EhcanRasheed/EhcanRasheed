import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ChangeUsername() {
  const { user, logout, changeUsername } = useAuth();
  const navigate = useNavigate();
  const [newUsername, setNewUsername] = useState('');
  const [isNavbarVisible, setIsNavbarVisible] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/auth/logout', { method: 'POST', credentials: 'include' });
    } finally {
      logout();
      localStorage.clear();
      navigate('/login');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const trimmed = newUsername.trim();
    if (!trimmed) {
      setError('Please enter a new username');
      setLoading(false);
      return;
    }
    try {
      await changeUsername(trimmed);
      setMessage('Username updated successfully. Your display name has been changed.');
      setNewUsername('');
      setLoading(false);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to update username';
      setError(msg);
      setLoading(false);
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
              <Link to="/change-username" style={styles.nestedLinkActive}>Change Username</Link>
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

      {/* MAIN WORKSPACE */}
      <main style={{
        ...styles.mainContent,
        paddingLeft: isNavbarVisible ? '320px' : '60px'
      }}>
        <header style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>Change Username</h1>
            <p style={styles.subText}>Update your account username</p>
          </div>
        </header>

        <div style={styles.settingsCard}>
          {message && <div style={styles.successMsg}>{message}</div>}
          {error && <div style={styles.errorMsg}>{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Current Username</label>
              <input 
                type="text" 
                style={styles.input} 
                value={user?.name || user?.fullName || ''} 
                disabled
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>New Username</label>
              <input 
                type="text" 
                style={styles.input} 
                value={newUsername} 
                onChange={(e) => setNewUsername(e.target.value)} 
                placeholder="Enter new username"
                required
              />
            </div>
            
            <button 
              type="submit" 
              style={{
                ...styles.maroonBtn,
                ...(loading ? styles.buttonDisabled : {})
              }}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Username'}
            </button>
          </form>
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
  workspace: { display: 'flex', minHeight: '100vh', width: '100vw', background: '#f8fafc', fontFamily: "'Inter', sans-serif", overflowX: 'hidden' },
  
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
  nestedLinkActive: { textDecoration: 'none', color: '#800000', padding: '8px 12px', fontSize: '13px', fontWeight: 600 },
  
  premiumDivider: { fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '32px', marginBottom: '8px', paddingLeft: '16px' },
  premiumLink: { textDecoration: 'none', color: '#800000', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff5f5' },
  badge: { fontSize: '10px', background: '#800000', color: '#fff', padding: '2px 6px', borderRadius: '4px' },
  
  logoutTrigger: { width: '100%', background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', color: '#dc2626', fontWeight: 600, fontSize: '14px', marginTop: '8px', textAlign: 'left' },
  
  mainContent: { flex: 1, padding: '48px 60px', display: 'flex', flexDirection: 'column', transition: 'padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' },
  topBar: { display: 'flex', justifyContent: 'space-between', marginBottom: '32px' },
  pageTitle: { fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: 0 },
  subText: { color: '#64748b', fontSize: '14px', marginTop: '4px' },
  
  settingsCard: { background: '#fff', borderRadius: '24px', padding: '40px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', maxWidth: '600px' },
  inputGroup: { marginBottom: '24px' },
  label: { display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' },
  input: { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box', background: '#fff' },
  maroonBtn: { width: '100%', padding: '14px', borderRadius: '12px', background: '#800000', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '16px' },
  buttonDisabled: { background: '#cbd5e1', cursor: 'not-allowed' },
  successMsg: { padding: '12px 16px', background: '#f0fdf4', color: '#16a34a', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', border: '1px solid #dcfce7' },
  errorMsg: { padding: '12px 16px', background: '#fef2f2', color: '#ef4444', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', border: '1px solid #fee2e2' },

  overlay: { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 300 },
  modal: { background: '#fff', padding: '40px', borderRadius: '24px', width: '380px', textAlign: 'center' },
  modalTitle: { marginBottom: '12px', fontSize: '1.5rem', fontWeight: 800 },
  modalText: { color: '#64748b', fontSize: '14px', marginBottom: '24px' },
  modalActions: { display: 'flex', gap: '12px' },
  confirmBtn: { flex: 1, background: '#ef4444', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' },
  cancelBtn: { flex: 1, background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }
};
