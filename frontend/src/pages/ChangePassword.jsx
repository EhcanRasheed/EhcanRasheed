import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import * as authApi from '../api/auth';
import AppLayout from '../components/AppLayout';

export default function ChangePassword() {
  const toast = useToast();
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordRuleText =
    'Password must be at least 7 characters and include letters and numbers.';

  const isPasswordStrong = (pwd) =>
    typeof pwd === 'string' &&
    pwd.length >= 7 &&
    /[A-Za-z]/.test(pwd) &&
    /\d/.test(pwd);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match');
      setLoading(false);
      return;
    }

    if (!isPasswordStrong(passwords.new)) {
      toast.error(passwordRuleText);
      setLoading(false);
      return;
    }

    try {
      await authApi.changePassword(passwords.current, passwords.new);
      toast.success('Password changed successfully!');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout activePage="change-password">
      <header style={styles.topBar}>
        <div>
          <h1 style={styles.pageTitle}>Change Password</h1>
          <p style={styles.subText}>Update your account password for better security</p>
        </div>
      </header>

      <div className="glass-card" style={styles.settingsCard}>
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Current Password</label>
            <div style={{ position: 'relative' }}>
            <input
              type={showCurrent ? 'text' : 'password'}
              style={{ ...styles.input, paddingRight: 44 }}
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              placeholder="Enter current password"
              required
              autoFocus
            />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6b6b70', cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1 }}>{showCurrent ? '🙈' : '👁️'}</button>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>New Password</label>
            <div style={{ position: 'relative' }}>
            <input
              type={showNew ? 'text' : 'password'}
              style={{ ...styles.input, paddingRight: 44 }}
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              placeholder="Enter new password (min. 7 characters)"
              required
            />
            <button type="button" onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6b6b70', cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1 }}>{showNew ? '🙈' : '👁️'}</button>
            </div>
            <span style={styles.helpText}>{passwordRuleText}</span>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm New Password</label>
            <div style={{ position: 'relative' }}>
            <input
              type={showConfirm ? 'text' : 'password'}
              style={{
                ...styles.input,
                paddingRight: 44,
                borderColor: passwords.confirm && passwords.new !== passwords.confirm ? '#dc4a4a' : undefined
              }}
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              placeholder="Confirm new password"
              required
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6b6b70', cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1 }}>{showConfirm ? '🙈' : '👁️'}</button>
            </div>
            {passwords.confirm && passwords.new !== passwords.confirm && (
              <span style={styles.errorText}>Passwords do not match</span>
            )}
          </div>

          <button
            type="submit"
            style={{ ...styles.maroonBtn, ...(loading ? styles.buttonDisabled : {}) }}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}

const styles = {
  topBar: { display: 'flex', justifyContent: 'space-between', marginBottom: '32px' },
  pageTitle: { fontSize: '2rem', fontWeight: 800, color: '#e8e8eb', margin: 0, letterSpacing: '-0.5px' },
  subText: { color: '#6b6b70', fontSize: '14px', marginTop: '6px' },
  settingsCard: { background: '#161618', borderRadius: '12px', padding: '40px', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 2px 12px rgba(0,0,0,0.4)', maxWidth: '600px' },
  inputGroup: { marginBottom: '24px' },
  label: { display: 'block', fontSize: '11px', fontWeight: 700, color: '#86868b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '14px', outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box', background: '#1d1d20', color: '#e8e8eb' },
  helpText: { fontSize: '12px', color: '#555558', marginTop: '6px', display: 'block' },
  errorText: { fontSize: '12px', color: '#dc4a4a', marginTop: '4px', display: 'block' },
  maroonBtn: { width: '100%', padding: '14px', borderRadius: '12px', background: '#c4a052', border: 'none', color: '#0a0a0b', fontWeight: 700, cursor: 'pointer', fontSize: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
  buttonDisabled: { opacity: 0.45, cursor: 'not-allowed' },
};
