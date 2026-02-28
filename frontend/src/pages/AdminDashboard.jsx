import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import * as adminApi from '../api/admin';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState(0);
  const [bankCount, setBankCount] = useState(0);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    adminApi.getAllUsers().then((u) => setUserCount(u.length)).catch(() => {});
    adminApi.getAllBanks().then((b) => setBankCount(b.length)).catch(() => {});
  }, [user, navigate]);

  return (
    <AppLayout activePage="admin">
      <header style={s.header}>
        <h1 style={s.title}>Admin Panel</h1>
        <p style={s.sub}>Manage users and question banks from one place.</p>
      </header>

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
      </div>
    </AppLayout>
  );
}

const s = {
  header: { marginBottom: 40 },
  title: { fontSize: '2rem', fontWeight: 800, color: '#e8e8eb', margin: 0 },
  sub: { color: '#6b6b70', fontSize: 14, marginTop: 6 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 },
  card: { background: '#161618', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '32px 28px', cursor: 'pointer', transition: 'border 0.2s', display: 'flex', flexDirection: 'column', gap: 10 },
  cardIcon: { fontSize: 32 },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#e8e8eb', margin: 0 },
  cardDesc: { fontSize: 13, color: '#6b6b70', lineHeight: 1.6, margin: 0 },
  stat: { fontSize: 12, color: '#c4a052', fontWeight: 600, marginTop: 'auto' },
};
