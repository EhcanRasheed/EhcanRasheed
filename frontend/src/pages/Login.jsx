import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, Link } from 'react-router-dom';

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
    padding: '48px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    maxWidth: '440px',
    width: '100%',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  logoSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '36px',
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
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
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
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
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
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  buttonHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    transform: 'none',
  },
  errorMsg: {
    color: '#dc4a4a',
    fontSize: '13px',
    marginBottom: '20px',
    padding: '12px 16px',
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: '10px',
    textAlign: 'center',
    border: '1px solid rgba(239,68,68,0.25)',
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
    color: '#6b6b70',
    textDecoration: 'none',
    fontWeight: '600',
    cursor: 'pointer',
  },
  maroonLink: {
    color: '#d4b062',
    textDecoration: 'none',
    fontWeight: '700',
    cursor: 'pointer',
  },
  divider: {
    color: '#3a3a3d',
  },
};

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

    const emailKey = email.trim().toLowerCase();
    const now = Date.now();
    const attempts = loadLoginAttempts();
    const existing = attempts[emailKey] || { failedAttempts: 0, lockUntil: null };

    // If user is currently locked out, block immediately
    if (existing.lockUntil && now < existing.lockUntil) {
      const remainingSeconds = Math.ceil((existing.lockUntil - now) / 1000);
      toast.error(`Too many wrong attempts. Please try again in ${remainingSeconds} seconds.`);
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

      toast.error(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="workspace" style={styles.container}>
      <div className="glass-card" style={styles.form}>
        <div style={styles.logoSection}>
          <div style={styles.logoBox}>HC</div>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Log in to your HireCraft account</p>
        </div>

        {/* errors now shown via toast */}

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
            <div style={{ position: 'relative' }}>
            <input 
              style={{ ...styles.input, paddingRight: 44 }} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              type={showPassword ? 'text' : 'password'} 
              placeholder="••••••••"
              required 
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6b6b70', cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1 }}>{showPassword ? '🙈' : '👁️'}</button>
            </div>
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