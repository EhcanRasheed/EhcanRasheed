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
    padding: '20px',
    fontFamily: "'Inter', sans-serif",
  },
  form: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(16px) saturate(125%)',
    borderRadius: '24px',
    padding: '40px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.02)',
    maxWidth: '420px',
    width: '100%',
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#d1d5db',
    marginBottom: '10px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '14px',
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: '30px',
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
    padding: '12px 20px',
    fontSize: '14px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '25px',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    color: '#d1d5db',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    outline: 'none',
    backdropFilter: 'blur(8px)',
  },
  button: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    background: '#FF8C00',
    color: '#1a1a1a',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    marginTop: '12px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(255, 140, 0, 0.3)',
  },
  buttonDisabled: {
    background: '#6b7280',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  successMsg: {
    color: '#22c55e',
    fontSize: '14px',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderRadius: '12px',
    textAlign: 'center',
    border: '1px solid rgba(34, 197, 94, 0.3)',
  },
  errorMsg: {
    color: '#ef4444',
    fontSize: '14px',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: '12px',
    textAlign: 'center',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
  warningMsg: {
    color: '#FF8C00',
    fontSize: '14px',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: 'rgba(255, 140, 0, 0.12)',
    borderRadius: '12px',
    textAlign: 'center',
    border: '1px solid rgba(255, 140, 0, 0.3)',
  },
  loginLink: {
    textAlign: 'center',
    marginTop: '25px',
    fontSize: '14px',
    color: '#9ca3af',
  },
  link: {
    color: '#FF8C00',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
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
