const fs = require('fs');

const code = `import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHiringAuth } from '../context/HiringAuthContext';
import { useToast } from '../context/ToastContext';
import { getDashboard, getSessions, deactivateSession, deleteSession } from '../api/hiring';

export default function HiringDashboard() {
  const { hiringUser, logout } = useHiringAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [dashData, sessData] = await Promise.all([getDashboard(), getSessions()]);
      setStats(dashData);
      setSessions(Array.isArray(sessData) ? sessData : []);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        logout();
        navigate('/hiring-ease/login');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDeactivate = async (id) => {
    setActionLoading(id);
    try {
      await deactivateSession(id);
      toast.success('Session closed.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setActionLoading(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this session and all candidate data?')) return;
    setActionLoading(id);
    try {
      await deleteSession(id);
      toast.success('Session deleted.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setActionLoading(null); }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/hiring-ease/login');
  };

  const statusColor = { active: '#2f8a5a', expired: '#dc4a4a', full: '#c4a052', closed: '#6b6b70' };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <p style={{ color: '#6b6b70', textAlign: 'center', marginTop: 60 }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Top Bar */}
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>Hiring Dashboard</h1>
            <p style={styles.greeting}>
              Welcome, <strong style={{ color: '#c4a052' }}>{hiringUser?.fullName}</strong>
              {hiringUser?.companyName && <span style={{ color: '#6b6b70' }}> — {hiringUser.companyName}</span>}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button style={styles.outlineBtn} onClick={() => navigate('/hiring-ease/banks')}>Question Banks</button>
            <button style={styles.outlineBtn} onClick={handleLogout}>Logout</button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div style={styles.statsGrid}>
            <StatCard label="Active Sessions" value={stats.activeSessions ?? 0} color="#2f8a5a" />
            <StatCard label="Total Candidates" value={stats.totalCandidates ?? 0} color="#c4a052" />
            <StatCard label="Avg. Score" value={stats.avgScore != null ? \`\${Math.round(stats.avgScore)}%\` : '—'} color="#5b9bd5" />
            <StatCard label="Completion Rate" value={stats.completionRate != null ? \`\${Math.round(stats.completionRate)}%\` : '—'} color="#d4b062" />
          </div>
        )}

        {/* Action Row */}
        <div style={styles.ctaRow}>
          <h2 style={styles.sectionTitle}>Your Sessions</h2>
          <button style={styles.primaryBtn} onClick={() => navigate('/hiring-ease/create-session')}>
            + Create Session
          </button>
        </div>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>📋</p>
            <p style={{ color: '#6b6b70', fontSize: 14 }}>No sessions yet. Create your first hiring session above.</p>
          </div>
        ) : (
          <div style={styles.sessionGrid}>
            {sessions.map((s) => (
              <div key={s.id} style={styles.sessionCard}>
                <div>
                  <div style={styles.sessionHeader}>
                    <h3 style={styles.sessionTitle}>{s.title}</h3>
                    <span style={{ ...styles.statusBadge, background: \`\${statusColor[s.status] || '#6b6b70'}20\`, color: statusColor[s.status] || '#6b6b70' }}>
                      {s.status?.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ color: '#86868b', fontSize: 13, margin: '0 0 16px' }}>
                    {s.completedCandidates} / {s.maxCandidates} candidates · {s.durationDays} day{s.durationDays > 1 ? 's' : ''}
                  </p>

                  <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: \`\${Math.min(100, (s.completedCandidates / s.maxCandidates) * 100)}%\` }} />
                  </div>
                  
                  <p style={{ color: '#555558', fontSize: 11, margin: '8px 0 0' }}>
                    Expires: {new Date(s.expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                <div style={styles.actionsContainer}>
                  <button style={styles.smallBtn} onClick={() => navigate(\`/hiring-ease/session/\${s.id}\`)}>View Details</button>
                  {s.status === 'active' && (
                    <>
                      <button style={styles.smallBtnGold} onClick={() => {
                        const url = \`\${window.location.origin}/hire/\${s.id}\`;
                        navigator.clipboard.writeText(url);
                        toast.success('Link copied to clipboard!');
                      }}>Copy Link</button>
                      <button style={styles.smallBtnDanger} onClick={() => handleDeactivate(s.id)} disabled={actionLoading === s.id}>Close</button>
                    </>
                  )}
                  <button style={{ ...styles.smallBtnDanger, background: 'rgba(220,74,74,0.05)', border: 'none' }} onClick={() => handleDelete(s.id)} disabled={actionLoading === s.id}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={styles.statCard}>
      <p style={styles.statLabel}>{label}</p>
      <p style={{ ...styles.statValue, color: color || '#e8e8eb' }}>{value}</p>
    </div>
  );
}

const styles = {
  page: { 
    minHeight: '100vh', 
    background: '#0a0a0b', 
    color: '#e8e8eb', 
    fontFamily: "'Inter', sans-serif", 
    padding: '40px 24px',
    backgroundImage: 'radial-gradient(ellipse at top, rgba(196,160,82,0.04) 0%, transparent 80%)'
  },
  container: { 
    maxWidth: 1200, 
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  },
  topBar: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingBottom: 24, 
    borderBottom: '1px solid rgba(255,255,255,0.05)' 
  },
  pageTitle: { 
    fontSize: 28, 
    fontWeight: 800, 
    margin: '0 0 6px', 
    letterSpacing: '-0.5px' 
  },
  greeting: { 
    color: '#86868b', 
    fontSize: 14, 
    margin: 0 
  },
  statsGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
    gap: 20 
  },
  statCard: { 
    background: 'linear-gradient(180deg, rgba(22, 22, 24, 0.8) 0%, rgba(18, 18, 20, 0.9) 100%)', 
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.04)', 
    borderRadius: 16, 
    padding: '24px', 
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
  },
  statLabel: {
    color: '#86868b', 
    fontSize: 12, 
    fontWeight: 600,
    textTransform: 'uppercase', 
    letterSpacing: 1.2, 
    margin: 0 
  },
  statValue: {
    fontSize: 32, 
    fontWeight: 900, 
    margin: 0 
  },
  ctaRow: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginTop: 10
  },
  primaryBtn: { 
    background: 'linear-gradient(135deg, #d4b062 0%, #c4a052 100%)', 
    color: '#0a0a0b', 
    border: 'none', 
    padding: '12px 24px', 
    borderRadius: 10, 
    fontWeight: 700, 
    fontSize: 14, 
    cursor: 'pointer', 
    boxShadow: '0 4px 15px rgba(196,160,82,0.2)',
    transition: 'all 0.2s',
  },
  outlineBtn: { 
    background: 'rgba(255,255,255,0.03)', 
    color: '#e8e8eb', 
    border: '1px solid rgba(255,255,255,0.1)', 
    padding: '10px 20px', 
    borderRadius: 10, 
    fontWeight: 500, 
    fontSize: 13, 
    cursor: 'pointer',
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: 700, 
    color: '#e8e8eb', 
    margin: 0
  },
  emptyState: { 
    textAlign: 'center', 
    padding: '64px 20px', 
    background: 'rgba(22, 22, 24, 0.4)', 
    borderRadius: 16, 
    border: '1px dashed rgba(255,255,255,0.05)' 
  },
  sessionGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
    gap: 24 
  },
  sessionCard: { 
    background: 'rgba(22, 22, 24, 0.7)', 
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.06)', 
    borderRadius: 16, 
    padding: '24px', 
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: 220,
    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
  },
  sessionHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 8 
  },
  sessionTitle: { 
    fontSize: 18, 
    fontWeight: 700, 
    color: '#e8e8eb', 
    margin: 0,
    lineHeight: 1.3
  },
  statusBadge: { 
    fontSize: 10, 
    fontWeight: 800, 
    padding: '4px 10px', 
    borderRadius: 6, 
    textTransform: 'uppercase', 
    letterSpacing: 0.8 
  },
  progressBar: { 
    height: 6, 
    background: 'rgba(255,255,255,0.05)', 
    borderRadius: 4, 
    overflow: 'hidden',
  },
  progressFill: { 
    height: '100%', 
    background: 'linear-gradient(90deg, #c4a052 0%, #e2c57a 100%)', 
    borderRadius: 4, 
    transition: 'width 0.5s ease', 
  },
  actionsContainer: {
    display: 'flex', 
    gap: 8, 
    flexWrap: 'wrap', 
    marginTop: 24,
    paddingTop: 16,
    borderTop: '1px solid rgba(255,255,255,0.05)'
  },
  smallBtn: { 
    background: 'rgba(255,255,255,0.05)', 
    color: '#e8e8eb', 
    border: '1px solid rgba(255,255,255,0.08)', 
    padding: '8px 14px', 
    borderRadius: 8, 
    fontSize: 12, 
    fontWeight: 600, 
    cursor: 'pointer',
  },
  smallBtnGold: { 
    background: 'rgba(196,160,82,0.1)', 
    color: '#c4a052', 
    border: '1px solid rgba(196,160,82,0.2)', 
    padding: '8px 14px', 
    borderRadius: 8, 
    fontSize: 12, 
    fontWeight: 600, 
    cursor: 'pointer',
  },
  smallBtnDanger: { 
    background: 'transparent', 
    color: '#dc4a4a', 
    border: '1px solid rgba(220,74,74,0.3)', 
    padding: '8px 14px', 
    borderRadius: 8, 
    fontSize: 12, 
    fontWeight: 600, 
    cursor: 'pointer',
  },
};
`;

fs.writeFileSync('C:/Users/Ehsan/Desktop/FYP/Ehsan/ehsan_interview/frontend/src/pages/HiringDashboard.jsx', code);
console.log('patched');
