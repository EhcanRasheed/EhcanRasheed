import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AppLayout from '../components/AppLayout';
import { SkeletonCardGrid } from '../components/Skeleton';
import { getHiringPayments, approveHiringPayment, rejectHiringPayment, deleteHiringPayment, getHiringUsers, deleteHiringUser } from '../api/hiring';

export default function AdminHiringPayments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [tab, setTab] = useState('payments'); // payments | users
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [screenshotModal, setScreenshotModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/dashboard'); return; }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pData, uData] = await Promise.all([getHiringPayments(), getHiringUsers()]);
      setPayments(Array.isArray(pData) ? pData : []);
      setUsers(Array.isArray(uData) ? uData : []);
    } catch (err) {
      toast.error('Failed to load data');
    } finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this payment and activate the hiring account?')) return;
    setActionLoading(id);
    try {
      await approveHiringPayment(id);
      toast.success('Payment approved! Account activated.');
      loadData();
    } catch { toast.error('Failed to approve'); }
    finally { setActionLoading(null); }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal);
    try {
      await rejectHiringPayment(rejectModal, rejectReason);
      toast.success('Payment rejected.');
      setRejectModal(null);
      setRejectReason('');
      loadData();
    } catch { toast.error('Failed to reject'); }
    finally { setActionLoading(null); }
  };

  const handleDeletePayment = async (id) => {
    if (!window.confirm('Delete this payment record?')) return;
    setActionLoading(id);
    try {
      await deleteHiringPayment(id);
      toast.success('Payment deleted.');
      loadData();
    } catch { toast.error('Failed to delete'); }
    finally { setActionLoading(null); }
  };

  const handleDeleteUser = async (id, email) => {
    if (!window.confirm(`Delete hiring user ${email} and all their data?`)) return;
    setActionLoading(id);
    try {
      await deleteHiringUser(id);
      toast.success('User deleted.');
      loadData();
    } catch { toast.error('Failed to delete'); }
    finally { setActionLoading(null); }
  };

  const statusColor = { PENDING: '#c4a052', APPROVED: '#2f8a5a', REJECTED: '#dc4a4a' };

  return (
    <AppLayout activePage="admin">
      <div style={{ marginBottom: '1.5rem' }}>
        <button style={styles.backBtn} onClick={() => navigate('/admin')}>← Back to Admin Dashboard</button>
      </div>

      <header style={{ marginBottom: 28 }}>
        <h1 style={styles.pageTitle}>Hiring Ease — Admin</h1>
        <p style={{ color: '#6b6b70', fontSize: 14 }}>Manage hiring user accounts and payment approvals.</p>
      </header>

      {/* Tabs */}
      <div style={styles.tabRow}>
        <button style={{ ...styles.tabBtn, ...(tab === 'payments' ? styles.tabActive : {}) }} onClick={() => setTab('payments')}>
          Payments ({payments.length})
        </button>
        <button style={{ ...styles.tabBtn, ...(tab === 'users' ? styles.tabActive : {}) }} onClick={() => setTab('users')}>
          Users ({users.length})
        </button>
      </div>

      {loading ? (
        <SkeletonCardGrid count={4} />
      ) : tab === 'payments' ? (
        /* ──── Payments Tab ──── */
        payments.length === 0 ? (
          <div style={styles.emptyState}><p style={{ color: '#6b6b70' }}>No hiring payment requests yet.</p></div>
        ) : (
          <div style={styles.grid}>
            {payments.map((p) => (
              <div key={p.id} style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <p style={{ color: '#e8e8eb', fontWeight: 700, fontSize: 14, margin: '0 0 2px' }}>{p.hiringUser?.fullName || '—'}</p>
                    <p style={{ color: '#6b6b70', fontSize: 12, margin: 0 }}>{p.hiringUser?.email || '—'}</p>
                    {p.hiringUser?.companyName && <p style={{ color: '#86868b', fontSize: 11, margin: '2px 0 0' }}>🏢 {p.hiringUser.companyName}</p>}
                  </div>
                  <span style={{ ...styles.statusBadge, color: statusColor[p.status], background: `${statusColor[p.status]}15` }}>
                    {p.status}
                  </span>
                </div>

                <p style={{ color: '#555558', fontSize: 11, margin: '0 0 8px' }}>
                  Method: <strong style={{ color: '#86868b' }}>{p.paymentMethod}</strong> · {new Date(p.createdAt).toLocaleDateString()}
                </p>

                {p.rejectionReason && (
                  <p style={{ color: '#dc4a4a', fontSize: 12, margin: '0 0 8px' }}>Reason: {p.rejectionReason}</p>
                )}

                {/* Screenshot */}
                {p.screenshotBase64 && (
                  <div style={styles.screenshotBox} onClick={() => setScreenshotModal(p.screenshotBase64)}>
                    <img src={p.screenshotBase64} alt="Screenshot" style={{ maxWidth: '100%', maxHeight: 120, objectFit: 'contain', borderRadius: 6, cursor: 'pointer' }} />
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                  {p.status === 'PENDING' && (
                    <>
                      <button style={styles.approveBtn} onClick={() => handleApprove(p.id)} disabled={actionLoading === p.id}>
                        ✓ Approve
                      </button>
                      <button style={styles.rejectBtn} onClick={() => { setRejectModal(p.id); setRejectReason(''); }} disabled={actionLoading === p.id}>
                        ✗ Reject
                      </button>
                    </>
                  )}
                  <button style={styles.deleteBtn} onClick={() => handleDeletePayment(p.id)} disabled={actionLoading === p.id}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* ──── Users Tab ──── */
        users.length === 0 ? (
          <div style={styles.emptyState}><p style={{ color: '#6b6b70' }}>No hiring users yet.</p></div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Company</th>
                  <th style={styles.th}>Active</th>
                  <th style={styles.th}>Joined</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ ...styles.td, fontWeight: 600, color: '#e8e8eb' }}>{u.fullName}</td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>{u.companyName || '—'}</td>
                    <td style={styles.td}>
                      <span style={{ color: u.isActive ? '#2f8a5a' : '#dc4a4a', fontWeight: 700 }}>
                        {u.isActive ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td style={styles.td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td style={styles.td}>
                      <button style={styles.deleteBtn} onClick={() => handleDeleteUser(u.id, u.email)} disabled={actionLoading === u.id}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Screenshot Modal */}
      {screenshotModal && (
        <div style={styles.modalOverlay} onClick={() => setScreenshotModal(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setScreenshotModal(null)}>✕</button>
            <img src={screenshotModal} alt="Payment Screenshot" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 8 }} />
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div style={styles.modalOverlay} onClick={() => setRejectModal(null)}>
          <div style={{ ...styles.modalContent, maxWidth: 400, padding: 28 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: '#e8e8eb', margin: '0 0 12px' }}>Reject Payment</h3>
            <p style={{ color: '#6b6b70', fontSize: 13, margin: '0 0 16px' }}>Optionally provide a reason for rejection.</p>
            <textarea
              style={{ width: '100%', background: '#1d1d20', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: '#e8e8eb', fontSize: 13, outline: 'none', resize: 'vertical', minHeight: 60, boxSizing: 'border-box' }}
              placeholder="Reason (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button style={{ ...styles.deleteBtn, flex: 1 }} onClick={() => setRejectModal(null)}>Cancel</button>
              <button style={{ ...styles.rejectBtn, flex: 1, opacity: actionLoading ? 0.5 : 1 }} onClick={handleReject} disabled={actionLoading === rejectModal}>
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

const styles = {
  backBtn: { background: 'none', border: 'none', color: '#6b6b70', cursor: 'pointer', fontSize: 13, padding: 0, textDecoration: 'underline' },
  pageTitle: { fontSize: 24, fontWeight: 900, color: '#e8e8eb', margin: 0, letterSpacing: '-0.3px' },

  tabRow: { display: 'flex', gap: 4, marginBottom: 24, background: '#161618', borderRadius: 10, padding: 4, border: '1px solid rgba(255,255,255,0.06)', width: 'fit-content' },
  tabBtn: { background: 'transparent', color: '#6b6b70', border: 'none', padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  tabActive: { background: 'rgba(196,160,82,0.15)', color: '#c4a052' },

  emptyState: { textAlign: 'center', padding: '40px 20px', background: '#161618', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 },
  card: { background: '#161618', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px 22px' },
  statusBadge: { fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8, textTransform: 'uppercase', whiteSpace: 'nowrap' },
  screenshotBox: { background: '#0a0a0b', borderRadius: 8, padding: 8, border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', cursor: 'pointer' },

  approveBtn: { background: 'rgba(47,138,90,0.15)', color: '#2f8a5a', border: '1px solid rgba(47,138,90,0.2)', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  rejectBtn: { background: 'rgba(220,74,74,0.12)', color: '#dc4a4a', border: '1px solid rgba(220,74,74,0.15)', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  deleteBtn: { background: 'rgba(255,255,255,0.04)', color: '#6b6b70', border: '1px solid rgba(255,255,255,0.06)', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' },

  tableWrapper: { overflowX: 'auto', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#161618', fontSize: 13 },
  th: { textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#86868b', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' },
  td: { padding: '12px 16px', color: '#86868b', whiteSpace: 'nowrap' },

  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: 20 },
  modalContent: { background: '#161618', borderRadius: 12, padding: 12, position: 'relative', maxWidth: '90vw' },
  closeBtn: { position: 'absolute', top: 8, right: 12, background: 'none', border: 'none', color: '#6b6b70', fontSize: 18, cursor: 'pointer' },
};
