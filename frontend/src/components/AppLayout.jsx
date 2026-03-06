import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWindowSize } from '../hooks/useWindowSize';
import { HiHome, HiDocumentText, HiChatBubbleLeftRight, HiAcademicCap } from 'react-icons/hi2';
import { HiOutlineUser, HiOutlineLockClosed, HiOutlineCreditCard, HiOutlineArrowRightOnRectangle } from 'react-icons/hi2';
import { HiRocketLaunch, HiCog6Tooth, HiShieldCheck } from 'react-icons/hi2';

/**
 * Shared layout component — sidebar navigation + logout modal.
 *
 * Props:
 *  activePage     – key for the current page ('dashboard', 'chatbot', 'resume', …)
 *  sidebarMode    – 'fixed' (Dashboard) | 'hover' (default, show on hover)
 *  mainClassName  – CSS class for <main> (default: 'main-content')
 *  mainStyle      – override inline style; pass null to omit inline styles entirely
 *  children       – page content rendered inside <main>
 */

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Home', key: 'dashboard', icon: HiHome },
  { to: '/resume', label: 'Resume Analysis', key: 'resume', icon: HiDocumentText },
  { to: '/chatbot', label: 'Chatbot', key: 'chatbot', icon: HiChatBubbleLeftRight },
  { to: '/interview', label: 'Interview Preparation', key: 'interview', icon: HiAcademicCap },
];

const ACCOUNT_ITEMS = [
  { to: '/change-username', label: 'Change Username', key: 'change-username', icon: HiOutlineUser },
  { to: '/change-password', label: 'Change Password', key: 'change-password', icon: HiOutlineLockClosed },
  { to: '/subscription', label: 'Subscription Plan', key: 'subscription', icon: HiOutlineCreditCard },
];

