# HireCraft Design System - Linear/Dark SaaS Theme

## Overview
HireCraft has been refactored with a premium Linear/Dark SaaS aesthetic, similar to Vercel and Framer. The design emphasizes minimalism, clarity, and sophisticated interactions with glassmorphism effects and precise typography.

## Color Palette

### Core Colors
- **Background**: `#030303` (true black)
- **Foreground**: `#ffffff` (pure white)
- **Muted**: `#888888`
- **Muted Darker**: `#666666`

### Component Colors
- **Card Background**: `rgba(255, 255, 255, 0.02)` with `backdrop-filter: blur(20px)`
- **Border (Standard)**: `rgba(255, 255, 255, 0.08)` - 1px
- **Border (Light)**: `rgba(255, 255, 255, 0.12)` - For hover states

### Status Colors
- **Success**: `#10b981`
- **Error**: `#ef4444`
- **Warning**: `#f59e0b`
- **Info**: `#3b82f6`

## Typography

- **Font Family**: System-ui, -apple-system, sans-serif
- **Heading**: `fontWeight: 800`, `letterSpacing: '-0.02em'`
- **Body**: `fontWeight: 400`, `fontSize: '13px'`
- **Labels**: `fontWeight: 600`, `fontSize: '13px'`

## Components

### Buttons

**Primary (CTA)**
- Background: `#ffffff`
- Text: `#030303`
- Padding: `12px 16px`
- Border-radius: `8px`
- Hover: Background `#f5f5f5`

**Secondary**
- Background: `transparent`
- Border: `1px solid rgba(255, 255, 255, 0.12)`
- Text: `#ffffff`
- Hover: Background `rgba(255, 255, 255, 0.08)`

**Danger**
- Background: `rgba(239, 68, 68, 0.1)`
- Border: `1px solid rgba(239, 68, 68, 0.2)`
- Text: `#ef4444`

### Forms

**Input Fields**
- Background: `rgba(255, 255, 255, 0.05)`
- Border: `1px solid rgba(255, 255, 255, 0.08)`
- Padding: `12px 14px`
- Border-radius: `8px`
- Focus: Border becomes `rgba(255, 255, 255, 0.12)`, bg becomes `rgba(255, 255, 255, 0.08)`

### Cards
- Background: `rgba(255, 255, 255, 0.02)`
- Border: `1px solid rgba(255, 255, 255, 0.08)`
- Padding: `24-48px` (context dependent)
- Border-radius: `12-20px`
- Backdrop-filter: `blur(20px)`

### Sidebar Navigation
- Width: `260px`
- Same card styling as above
- Link height padding: `10px 12px`
- Active link: Background `rgba(255, 255, 255, 0.08)` + Border

## Glassmorphism

All layered UI elements use:
```css
backdrop-filter: blur(20px);
background: rgba(255, 255, 255, 0.02);
border: 1px solid rgba(255, 255, 255, 0.08);
```

This creates a frosted glass effect that's subtle but visually distinct from the background.

## Aurora Glow (Optional Accent)

Auth pages include a decorative aurora glow:
```javascript
background: 'rgba(79, 70, 229, 0.15)'
filter: 'blur(120px)'
borderRadius: '50%'
```

Position: Top-right, `500px x 500px`

## Refactored Pages

### Completed
- **Dashboard** - Bento grid layout with stats cards
- **Welcome** - Feature showcase with dark cards
- **Login** - Glassmorphic auth form
- **Register** - Extended auth form
- **Chatbot** - Collapsible sidebar with message bubbles

### Styling Pattern
All pages follow this structure:
1. Dark background (`#030303`)
2. Fixed sidebar with glassmorphism (auth pages have overlay)
3. Main content area with `padding: 60px 80px`
4. Cards with consistent border/bg styling
5. White buttons for CTAs

## Remaining Pages

The following pages need refactoring (same pattern as above):
- **Resume.jsx** - Card layout with upload zone
- **InterviewPreparation.jsx** - Question/answer interface
- **VerifyOtp.jsx** - OTP input auth form
- **ForgotPassword.jsx** - Password recovery form
- **ResetPassword.jsx** - Password reset form
- **ChangeUsername.jsx** - Account settings form
- **ChangePassword.jsx** - Account settings form
- **SubscriptionPlan.jsx** - Pricing/subscription cards
- **HiringEase.jsx** - Enterprise feature page

## Quick Refactoring Guide

To refactor remaining pages, replace their `const styles = {...}` with:

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
  form: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '48px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    maxWidth: '420px',
    width: '100%',
    position: 'relative',
    zIndex: 10,
  },
  // ... continue with other styles using colors above
};
```

## Backend Integration

All pages maintain full backend integration:
- Authentication: `AuthContext` with session cookies
- API calls: Configured with `credentials: 'include'`
- Error handling: Proper error states with user feedback
- Loading states: Processing indicators

## Accessibility

- High contrast ratios (white text on dark bg)
- Semantic HTML (proper heading hierarchy)
- Keyboard navigation support
- Clear focus states on interactive elements
- ARIA labels where needed

## Performance

- No animations on page load (smooth scrolling only)
- Minimal CSS in JS (all inline, no external stylesheets)
- System font stack for fast rendering
- Efficient re-renders with React hooks

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Backdrop-filter support required

---

**Last Updated**: February 21, 2026
**Design Inspired by**: Linear, Vercel, Framer
