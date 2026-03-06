import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const passwordRuleText =
    'Password must be at least 7 characters and include letters and numbers.';

  const isPasswordStrong = (pwd) =>
    typeof pwd === 'string' &&
    pwd.length >= 7 &&
    /[A-Za-z]/.test(pwd) &&
    /\d/.test(pwd);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    gender: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Helper to handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Runtime check
  const passwordsMatch = formData.password === formData.confirmPassword;
  const showMatchError = formData.confirmPassword.length > 0 && !passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend-only limit: max 3 OTP/registration attempts per email within 1 hour
    try {
      const emailKey = formData.email.trim().toLowerCase();
      const raw = localStorage.getItem('otpRequests');
      const data = raw ? JSON.parse(raw) : {};
      const now = Date.now();

      const existing = Array.isArray(data[emailKey]) ? data[emailKey] : [];
      const recent = existing.filter((ts) => now - ts <= 60 * 60 * 1000); // last 1 hour

      if (recent.length >= 3) {
        toast.error('Too much OTP request. Please try again after some time.');
        return;
      }

      // Record this new OTP / registration attempt
      recent.push(now);
      data[emailKey] = recent;
      localStorage.setItem('otpRequests', JSON.stringify(data));
    } catch {
      // If localStorage is unavailable or fails, just skip the frontend limit
    }

    // Final check before sending
    if (!isPasswordStrong(formData.password)) {
      toast.error(passwordRuleText);
      return;
    }

    if (!passwordsMatch) {
      toast.error('Passwords do not match. Please try again.');
      return;
    }

    setLoading(true);
    try {
      // ✅ Sending data to backend via AuthContext
      const res = await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        gender: formData.gender
      });

      // ✅ SUCCESS LOGIC: Show feedback to user
      toast.success(res?.message || 'Registration successful! Redirecting to verification...');
      
      // ✅ AUTOMATIC REDIRECT: Moves to OTP page and passes the email
      setTimeout(() => {
        navigate('/verify-otp', { state: { email: formData.email } });
      }, 2000);

    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="workspace" style={styles.container}>
      <div className="glass-card" style={styles.formCard}>
        <div style={styles.header}>
          <div style={styles.logo}>HC</div>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Join HireCraft to start your preparation.</p>
        </div>

        {/* messages now shown via toast */}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              name="fullName"
              style={styles.input}
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Gender</label>
            <select
              name="gender"
              style={styles.input}
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              name="email"
              type="email"
              style={styles.input}
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={{ position: 'relative' }}>
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              style={{
                ...styles.input,
                paddingRight: 44,
                borderColor: showMatchError ? '#dc4a4a' : '#d1d5db'
              }}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6b6b70', cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1 }}>{showPassword ? '🙈' : '👁️'}</button>
            </div>
            <span style={styles.helpText}>{passwordRuleText}</span>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
            <input
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              style={{
                ...styles.input,
                paddingRight: 44,
                borderColor: showMatchError ? '#dc4a4a' : (formData.confirmPassword && passwordsMatch ? '#2f8a5a' : '#d1d5db')
              }}
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6b6b70', cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1 }}>{showConfirmPassword ? '🙈' : '👁️'}</button>
            </div>
            {/* Runtime Feedback Label */}
            {formData.confirmPassword && (
              <span style={{ 
                fontSize: '12px', 
                color: passwordsMatch ? '#2f8a5a' : '#dc4a4a',
                marginTop: '4px',
                display: 'block' 
              }}>
                {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              background: loading ? 'rgba(196,160,82,0.3)' : '#c4a052',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Processing...' : 'Sign Up'}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account? <Link to="/login" style={styles.link}>Login here</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100vw', background: '#0a0a0b', padding: '20px', fontFamily: "'Inter', sans-serif", boxSizing: 'border-box' },
  formCard: { background: '#161618', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', width: '100%', maxWidth: '480px', border: '1px solid rgba(255,255,255,0.08)' },
  header: { textAlign: 'center', marginBottom: '32px' },
  logo: { width: '44px', height: '44px', background: '#c4a052', color: '#0a0a0b', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontWeight: 800, fontSize: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
  title: { fontSize: '24px', fontWeight: 800, color: '#e8e8eb', margin: 0, letterSpacing: '-0.5px' },
  subtitle: { fontSize: '14px', color: '#6b6b70', marginTop: '6px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '11px', fontWeight: 700, color: '#86868b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '14px', outline: 'none', transition: 'border 0.2s', color: '#e8e8eb', backgroundColor: '#1d1d20' },
  helpText: { marginTop: '6px', fontSize: '12px', color: '#555558' },
  submitBtn: { padding: '14px', borderRadius: '12px', border: 'none', color: '#0a0a0b', fontWeight: 700, fontSize: '15px', marginTop: '8px', transition: '0.3s', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
  successBox: { padding: '12px 16px', background: 'rgba(34,197,94,0.1)', color: '#3faa72', borderRadius: '10px', fontSize: '13px', textAlign: 'center', marginBottom: '20px', border: '1px solid rgba(34,197,94,0.25)' },
  errorBox: { padding: '12px 16px', background: 'rgba(239,68,68,0.1)', color: '#dc4a4a', borderRadius: '10px', fontSize: '13px', textAlign: 'center', marginBottom: '20px', border: '1px solid rgba(239,68,68,0.25)' },
  footerText: { textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#6b6b70' },
  link: { color: '#d4b062', fontWeight: 700, textDecoration: 'none' }
};