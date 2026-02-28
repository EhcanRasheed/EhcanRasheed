import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import * as adminApi from '../api/admin';

export default function AdminBanks() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newBankCategory, setNewBankCategory] = useState('');
  const [newBankFile, setNewBankFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [feedbackCounts, setFeedbackCounts] = useState({});
  const [bankFeedback, setBankFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const CATEGORIES = [
    'Software Engineering', 'Frontend Development', 'Backend Development', 'Full Stack Development',
    'Data Science', 'Machine Learning', 'Artificial Intelligence', 'Data Engineering',
    'DevOps', 'Cloud Computing', 'Cybersecurity', 'Networking',
    'Mobile Development', 'iOS Development', 'Android Development',
    'Database Administration', 'System Design', 'Embedded Systems',
    'Blockchain', 'Game Development', 'QA & Testing',
    'Product Management', 'Project Management', 'Business Analysis',
    'UI/UX Design', 'Graphic Design',
    'Digital Marketing', 'SEO', 'Content Writing',
    'Finance & Accounting', 'Human Resources', 'Sales',
    'Healthcare', 'Nursing', 'Pharmacy',
    'Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering',
    'Teaching & Education', 'Law', 'Supply Chain & Logistics',
    'Customer Service', 'Data Analytics', 'Consulting',
    'General', 'Behavioral', 'Soft Skills', 'Leadership',
  ];

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/dashboard'); return; }
    loadBanks();
    loadFeedbackCounts();
  }, [user, navigate]);

  const loadBanks = async () => {
    try {
      const data = await adminApi.getAllBanks();
      setBanks(data);
    } catch { setMsg('Failed to load banks'); }
  };

  const loadFeedbackCounts = async () => {
    try {
      const data = await adminApi.getAllBankFeedbackCounts();
      const map = {};
      data.forEach((r) => { map[r.bankId] = { count: Number(r.count), avgRating: Number(r.avgRating) }; });
      setFeedbackCounts(map);
    } catch { /* silent */ }
  };

  const handleCreate = async () => {
    if (!newBankName.trim()) { setMsg('Bank name is required'); return; }
    if (!newBankCategory) { setMsg('Please select a category'); return; }
    if (!newBankFile) { setMsg('Please select a JSON file with questions'); return; }
    setUploading(true);
    try {
      const text = await newBankFile.text();
      const json = JSON.parse(text);
      const questions = Array.isArray(json) ? json : json.questions;
      if (!Array.isArray(questions) || questions.length === 0) throw new Error('JSON must be an array of questions');
      for (const q of questions) {
        if (!q.question && !q.text) throw new Error('Each question must have a "question" field');
      }
      const normalized = questions.map(q => ({
        question: q.question || q.text,
        difficulty: q.difficulty || 'medium',
        category: q.category || 'General',
      }));
      await adminApi.createBankWithQuestions(newBankName, newBankCategory, normalized);
      setCreating(false);
      setNewBankName('');
      setNewBankCategory('');
      setNewBankFile(null);
      setMsg(`Bank created with ${normalized.length} questions (Draft — publish when ready).`);
      loadBanks();
    } catch (e) {
      setMsg(e.message || e.response?.data?.message || 'Create failed — check JSON format');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBank = async (id) => {
    if (!window.confirm('Delete this question bank and ALL its questions?')) return;
    try {
      await adminApi.deleteBank(id);
      if (selectedBank?.id === id) setSelectedBank(null);
      setMsg('Bank deleted');
      loadBanks();
    } catch { setMsg('Delete failed'); }
  };

  const openBank = async (id) => {
    try {
      const data = await adminApi.getBankById(id);
      setSelectedBank(data);
      setShowFeedback(false);
      // Load feedback for this bank
      try {
        const fb = await adminApi.getBankFeedback(id);
        setBankFeedback(fb);
      } catch { setBankFeedback(null); }
    } catch { setMsg('Failed to load bank details'); }
  };

  const handleFileUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || !selectedBank) return;
    setUploading(true);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const questions = json.questions || json;
      if (!Array.isArray(questions)) throw new Error('Invalid format');
      const result = await adminApi.bulkUploadQuestions(selectedBank.id, questions);
      setMsg(`${result.count} questions uploaded!`);
      openBank(selectedBank.id);
    } catch (e) {
      setMsg(e.message || 'Upload failed — check JSON format');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDeleteQuestion = async (qId) => {
    try {
      await adminApi.deleteQuestion(qId);
      openBank(selectedBank.id);
    } catch { setMsg('Delete question failed'); }
  };

  const handleTogglePublish = async (e, bankId) => {
    e.stopPropagation();
    try {
      const result = await adminApi.togglePublishBank(bankId);
      setMsg(result.isPublished ? 'Bank published — now visible to users' : 'Bank unpublished — hidden from users');
      loadBanks();
      if (selectedBank?.id === bankId) openBank(bankId);
    } catch { setMsg('Failed to toggle publish status'); }
  };

  return (
    <AppLayout activePage="admin">
      <div style={s.topRow}>
        <div>
          <h1 style={s.title}>Question Banks</h1>
          <p style={s.sub}>{banks.length} banks created</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={s.goldBtn} onClick={() => setCreating(true)}>+ New Bank</button>
          <button style={s.backBtn} onClick={() => navigate('/admin')}>← Back</button>
        </div>
      </div>

      {msg && <div style={s.msg}>{msg}<button style={s.dismissBtn} onClick={() => setMsg('')}>×</button></div>}

      {/* Create Form */}
      {creating && (
        <div style={s.formCard}>
          <h3 style={s.formTitle}>Create New Question Bank</h3>
          <p style={{ color: '#6b6b70', fontSize: 12, margin: '0 0 4px' }}>New banks start as Draft. Publish when ready for users.</p>
          <input style={s.input} placeholder="Bank name" value={newBankName} onChange={(e) => setNewBankName(e.target.value)} />
          <select style={s.select} value={newBankCategory} onChange={(e) => setNewBankCategory(e.target.value)}>
            <option value="">— Select Category —</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="file" accept=".json" style={s.fileInput} onChange={(e) => setNewBankFile(e.target.files?.[0] || null)} />
          <p style={{ color: '#6b6b70', fontSize: 11, margin: 0, lineHeight: 1.5 }}>
            JSON format: <code style={s.code}>{`[{"question":"...","difficulty":"easy|medium|hard","category":"Technical|Behavioral|..."}]`}</code>
          </p>
          <div style={s.formActions}>
            <button style={s.saveBtn} onClick={handleCreate} disabled={uploading}>{uploading ? 'Creating…' : 'Create'}</button>
            <button style={s.cancelBtn} onClick={() => { setCreating(false); setNewBankName(''); setNewBankCategory(''); setNewBankFile(null); }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={s.layout}>
        {/* Bank List */}
        <div style={s.bankList}>
          {banks.map((b) => (
            <div
              key={b.id}
              style={{ ...s.bankItem, ...(selectedBank?.id === b.id ? s.bankItemActive : {}), ...(b.isPublished ? {} : { opacity: 0.7 }) }}
              onClick={() => openBank(b.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={s.bankName}>{b.name}</div>
                <span style={b.isPublished ? s.publishedBadge : s.draftBadge}>{b.isPublished ? 'Published' : 'Draft'}</span>
              </div>
              <div style={s.bankMeta}>{b.category} • {new Date(b.createdAt).toLocaleDateString()}</div>
              {feedbackCounts[b.id]?.count > 0 && (
                <div style={s.feedbackMeta}>⭐ {feedbackCounts[b.id].avgRating} ({feedbackCounts[b.id].count} reviews)</div>
              )}
              <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 4 }}>
                <button
                  style={b.isPublished ? s.unpublishBtn : s.publishBtnText}
                  onClick={(e) => handleTogglePublish(e, b.id)}
                  title={b.isPublished ? 'Unpublish' : 'Publish'}
                >
                  {b.isPublished ? 'Unpublish' : 'Publish'}
                </button>
                <button style={s.delBtnSmall} onClick={(e) => { e.stopPropagation(); handleDeleteBank(b.id); }}>🗑</button>
              </div>
            </div>
          ))}
          {banks.length === 0 && <p style={s.empty}>No banks yet. Create one above.</p>}
        </div>

        {/* Bank Detail */}
        <div style={s.bankDetail}>
          {selectedBank ? (
            <>
              <h2 style={s.detailTitle}>{selectedBank.name}</h2>
              <p style={s.detailMeta}>{selectedBank.category} — {selectedBank.description}</p>
              <p style={s.detailCount}>{selectedBank.questions?.length || 0} questions</p>

              {/* Feedback Summary + Toggle */}
              {bankFeedback && bankFeedback.count > 0 && (
                <div style={s.feedbackSummaryBar}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={s.feedbackStars}>{'★'.repeat(Math.round(bankFeedback.avgRating))}{'☆'.repeat(5 - Math.round(bankFeedback.avgRating))}</span>
                    <span style={s.feedbackAvg}>{bankFeedback.avgRating}</span>
                    <span style={s.feedbackCountText}>({bankFeedback.count} {bankFeedback.count === 1 ? 'review' : 'reviews'})</span>
                  </div>
                  <button style={s.feedbackToggleBtn} onClick={() => setShowFeedback(!showFeedback)}>
                    {showFeedback ? 'Hide Feedback' : 'View Feedback'}
                  </button>
                </div>
              )}

              {/* Feedback List */}
              {showFeedback && bankFeedback && bankFeedback.feedbacks?.length > 0 && (
                <div style={s.feedbackSection}>
                  <h4 style={s.feedbackSectionTitle}>User Feedback</h4>
                  {bankFeedback.feedbacks.map((fb) => (
                    <div key={fb.id} style={s.feedbackItem}>
                      <div style={s.feedbackHeader}>
                        <span style={s.feedbackUser}>{fb.userName}</span>
                        <span style={s.feedbackRating}>{'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}</span>
                        <span style={s.feedbackDate}>{new Date(fb.createdAt).toLocaleDateString()}</span>
                      </div>
                      {fb.comment && <p style={s.feedbackComment}>{fb.comment}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Section */}
              <div style={s.uploadSection}>
                <h4 style={s.uploadTitle}>Bulk Upload Questions (JSON)</h4>
                <p style={s.uploadHint}>
                  Format: <code style={s.code}>{`[{"question":"...","difficulty":"easy|medium|hard","category":"Technical|Behavioral|..."}]`}</code>
                </p>
                <div style={s.uploadRow}>
                  <input ref={fileRef} type="file" accept=".json" style={s.fileInput} />
                  <button style={s.goldBtn} onClick={handleFileUpload} disabled={uploading}>
                    {uploading ? 'Uploading…' : 'Upload'}
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div style={s.questionList}>
                {selectedBank.questions?.map((q, i) => (
                  <div key={q.id} style={s.questionItem}>
                    <div style={s.qNumber}>{i + 1}</div>
                    <div style={s.qBody}>
                      <div style={s.qText}>{q.text}</div>
                      <div style={s.qMeta}>
                        {q.category}{q.subcategory ? ` / ${q.subcategory}` : ''} • <span style={{ color: q.difficulty === 'easy' ? '#4ade80' : q.difficulty === 'hard' ? '#f87171' : '#c4a052', fontWeight: 600 }}>{q.difficulty}</span>
                      </div>
                    </div>
                    <button style={s.delBtnSmall} onClick={() => handleDeleteQuestion(q.id)}>🗑</button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={s.empty}>Select a bank from the left to view its questions.</p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

const s = {
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontSize: '1.6rem', fontWeight: 800, color: '#e8e8eb', margin: 0 },
  sub: { color: '#6b6b70', fontSize: 13, marginTop: 4 },
  backBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#c8c8cc', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  goldBtn: { background: '#c4a052', color: '#0a0a0b', border: 'none', padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 },
  msg: { background: '#1e1e20', border: '1px solid #c4a052', color: '#c4a052', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  dismissBtn: { background: 'none', border: 'none', color: '#c4a052', fontSize: 18, cursor: 'pointer' },
  formCard: { background: '#161618', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 500 },
  formTitle: { color: '#e8e8eb', fontSize: 15, fontWeight: 700, margin: 0 },
  input: { background: '#0e0e10', border: '1px solid rgba(255,255,255,0.12)', color: '#e8e8eb', padding: '8px 12px', borderRadius: 8, fontSize: 13 },
  select: { background: '#0e0e10', border: '1px solid rgba(255,255,255,0.12)', color: '#e8e8eb', padding: '8px 12px', borderRadius: 8, fontSize: 13, cursor: 'pointer' },
  formActions: { display: 'flex', gap: 8 },
  saveBtn: { background: '#28a745', color: '#fff', border: 'none', padding: '7px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  cancelBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#c8c8cc', padding: '7px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  layout: { display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, minHeight: 400 },
  bankList: { display: 'flex', flexDirection: 'column', gap: 6 },
  bankItem: { background: '#161618', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '14px 16px', cursor: 'pointer', position: 'relative', transition: 'border 0.15s' },
  bankItemActive: { borderColor: '#c4a052' },
  bankName: { fontSize: 14, fontWeight: 700, color: '#e8e8eb' },
  bankMeta: { fontSize: 11, color: '#6b6b70', marginTop: 4 },
  delBtnSmall: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: 0 },
  publishBtnText: { background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 6, letterSpacing: 0.3 },
  unpublishBtn: { background: '#6b6b70', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 6, letterSpacing: 0.3 },
  feedbackMeta: { fontSize: 10, color: '#c4a052', marginTop: 3 },
  publishedBadge: { fontSize: 9, fontWeight: 700, color: '#28a745', background: '#28a74520', padding: '2px 7px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  draftBadge: { fontSize: 9, fontWeight: 700, color: '#6b6b70', background: '#6b6b7020', padding: '2px 7px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  bankDetail: { background: '#161618', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 24, minHeight: 300 },
  detailTitle: { fontSize: '1.2rem', fontWeight: 800, color: '#e8e8eb', margin: 0 },
  detailMeta: { color: '#6b6b70', fontSize: 13, marginTop: 4 },
  detailCount: { color: '#c4a052', fontSize: 13, fontWeight: 600, margin: '8px 0 20px' },
  uploadSection: { background: '#0e0e10', borderRadius: 10, padding: 18, marginBottom: 20 },
  uploadTitle: { color: '#e8e8eb', fontSize: 14, fontWeight: 700, margin: '0 0 6px' },
  uploadHint: { color: '#6b6b70', fontSize: 12, margin: '0 0 12px', lineHeight: 1.5 },
  code: { background: '#1e1e20', padding: '2px 6px', borderRadius: 4, fontSize: 11, color: '#c4a052' },
  uploadRow: { display: 'flex', gap: 10, alignItems: 'center' },
  fileInput: { color: '#c8c8cc', fontSize: 13 },
  questionList: { display: 'flex', flexDirection: 'column', gap: 8 },
  questionItem: { display: 'flex', alignItems: 'flex-start', gap: 12, background: '#0e0e10', borderRadius: 8, padding: '12px 14px', position: 'relative' },
  qNumber: { background: '#c4a052', color: '#0a0a0b', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 },
  qBody: { flex: 1 },
  qText: { color: '#e8e8eb', fontSize: 13, lineHeight: 1.5 },
  qMeta: { color: '#6b6b70', fontSize: 11, marginTop: 4 },
  empty: { color: '#6b6b70', fontSize: 13, textAlign: 'center', padding: 40 },
  // Feedback styles
  feedbackSummaryBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0e0e10', borderRadius: 10, padding: '12px 16px', marginBottom: 16 },
  feedbackStars: { color: '#c4a052', fontSize: 16, letterSpacing: 2 },
  feedbackAvg: { color: '#c4a052', fontWeight: 800, fontSize: 15 },
  feedbackCountText: { color: '#6b6b70', fontSize: 12 },
  feedbackToggleBtn: { background: 'transparent', border: '1px solid rgba(196,160,82,0.3)', color: '#c4a052', padding: '5px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  feedbackSection: { background: '#0e0e10', borderRadius: 10, padding: 16, marginBottom: 20 },
  feedbackSectionTitle: { color: '#e8e8eb', fontSize: 14, fontWeight: 700, margin: '0 0 12px' },
  feedbackItem: { background: '#161618', borderRadius: 8, padding: '12px 14px', marginBottom: 8, borderLeft: '3px solid #c4a052' },
  feedbackHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 },
  feedbackUser: { color: '#e8e8eb', fontSize: 13, fontWeight: 600 },
  feedbackRating: { color: '#c4a052', fontSize: 13, letterSpacing: 1 },
  feedbackDate: { color: '#6b6b70', fontSize: 11, marginLeft: 'auto' },
  feedbackComment: { color: '#a0a0a5', fontSize: 13, lineHeight: 1.5, margin: 0 },
};
