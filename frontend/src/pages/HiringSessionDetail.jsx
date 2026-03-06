import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { getSessionDetail, deactivateSession } from '../api/hiring';
import { SkeletonCardGrid, SkeletonLine } from '../components/Skeleton';

export default function HiringSessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | top5 | top10 | evaluated | in_progress
  const [sortBy, setSortBy] = useState('score'); // score | name | date

  const fetchSession = useCallback(async () => {
    try {
      const data = await getSessionDetail(id);
      setSession(data);
    } catch (err) {
      toast.error('Failed to load session');
      navigate('/hiring-ease/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchSession(); }, [fetchSession]);

  const handleClose = async () => {
    if (!window.confirm('Close this session? No more candidates will be able to join.')) return;
    setActionLoading(true);
    try {
      await deactivateSession(id);
      toast.success('Session closed.');
      fetchSession();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setActionLoading(false); }
  };

  const copyLink = () => {
    const url = `${window.location.origin}/hire/${id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied!');
  };

  const filteredCandidates = useMemo(() => {
    if (!session) return [];
    let list = [...(session.candidates || [])];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q));
    }

    // Filter by status
    if (filter === 'evaluated') {
      list = list.filter((c) => c.interviewStatus === 'EVALUATED');
    } else if (filter === 'in_progress') {
      list = list.filter((c) => c.interviewStatus === 'IN_PROGRESS' || c.interviewStatus === 'NOT_STARTED');
    }

    // Sort
    if (sortBy === 'score') {
      list.sort((a, b) => (b.combinedScore ?? b.interviewScore ?? -1) - (a.combinedScore ?? a.interviewScore ?? -1));
    } else if (sortBy === 'name') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'date') {
      list.sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0));
    }

    // Top N
    if (filter === 'top5') list = list.slice(0, 5);
    if (filter === 'top10') list = list.slice(0, 10);

    return list;
  }, [session, search, filter, sortBy]);

  if (loading) {
    return <div style={styles.page}><div style={styles.container}><SkeletonLine width="40%" height={28} /><div style={{ marginTop: 24 }}><SkeletonCardGrid count={4} /></div></div></div>;
  }
  if (!session) return null;

  const candidates = session.candidates || [];
  const statusColor = { active: '#2f8a5a', expired: '#dc4a4a', full: '#c4a052', closed: '#6b6b70' };
  const interviewStatusColor = { NOT_STARTED: '#6b6b70', IN_PROGRESS: '#c4a052', COMPLETED: '#5b9bd5', EVALUATED: '#2f8a5a' };
  const gradeColor = (g) => !g ? '#555' : g.startsWith('A') ? '#2f8a5a' : g.startsWith('B') ? '#5b9bd5' : g.startsWith('C') ? '#c4a052' : '#dc4a4a';

  return (
    <motion.div style={styles.page} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
      <div style={styles.container}>
        <button style={styles.backBtn} onClick={() => navigate('/hiring-ease/dashboard')}>← Back to Dashboard</button>

        {/* Session Header */}
        <div style={styles.headerCard}>
          <div style={styles.headerTop}>
            <div>
              <h1 style={styles.title}>{session.title}</h1>
              <p style={{ color: '#6b6b70', fontSize: 13, margin: '4px 0 0' }}>
                Created {new Date(session.createdAt).toLocaleDateString()} · Expires {new Date(session.expiresAt).toLocaleString()}
              </p>
            </div>
            <span style={{ ...styles.statusBadge, background: `${statusColor[session.status] || '#6b6b70'}20`, color: statusColor[session.status] || '#6b6b70' }}>
              {(session.status || '').toUpperCase()}
            </span>
          </div>

          {session.jobDescription && (
            <p style={{ color: '#86868b', fontSize: 13, lineHeight: 1.6, margin: '14px 0 0', whiteSpace: 'pre-wrap' }}>{session.jobDescription}</p>
          )}

          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: '#86868b', fontSize: 12 }}>Candidates</span>
              <span style={{ color: '#e8e8eb', fontSize: 12, fontWeight: 700 }}>{candidates.length}/{session.maxCandidates}</span>
            </div>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${Math.min(100, (candidates.length / session.maxCandidates) * 100)}%` }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            {session.status === 'active' && (
              <>
                <button style={styles.goldBtn} onClick={copyLink}>📋 Copy Link</button>
                <button style={styles.dangerBtn} onClick={handleClose} disabled={actionLoading}>
                  {actionLoading ? 'Closing...' : 'Close Session'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Candidates Section */}
        <div style={{ marginTop: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Candidates ({candidates.length})</h2>
            <input style={styles.searchInput} placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ color: '#6b6b70', fontSize: 12, fontWeight: 700 }}>Filter:</span>
            {[
              { key: 'all', label: 'All' },
              { key: 'top5', label: 'Top 5' },
              { key: 'top10', label: 'Top 10' },
              { key: 'evaluated', label: 'Evaluated' },
              { key: 'in_progress', label: 'Pending' },
            ].map((f) => (
              <button
                key={f.key}
                style={{ ...styles.filterBtn, ...(filter === f.key ? styles.filterActive : {}) }}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#6b6b70', fontSize: 12 }}>Sort:</span>
              <select style={styles.sortSelect} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="score">Score (High → Low)</option>
                <option value="name">Name (A → Z)</option>
                <option value="date">Date (Recent)</option>
              </select>
            </div>
          </div>

          {filteredCandidates.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ color: '#6b6b70', fontSize: 14 }}>{candidates.length === 0 ? 'No candidates yet.' : 'No matches found.'}</p>
            </div>
          ) : (
            <div style={{ ...styles.tableWrap, overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Interview</th>
                    <th style={styles.th}>Resume</th>
                    <th style={styles.th}>Combined</th>
                    <th style={styles.th}>Grade</th>
                    <th style={styles.th}>Completed</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((c, i) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={styles.td}>{i + 1}</td>
                      <td style={{ ...styles.td, fontWeight: 600, color: '#e8e8eb' }}>{c.name}</td>
                      <td style={styles.td}>{c.email}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.statusBadgeSm, color: interviewStatusColor[c.interviewStatus] || '#6b6b70' }}>
                          {(c.interviewStatus || '').replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ ...styles.td, fontWeight: 700, color: c.interviewScore != null ? '#c4a052' : '#555558' }}>
                        {c.interviewScore != null ? `${Math.round(c.interviewScore)}%` : '—'}
                      </td>
                      <td style={{ ...styles.td, fontWeight: 700, color: c.resumeScore != null ? '#5b9bd5' : '#555558' }}>
                        {c.resumeScore != null ? `${Math.round(c.resumeScore)}%` : '—'}
                      </td>
                      <td style={{ ...styles.td, fontWeight: 800, color: c.combinedScore != null ? '#e8e8eb' : '#555558' }}>
                        {c.combinedScore != null ? `${Math.round(c.combinedScore)}%` : '—'}
                      </td>
                      <td style={{ ...styles.td, fontWeight: 800, color: gradeColor(c.grade) }}>
                        {c.grade || '—'}
                      </td>
                      <td style={styles.td}>{c.completedAt ? new Date(c.completedAt).toLocaleDateString() : '—'}</td>
                      <td style={styles.td}>
                        <button style={styles.viewBtn} onClick={() => navigate(`/hiring-ease/candidate/${c.id}`)}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

const styles = {
  page: { 
    minHeight: '100vh', 
    background: '#0a0a0b', 
    color: '#e8e8eb', 
    fontFamily: "'Inter', sans-serif", 
    padding: '40px 24px',
    backgroundImage: 'radial-gradient(ellipse at top, rgba(196,160,82,0.04) 0%, transparent 70%)'
  },
  container: { 
    maxWidth: 1100, 
    margin: '0 auto', 
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  backBtn: { 
    background: 'transparent', 
    border: '1px solid rgba(255,255,255,0.1)', 
    color: '#e8e8eb', 
    cursor: 'pointer', 
    fontSize: 13, 
    padding: '8px 16px', 
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 0
  },

  headerCard: { 
    background: 'rgba(22, 22, 24, 0.7)', 
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(196,160,82,0.15)', 
    borderRadius: 16, 
    padding: '30px 36px', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: 16,
    boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
  },
  headerTop: { 
    display: 'flex', 
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 16
  },
  title: { 
    fontSize: 28, 
    fontWeight: 800, 
    margin: '0 0 6px', 
    letterSpacing: '-0.5px' 
  },
  statusBadge: { 
    fontSize: 11, 
    fontWeight: 800, 
    padding: '6px 12px', 
    borderRadius: 8, 
    textTransform: 'uppercase', 
    letterSpacing: 0.8 
  },
  infoText: { 
    color: '#86868b', 
    fontSize: 13, 
    margin: 0,
    lineHeight: 1.5 
  },

  actionBtnGroup: { 
    display: 'flex', 
    gap: 12, 
    flexWrap: 'wrap' 
  },
  primaryBtn: { 
    background: 'linear-gradient(135deg, #d4b062 0%, #c4a052 100%)', 
    color: '#0a0a0b', 
    border: 'none', 
    padding: '10px 20px', 
    borderRadius: 10, 
    fontWeight: 700, 
    fontSize: 14, 
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(196,160,82,0.2)',
  },
  dangerBtn: { 
    background: 'rgba(220,74,74,0.1)', 
    color: '#dc4a4a', 
    border: '1px solid rgba(220,74,74,0.2)', 
    padding: '10px 20px', 
    borderRadius: 10, 
    fontWeight: 700, 
    fontSize: 14, 
    cursor: 'pointer' 
  },

  progressWrap: { 
    marginTop: 8 
  },
  progressLabels: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    marginBottom: 6, 
    fontSize: 12, 
    color: '#a0a0a5', 
    fontWeight: 600 
  },
  progressBar: { 
    height: 8, 
    background: 'rgba(255,255,255,0.05)', 
    borderRadius: 6, 
    overflow: 'hidden' 
  },
  progressFill: { 
    height: '100%', 
    background: 'linear-gradient(90deg, #c4a052 0%, #e2c57a 100%)', 
    borderRadius: 6, 
    transition: 'width 0.5s ease' 
  },

  controlsRow: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    flexWrap: 'wrap', 
    gap: 16,
    background: 'rgba(22, 22, 24, 0.4)',
    padding: '16px 24px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.05)'
  },
  searchBar: { 
    display: 'flex', 
    alignItems: 'center', 
    background: 'rgba(0,0,0,0.3)', 
    border: '1px solid rgba(255,255,255,0.1)', 
    borderRadius: 10, 
    padding: '8px 14px', 
    width: 260 
  },
  searchInput: { 
    background: 'transparent', 
    border: 'none', 
    color: '#e8e8eb', 
    fontSize: 13, 
    outline: 'none', 
    width: '100%', 
    marginLeft: 8 
  },
  filterGroup: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: 12, 
    flexWrap: 'wrap' 
  },
  select: { 
    background: 'rgba(0,0,0,0.3)', 
    color: '#e8e8eb', 
    border: '1px solid rgba(255,255,255,0.1)', 
    padding: '8px 12px', 
    borderRadius: 8, 
    fontSize: 13, 
    outline: 'none' 
  },

  tableWrap: { 
    background: 'rgba(22, 22, 24, 0.7)', 
    backdropFilter: 'blur(10px)',
    borderRadius: 16, 
    border: '1px solid rgba(255,255,255,0.06)', 
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
  },
  table: { 
    width: '100%', 
    borderCollapse: 'collapse', 
    textAlign: 'left' 
  },
  th: { 
    padding: '16px 20px', 
    fontSize: 11, 
    textTransform: 'uppercase', 
    letterSpacing: 1, 
    color: '#86868b', 
    borderBottom: '1px solid rgba(255,255,255,0.05)', 
    background: 'rgba(0,0,0,0.2)',
    fontWeight: 700 
  },
  td: { 
    padding: '16px 20px', 
    fontSize: 13, 
    borderBottom: '1px solid rgba(255,255,255,0.03)', 
    verticalAlign: 'middle',
    color: '#e8e8eb'
  },
  tr: { 
    transition: 'background 0.2s',
    cursor: 'default'
  },
  badge: { 
    fontSize: 10, 
    fontWeight: 800, 
    padding: '4px 8px', 
    borderRadius: 6, 
    textTransform: 'uppercase',
    letterSpacing: 0.5 
  },
  viewBtn: { 
    background: 'rgba(196,160,82,0.1)', 
    color: '#c4a052', 
    border: '1px solid rgba(196,160,82,0.2)', 
    padding: '6px 12px', 
    borderRadius: 8, 
    fontSize: 12, 
    fontWeight: 600, 
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
};
