/**
 * Linear/Dark SaaS Design System
 * Applied across all pages for consistency
 */

export const darkTheme = {
  // Core colors
  background: '#030303',
  foreground: '#ffffff',
  muted: '#888888',
  mutedDarker: '#666666',
  mutedEven: '#555555',
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.12)',
  
  // Component backgrounds
  card: 'rgba(255, 255, 255, 0.02)',
  cardHover: 'rgba(255, 255, 255, 0.04)',
  input: 'rgba(255, 255, 255, 0.05)',
  
  // Status colors
  danger: '#ef4444',
  dangerLight: 'rgba(239, 68, 68, 0.1)',
  dangerBorder: 'rgba(239, 68, 68, 0.2)',
  success: '#10b981',
  successLight: 'rgba(16, 185, 129, 0.1)',
  
  // Typography
  fontFamily: 'system-ui, -apple-system, sans-serif',
};

/**
 * Shared styles for auth pages (login, register, etc.)
 */
export const authPageStyles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: darkTheme.background,
    padding: '20px',
    fontFamily: darkTheme.fontFamily,
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
    backgroundColor: darkTheme.card,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${darkTheme.border}`,
    borderRadius: '16px',
    padding: '48px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    maxWidth: '420px',
    width: '100%',
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
    width: 44,
    height: 44,
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
    color: darkTheme.foreground,
    margin: 0,
    textAlign: 'center',
    letterSpacing: '-0.02em',
  },

  subtitle: {
    fontSize: '13px',
    color: darkTheme.muted,
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
    color: darkTheme.foreground,
    marginBottom: '8px',
  },

  input: {
    width: '100%',
    padding: '12px 14px',
    fontSize: '13px',
    border: `1px solid ${darkTheme.border}`,
    borderRadius: '8px',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    color: darkTheme.foreground,
    backgroundColor: darkTheme.input,
    outline: 'none',
    fontFamily: darkTheme.fontFamily,
  },

  inputFocus: {
    borderColor: darkTheme.borderLight,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  button: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '13px',
    fontWeight: '600',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: darkTheme.fontFamily,
  },

  primaryButton: {
    backgroundColor: '#ffffff',
    color: '#030303',
    letterSpacing: '-0.02em',
  },

  primaryButtonHover: {
    backgroundColor: '#f5f5f5',
  },

  secondaryButton: {
    backgroundColor: 'transparent',
    color: darkTheme.foreground,
    border: `1px solid ${darkTheme.border}`,
    marginTop: '12px',
  },

  secondaryButtonHover: {
    backgroundColor: darkTheme.cardHover,
    borderColor: darkTheme.borderLight,
  },

  link: {
    display: 'flex',
    justifyContent: 'center',
    gap: '4px',
    marginTop: '20px',
    fontSize: '13px',
    color: darkTheme.muted,
    textDecoration: 'none',
  },

  linkHover: {
    color: darkTheme.foreground,
  },

  errorMessage: {
    fontSize: '12px',
    color: darkTheme.danger,
    marginTop: '6px',
  },

  successMessage: {
    fontSize: '12px',
    color: darkTheme.success,
    marginTop: '6px',
  },
};

/**
 * Shared styles for pages with sidebar
 */
export const appPageStyles = {
  workspace: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    background: darkTheme.background,
    color: darkTheme.foreground,
    fontFamily: darkTheme.fontFamily,
    position: 'relative',
    overflow: 'hidden',
  },

  sidebar: {
    width: '260px',
    background: darkTheme.card,
    backdropFilter: 'blur(20px)',
    borderRight: `1px solid ${darkTheme.border}`,
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

  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '60px 80px',
    marginLeft: '260px',
    position: 'relative',
    zIndex: 1,
  },

  card: {
    background: darkTheme.card,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${darkTheme.border}`,
    borderRadius: '16px',
    padding: '32px',
    transition: 'all 0.3s ease',
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
    fontFamily: darkTheme.fontFamily,
    letterSpacing: '-0.02em',
  },

  buttonSecondary: {
    backgroundColor: 'transparent',
    color: darkTheme.foreground,
    border: `1px solid ${darkTheme.border}`,
    padding: '10px 16px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '13px',
    fontFamily: darkTheme.fontFamily,
  },

  buttonDanger: {
    backgroundColor: darkTheme.dangerLight,
    color: darkTheme.danger,
    border: `1px solid ${darkTheme.dangerBorder}`,
  },
};

export default darkTheme;
