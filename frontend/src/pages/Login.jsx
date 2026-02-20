import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

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

  inputFocus: {
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
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

  buttonHover: {
    background: '#f5f5f5',
  },

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

  linksContainer: {
    marginTop: '24px',
    display: 'flex',
    gap: '4px',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '12px',
  },

  link: {
    color: '#888888',
    textDecoration: 'none',
    fontWeight: '400',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
  },

  linkHover: {
    color: '#ffffff',
  },

  maroonLink: {
    color: '#ffffff',
    textDecoration: 'none',
    fontWeight: '600',
    cursor: 'pointer',
  },

  divider: {
    color: '#666666',
  },
};

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Frontend-only rate limiting for login attempts (per email)
  const loadLoginAttempts = () => {
    try {
      const raw = localStorage.getItem('loginAttempts');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const saveLoginAttempts = (attempts) => {
    try {
      localStorage.setItem('loginAttempts', JSON.stringify(attempts));
    } catch {
      // Ignore storage errors – just don't persist attempts
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const emailKey = email.trim().toLowerCase();
    const now = Date.now();
    const attempts = loadLoginAttempts();
    const existing = attempts[emailKey] || { failedAttempts: 0, lockUntil: null };

    // If user is currently locked out, block immediately
    if (existing.lockUntil && now < existing.lockUntil) {
      const remainingSeconds = Math.ceil((existing.lockUntil - now) / 1000);
      setError(
        `Too many wrong attempts. Please try again in ${remainingSeconds} seconds.`
      );
      return;
    }

    // If previous lock period has expired, reset counters
    if (existing.lockUntil && now >= existing.lockUntil) {
      existing.lockUntil = null;
      existing.failedAttempts = 0;
      attempts[emailKey] = existing;
      saveLoginAttempts(attempts);
    }

    setLoading(true);

    try {
      await login(email, password);

       // On successful login, reset attempts for this email
      attempts[emailKey] = { failedAttempts: 0, lockUntil: null };
      saveLoginAttempts(attempts);

      navigate('/dashboard');
    } catch (err) {
      // Treat any failed login as a failed attempt for this email
      const updated = attempts[emailKey] || { failedAttempts: 0, lockUntil: null };
      const failed = (updated.failedAttempts || 0) + 1;
      updated.failedAttempts = failed;

      // After 3 continuous failures, lock for 1 minute
      if (failed >= 3) {
        updated.lockUntil = now + 60 * 1000; // 1 minute in ms
        updated.failedAttempts = 0;
      }

      attempts[emailKey] = updated;
      saveLoginAttempts(attempts);

      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.auroraGlow}></div>
      <div style={styles.form}>
        <div style={styles.logoSection}>
          <div style={styles.logoBox}>HC</div>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Log in to your HireCraft account</p>
        </div>

        {error && <div style={styles.errorMsg}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              style={styles.input} 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              type="email" 
              placeholder="name@company.com"
              required 
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              style={styles.input} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              type="password" 
              placeholder="••••••••"
              required 
            />
          </div>
          <button 
            style={{ 
              ...styles.button, 
              ...(loading ? styles.buttonDisabled : {}),
              ...(hoveredBtn && !loading ? styles.buttonHover : {})
            }} 
            type="submit" 
            disabled={loading}
            onMouseEnter={() => setHoveredBtn(true)}
            onMouseLeave={() => setHoveredBtn(false)}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.linksContainer}>
          <Link to="/forgot-password" style={styles.link}>Forgot Password?</Link>
          <span style={styles.divider}>•</span>
          <Link to="/reset-password" style={styles.link}>Reset</Link>
        </div>

        <div style={{...styles.subtitle, marginTop: '32px'}}>
          Don't have an account? 
          <Link to="/register" style={{...styles.maroonLink, marginLeft: '6px'}}>
            Create one now
          </Link>
        </div>
      </div>
    </div>
  );
}
