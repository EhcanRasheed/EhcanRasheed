import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: "'Inter', sans-serif",
  },
  formCard: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(16px) saturate(125%)',
    borderRadius: '24px',
    padding: '40px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.02)',
    maxWidth: '440px',
    width: '100%',
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },
  logoSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '32px',
  },
  logoBox: {
    width: 44,
    height: 44,
    background: 'linear-gradient(135deg, #FF8C00 0%, #A4C639 100%)',
    borderRadius: '12px',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '20px',
    marginBottom: '12px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#d1d5db',
    margin: 0,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '14px',
    color: '#9ca3af',
    marginTop: '8px',
    textAlign: 'center',
    lineHeight: '1.5',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#d1d5db',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    color: '#d1d5db',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    outline: 'none',
    backdropFilter: 'blur(8px)',
  },
  button: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '700',
    background: '#FF8C00',
    color: '#1a1a1a',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    marginTop: '12px',
    transition: 'all 0.3s ease',
  },
  buttonDisabled: {
    backgroundColor: '#6b7280',
    cursor: 'not-allowed',
  },
  successMsg: {
    color: '#22c55e',
    fontSize: '14px',
    marginBottom: '20px',
    padding: '12px',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderRadius: '10px',
    textAlign: 'center',
    border: '1px solid rgba(34, 197, 94, 0.3)',
  },
  errorMsg: {
    color: '#ef4444',
    fontSize: '14px',
    marginBottom: '20px',
    padding: '12px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: '10px',
    textAlign: 'center',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
  footerLink: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '14px',
    color: '#9ca3af',
  },
  maroonLink: {
    color: '#FF8C00',
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
