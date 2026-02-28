import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AppLayout from '../components/AppLayout';

export default function ChangeUsername() {
  const { user, changeUsername } = useAuth();
  const toast = useToast();
  const [newUsername, setNewUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const trimmed = newUsername.trim();
    if (!trimmed) {
      toast.error('Please enter a new username');
      setLoading(false);
      return;
    }
    try {
      await changeUsername(trimmed);
      toast.success('Username updated successfully.');
      setNewUsername('');
      setLoading(false);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to update username';
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <AppLayout activePage="change-username">
      <header style={styles.topBar}>
        <div>
          <h1 style={styles.pageTitle}>Change Username</h1>
          <p style={styles.subText}>Update your account username</p>
        </div>
      </header>

      <div className="glass-card" style={styles.settingsCard}>
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Current Username</label>
            <input
              type="text"
              style={styles.input}
              value={user?.name || user?.fullName || ''}
              disabled
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>New Username</label>
            <input
              type="text"
              style={styles.input}
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter new username"
              required
            />
          </div>

          <button
            type="submit"
            style={{ ...styles.maroonBtn, ...(loading ? styles.buttonDisabled : {}) }}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Username'}
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
  maroonBtn: { width: '100%', padding: '14px', borderRadius: '12px', background: '#c4a052', border: 'none', color: '#0a0a0b', fontWeight: 700, cursor: 'pointer', fontSize: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
  buttonDisabled: { opacity: 0.45, cursor: 'not-allowed' },
};
