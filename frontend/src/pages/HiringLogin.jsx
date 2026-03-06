import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useHiringAuth } from '../context/HiringAuthContext';
import { useToast } from '../context/ToastContext';

export default function HiringLogin() {
  const navigate = useNavigate();
  const { login } = useHiringAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/hiring-ease/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <div style={styles.header}>
          <div style={styles.logo}>HC</div>
          <h2 style={styles.title}>Hiring Ease Login</h2>
          <p style={styles.subtitle}>Sign in to your hiring manager account.</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input type="email" style={styles.input} placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} style={{ ...styles.input, paddingRight: 44 }} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>{showPassword ? '🙈' : '👁️'}</button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ ...styles.submitBtn, background: loading ? 'rgba(196,160,82,0.3)' : '#c4a052', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footerText}>
          Don't have an account? <Link to="/hiring-ease/register" style={styles.link}>Sign up</Link>
        </p>
        <p style={styles.footerText}>
          Payment pending? <Link to="/hiring-ease/payment" style={{ ...styles.link, color: '#86868b' }}>Submit payment</Link>
        </p>
        <p style={styles.footerText}>
          <Link to="/hiring-ease" style={{ ...styles.link, color: '#6b6b70' }}>← Back to Hiring Ease</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100vw', background: '#0a0a0b', padding: 20, fontFamily: "'Inter', sans-serif", boxSizing: 'border-box' },
  formCard: { background: '#161618', padding: 'clamp(20px, 5vw, 40px)', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', width: '100%', maxWidth: 440, border: '1px solid rgba(255,255,255,0.08)' },
  header: { textAlign: 'center', marginBottom: 32 },
  logo: { width: 44, height: 44, background: '#c4a052', color: '#0a0a0b', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontWeight: 800, fontSize: 18 },
  title: { fontSize: 24, fontWeight: 800, color: '#e8e8eb', margin: 0, letterSpacing: '-0.5px' },
  subtitle: { fontSize: 14, color: '#6b6b70', marginTop: 6 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  inputGroup: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: 11, fontWeight: 700, color: '#86868b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', fontSize: 14, outline: 'none', color: '#e8e8eb', backgroundColor: '#1d1d20' },
  eyeBtn: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6b6b70', cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1 },
  submitBtn: { padding: 14, borderRadius: 12, border: 'none', color: '#0a0a0b', fontWeight: 700, fontSize: 15, marginTop: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
  footerText: { textAlign: 'center', marginTop: 16, fontSize: 14, color: '#6b6b70' },
  link: { color: '#d4b062', fontWeight: 700, textDecoration: 'none' },
};
