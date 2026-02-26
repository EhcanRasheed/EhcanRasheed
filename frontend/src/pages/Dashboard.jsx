import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  return (
    <div style={styles.workspace}>
      {/* FIXED SIDEBAR - ALWAYS VISIBLE AT 280px */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logoBox}>HC</div>
          <span style={styles.brandName}>HireCraft</span>
        </div>

        <nav style={styles.sideNav}>
          <Link to="/dashboard" style={styles.sideNavLinkActive}>
            Home
          </Link>
          <Link to="/resume" style={styles.sideNavLink}>
            Resume Lab
          </Link>
          <Link to="/chatbot" style={styles.sideNavLink}>
            Chatbot
          </Link>
          <Link to="/interview" style={styles.sideNavLink}>
            Interview Preparation
          </Link>

          <div
            style={styles.accountTabTrigger}
            onClick={() => setIsAccountOpen(!isAccountOpen)}
          >
            <span>Account</span>
            <span
              style={{
                transform: isAccountOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: '0.2s',
              }}
            >
              ▼
            </span>
          </div>

          {isAccountOpen && (
            <div style={styles.nestedMenu}>
              <Link to="/change-username" style={styles.nestedLink}>
                Change Username
              </Link>
              <Link to="/change-password" style={styles.nestedLink}>
                Change Password
              </Link>
              <Link to="/subscription" style={styles.nestedLink}>
                Subscription Plan
              </Link>
              <button
                style={styles.logoutTrigger}
                onClick={() => setShowLogoutModal(true)}
              >
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

      <main style={styles.mainContent}>
        <header style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>
              Welcome, {user?.name || 'Professional'}
            </h1>
            <p style={styles.subText}>
              Your AI-powered career command center.
            </p>
          </div>
        </header>

        <div style={styles.grid}>
          <div style={styles.card} onClick={() => navigate('/resume')}>
            <h3 style={styles.cardTitle}>Resume Analysis</h3>
            <p style={styles.cardDesc}>
              Upload your document for deep-dive ATS keyword scanning and structural optimization.
            </p>
          </div>

          <div style={styles.card} onClick={() => navigate('/chatbot')}>
            <h3 style={styles.cardTitle}>Chatbot</h3>
            <p style={styles.cardDesc}>
              Engage in casual practice with Crafty to refine your technical explanations and logic.
            </p>
          </div>

          <div style={styles.card} onClick={() => navigate('/interview')}>
            <h3 style={styles.cardTitle}>Interview Preparation</h3>
            <p style={styles.cardDesc}>
              Participate in a formal AI-driven simulation for your target role and industry.
            </p>
          </div>

          <div style={styles.enterpriseCard} onClick={() => navigate('/hiring-ease')}>
            <h3 style={styles.cardTitle}>Hiring Ease</h3>
            <p style={styles.cardDesc}>
              Mass interview tools for corporations using shared access links.
            </p>
            <button style={styles.maroonBtn}>Manage Enterprise</button>
          </div>
        </div>

        <footer style={styles.footer}>
          <div style={styles.footerGrid}>
            <div style={styles.footerBrandCol}>
              <div style={styles.footerLogoRow}>
                <div style={styles.logoBoxSmall}>HC</div>
                <span style={styles.footerBrandName}>HireCraft</span>
              </div>
              <p style={styles.footerDescription}>
                Crafting the future of recruitment through generative AI and data-driven insights.
              </p>
            </div>
            <div style={styles.footerNavCol}>
              <h4 style={styles.footerHeader}>Product</h4>
              <span style={styles.footerLink} onClick={() => navigate('/resume')}>Resume Lab</span>
              <span style={styles.footerLink} onClick={() => navigate('/chatbot')}>AI Chatbot</span>
              <span style={styles.footerLink} onClick={() => navigate('/interview')}>Mock Interviews</span>
            </div>
          </div>
          <div style={styles.copyrightSection}>
            <p>© 2026 HireCraft AI. All rights reserved.</p>
          </div>
        </footer>
      </main>

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Sign Out?</h2>
            <p style={styles.modalText}>
              Are you sure you want to end your session?
            </p>
            <div style={styles.modalActions}>
              <button
                style={styles.cancelBtn}
                onClick={() => setShowLogoutModal(false)}
              >
                Stay
              </button>
              <button style={styles.confirmBtn} onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  workspace: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    color: '#d1d5db',
    fontFamily: "'Inter', sans-serif",
  },

  sidebar: {
    width: '280px',
    background: 'rgba(26, 26, 26, 0.5)',
    backdropFilter: 'blur(12px)',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    padding: '32px 24px 200px 24px',
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    zIndex: 100,
  },

  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '40px',
  },

  logoBox: {
    width: 34,
    height: 34,
    background: 'linear-gradient(135deg, #FF8C00 0%, #A4C639 100%)',
    borderRadius: '8px',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
  },

  brandName: {
    fontWeight: 700,
    fontSize: '1.2rem',
    color: '#d1d5db',
  },

  sideNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },

  sideNavLink: {
    textDecoration: 'none',
    color: '#9ca3af',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
  },

  sideNavLinkActive: {
    textDecoration: 'none',
    color: '#A4C639',
    background: 'rgba(164, 198, 57, 0.12)',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    border: '1px solid rgba(164, 198, 57, 0.2)',
  },

  accountTabTrigger: {
    cursor: 'pointer',
    color: '#9ca3af',
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: 500,
  },

  nestedMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    paddingLeft: '24px',
    marginBottom: '8px',
    borderLeft: '2px solid rgba(164, 198, 57, 0.2)',
    marginLeft: '16px',
  },

  nestedLink: {
    textDecoration: 'none',
    color: '#6b7280',
    padding: '8px 12px',
    fontSize: '13px',
  },

  premiumDivider: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginTop: '32px',
    marginBottom: '8px',
    paddingLeft: '16px',
  },

  premiumLink: {
    textDecoration: 'none',
    color: '#FF8C00',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255, 140, 0, 0.12)',
    border: '1px solid rgba(255, 140, 0, 0.2)',
  },

  badge: {
    fontSize: '10px',
    background: '#FF8C00',
    color: '#1a1a1a',
    padding: '2px 6px',
    borderRadius: '4px',
  },

  logoutTrigger: {
    width: '100%',
    background: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    padding: '10px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#ef4444',
    fontWeight: 600,
    fontSize: '14px',
    marginTop: '8px',
    textAlign: 'left',
  },

  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '48px 60px',
    marginLeft: '280px',
  },

  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
  },

  pageTitle: {
    fontSize: '1.8rem',
    fontWeight: 800,
    color: '#d1d5db',
    margin: 0,
  },

  subText: {
    color: '#9ca3af',
    fontSize: '14px',
    marginTop: '4px',
  },

  grid: {
    display: 'grid',
    gap: '24px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  },

  card: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(164, 198, 57, 0.2)',
    padding: '32px',
    borderRadius: '24px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  enterpriseCard: {
    background: 'rgba(255, 140, 0, 0.08)',
    backdropFilter: 'blur(12px)',
    border: '1.5px solid rgba(255, 140, 0, 0.4)',
    borderTop: '2px solid rgba(255, 140, 0, 0.6)',
    padding: '32px',
    borderRadius: '24px',
    transition: 'all 0.3s ease',
  },

  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#d1d5db',
    marginBottom: '12px',
  },

  cardDesc: {
    color: '#9ca3af',
    fontSize: '14px',
    lineHeight: 1.6,
    marginBottom: '24px',
  },

  maroonBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: '12px',
    background: '#FF8C00',
    border: 'none',
    color: '#1a1a1a',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  footer: {
    marginTop: '80px',
    paddingTop: '60px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
  },

  footerGrid: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '48px',
  },

  footerBrandCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  footerLogoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  logoBoxSmall: {
    width: 30,
    height: 30,
    background: 'linear-gradient(135deg, #FF8C00 0%, #A4C639 100%)',
    borderRadius: '6px',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '12px',
  },

  footerBrandName: {
    fontWeight: 700,
    fontSize: '1.1rem',
    color: '#d1d5db',
  },

  footerDescription: {
    color: '#9ca3af',
    fontSize: '14px',
    lineHeight: 1.6,
    maxWidth: '300px',
  },

  footerNavCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  footerHeader: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#d1d5db',
    marginBottom: '8px',
    textTransform: 'uppercase',
  },

  footerLink: {
    textDecoration: 'none',
    color: '#9ca3af',
    fontSize: '14px',
    cursor: 'pointer',
  },

  copyrightSection: {
    padding: '24px 0',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '13px',
  },

  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(15, 15, 15, 0.7)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },

  modal: {
    background: 'rgba(26, 26, 26, 0.8)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '40px',
    borderRadius: '24px',
    width: '380px',
    textAlign: 'center',
  },

  modalTitle: {
    marginBottom: '12px',
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#d1d5db',
  },

  modalText: {
    color: '#9ca3af',
    fontSize: '14px',
    marginBottom: '24px',
  },

  modalActions: {
    display: 'flex',
    gap: '12px',
  },

  confirmBtn: {
    flex: 1,
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '14px',
    borderRadius: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  },

  cancelBtn: {
    flex: 1,
    background: 'rgba(164, 198, 57, 0.15)',
    border: '1px solid rgba(164, 198, 57, 0.3)',
    color: '#A4C639',
    padding: '14px',
    borderRadius: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
