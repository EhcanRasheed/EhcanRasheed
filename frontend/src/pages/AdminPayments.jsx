import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import { SkeletonCardGrid } from '../components/Skeleton';
import * as adminApi from '../api/admin';

export default function AdminPayments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    loadPayments();
  }, [user, navigate]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getPayments();
      setPayments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, tier, userEmail) => {
    if (!window.confirm(`Approve payment and upgrade ${userEmail} to ${tier}?`)) return;
    try {
      await adminApi.approvePayment(id);
      loadPayments();
    } catch (e) {
      alert('Failed to approve');
    }
  };

  const handleReject = async (id, userEmail) => {
    if (!window.confirm(`Reject payment from ${userEmail}?`)) return;
    try {
      await adminApi.rejectPayment(id);
      loadPayments();
    } catch (e) {
      alert('Failed to reject');
    }
  };

  const handleDelete = async (id, userEmail) => {
    if (!window.confirm(`Are you sure you want to delete the payment request from ${userEmail}?`)) return;
    try {
      await adminApi.deletePayment(id);
      loadPayments();
    } catch (e) {
      alert('Failed to delete payment request');
    }
  };

  return (
    <AppLayout activePage="admin">
      <div style={{ marginBottom: '2rem' }}>
        <button style={styles.backBtn} onClick={() => navigate('/admin')}>
          &larr; Back to Dashboard
        </button>
      </div>

      <header style={styles.header}>
        <h1 style={styles.title}>Payment Validations</h1>
        <p style={styles.sub}>Review user payment screenshots before upgrading their tiers to premium.</p>
      </header>

      {loading ? (
        <SkeletonCardGrid count={3} />
      ) : payments.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#6b6b70' }}>
          No pending payment requests.
        </div>
      ) : (
        <div style={styles.grid}>
          {payments.map(p => (
            <div key={p.id} className="glass-card" style={styles.paymentCard}>
              <div style={styles.badge(p.status)}>{p.status}</div>
              <div style={styles.infoRow}>
                <span style={styles.label}>User: </span>
                <span style={styles.val}>{p.userEmail}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.label}>Requested Tier: </span>
                <span style={{...styles.val, color: '#c4a052', fontWeight: 600}}>{p.requestedTier}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.label}>Method: </span>
                <span style={styles.val}>{p.paymentMethod.toUpperCase()}</span>
              </div>

              {p.screenshotBase64 && (
                <div style={styles.imgContainer}>
                  <img src={p.screenshotBase64} alt="Payment Proof" style={styles.screenshot} />
                </div>
              )}

              {p.status === 'PENDING' && (
                <div style={styles.actions}>
                  <button style={{...styles.btn, ...styles.btnApprove}} onClick={() => handleApprove(p.id, p.requestedTier, p.userEmail)}>
                    Approve & Upgrade
                  </button>
                  <button style={{...styles.btn, ...styles.btnReject}} onClick={() => handleReject(p.id, p.userEmail)}>
                    Reject
                  </button>
                </div>
              )}
              {p.status !== 'PENDING' && (
                <div style={styles.actions}>
                  <button style={{...styles.btn, ...styles.btnDelete}} onClick={() => handleDelete(p.id, p.userEmail)}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

const styles = {
  header: { marginBottom: 30 },
  title: { fontSize: '2rem', fontWeight: 800, color: '#e8e8eb', margin: 0 },
  sub: { color: '#6b6b70', fontSize: 14, marginTop: 6 },
  backBtn: {
    background: 'none', border: 'none', color: '#86868b', cursor: 'pointer',
    fontSize: '0.95rem', padding: 0, '&:hover': { color: '#e8e8eb' }
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px'
  },
  paymentCard: {
    background: '#161618',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    padding: '24px',
    position: 'relative'
  },
  badge: (status) => ({
    position: 'absolute',
    top: 16, right: 16,
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: '12px',
    textTransform: 'uppercase',
    background: status === 'PENDING' ? 'rgba(196, 160, 82, 0.2)' : status === 'APPROVED' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)',
    color: status === 'PENDING' ? '#c4a052' : status === 'APPROVED' ? '#2ecc71' : '#e74c3c'
  }),
  infoRow: {
    marginBottom: '8px',
    fontSize: '0.9rem'
  },
  label: { color: '#86868b' },
  val: { color: '#e8e8eb' },
  imgContainer: {
    marginTop: '16px',
    width: '100%',
    height: '220px',
    background: '#0a0a0b',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  screenshot: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain'
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px'
  },
  btn: {
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
    border: 'none',
    transition: 'opacity 0.2s'
  },
  btnApprove: { background: '#2ecc71', color: '#161618' },
  btnReject: { background: 'transparent', border: '1px solid rgba(231, 76, 60, 0.4)', color: '#e74c3c' },
  btnDelete: { background: 'transparent', border: '1px solid rgba(231, 76, 60, 0.4)', color: '#e74c3c', marginTop: '10px' }
};