/* Reusable nav link with hover effect */
function NavLink({ to, icon: Icon, label, isActive, style, activeStyle, iconSize = 18 }) {
  const [hovered, setHovered] = useState(false);
  const base = isActive ? activeStyle : style;
  const hoverBg = isActive ? undefined : 'rgba(255,255,255,0.06)';
  const hoverColor = isActive ? undefined : '#c8c8cc';

  return (
    <Link
      to={to}
      style={{
        ...base,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'background 0.2s, color 0.2s',
        ...(hovered && !isActive ? { background: hoverBg, color: hoverColor } : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {Icon && <Icon size={iconSize} style={{ flexShrink: 0 }} />}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
    </Link>
  );
}

const COLLAPSED_WIDTH = 62;  // icon-rail width in px
const EXPANDED_WIDTH = 280;  // full sidebar width in px

export default function AppLayout({
  activePage,
  sidebarMode = 'hover',
  children,
  mainClassName = 'main-content',
  mainStyle: mainStyleProp,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isMobile } = useWindowSize();
  const [isExpanded, setIsExpanded] = useState(sidebarMode === 'fixed');
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      logout();
      localStorage.clear();
      navigate('/login');
    }
  };

  const isHoverMode = sidebarMode === 'hover';
  const sidebarWidth = isHoverMode
    ? (isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH)
    : EXPANDED_WIDTH;

  /* Sidebar style — fixed vs hover */
  const sidebarDynamicStyle =
    sidebarMode === 'fixed'
      ? styles.sidebarFixed
      : {
          ...styles.sidebar,
          width: `${sidebarWidth}px`,
        };

  /* Main content style */
  const computedMainStyle =
    mainStyleProp !== undefined
      ? mainStyleProp || undefined
      : sidebarMode === 'fixed'
        ? styles.mainContentFixed
        : { ...styles.mainContentHover, paddingLeft: `${sidebarWidth + 24}px` };

  return (
    <div className="workspace" style={styles.workspace}>
      {/* Mobile hamburger button */}
      <button
        className="hamburger-btn"
        aria-label="Open navigation"
        onClick={() => setMobileNavOpen(true)}
      >
        ☰
      </button>

      {/* Mobile nav overlay backdrop */}
      {isMobile && mobileNavOpen && (
        <div
          className="mobile-nav-overlay"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar${isMobile && mobileNavOpen ? ' mobile-open' : ''}`}
        style={sidebarDynamicStyle}
        onMouseEnter={isHoverMode ? () => setIsExpanded(true) : undefined}
        onMouseLeave={
          isHoverMode
            ? () => { setIsExpanded(false); setIsAccountOpen(false); }
            : undefined
        }
      >
        <div
          style={{
            ...styles.sidebarHeader,
            cursor: isHoverMode ? 'pointer' : 'default',
            position: 'relative',
          }}
          onClick={isHoverMode ? () => navigate('/dashboard') : undefined}
        >
          {/* Mobile close button */}
          {isMobile && (
            <button
              onClick={(e) => { e.stopPropagation(); setMobileNavOpen(false); }}
              style={{ position: 'absolute', top: 0, right: 0, background: 'none', border: 'none', color: '#86868b', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4 }}
              aria-label="Close navigation"
            >
              ✕
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={styles.logoBox}>HC</div>
            {(isExpanded || !isHoverMode) && (
              <span style={styles.brandName}>HireCraft</span>
            )}
          </div>
          {(isExpanded || !isHoverMode) && user?.fullName && (
            <span style={styles.sidebarUsername}>{user.fullName}</span>
          )}
        </div>

        <nav style={styles.sideNav} onClick={isMobile ? () => setMobileNavOpen(false) : undefined}>
          {NAV_ITEMS.map((item) =>
            isExpanded || !isHoverMode ? (
              <NavLink
                key={item.key}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={activePage === item.key}
                style={styles.sideNavLink}
                activeStyle={styles.sideNavLinkActive}
              />
            ) : (
              /* Collapsed: icon only */
              <Link
                key={item.key}
                to={item.to}
                title={item.label}
                style={{
                  ...(activePage === item.key ? styles.sideNavLinkActive : styles.sideNavLink),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '11px 0',
                }}
              >
                <item.icon size={20} style={{ flexShrink: 0 }} />
              </Link>
            )
          )}

          {/* Account section */}
          {isExpanded || !isHoverMode ? (
            <>
              <div
                style={styles.accountTabTrigger}
                onClick={() => setIsAccountOpen(!isAccountOpen)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <HiCog6Tooth size={18} style={{ flexShrink: 0 }} />
                  <span>Account</span>
                </span>
                <span
                  style={{
                    transform: isAccountOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: '0.2s',
                    fontSize: '12px',
                  }}
                >
                  ▼
                </span>
              </div>

              {isAccountOpen && (
                <div style={styles.nestedMenu}>
                  {ACCOUNT_ITEMS.map((item) => (
                    <NavLink
                      key={item.key}
                      to={item.to}
                      icon={item.icon}
                      label={item.label}
                      isActive={activePage === item.key}
                      style={styles.nestedLink}
                      activeStyle={styles.nestedLinkActive}
                      iconSize={16}
                    />
                  ))}
                  <button
                    style={styles.logoutTrigger}
                    onClick={() => setShowLogoutModal(true)}
                  >
                    <HiOutlineArrowRightOnRectangle size={16} style={{ flexShrink: 0 }} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Collapsed: account icon only */
            <div
              title="Account"
              style={{
                ...styles.accountTabTrigger,
                justifyContent: 'center',
                padding: '11px 0',
              }}
              onClick={() => { setIsExpanded(true); setIsAccountOpen(true); }}
            >
              <HiCog6Tooth size={20} />
            </div>
          )}

          {/* Enterprise section */}
          {isExpanded || !isHoverMode ? (
            <>
              <div style={styles.premiumDivider}>Enterprise Tier</div>
              <NavLink
                to="/hiring-ease"
                icon={HiRocketLaunch}
                label="Hiring Ease"
                isActive={activePage === 'hiring-ease'}
                style={styles.premiumLink}
                activeStyle={styles.premiumLinkActive}
              />
            </>
          ) : (
            <Link
              to="/hiring-ease"
              title="Hiring Ease (Pro)"
              style={{
                ...(activePage === 'hiring-ease' ? styles.premiumLinkActive : styles.premiumLink),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '11px 0',
                marginTop: '32px',
              }}
            >
              <HiRocketLaunch size={20} />
            </Link>
          )}

          {/* Admin Panel — only visible to admin users */}
          {user?.role === 'admin' && (
            isExpanded || !isHoverMode ? (
              <>
                <div style={styles.premiumDivider}>Admin</div>
                <NavLink
                  to="/admin"
                  icon={HiShieldCheck}
                  label="Admin Panel"
                  isActive={activePage === 'admin'}
                  style={styles.premiumLink}
                  activeStyle={styles.premiumLinkActive}
                />
              </>
            ) : (
              <Link
                to="/admin"
                title="Admin Panel"
                style={{
                  ...(activePage === 'admin' ? styles.premiumLinkActive : styles.premiumLink),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '11px 0',
                  marginTop: '8px',
                }}
              >
                <HiShieldCheck size={20} />
              </Link>
            )
          )}
        </nav>
      </aside>

      {/* Main content area */}
      <main className={mainClassName} style={computedMainStyle}>
        {children}
      </main>

      {/* Logout modal */}
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

/* ─── Shared layout styles ─── */

const styles = {
  workspace: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    background: '#0a0a0b',
    color: '#e8e8eb',
    fontFamily: "'Inter', sans-serif",
    overflowX: 'hidden',
  },

  /* Fixed sidebar (Dashboard) */
  sidebarFixed: {
    width: '280px',
    background: '#101012',
    borderRight: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    flexDirection: 'column',
    padding: '32px 20px 200px 20px',
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    zIndex: 100,
  },

  /* Hover sidebar (other pages) — now always visible as icon rail */
  sidebar: {
    background: '#101012',
    borderRight: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    flexDirection: 'column',
    padding: '32px 10px 200px 10px',
    position: 'fixed',
    left: 0,
    top: 0,
    height: '100vh',
    zIndex: 200,
    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
  },

  sidebarHeader: {
    display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '40px',
  },
  sidebarUsername: { fontSize: '12px', color: '#86868b', paddingLeft: '4px' },

  logoBox: {
    minWidth: '36px', height: '36px', background: '#c4a052', borderRadius: '10px',
    color: '#0a0a0b', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 800, fontSize: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  brandName: {
    fontWeight: 700, fontSize: '1.2rem', color: '#e8e8eb', letterSpacing: '-0.3px',
  },

  sideNav: {
    display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, whiteSpace: 'nowrap',
  },
  sideNavLink: {
    textDecoration: 'none', color: '#86868b', padding: '11px 14px',
    borderRadius: '10px', fontSize: '14px', fontWeight: 500,
  },
  sideNavLinkActive: {
    textDecoration: 'none', color: '#e8e8eb', background: 'rgba(196,160,82,0.10)',
    border: '1px solid rgba(196,160,82,0.15)', padding: '11px 14px',
    borderRadius: '10px', fontSize: '14px', fontWeight: 600,
  },

  accountTabTrigger: {
    cursor: 'pointer', color: '#86868b', padding: '11px 14px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontSize: '14px', fontWeight: 500, borderRadius: '10px',
  },
  nestedMenu: {
    display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '14px',
    marginBottom: '8px', borderLeft: '2px solid rgba(196,160,82,0.12)', marginLeft: '14px',
  },
  nestedLink: {
    textDecoration: 'none', color: '#6b6b70', padding: '8px 12px',
    fontSize: '13px', borderRadius: '8px',
  },
  nestedLinkActive: {
    textDecoration: 'none', color: '#d4b062', padding: '8px 12px',
    fontSize: '13px', fontWeight: 600, borderRadius: '8px',
  },

  logoutTrigger: {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)', padding: '10px 12px',
    borderRadius: '8px', cursor: 'pointer', color: '#86868b',
    fontWeight: 600, fontSize: '13px', marginTop: '8px', textAlign: 'left',
    display: 'flex', alignItems: 'center', gap: '10px',
  },

  premiumDivider: {
    fontSize: '10px', fontWeight: 700, color: '#555558', textTransform: 'uppercase',
    letterSpacing: '1.2px', marginTop: '32px', marginBottom: '8px', paddingLeft: '14px',
  },
  premiumLink: {
    textDecoration: 'none', color: '#c4a052', padding: '11px 14px', borderRadius: '10px',
    fontSize: '14px', fontWeight: 600, display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', background: 'rgba(196,160,82,0.06)',
    border: '1px solid rgba(196,160,82,0.10)',
  },
  premiumLinkActive: {
    textDecoration: 'none', color: '#c4a052', padding: '11px 14px', borderRadius: '10px',
    fontSize: '14px', fontWeight: 700, display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', background: 'rgba(196,160,82,0.10)',
    border: '1px solid rgba(196,160,82,0.2)',
  },
  badge: {
    fontSize: '10px', background: '#c4a052', color: '#0a0a0b',
    padding: '2px 8px', borderRadius: '12px', fontWeight: 700,
  },

  /* Main content variants */
  mainContentFixed: {
    flex: 1, display: 'flex', flexDirection: 'column',
    padding: '48px 60px', marginLeft: '280px',
  },
  mainContentHover: {
    flex: 1, display: 'flex', flexDirection: 'column',
    padding: '48px 60px',
    transition: 'padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  /* Modal */
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center',
    alignItems: 'center', zIndex: 300,
  },
  modal: {
    background: '#161618', border: '1px solid rgba(255,255,255,0.1)',
    padding: '40px', borderRadius: '12px', width: '400px', textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  },
  modalTitle: { marginBottom: '12px', fontSize: '1.5rem', fontWeight: 800, color: '#e8e8eb' },
  modalText: { color: '#6b6b70', fontSize: '14px', marginBottom: '28px' },
  modalActions: { display: 'flex', gap: '12px' },
  confirmBtn: {
    flex: 1, background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)', color: '#e8e8eb',
    padding: '14px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer',
  },
  cancelBtn: {
    flex: 1, background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', color: '#86868b',
    padding: '14px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer',
  },
};
