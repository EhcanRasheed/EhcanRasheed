import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import * as interviewApi from '../api/interview';

export default function InterviewPreparation() {
  const navigate = useNavigate();
  const [banks, setBanks] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [tab, setTab] = useState('banks'); // 'banks' | 'history'
  const [filterCat, setFilterCat] = useState('All');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [b, h] = await Promise.all([
        interviewApi.getAvailableBanks(),
        interviewApi.getMyHistory(),
      ]);
      setBanks(b);
      setHistory(h);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleStart = async (bankId) => {
    setStarting(true);
    try {
      const data = await interviewApi.startSession(bankId);
      navigate(`/interview/session/${data.sessionId}`);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to start session');
    }
    setStarting(false);
  };

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this interview session? This cannot be undone.')) return;
    try {
      await interviewApi.deleteSession(sessionId);
      setHistory((prev) => prev.filter((h) => h.id !== sessionId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete session');
    }
  };

  return (
    <AppLayout activePage="interview">
      <div style={s.hero}>
        <h1 style={s.heroTitle}>Interview Preparation</h1>
        <p style={s.heroSub}>Choose a question bank to begin a mock interview, or review past sessions.</p>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        <button style={tab === 'banks' ? s.tabActive : s.tab} onClick={() => setTab('banks')}>Question Banks</button>
        <button style={tab === 'history' ? s.tabActive : s.tab} onClick={() => setTab('history')}>My History ({history.length})</button>
      </div>

      {loading ? (
        <p style={s.loading}>Loading…</p>
      ) : tab === 'banks' ? (
        <>
          {/* Category filter */}
          {banks.length > 0 && (() => {
            const cats = ['All', ...Array.from(new Set(banks.map(b => b.category))).sort()];
            return (
              <div style={s.filterRow}>
                {cats.map((c) => (
                  <button key={c} style={filterCat === c ? s.filterActive : s.filterBtn} onClick={() => setFilterCat(c)}>{c}</button>
                ))}
              </div>
            );
          })()}
          <div style={s.grid}>
            {banks.filter(b => filterCat === 'All' || b.category === filterCat).length === 0 && <p style={s.empty}>No question banks match this filter.</p>}
            {banks.filter(b => filterCat === 'All' || b.category === filterCat).map((b) => (
            <div key={b.id} style={s.card}>
              <div style={s.cardBadge}>{b.category}</div>
              <h3 style={s.cardTitle}>{b.name}</h3>
              <p style={s.cardDesc}>{b.description || 'No description'}</p>
              {/* Difficulty breakdown */}
              <div style={s.diffRow}>
                {b.easyCount > 0 && <span style={s.diffPill('#4ade80')}>🟢 {b.easyCount} Easy</span>}
                {b.mediumCount > 0 && <span style={s.diffPill('#c4a052')}>🟡 {b.mediumCount} Medium</span>}
                {b.hardCount > 0 && <span style={s.diffPill('#f87171')}>🔴 {b.hardCount} Hard</span>}
              </div>
              <div style={s.cardFooter}>
                <span style={s.qCount}>{b.questionCount} questions</span>
                <button style={s.startBtn} onClick={() => handleStart(b.id)} disabled={starting}>
                  {starting ? 'Starting…' : 'Start Interview →'}
                </button>
              </div>
            </div>
          ))}
          </div>
        </>
      ) : (
        <div style={s.historyList}>
          {history.length === 0 && <p style={s.empty}>No interviews yet. Pick a bank above to get started!</p>}
          {[...history].sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt)).map((h) => {
            const d = new Date(h.startedAt);
            const day = d.getDate();
            const month = d.toLocaleString('default', { month: 'short' });
            const year = d.getFullYear();
            const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
            <div key={h.id} style={s.historyItem} onClick={() => navigate(`/interview/result/${h.id}`)}>
              <div style={s.histColLeft}>
                <div style={s.hBankName}>{h.bankName}</div>
                <div style={s.hMeta}>{h.category}</div>
              </div>
              <div style={s.histColRight}>
                <div style={s.histDateCol}>
                  <span style={s.histDateText}>{day} {month} {year}</span>
                  <span style={s.histTimeText}>{time}</span>
                </div>
                <span style={s.statusBadge(h.status)}>{h.status}</span>
                {h.totalScore != null && <span style={s.scoreBadge}>{h.totalScore.toFixed(1)}</span>}
                <button style={s.delBtn} onClick={(e) => handleDeleteSession(e, h.id)} title="Delete session">🗑</button>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}

const s = {
  hero: { textAlign: 'center', marginBottom: 36 },
  heroTitle: { fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 900, color: '#e8e8eb', margin: '0 0 10px' },
  heroSub: { color: '#6b6b70', fontSize: 14, lineHeight: 1.7, maxWidth: 480, margin: '0 auto' },
  tabs: { display: 'flex', gap: 0, marginBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.07)' },
  tab: { background: 'transparent', border: 'none', color: '#6b6b70', padding: '10px 24px', cursor: 'pointer', fontSize: 14, fontWeight: 600, borderBottom: '2px solid transparent', transition: 'all 0.2s' },
  tabActive: { background: 'transparent', border: 'none', color: '#c4a052', padding: '10px 24px', cursor: 'pointer', fontSize: 14, fontWeight: 700, borderBottom: '2px solid #c4a052' },
  loading: { color: '#6b6b70', textAlign: 'center', padding: 40 },
  empty: { color: '#6b6b70', fontSize: 13, textAlign: 'center', padding: 40 },
  filterRow: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  filterBtn: { background: '#161618', border: '1px solid rgba(255,255,255,0.08)', color: '#6b6b70', padding: '5px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.15s' },
  filterActive: { background: '#c4a052', border: '1px solid #c4a052', color: '#0a0a0b', padding: '5px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 700 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 },
  card: { background: '#161618', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: 10 },
  cardBadge: { display: 'inline-block', background: '#c4a052', color: '#0a0a0b', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 10, textTransform: 'uppercase', letterSpacing: 0.5, alignSelf: 'flex-start' },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#e8e8eb', margin: 0 },
  cardDesc: { fontSize: 13, color: '#6b6b70', lineHeight: 1.5, margin: 0, flex: 1 },
  diffRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 },
  diffPill: (color) => ({ fontSize: 11, fontWeight: 600, color, background: `${color}18`, padding: '3px 10px', borderRadius: 10 }),
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  qCount: { fontSize: 12, color: '#6b6b70' },
  startBtn: { background: '#c4a052', color: '#0a0a0b', border: 'none', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700 },
  historyList: { display: 'flex', flexDirection: 'column', gap: 10 },
  historyItem: { display: 'flex', alignItems: 'center', background: '#161618', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '16px 20px', cursor: 'pointer', transition: 'border-color 0.2s', gap: 16 },
  histColLeft: { flex: 1 },
  histColRight: { display: 'flex', gap: 14, alignItems: 'center', flexShrink: 0 },
  histDateCol: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
  histDateText: { fontSize: 13, fontWeight: 600, color: '#c8c8cc' },
  histTimeText: { fontSize: 11, color: '#6b6b70', marginTop: 2 },
  hBankName: { fontSize: 14, fontWeight: 700, color: '#e8e8eb' },
  hMeta: { fontSize: 11, color: '#6b6b70', marginTop: 3 },
  statusBadge: (status) => ({
    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 10,
    background: status === 'evaluated' ? '#28a74520' : status === 'completed' ? '#c4a05220' : '#6b6b7020',
    color: status === 'evaluated' ? '#28a745' : status === 'completed' ? '#c4a052' : '#6b6b70',
  }),
  scoreBadge: { fontSize: 16, fontWeight: 800, color: '#c4a052' },
  delBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: '4px 6px', borderRadius: 6, opacity: 0.5, transition: 'opacity 0.2s' },
};
