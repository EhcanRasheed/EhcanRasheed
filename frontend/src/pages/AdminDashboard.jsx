import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import { SkeletonCardGrid } from '../components/Skeleton';
import * as adminApi from '../api/admin';
import { getHiringPayments } from '../api/hiring';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState(null);
  const [bankCount, setBankCount] = useState(null);
  const [pendingPayments, setPendingPayments] = useState(null);
  const [pendingHiringPayments, setPendingHiringPayments] = useState(null);
  const loading = userCount === null || bankCount === null || pendingPayments === null || pendingHiringPayments === null;

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    adminApi.getAllUsers().then((u) => setUserCount(u.length)).catch((e) => console.error('ADMIN getAllUsers error:', e.response?.status, e.response?.data, e.message));
    adminApi.getAllBanks().then((b) => setBankCount(b.length)).catch((e) => console.error('ADMIN getAllBanks error:', e.response?.status, e.response?.data, e.message));
    adminApi.getPayments().then((p) => {
      const pending = Array.isArray(p) ? p.filter((r) => r.status === 'PENDING').length : 0;
      setPendingPayments(pending);
    }).catch((e) => console.error('ADMIN getPayments error:', e.response?.status, e.response?.data, e.message));
    getHiringPayments().then((p) => {
      const pending = Array.isArray(p) ? p.filter((r) => r.status === 'PENDING').length : 0;
      setPendingHiringPayments(pending);
    }).catch((e) => console.error('ADMIN getHiringPayments error:', e.response?.status, e.response?.data, e.message));
  }, [user, navigate]);

  return (
    <AppLayout activePage="admin">
      <header style={s.header}>
        <h1 style={s.title}>Admin Panel</h1>
        <p style={s.sub}>Manage users, question banks, and payment verifications from one place.</p>
      </header>

      {loading ? (
        <SkeletonCardGrid count={4} />
      ) : (
      <div style={s.grid}>
        <div style={s.card} onClick={() => navigate('/admin/users')}>
          <div style={s.cardIcon}>👥</div>
          <h3 style={s.cardTitle}>User Management</h3>
          <p style={s.cardDesc}>View all registered users, edit credentials, change roles.</p>
          <span style={s.stat}>{userCount} users</span>
        </div>
        <div style={s.card} onClick={() => navigate('/admin/banks')}>
          <div style={s.cardIcon}>📚</div>
          <h3 style={s.cardTitle}>Question Banks</h3>
          <p style={s.cardDesc}>Create, upload, and manage interview question banks.</p>
          <span style={s.stat}>{bankCount} banks</span>
        </div>
        <div style={{...s.card, ...(pendingPayments > 0 ? s.cardHighlight : {})}} onClick={() => navigate('/admin/payments')}>
          <div style={s.cardIcon}>💳</div>
          <h3 style={s.cardTitle}>Payment Validations</h3>
          <p style={s.cardDesc}>Review payment screenshots and approve or reject tier upgrades.</p>
          <span style={s.stat}>
            {pendingPayments > 0 ? `${pendingPayments} pending` : 'No pending requests'}
          </span>
        </div>
        <div style={{...s.card, ...(pendingHiringPayments > 0 ? s.cardHighlight : {})}} onClick={() => navigate('/admin/hiring-payments')}>
          <div style={s.cardIcon}>🏢</div>
          <h3 style={s.cardTitle}>Hiring Ease Payments</h3>
          <p style={s.cardDesc}>Manage Hiring Ease account activations and payment verifications.</p>
          <span style={s.stat}>
            {pendingHiringPayments > 0 ? `${pendingHiringPayments} pending` : 'No pending requests'}
          </span>
        </div>
      </div>
      )}
    </AppLayout>
  );
}

const s = {
  header: { marginBottom: 40 },
  title: { fontSize: '2rem', fontWeight: 800, color: '#e8e8eb', margin: 0 },
  sub: { color: '#6b6b70', fontSize: 14, marginTop: 6 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 },
  card: { background: '#161618', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '32px 28px', cursor: 'pointer', transition: 'border 0.2s', display: 'flex', flexDirection: 'column', gap: 10 },
  cardHighlight: { border: '1px solid rgba(196,160,82,0.35)', boxShadow: '0 0 20px rgba(196,160,82,0.08)' },
  cardIcon: { fontSize: 32 },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#e8e8eb', margin: 0 },
  cardDesc: { fontSize: 13, color: '#6b6b70', lineHeight: 1.6, margin: 0 },
  stat: { fontSize: 12, color: '#c4a052', fontWeight: 600, marginTop: 'auto' },
};
