import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

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

  formCard: {
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
    lineHeight: '1.6',
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
    letterSpacing: '-0.02em',
  },

  buttonDisabled: {
    backgroundColor: '#555555',
    cursor: 'not-allowed',
    color: '#888888',
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

  footerLink: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '12px',
    color: '#888888',
  },

  maroonLink: {
    color: '#ffffff',
    textDecoration: 'none',
    fontWeight: '700',
    marginLeft: '6px',
  }
};

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // Frontend-only limit: max 3 reset-email requests per email within 1 hour
    try {
      const emailKey = email.trim().toLowerCase();
      const raw = localStorage.getItem('otpRequests');
      const data = raw ? JSON.parse(raw) : {};
      const now = Date.now();

      const existing = Array.isArray(data[emailKey]) ? data[emailKey] : [];
      const recent = existing.filter((ts) => now - ts <= 60 * 60 * 1000); // last 1 hour

      if (recent.length >= 3) {
        setError(
          'You have requested too many reset emails for this address. Please try again after some time.'
        );
        return;
      }

      // Record this new reset / OTP attempt
      recent.push(now);
      data[emailKey] = recent;
      localStorage.setItem('otpRequests', JSON.stringify(data));
    } catch {
      // If localStorage is unavailable or fails, just skip the frontend limit
    }

    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setMessage(res?.message || 'Password reset email sent. Please check your inbox.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error sending reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.auroraGlow}></div>
      <div style={styles.formCard}>
        <div style={styles.logoSection}>
          <div style={styles.logoBox}>HC</div>
          <h2 style={styles.title}>Forgot Password?</h2>
          <p style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {message && <div style={styles.successMsg}>{message}</div>}
        {error && <div style={styles.errorMsg}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              style={styles.input}
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <button
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
              ...(hoveredBtn && !loading ? { background: '#600000' } : {})
            }}
            type="submit"
            disabled={loading}
            onMouseEnter={() => setHoveredBtn(true)}
            onMouseLeave={() => setHoveredBtn(false)}
          >
            {loading ? 'Sending Request...' : 'Send Reset Link'}
          </button>
        </form>

        <div style={styles.footerLink}>
          Remember your password? 
          <Link to="/login" style={styles.maroonLink}>Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
