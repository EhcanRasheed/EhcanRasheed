/**
 * HireCraft Linear/Dark SaaS Style Template
 * Copy this template and customize for your page
 * 
 * Usage: Replace `const styles = {...}` in your component with the appropriate template below
 */

// ============================================================================
// TEMPLATE 1: AUTH PAGE (Login, Register, VerifyOtp, ForgotPassword, ResetPassword)
// ============================================================================

export const authPageStylesTemplate = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#030303',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    position: 'relative',
    overflow: 'hidden',
  },

  auroraGlow: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'rgba(79, 70, 229, 0.15)',
    filter: 'blur(120px)',
    pointerEvents: 'none',
    top: '-200px',
    right: '-200px',
  },

  form: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    padding: '48px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    maxWidth: '420px',
    width: '100%',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    position: 'relative',
    zIndex: 10,
  },

  logoSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '40px',
  },

  logoBox: {
    width: '44px',
    height: '44px',
    background: '#ffffff',
    borderRadius: '8px',
    color: '#030303',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '20px',
    marginBottom: '16px',
  },

  title: {
    fontSize: '1.8rem',
    fontWeight: 800,
    color: '#ffffff',
    margin: 0,
    textAlign: 'center',
    letterSpacing: '-0.02em',
  },

  subtitle: {
    fontSize: '13px',
    color: '#888888',
    marginTop: '8px',
    textAlign: 'center',
    fontWeight: 400,
  },

  inputGroup: {
    marginBottom: '20px',
  },

  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '8px',
  },

  input: {
    width: '100%',
    padding: '12px 14px',
    fontSize: '13px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    outline: 'none',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },

  inputFocus: {
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  button: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '13px',
    fontWeight: '700',
    background: '#ffffff',
    color: '#030303',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '12px',
    transition: 'all 0.2s ease',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    letterSpacing: '-0.02em',
  },

  buttonHover: {
    background: '#f5f5f5',
  },

  buttonDisabled: {
    backgroundColor: '#555555',
    cursor: 'not-allowed',
    color: '#888888',
  },

  errorMsg: {
    color: '#ef4444',
    fontSize: '12px',
    marginBottom: '20px',
    padding: '12px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: '8px',
    textAlign: 'center',
    border: '1px solid rgba(239, 68, 68, 0.2)',
  },

  successMsg: {
    color: '#10b981',
    fontSize: '12px',
    marginBottom: '20px',
    padding: '12px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '8px',
    textAlign: 'center',
    border: '1px solid rgba(16, 185, 129, 0.2)',
  },

  link: {
    color: '#ffffff',
    textDecoration: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
  },

  linkHover: {
    color: '#f5f5f5',
  },
};

// ============================================================================
// TEMPLATE 2: APP PAGE WITH SIDEBAR (Dashboard, Chatbot, Resume, Interview, etc.)
// ============================================================================

export const appPageStylesTemplate = {
  workspace: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    background: '#030303',
    color: '#ffffff',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    position: 'relative',
    overflow: 'hidden',
  },

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
    width: '40px',
    height: '40px',
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
    fontSize: '1rem',
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
    color: '#888888',
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
    fontWeight: '600',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  divider: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.08)',
    margin: '12px 0',
  },

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
    fontSize: '2.2rem',
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: '-0.02em',
    margin: 0,
  },

  subText: {
    color: '#888888',
    fontSize: '14px',
    marginTop: '8px',
    fontWeight: 400,
  },

  card: {
    background: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '32px',
    transition: 'all 0.3s ease',
  },

  cardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },

  button: {
    backgroundColor: '#ffffff',
    color: '#030303',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '13px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    letterSpacing: '-0.02em',
  },

  buttonHover: {
    background: '#f5f5f5',
  },

  buttonSecondary: {
    backgroundColor: 'transparent',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    padding: '10px 16px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '13px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },

  buttonSecondaryHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.20)',
  },

  buttonDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.2)',
  },

  input: {
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    fontSize: '13px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#ffffff',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    outline: 'none',
    transition: 'all 0.2s ease',
  },

  inputFocus: {
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

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
    color: '#888888',
    fontSize: '13px',
    marginBottom: '32px',
  },

  modalActions: {
    display: 'flex',
    gap: '12px',
  },
};

// ============================================================================
// COLOR CONSTANTS
// ============================================================================

export const colors = {
  // Base
  background: '#030303',
  foreground: '#ffffff',
  muted: '#888888',
  mutedDarker: '#666666',

  // Glass
  glass: 'rgba(255, 255, 255, 0.02)',
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.12)',

  // Status
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

// ============================================================================
// IMPLEMENTATION INSTRUCTIONS
// ============================================================================

/*
1. FOR AUTH PAGES:
   - Copy `authPageStylesTemplate`
   - Paste into your component: `const styles = { ...authPageStylesTemplate };`
   - Add <div style={styles.auroraGlow}></div> before the form in JSX
   - Customize colors if needed using `colors` constants

2. FOR APP PAGES WITH SIDEBAR:
   - Copy `appPageStylesTemplate`
   - Paste into your component: `const styles = { ...appPageStylesTemplate };`
   - Adjust padding for mainContent if sidebar width changes
   - Add custom styles for page-specific elements

3. HOVER STATES:
   - Use conditional styling: {...styles.button, ...(hoveredBtn && styles.buttonHover)}
   - Or use onMouseEnter/Leave: onMouseEnter={() => setHovered(true)}

4. RESPONSIVE:
   - Current breakpoints designed for 1024px+ screens
   - For mobile, adjust padding: `padding: '20px'` instead of `'60px 80px'`
   - Adjust sidebar width dynamically if needed

5. TESTING:
   - Check all button states (normal, hover, disabled, active)
   - Verify input focus states
   - Test modal overlays
   - Confirm sidebar navigation works
*/
