# HireCraft Design Refactoring Guide

## Completed Pages
- Dashboard ✅
- Welcome ✅
- Login ✅
- Register ✅
- Chatbot ✅

## Pages Pending Quick Refactor

The following pages follow the same Linear/Dark SaaS pattern and just need their style objects updated. Use the templates below.

### Template 1: Auth Forms (VerifyOtp, ForgotPassword, ResetPassword)

Replace the entire `const styles = {...}` with:

```javascript
const styles = {
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
  inputGroup: { marginBottom: '20px' },
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
  buttonHover: { background: '#f5f5f5' },
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
  link: {
    color: '#ffffff',
    textDecoration: 'none',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
```

Also add `<div style={styles.auroraGlow}></div>` before the form in JSX.

### Template 2: App Pages with Sidebar (Resume, InterviewPreparation, etc.)

For pages with the sidebar navigation (Dashboard pattern):

Replace `const styles = {...}` with:

```javascript
const styles = {
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
  navbarTriggerLine: {
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    width: '8px',
    zIndex: 150,
    background: 'rgba(255, 255, 255, 0.08)',
    cursor: 'pointer',
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
  sideNav: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 },
  sideNavLink: {
    textDecoration: 'none',
    color: '#888888',
    padding: '10px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
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
  // ... add other styles as needed
};
```

### Template 3: Account Settings Pages (ChangeUsername, ChangePassword)

Same as Template 1 (Auth Forms), but with appropriate titles and fields.

### Template 4: Account Pages (SubscriptionPlan, HiringEase)

Same as Template 2 (App Pages with Sidebar), but with card-based layouts for pricing/features.

## Quick Checklist for Each Page

1. Replace `const styles = {...}` with appropriate template above
2. Add `<div style={styles.auroraGlow}></div>` if it's an auth page
3. Update colors in existing JSX conditionals if any
4. Replace any old color references (#eef2f6, #800000, etc.)
5. Keep all functionality and backend integration intact
6. Test form submissions and navigation

## Key Color Mapping

| Old | New | Usage |
|-----|-----|-------|
| #eef2f6 | #030303 | Background |
| #ffffff | #030303 | Dark backgrounds |
| #0f172a | #ffffff | Text/Icons |
| #800000 | #ffffff | Primary button |
| #e2e8f0 | rgba(255,255,255,0.08) | Borders |
| #64748b | #888888 | Secondary text |

## Testing After Refactor

1. Check dark background applies to all pages
2. Verify button hover states work
3. Test form inputs have proper focus states
4. Confirm sidebar navigation appears correctly
5. Check that backend API calls still work
6. Verify auth flow is not broken

## Backend Integration Verification

All pages should maintain:
- `credentials: 'include'` on fetch calls
- Proper error handling with user feedback
- Loading states during API calls
- Redirect to login on auth failure
- Logout functionality with session cleanup

---

**Estimated Time**: 15-20 minutes per page
**Total Pages to Refactor**: 5-9
