import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { hiringRegister } from '../api/hiringAuth';
import { useToast } from '../context/ToastContext';

export default function HiringRegister() {
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    fullName: '', email: '', companyName: '', phoneNumber: '', password: '', confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordRuleText = 'Password must be at least 7 characters and include letters and numbers.';
  const isPasswordStrong = (pwd) => typeof pwd === 'string' && pwd.length >= 7 && /[A-Za-z]/.test(pwd) && /\d/.test(pwd);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const passwordsMatch = formData.password === formData.confirmPassword;
  const showMatchError = formData.confirmPassword.length > 0 && !passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPasswordStrong(formData.password)) { toast.error(passwordRuleText); return; }
    if (!passwordsMatch) { toast.error('Passwords do not match.'); return; }

    setLoading(true);
    try {
      const res = await hiringRegister({
        fullName: formData.fullName,
        email: formData.email,
        companyName: formData.companyName,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      });
      toast.success(res?.message || 'Account created! Proceed to payment.');
      setTimeout(() => navigate('/hiring-ease/payment', { state: { email: formData.email, userId: res.userId } }), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <div style={styles.header}>
          <div style={styles.logo}>HC</div>
          <h2 style={styles.title}>Hiring Ease Sign Up</h2>
          <p style={styles.subtitle}>Create your hiring manager account.</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input name="fullName" style={styles.input} placeholder="Jane Doe" value={formData.fullName} onChange={handleChange} required />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Company Name</label>
            <input name="companyName" style={styles.input} placeholder="Acme Corp" value={formData.companyName} onChange={handleChange} required />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input name="email" type="email" style={styles.input} placeholder="name@company.com" value={formData.email} onChange={handleChange} required />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Phone Number</label>
            <input name="phoneNumber" style={styles.input} placeholder="0300-1234567" value={formData.phoneNumber} onChange={handleChange} required />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={{ position: 'relative' }}>
              <input name="password" type={showPassword ? 'text' : 'password'} style={{ ...styles.input, paddingRight: 44 }} placeholder="••••••••" value={formData.password} onChange={handleChange} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>{showPassword ? '🙈' : '👁️'}</button>
            </div>
            <span style={styles.helpText}>{passwordRuleText}</span>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} style={{ ...styles.input, paddingRight: 44, borderColor: showMatchError ? '#dc4a4a' : (formData.confirmPassword && passwordsMatch ? '#2f8a5a' : 'rgba(255,255,255,0.1)') }} placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeBtn}>{showConfirmPassword ? '🙈' : '👁️'}</button>
            </div>
            {formData.confirmPassword && (
              <span style={{ fontSize: 12, color: passwordsMatch ? '#2f8a5a' : '#dc4a4a', marginTop: 4, display: 'block' }}>
                {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
              </span>
            )}
          </div>

          <button type="submit" disabled={loading} style={{ ...styles.submitBtn, background: loading ? 'rgba(196,160,82,0.3)' : '#c4a052', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Processing...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account? <Link to="/hiring-ease/login" style={styles.link}>Login here</Link>
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
  formCard: { background: '#161618', padding: 'clamp(20px, 5vw, 40px)', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', width: '100%', maxWidth: 480, border: '1px solid rgba(255,255,255,0.08)' },
  header: { textAlign: 'center', marginBottom: 32 },
  logo: { width: 44, height: 44, background: '#c4a052', color: '#0a0a0b', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontWeight: 800, fontSize: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
  title: { fontSize: 24, fontWeight: 800, color: '#e8e8eb', margin: 0, letterSpacing: '-0.5px' },
  subtitle: { fontSize: 14, color: '#6b6b70', marginTop: 6 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  inputGroup: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: 11, fontWeight: 700, color: '#86868b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', fontSize: 14, outline: 'none', color: '#e8e8eb', backgroundColor: '#1d1d20', transition: 'border 0.2s' },
  helpText: { marginTop: 6, fontSize: 12, color: '#555558' },
  eyeBtn: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6b6b70', cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1 },
  submitBtn: { padding: 14, borderRadius: 12, border: 'none', color: '#0a0a0b', fontWeight: 700, fontSize: 15, marginTop: 8, transition: '0.3s', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
  footerText: { textAlign: 'center', marginTop: 16, fontSize: 14, color: '#6b6b70' },
  link: { color: '#d4b062', fontWeight: 700, textDecoration: 'none' },
};
