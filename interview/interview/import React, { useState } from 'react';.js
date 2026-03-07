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

  const stats = [
    { label: 'Interviews Completed', value: '12', icon: '🎯', color: '#00d9ff' },
    { label: 'Resume Score', value: '8.5/10', icon: '⭐', color: '#0099ff' },
    { label: 'Learning Streak', value: '7 Days', icon: '🔥', color: '#3b82f6' },
  ];

  return (
    <div style={styles.workspace}>
      {/* PREMIUM SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logoBox}>HC</div>
          <span style={styles.brandName}>Hire-Craft</span>
        </div>

        <nav style={styles.sideNav}>
          <Link to="/dashboard" style={styles.sideNavLinkActive}>
            <span style={styles.navIcon}>⌘</span> Home
          </Link>
          <Link to="/resume" style={styles.sideNavLink}>
            <span style={styles.navIcon}>📄</span> Resume Lab
          </Link>
          <Link to="/chatbot" style={styles.sideNavLink}>
            <span style={styles.navIcon}>💬</span> Chatbot
          </Link>
          <Link to="/interview" style={styles.sideNavLink}>
            <span style={styles.navIcon}>🎤</span> Interview Prep
          </Link>

          <div style={styles.divider}></div>

          <div
            style={styles.accountTabTrigger}
            onClick={() => setIsAccountOpen(!isAccountOpen)}
          >
            <span>⚙️ Account</span>
            <span style={{
              transform: isAccountOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: '0.2s',
            }}>▼</span>
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

          <div style={styles.premiumDivider}>ENTERPRISE</div>
          <Link to="/hiring-ease" style={styles.premiumLink}>
            <span>🚀 Hiring Ease</span>
            <span style={styles.badge}>Pro</span>
          </Link>
        </nav>
      </aside>

      <main style={styles.mainContent}>
        {/* HEADER */}
        <header style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>
              Welcome back, <span style={styles.nameHighlight}>{user?.name || 'Professional'}</span>
            </h1>
            <p style={styles.subText}>
              Your AI-powered career command center
            </p>
          </div>
        </header>

        {/* STATS BENTO GRID */}
        <div style={styles.statsGrid}>
          {stats.map((stat, idx) => (
            <div key={idx} style={{...styles.statCard, borderTopColor: stat.color}}>
              <div style={styles.statIcon}>{stat.icon}</div>
              <p style={styles.statLabel}>{stat.label}</p>
              <p style={{...styles.statValue, color: stat.color}}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* MAIN CONTENT GRID - BENTO STYLE */}
        <div style={styles.contentGrid}>
          {/* RESUME ANALYSIS - LARGE CARD */}
          <div 
            style={{...styles.card, gridColumn: 'span 2', gridRow: 'span 1'}}
            onClick={() => navigate('/resume')}
          >
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>📄 Resume Analysis</h3>
              <div style={styles.cardBadge}>AI Powered</div>
            </div>
            <p style={styles.cardDesc}>
              Upload your document for deep-dive ATS keyword scanning and structural optimization. Get instant feedback on formatting and content.
            </p>
            <button style={styles.primaryBtn}>Start Analysis →</button>
          </div>

          {/* CHATBOT - MEDIUM CARD */}
          <div 
            style={{...styles.card, gridColumn: 'span 1', gridRow: 'span 1'}}
            onClick={() => navigate('/chatbot')}
          >
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>💬 Crafty</h3>
            </div>
            <p style={styles.cardDesc}>
              Practice with AI. Refine technical explanations.
            </p>
            <button style={styles.primaryBtn}>Chat Now →</button>
          </div>

          {/* INTERVIEW PREP - LARGE CARD */}
          <div 
            style={{...styles.card, gridColumn: 'span 1', gridRow: 'span 1'}}
            onClick={() => navigate('/interview')}
          >
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>🎤 Mock Interview</h3>
            </div>
            <p style={styles.cardDesc}>
              Simulate real interviews for your target role.
            </p>
            <button style={styles.primaryBtn}>Practice →</button>
          </div>

          {/* HIRING EASE - PREMIUM CARD */}
          <div 
            style={{...styles.card, ...styles.premiumCard, gridColumn: 'span 2'}}
            onClick={() => navigate('/hiring-ease')}
          >
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>🚀 Hiring Ease</h3>
              <div style={{...styles.cardBadge, background: 'linear-gradient(135deg, #00d9ff, #0099ff)'}}>
                Enterprise
              </div>
            </div>
            <p style={styles.cardDesc}>
              Mass interview tools for corporations using shared access links. Streamline bulk hiring with AI.
            </p>
            <button style={styles.primaryBtn}>Explore Enterprise →</button>
          </div>
        </div>

        {/* FOOTER */}
        <footer style={styles.footer}>
          <div style={styles.footerContent}>
            <div style={styles.footerBrand}>
              <div style={styles.footerLogo}>HC</div>
              <div>
                <p style={styles.footerTitle}>Hire-Craft</p>
                <p style={styles.footerSubtitle}>AI-powered recruitment platform</p>
              </div>
            </div>
            <div style={styles.footerLinks}>
              <a onClick={() => navigate('/resume')} style={styles.footerLink}>Resume Lab</a>
              <a onClick={() => navigate('/chatbot')} style={styles.footerLink}>AI Chatbot</a>
              <a onClick={() => navigate('/interview')} style={styles.footerLink}>Interviews</a>
              <a onClick={() => navigate('/hiring-ease')} style={styles.footerLink}>Enterprise</a>
            </div>
          </div>
          <div style={styles.footerBottom}>
            <p>© 2026 Hire-Craft AI. All rights reserved.</p>
          </div>
        </footer>
      </main>

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h2 style={styles.modalTitle}>Sign Out?</h2>
              <p style={styles.modalText}>Are you sure you want to end your session?</p>
              <div style={styles.modalActions}>
                <button
                  style={styles.secondaryBtn}
                  onClick={() => setShowLogoutModal(false)}
                >
                  Stay
                </button>
                <button style={styles.dangerBtn} onClick={handleLogout}>
                  Sign Out
                </button>
              </div>
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
    background: 'linear-gradient(135deg, #0a0e27 0%, #111827 100%)',
    color: '#f8fafc',
    fontFamily: "'Inter', sans-serif",
  },

  /* SIDEBAR */
  sidebar: {
    width: '280px',
    background: 'rgba(17, 24, 39, 0.95)',
    backdropFilter: 'blur(12px)',
    borderRight: '1px solid rgba(0, 217, 255, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    padding: '32px 24px 200px 24px',
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    zIndex: 100,
    overflow: 'auto',
  },

  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '40px',
  },

  logoBox: {
    width: 40,
    height: 40,
    background: 'linear-gradient(135deg, #00d9ff, #0099ff)',
    borderRadius: '10px',
    color: '#0a0e27',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '18px',
    boxShadow: '0 0 20px rgba(0, 217, 255, 0.3)',
  },

  brandName: {
    fontWeight: 700,
    fontSize: '1.3rem',
    color: '#f8fafc',
    letterSpacing: '-0.5px',
  },

  sideNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },

  sideNavLink: {
    textDecoration: 'none',
    color: '#cbd5e1',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.2s ease',
    ':hover': {
      background: 'rgba(0, 217, 255, 0.1)',
      color: '#00d9ff',
    }
  },

  sideNavLinkActive: {
    textDecoration: 'none',
    color: '#00d9ff',
    background: 'rgba(0, 217, 255, 0.15)',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderLeft: '3px solid #00d9ff',
    paddingLeft: '13px',
  },

  navIcon: {
    fontSize: '16px',
  },

  divider: {
    height: '1px',
    background: 'rgba(0, 217, 255, 0.1)',
    margin: '12px 0',
  },

  accountTabTrigger: {
    cursor: 'pointer',
    color: '#cbd5e1',
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: 500,
    borderRadius: '10px',
    transition: 'all 0.2s ease',
  },

  nestedMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    paddingLeft: '24px',
    marginBottom: '8px',
    borderLeft: '2px solid rgba(0, 217, 255, 0.2)',
    marginLeft: '16px',
  },

  nestedLink: {
    textDecoration: 'none',
    color: '#94a3b8',
    padding: '8px 12px',
    fontSize: '13px',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
  },

  premiumDivider: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginTop: '32px',
    marginBottom: '8px',
    paddingLeft: '16px',
  },

  premiumLink: {
    textDecoration: 'none',
    color: '#00d9ff',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(0, 217, 255, 0.1)',
    border: '1px solid rgba(0, 217, 255, 0.2)',
    transition: 'all 0.2s ease',
  },

  badge: {
    fontSize: '10px',
    background: 'linear-gradient(135deg, #00d9ff, #0099ff)',
    color: '#0a0e27',
    padding: '2px 8px',
    borderRadius: '4px',
    fontWeight: 700,
  },

  logoutTrigger: {
    width: '100%',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    padding: '10px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#ef4444',
    fontWeight: 600,
    fontSize: '14px',
    marginTop: '8px',
    textAlign: 'left',
    transition: 'all 0.2s ease',
  },

  /* MAIN CONTENT */
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
    alignItems: 'flex-start',
    marginBottom: '48px',
    paddingBottom: '24px',
    borderBottom: '1px solid rgba(0, 217, 255, 0.1)',
  },

  pageTitle: {
    fontSize: '2.5rem',
    fontWeight: 800,
    color: '#f8fafc',
    margin: 0,
    letterSpacing: '-1px',
  },

  nameHighlight: {
    background: 'linear-gradient(135deg, #00d9ff, #0099ff)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },

  subText: {
    color: '#cbd5e1',
    fontSize: '16px',
    marginTop: '8px',
  },

  /* STATS GRID */
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginBottom: '48px',
  },

  statCard: {
    background: 'rgba(17, 24, 39, 0.6)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(0, 217, 255, 0.1)',
    borderRadius: '16px',
    padding: '24px',
    borderTop: '3px solid #00d9ff',
    transition: 'all 0.3s ease',
  },

  statIcon: {
    fontSize: '32px',
    marginBottom: '12px',
  },

  statLabel: {
    fontSize: '12px',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },

  statValue: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#00d9ff',
  },

  /* CONTENT GRID */
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    marginBottom: '60px',
  },

  card: {
    background: 'rgba(17, 24, 39, 0.6)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(0, 217, 255, 0.1)',
    borderRadius: '20px',
    padding: '32px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },

  cardTitle: {
    fontSize: '1.4rem',
    fontWeight: 700,
    color: '#f8fafc',
    marginBottom: '0',
  },

  cardBadge: {
    fontSize: '11px',
    background: 'rgba(0, 217, 255, 0.2)',
    color: '#00d9ff',
    padding: '4px 10px',
    borderRadius: '6px',
    fontWeight: 600,
  },

  cardDesc: {
    color: '#cbd5e1',
    fontSize: '14px',
    lineHeight: 1.6,
    marginBottom: '20px',
    flex: 1,
  },

  premiumCard: {
    background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.1), rgba(0, 153, 255, 0.05))',
    borderColor: 'rgba(0, 217, 255, 0.3)',
  },

  /* BUTTONS */
  primaryBtn: {
    background: 'linear-gradient(135deg, #00d9ff, #0099ff)',
    color: '#0a0e27',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '10px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '14px',
    width: 'fit-content',
  },

  secondaryBtn: {
    flex: 1,
    background: 'rgba(203, 213, 225, 0.1)',
    border: '1px solid rgba(203, 213, 225, 0.2)',
    color: '#cbd5e1',
    padding: '14px',
    borderRadius: '10px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  dangerBtn: {
    flex: 1,
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
    padding: '14px',
    borderRadius: '10px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  /* FOOTER */
  footer: {
    marginTop: '60px',
    paddingTop: '40px',
    borderTop: '1px solid rgba(0, 217, 255, 0.1)',
  },

  footerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '40px',
  },

  footerBrand: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
  },

  footerLogo: {
    width: 40,
    height: 40,
    background: 'linear-gradient(135deg, #00d9ff, #0099ff)',
    borderRadius: '8px',
    color: '#0a0e27',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
  },

  footerTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#f8fafc',
    margin: '0 0 4px 0',
  },

  footerSubtitle: {
    fontSize: '13px',
    color: '#94a3b8',
    margin: 0,
  },

  footerLinks: {
    display: 'flex',
    gap: '32px',
  },

  footerLink: {
    color: '#cbd5e1',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    textDecoration: 'none',
  },

  footerBottom: {
    padding: '20px 0',
    borderTop: '1px solid rgba(0, 217, 255, 0.1)',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '13px',
  },

  /* MODAL */
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(10, 14, 39, 0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },

  modal: {
    background: 'rgba(17, 24, 39, 0.95)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(0, 217, 255, 0.2)',
    borderRadius: '20px',
    width: '420px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
  },

  modalContent: {
    padding: '40px',
    textAlign: 'center',
  },

  modalTitle: {
    marginBottom: '12px',
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#f8fafc',
  },

  modalText: {
    color: '#cbd5e1',
    fontSize: '14px',
    marginBottom: '32px',
  },

  modalActions: {
    display: 'flex',
    gap: '12px',
  },
};
