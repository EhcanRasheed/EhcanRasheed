import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.codeWrap}>
          <span style={styles.four}>4</span>
          <span style={styles.zero}>0</span>
          <span style={styles.four}>4</span>
        </div>
        <h1 style={styles.title}>Page Not Found</h1>
        <p style={styles.subtitle}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={styles.btnRow}>
          <button
            style={styles.primaryBtn}
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
          >
            {isAuthenticated ? 'Back to Dashboard' : 'Back to Home'}
          </button>
          <button style={styles.ghostBtn} onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100vw',
    background: '#0a0a0b',
    padding: '20px',
    boxSizing: 'border-box',
    fontFamily: "'Inter', sans-serif",
  },
  card: {
    textAlign: 'center',
    maxWidth: '480px',
    width: '100%',
  },
  codeWrap: {
    display: 'flex',
    justifyContent: 'center',
    gap: '4px',
    marginBottom: '32px',
  },
  four: {
    fontSize: 'clamp(80px, 16vw, 140px)',
    fontWeight: 900,
    background: '#c4a052',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-4px',
    lineHeight: 1,
  },
  zero: {
    fontSize: 'clamp(80px, 16vw, 140px)',
    fontWeight: 900,
    color: 'rgba(255,255,255,0.06)',
    letterSpacing: '-4px',
    lineHeight: 1,
  },
  title: {
    fontSize: 'clamp(22px, 4vw, 32px)',
    fontWeight: 800,
    color: '#e8e8eb',
    margin: '0 0 12px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#6b6b70',
    lineHeight: 1.65,
    margin: '0 0 36px',
  },
  btnRow: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  primaryBtn: {
    padding: '13px 32px',
    borderRadius: '12px',
    background: '#c4a052',
    border: 'none',
    color: '#0a0a0b',
    fontWeight: 700,
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  ghostBtn: {
    padding: '13px 32px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#86868b',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
  },
};
