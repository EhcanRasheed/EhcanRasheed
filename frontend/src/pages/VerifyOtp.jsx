import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ 1. Try to grab email from the redirect state immediately
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ 2. Double-check state on mount to ensure it's captured
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:3000/auth/verify-otp', { email, otp });
      alert('Verification successful! You can now login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.auroraGlow}></div>
      <div style={styles.card}>
        <h2 style={styles.title}>Verify Your Account</h2>
        
        {/* ✅ Displaying the email so the user knows where the code went */}
        <p style={styles.subtitle}>
          Enter the 6-digit code sent to <br/>
          <strong style={{ color: '#800000' }}>{email || 'your email'}</strong>
        </p>

        <form onSubmit={handleVerify} style={styles.form}>
          <div style={styles.inputGroup}>
            <input 
              type="text" 
              maxLength="6" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              placeholder="000000"
              required
              style={styles.otpInput}
              autoFocus
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ ...styles.button, background: loading ? '#94a3b8' : '#800000' }}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        {error && <p style={styles.errorText}>{error}</p>}
        
        <p style={styles.footerText}>
          Didn't get a code? <button onClick={() => navigate('/register')} style={styles.linkBtn}>Try signing up again</button>
        </p>
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
    fontFamily: 'system-ui, -apple-system, sans-serif',
    background: '#030303',
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

  card: {
    background: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '48px',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    width: '100%',
    maxWidth: '420px',
    textAlign: 'center',
    position: 'relative',
    zIndex: 10,
  },

  title: {
    margin: '0 0 16px',
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '-0.02em',
  },

  subtitle: {
    color: '#888888',
    fontSize: '13px',
    marginBottom: '32px',
    lineHeight: '1.6',
    fontWeight: 400,
  },

  form: { display: 'flex', flexDirection: 'column', gap: '20px' },

  otpInput: {
    width: '100%',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    textAlign: 'center',
    fontSize: '28px',
    letterSpacing: '8px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },

  button: {
    padding: '12px 16px',
    color: '#030303',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '13px',
    background: '#ffffff',
    transition: 'all 0.2s ease',
    letterSpacing: '-0.02em',
  },

  errorText: {
    color: '#ef4444',
    marginTop: '16px',
    fontSize: '12px',
    fontWeight: 'bold',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid rgba(239, 68, 68, 0.2)',
  },

  footerText: { marginTop: '24px', fontSize: '12px', color: '#888888' },

  linkBtn: {
    background: 'none',
    border: 'none',
    color: '#ffffff',
    cursor: 'pointer',
    fontWeight: 'bold',
    padding: 0,
    textDecoration: 'underline',
  },
};
