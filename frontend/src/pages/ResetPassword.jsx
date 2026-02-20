import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

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
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '48px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    maxWidth: '420px',
    width: '100%',
    position: 'relative',
    zIndex: 10,
  },

  title: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: '10px',
    textAlign: 'center',
    letterSpacing: '-0.02em',
  },

  subtitle: {
    fontSize: '13px',
    color: '#888888',
    textAlign: 'center',
    marginBottom: '30px',
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
    background: '#555555',
    cursor: 'not-allowed',
    color: '#888888',
  },

  successMsg: {
    color: '#10b981',
    fontSize: '12px',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '8px',
    textAlign: 'center',
    border: '1px solid rgba(16, 185, 129, 0.2)',
  },

  errorMsg: {
    color: '#ef4444',
    fontSize: '12px',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: '8px',
    textAlign: 'center',
    border: '1px solid rgba(239, 68, 68, 0.2)',
  },

  warningMsg: {
    color: '#f59e0b',
    fontSize: '12px',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: '8px',
    textAlign: 'center',
    border: '1px solid rgba(245, 158, 11, 0.2)',
  },

  loginLink: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '12px',
    color: '#888888',
  },

  link: {
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '12px',
    fontWeight: '700',
    marginLeft: '6px',
    transition: 'opacity 0.2s',
  },
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function parseToken(rawToken) {
  if (!rawToken) return null;
  let t = rawToken;
  if (t.includes('token=')) t = t.split('token=').pop();
  try {
    return decodeURIComponent(t).trim();
  } catch {
    return t.trim();
  }
}

export default function ResetPassword() {
  const passwordRuleText =
    'Password must be at least 7 characters and include letters and numbers.';

  const isPasswordStrong = (pwd) =>
    typeof pwd === 'string' &&
    pwd.length >= 7 &&
    /[A-Za-z]/.test(pwd) &&
    /\d/.test(pwd);

  const query = useQuery();
  const rawToken = query.get('token');
  const token = parseToken(rawToken);

  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isPasswordStrong(password)) {
      setError(passwordRuleText);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Reset failed');

      setMessage('Password updated successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again or request a new link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.auroraGlow}></div>
      <div style={styles.form}>
        <h2 style={styles.title}>Reset Password</h2>
        <p style={styles.subtitle}>
          Enter a new password below. {passwordRuleText}
        </p>
        
        {!token && (
          <div style={styles.warningMsg}>
            Invalid or missing reset link. Please use the link from your email or request a new one from the login page.
          </div>
        )}
        
        {message && <div style={styles.successMsg}>{message}</div>}
        {error && <div style={styles.errorMsg}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>New Password</label>
            <input 
              style={styles.input} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              type="password" 
              placeholder="At least 7 characters"
              required 
              disabled={!token || loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm New Password</label>
            <input 
              style={styles.input} 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              type="password" 
              placeholder="Confirm new password"
              required 
              disabled={!token || loading}
            />
          </div>

          <button 
            style={{ 
              ...styles.button, 
              ...(loading || !token ? styles.buttonDisabled : {}),
              ...(hoveredBtn && !loading && token ? { filter: 'brightness(1.1)' } : {})
            }} 
            type="submit" 
            disabled={loading || !token}
            onMouseEnter={() => setHoveredBtn(true)}
            onMouseLeave={() => setHoveredBtn(false)}
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>

        <div style={styles.loginLink}>
          Back to
          <Link to="/login" style={styles.link}> Sign in</Link>
        </div>
      </div>
    </div>
  );
}
