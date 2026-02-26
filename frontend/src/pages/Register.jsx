import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

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
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Helper to handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Runtime check
  const passwordsMatch = formData.password === formData.confirmPassword;
  const showMatchError = formData.confirmPassword.length > 0 && !passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // Frontend-only limit: max 3 OTP/registration attempts per email within 1 hour
    try {
      const emailKey = formData.email.trim().toLowerCase();
      const raw = localStorage.getItem('otpRequests');
      const data = raw ? JSON.parse(raw) : {};
      const now = Date.now();

      const existing = Array.isArray(data[emailKey]) ? data[emailKey] : [];
      const recent = existing.filter((ts) => now - ts <= 60 * 60 * 1000); // last 1 hour

      if (recent.length >= 3) {
        setError(
          'Too much OTP request. Please try again after some time.'
        );
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
      setError(passwordRuleText);
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match. Please try again.");
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
      setMessage(res?.message || "Registration successful! Redirecting to verification...");
      
      // ✅ AUTOMATIC REDIRECT: Moves to OTP page and passes the email
      setTimeout(() => {
        navigate('/verify-otp', { state: { email: formData.email } });
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <div style={styles.header}>
          <div style={styles.logo}>HC</div>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Join HireCraft to start your preparation.</p>
        </div>

        {message && <div style={styles.successBox}>{message}</div>}
        {error && <div style={styles.errorBox}>{error}</div>}

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
            <input
              name="password"
              type="password"
              style={{
                ...styles.input,
                borderColor: showMatchError ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.15)'
              }}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span style={styles.helpText}>{passwordRuleText}</span>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              style={{
                ...styles.input,
                borderColor: showMatchError ? 'rgba(239, 68, 68, 0.5)' : (formData.confirmPassword && passwordsMatch ? 'rgba(34, 197, 94, 0.4)' : 'rgba(255, 255, 255, 0.15)')
              }}
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {/* Runtime Feedback Label */}
            {formData.confirmPassword && (
              <span style={{ 
                fontSize: '12px', 
                color: passwordsMatch ? '#22c55e' : '#ef4444',
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
              background: loading ? '#94a3b8' : '#800000',
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
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px', fontFamily: "'Inter', sans-serif" },
  formCard: { background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(16px) saturate(125%)', padding: '40px', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.02)', width: '100%', maxWidth: '480px', border: '1px solid rgba(255, 255, 255, 0.12)' },
  header: { textAlign: 'center', marginBottom: '32px' },
  logo: { width: '40px', height: '40px', background: 'linear-gradient(135deg, #FF8C00 0%, #A4C639 100%)', color: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontWeight: 800 },
  title: { fontSize: '24px', fontWeight: 800, color: '#d1d5db', margin: 0 },
  subtitle: { fontSize: '14px', color: '#9ca3af', marginTop: '4px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '14px', fontWeight: 600, color: '#d1d5db', marginBottom: '6px' },
  input: { padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.15)', fontSize: '14px', outline: 'none', transition: 'border 0.2s', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#d1d5db', backdropFilter: 'blur(8px)' },
  helpText: { marginTop: '6px', fontSize: '12px', color: '#9ca3af' },
  submitBtn: { padding: '14px', borderRadius: '12px', border: 'none', color: '#1a1a1a', fontWeight: 700, fontSize: '16px', marginTop: '8px', transition: '0.3s' },
  successBox: { padding: '12px', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', borderRadius: '10px', fontSize: '14px', textAlign: 'center', marginBottom: '20px', border: '1px solid rgba(34, 197, 94, 0.3)' },
  errorBox: { padding: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderRadius: '10px', fontSize: '14px', textAlign: 'center', marginBottom: '20px', border: '1px solid rgba(239, 68, 68, 0.3)' },
  footerText: { textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#9ca3af' },
  link: { color: '#FF8C00', fontWeight: 700, textDecoration: 'none' }
};
