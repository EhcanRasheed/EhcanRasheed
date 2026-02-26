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
      <div style={styles.card}>
        <h2 style={styles.title}>Verify Your Account</h2>
        
        {/* ✅ Displaying the email so the user knows where the code went */}
        <p style={styles.subtitle}>
          Enter the 6-digit code sent to <br/>
          <strong style={{ color: '#FF8C00' }}>{email || 'your email'}</strong>
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
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', fontFamily: 'Inter, sans-serif' },
  card: { background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(16px) saturate(125%)', padding: '40px', borderRadius: '15px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.02)', width: '100%', maxWidth: '400px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.12)' },
  title: { margin: '0 0 10px', fontSize: '24px', fontWeight: 'bold', color: '#d1d5db' },
  subtitle: { color: '#9ca3af', fontSize: '14px', marginBottom: '25px', lineHeight: '1.6' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  otpInput: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.15)', textAlign: 'center', fontSize: '28px', letterSpacing: '8px', fontWeight: 'bold', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#d1d5db', backdropFilter: 'blur(8px)' },
  button: { padding: '15px', color: '#1a1a1a', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', background: '#FF8C00' },
  errorText: { color: '#ef4444', marginTop: '15px', fontSize: '14px', fontWeight: 'bold' },
  footerText: { marginTop: '20px', fontSize: '12px', color: '#9ca3af' },
  linkBtn: { background: 'none', border: 'none', color: '#FF8C00', cursor: 'pointer', fontWeight: 'bold', padding: 0 }
};
