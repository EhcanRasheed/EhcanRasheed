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
          <span style={styles.brandName}>HireCraft</span>
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
                <p style={styles.footerTitle}>HireCraft</p>
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
            <p>© 2026 HireCraft AI. All rights reserved.</p>
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
    background: '#030303',
    color: '#f5f5f5',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    position: 'relative',
    overflow: 'hidden',
  },

  /* Aurora Background Glow */
  auroraGlow: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'rgba(79, 70, 229, 0.15)',
    filter: 'blur(120px)',
    pointerEvents: 'none',
  },

  /* SIDEBAR */
  sidebar: {
    width: '260px',
    background: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
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
    background: '#ffffff',
    borderRadius: '8px',
    color: '#030303',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '18px',
  },

  brandName: {
    fontWeight: 700,
    fontSize: '1.1rem',
    color: '#ffffff',
    letterSpacing: '-0.02em',
  },

  sideNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
  },

  sideNavLink: {
    textDecoration: 'none',
    color: '#888',
    padding: '10px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },

  sideNavLinkActive: {
    textDecoration: 'none',
    color: '#ffffff',
    background: 'rgba(255, 255, 255, 0.08)',
    padding: '10px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },

  navIcon: {
    fontSize: '14px',
  },

  divider: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.08)',
    margin: '12px 0',
  },

  accountTabTrigger: {
    cursor: 'pointer',
    color: '#888',
    padding: '10px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    fontWeight: 500,
    borderRadius: '6px',
    transition: 'all 0.2s ease',
  },

  nestedMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    paddingLeft: '16px',
    marginBottom: '8px',
    borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
    marginLeft: '12px',
  },

  nestedLink: {
    textDecoration: 'none',
    color: '#666',
    padding: '8px 8px',
    fontSize: '12px',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },

  premiumDivider: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: '24px',
    marginBottom: '8px',
    paddingLeft: '12px',
  },

  premiumLink: {
    textDecoration: 'none',
    color: '#ffffff',
    padding: '10px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },

  badge: {
    fontSize: '9px',
    background: '#ffffff',
    color: '#030303',
    padding: '2px 6px',
    borderRadius: '3px',
    fontWeight: 700,
  },

  logoutTrigger: {
    width: '100%',
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    padding: '10px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#ef4444',
    fontWeight: 600,
    fontSize: '13px',
    marginTop: '8px',
    textAlign: 'left',
    transition: 'all 0.2s ease',
  },

  /* MAIN CONTENT */
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '60px 80px',
    marginLeft: '260px',
    position: 'relative',
    zIndex: 1,
  },

  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '60px',
    paddingBottom: '32px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },

  pageTitle: {
    fontSize: '2.8rem',
    fontWeight: 800,
    color: '#ffffff',
    margin: 0,
    letterSpacing: '-0.02em',
  },

  nameHighlight: {
    color: '#ffffff',
    fontWeight: 900,
  },

  subText: {
    color: '#888',
    fontSize: '14px',
    marginTop: '8px',
    fontWeight: 400,
  },

  /* STATS GRID */
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '60px',
  },

  statCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '24px',
    borderTop: '2px solid #ffffff',
    transition: 'all 0.3s ease',
  },

  statIcon: {
    fontSize: '32px',
    marginBottom: '12px',
  },

  statLabel: {
    fontSize: '11px',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '8px',
    fontWeight: 500,
  },

  statValue: {
    fontSize: '32px',
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: '-0.02em',
  },

  /* CONTENT GRID */
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginBottom: '80px',
  },

  card: {
    background: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
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
    marginBottom: '20px',
  },

  cardTitle: {
    fontSize: '1.3rem',
    fontWeight: 700,
    color: '#ffffff',
    margin: 0,
    letterSpacing: '-0.02em',
  },

  cardBadge: {
    fontSize: '10px',
    background: 'rgba(255, 255, 255, 0.08)',
    color: '#ffffff',
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: 600,
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },

  cardDesc: {
    color: '#888',
    fontSize: '13px',
    lineHeight: 1.6,
    marginBottom: '24px',
    flex: 1,
    fontWeight: 400,
  },

  premiumCard: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },

  /* BUTTONS */
  primaryBtn: {
    background: '#ffffff',
    color: '#030303',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '13px',
    width: 'fit-content',
    letterSpacing: '-0.02em',
  },

  secondaryBtn: {
    flex: 1,
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#ffffff',
    padding: '12px 16px',
    borderRadius: '6px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '13px',
  },

  dangerBtn: {
    flex: 1,
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    padding: '12px 16px',
    borderRadius: '6px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '13px',
  },

  /* FOOTER */
  footer: {
    marginTop: '80px',
    paddingTop: '48px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
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
    background: '#ffffff',
    borderRadius: '6px',
    color: '#030303',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
  },

  footerTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#ffffff',
    margin: '0 0 4px 0',
    letterSpacing: '-0.02em',
  },

  footerSubtitle: {
    fontSize: '12px',
    color: '#888',
    margin: 0,
  },

  footerLinks: {
    display: 'flex',
    gap: '40px',
  },

  footerLink: {
    color: '#888',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    textDecoration: 'none',
  },

  footerBottom: {
    padding: '20px 0',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    textAlign: 'center',
    color: '#666',
    fontSize: '12px',
  },

  /* MODAL */
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(3, 3, 3, 0.6)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },

  modal: {
    background: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    width: '420px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },

  modalContent: {
    padding: '40px',
    textAlign: 'center',
  },

  modalTitle: {
    marginBottom: '12px',
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: '-0.02em',
  },

  modalText: {
    color: '#888',
    fontSize: '13px',
    marginBottom: '32px',
  },

  modalActions: {
    display: 'flex',
    gap: '12px',
  },
};
