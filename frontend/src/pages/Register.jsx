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
      <div style={styles.auroraGlow}></div>
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
                borderColor: showMatchError ? '#ef4444' : '#d1d5db'
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
                borderColor: showMatchError ? '#ef4444' : (formData.confirmPassword && passwordsMatch ? '#16a34a' : '#d1d5db')
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
                color: passwordsMatch ? '#16a34a' : '#ef4444',
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

  formCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '48px',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    width: '100%',
    maxWidth: '420px',
    position: 'relative',
    zIndex: 10,
  },

  header: { textAlign: 'center', marginBottom: '40px' },

  logo: {
    width: '44px',
    height: '44px',
    background: '#ffffff',
    color: '#030303',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    fontWeight: 800,
    fontSize: '20px'
  },

  title: {
    fontSize: '1.8rem',
    fontWeight: 800,
    color: '#ffffff',
    margin: 0,
    letterSpacing: '-0.02em'
  },

  subtitle: {
    fontSize: '13px',
    color: '#888888',
    marginTop: '8px',
    fontWeight: 400
  },

  form: { display: 'flex', flexDirection: 'column', gap: '18px' },

  inputGroup: { display: 'flex', flexDirection: 'column' },

  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '8px'
  },

  input: {
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    fontSize: '13px',
    outline: 'none',
    transition: 'all 0.2s',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#ffffff',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },

  helpText: {
    marginTop: '6px',
    fontSize: '12px',
    color: '#888888'
  },

  submitBtn: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: 'none',
    color: '#030303',
    backgroundColor: '#ffffff',
    fontWeight: '700',
    fontSize: '13px',
    marginTop: '12px',
    transition: 'all 0.2s',
    cursor: 'pointer',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    letterSpacing: '-0.02em'
  },

  successBox: {
    padding: '12px',
    background: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
    borderRadius: '8px',
    fontSize: '12px',
    textAlign: 'center',
    marginBottom: '20px',
    border: '1px solid rgba(16, 185, 129, 0.2)'
  },

  errorBox: {
    padding: '12px',
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    borderRadius: '8px',
    fontSize: '12px',
    textAlign: 'center',
    marginBottom: '20px',
    border: '1px solid rgba(239, 68, 68, 0.2)'
  },

  footerText: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '13px',
    color: '#888888'
  },

  link: {
    color: '#ffffff',
    fontWeight: '700',
    textDecoration: 'none',
    marginLeft: '4px'
  }
};
