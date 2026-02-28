import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ 1. Try to grab email from the redirect state immediately
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const toast = useToast();
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

    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/verify-otp`, { email, otp });
      toast.success('Verification successful! You can now login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="workspace" style={styles.container}>
      <div className="glass-card" style={styles.card}>
        <h2 style={styles.title}>Verify Your Account</h2>
        
        {/* ✅ Displaying the email so the user knows where the code went */}
        <p style={styles.subtitle}>
          Enter the 6-digit code sent to <br/>
          <strong style={{ color: '#d4b062' }}>{email || 'your email'}</strong>
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
            style={{ ...styles.button, background: loading ? 'rgba(196,160,82,0.3)' : '#c4a052' }}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        {/* errors now shown via toast */}
        
        <p style={styles.footerText}>
          Didn't get a code? <button onClick={() => navigate('/register')} style={styles.linkBtn}>Try signing up again</button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100vw', fontFamily: 'Inter, sans-serif', background: '#0a0a0b', boxSizing: 'border-box' },
  card: { background: '#161618', padding: '48px 40px', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', width: '100%', maxWidth: '420px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' },
  title: { margin: '0 0 10px', fontSize: '26px', fontWeight: 800, color: '#e8e8eb', letterSpacing: '-0.5px' },
  subtitle: { color: '#6b6b70', fontSize: '14px', marginBottom: '28px', lineHeight: '1.65' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  otpInput: { width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', fontSize: '32px', letterSpacing: '10px', fontWeight: 'bold', color: '#e8e8eb', backgroundColor: '#1d1d20', outline: 'none', boxSizing: 'border-box' },
  button: { padding: '14px', color: '#0a0a0b', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '15px', background: '#c4a052', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
  errorText: { color: '#dc4a4a', marginTop: '15px', fontSize: '14px', fontWeight: 600 },
  footerText: { marginTop: '20px', fontSize: '12px', color: '#6b6b70' },
  linkBtn: { background: 'none', border: 'none', color: '#d4b062', cursor: 'pointer', fontWeight: 700, padding: 0 }
};