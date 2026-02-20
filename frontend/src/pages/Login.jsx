import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#eef2f6', // Matches Dashboard background
    padding: '20px',
    fontFamily: "'Inter', sans-serif",
  },
  form: {
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '48px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)',
    maxWidth: '440px',
    width: '100%',
    border: '1px solid #e2e8f0',
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
    background: '#0f172a',
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
    color: '#0f172a',
    margin: 0,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '8px',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '12px',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    color: '#0f172a',
    backgroundColor: '#fff',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '700',
    background: '#800000', // Signature Maroon
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    marginTop: '12px',
    transition: 'all 0.3s ease',
  },
  buttonHover: {
    background: '#600000',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(128, 0, 0, 0.2)',
  },
  buttonDisabled: {
    backgroundColor: '#cbd5e1',
    cursor: 'not-allowed',
  },
  errorMsg: {
    color: '#ef4444',
    fontSize: '14px',
    marginBottom: '20px',
    padding: '12px',
    backgroundColor: '#fef2f2',
    borderRadius: '10px',
    textAlign: 'center',
    border: '1px solid #fee2e2',
  },
  linksContainer: {
    marginTop: '24px',
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '13px',
  },
  link: {
    color: '#64748b',
    textDecoration: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
  },
  maroonLink: {
    color: '#800000',
    textDecoration: 'none',
    fontWeight: '700',
    cursor: 'pointer',
  },
  divider: {
    color: '#cbd5e1',
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