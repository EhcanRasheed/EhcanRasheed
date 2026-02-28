import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100vw',
    background: '#0a0a0b',
    padding: '20px',
    fontFamily: "'Inter', sans-serif",
    boxSizing: 'border-box',
  },
  formCard: {
    backgroundColor: '#161618',
    borderRadius: '12px',
    padding: '40px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    maxWidth: '440px',
    width: '100%',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  logoSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '32px',
  },
  logoBox: {
    width: 48,
    height: 48,
    background: '#c4a052',
    borderRadius: '10px',
    color: '#0a0a0b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '20px',
    marginBottom: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
  },
  title: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#e8e8eb',
    margin: 0,
    textAlign: 'center',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b6b70',
    marginTop: '8px',
    textAlign: 'center',
    lineHeight: '1.6',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '700',
    color: '#86868b',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    color: '#e8e8eb',
    backgroundColor: '#1d1d20',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '14px',
    fontSize: '15px',
    fontWeight: '700',
    background: '#c4a052',
    color: '#0a0a0b',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    marginTop: '12px',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  buttonDisabled: {
    opacity: 0.45,
    cursor: 'not-allowed',
  },
  successMsg: {
    color: '#3faa72',
    fontSize: '13px',
    marginBottom: '20px',
    padding: '12px',
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderRadius: '10px',
    textAlign: 'center',
    border: '1px solid rgba(34,197,94,0.25)',
  },
  errorMsg: {
    color: '#dc4a4a',
    fontSize: '13px',
    marginBottom: '20px',
    padding: '12px',
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: '10px',
    textAlign: 'center',
    border: '1px solid rgba(239,68,68,0.25)',
  },
  footerLink: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '14px',
    color: '#6b6b70',
  },
  maroonLink: {
    color: '#d4b062',
    textDecoration: 'none',
    fontWeight: '700',
    marginLeft: '6px',
  }
};

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend-only limit: max 3 reset-email requests per email within 1 hour
    try {
      const emailKey = email.trim().toLowerCase();
      const raw = localStorage.getItem('otpRequests');
      const data = raw ? JSON.parse(raw) : {};
      const now = Date.now();

      const existing = Array.isArray(data[emailKey]) ? data[emailKey] : [];
      const recent = existing.filter((ts) => now - ts <= 60 * 60 * 1000); // last 1 hour

      if (recent.length >= 3) {
        toast.error('You have requested too many reset emails for this address. Please try again after some time.');
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
      toast.success(res?.message || 'Password reset email sent. Please check your inbox.');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Error sending reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="workspace" style={styles.container}>
      <div className="glass-card" style={styles.formCard}>
        <div style={styles.logoSection}>
          <div style={styles.logoBox}>HC</div>
          <h2 style={styles.title}>Forgot Password?</h2>
          <p style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* messages now shown via toast */}

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