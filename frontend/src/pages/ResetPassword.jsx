import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

function useQuery() {
  return new URLSearchParams(useLocation().search);
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
    fontFamily: "'Inter', sans-serif",
    boxSizing: 'border-box',
  },
  form: {
    backgroundColor: '#161618',
    borderRadius: '12px',
    padding: '40px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    maxWidth: '420px',
    width: '100%',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#e8e8eb',
    marginBottom: '10px',
    textAlign: 'center',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b6b70',
    textAlign: 'center',
    marginBottom: '30px',
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
    transition: 'all 0.3s ease',
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
    boxShadow: 'none',
  },
  successMsg: {
    color: '#3faa72',
    fontSize: '13px',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderRadius: '12px',
    textAlign: 'center',
    border: '1px solid rgba(34,197,94,0.25)',
  },
  errorMsg: {
    color: '#dc4a4a',
    fontSize: '13px',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: '12px',
    textAlign: 'center',
    border: '1px solid rgba(239,68,68,0.25)',
  },
  warningMsg: {
    color: '#d4a030',
    fontSize: '13px',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: 'rgba(251,146,60,0.1)',
    borderRadius: '12px',
    textAlign: 'center',
    border: '1px solid rgba(251,146,60,0.25)',
  },
  loginLink: {
    textAlign: 'center',
    marginTop: '25px',
    fontSize: '14px',
    color: '#6b6b70',
  },
  link: {
    color: '#d4b062',
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
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordStrong(password)) {
      toast.error(passwordRuleText);
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);

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

      toast.success('Password updated successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again or request a new link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="workspace" style={styles.container}>
      <div className="glass-card" style={styles.form}>
        <h2 style={styles.title}>Reset Password</h2>
        <p style={styles.subtitle}>
          Enter a new password below. {passwordRuleText}
        </p>
        
        {!token && (
          <div style={styles.warningMsg}>
            Invalid or missing reset link. Please use the link from your email or request a new one from the login page.
          </div>
        )}
        
        {/* messages now shown via toast */}

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>New Password</label>
            <div style={{ position: 'relative' }}>
            <input 
              style={{ ...styles.input, paddingRight: 44 }} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              type={showPassword ? 'text' : 'password'} 
              placeholder="At least 7 characters"
              required 
              disabled={!token || loading}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6b6b70', cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1 }}>{showPassword ? '🙈' : '👁️'}</button>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm New Password</label>
            <div style={{ position: 'relative' }}>
            <input 
              style={{ ...styles.input, paddingRight: 44 }} 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              type={showConfirmPassword ? 'text' : 'password'} 
              placeholder="Confirm new password"
              required 
              disabled={!token || loading}
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6b6b70', cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1 }}>{showConfirmPassword ? '🙈' : '👁️'}</button>
            </div>
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