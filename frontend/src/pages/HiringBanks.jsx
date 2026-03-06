import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { SkeletonCardGrid } from '../components/Skeleton';
import { getAvailableBanks, createCustomBank, getBankQuestions } from '../api/hiring';

export default function HiringBanks() {
  const navigate = useNavigate();
  const toast = useToast();
  const fileRef = useRef(null);

  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [expandedBank, setExpandedBank] = useState(null);
  const [expandLoading, setExpandLoading] = useState(null);

  const [newBank, setNewBank] = useState({ name: '', category: 'General' });
  const [bankFile, setBankFile] = useState(null);

  const CATEGORIES = [
    'Software Engineering', 'Frontend Development', 'Backend Development', 'Full Stack Development',
    'Data Science', 'Machine Learning', 'Artificial Intelligence', 'Data Engineering',
    'DevOps', 'Cloud Computing', 'Cybersecurity', 'Networking',
    'Mobile Development', 'iOS Development', 'Android Development',
    'Database Administration', 'System Design', 'Embedded Systems',
    'Blockchain', 'Game Development', 'QA & Testing',
    'Product Management', 'Project Management', 'Business Analysis',
    'UI/UX Design', 'Graphic Design', 'Digital Marketing',
    'Finance & Accounting', 'Human Resources', 'Sales',
    'Healthcare', 'Teaching & Education', 'Law',
    'General', 'Behavioral', 'Soft Skills', 'Leadership',
  ];

  useEffect(() => {
    getAvailableBanks()
      .then((data) => setBanks(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load banks'))
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = async (bankId) => {
    if (expandedBank?.id === bankId) { setExpandedBank(null); return; }
    setExpandLoading(bankId);
    try {
      const data = await getBankQuestions(bankId);
      setExpandedBank(data);
    } catch { toast.error('Failed to load questions'); }
    finally { setExpandLoading(null); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newBank.name.trim()) { toast.error('Bank name is required.'); return; }
    if (!bankFile) { toast.error('Please select a JSON file with questions.'); return; }

    let questions;
    try {
      const text = await bankFile.text();
      const json = JSON.parse(text);
      questions = Array.isArray(json) ? json : json.questions;
      if (!Array.isArray(questions) || questions.length === 0) throw new Error();
      for (const q of questions) {
        if (!q.question && !q.text) throw new Error('Each question must have a "question" field');
      }
    } catch (err) {
      toast.error(err.message || 'Invalid JSON file. Must be array of {question, difficulty, category}');
      return;
    }

    const normalized = questions.map(q => ({
      question: q.question || q.text,
      difficulty: (q.difficulty || 'medium').toLowerCase(),
      category: q.category || newBank.category || 'General',
    }));

    setCreating(true);
    try {
      await createCustomBank({ name: newBank.name.trim(), category: newBank.category || 'General', questions: normalized });
      toast.success('Bank created with ' + normalized.length + ' questions!');
      setShowCreate(false);
      setNewBank({ name: '', category: 'General' });
      setBankFile(null);
      if (fileRef.current) fileRef.current.value = '';
      const data = await getAvailableBanks();
      setBanks(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create bank');
    } finally { setCreating(false); }
  };

  const diffColor = (d) => d === 'easy' ? '#2f8a5a' : d === 'hard' ? '#dc4a4a' : '#c4a052';

  return (
    <motion.div style={styles.page} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={styles.container}>
        <button style={styles.backBtn} onClick={() => navigate('/hiring-ease/dashboard')}>← Back to Dashboard</button>
        <div style={styles.topRow}>
          <h1 style={styles.title}>Question Banks</h1>
          <button style={styles.primaryBtn} onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? 'Cancel' : '+ Create Custom Bank'}
          </button>
        </div>

        {showCreate && (
          <div style={styles.createCard}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', color: '#e8e8eb' }}>New Custom Question Bank</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Bank Name *</label>
                <input style={styles.input} placeholder="e.g. React Senior Interview" value={newBank.name} onChange={(e) => setNewBank(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Category</label>
                <select style={styles.input} value={newBank.category} onChange={(e) => setNewBank(p => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Questions (JSON File) *</label>
                <input ref={fileRef} type="file" accept=".json" style={{ ...styles.input, padding: '10px 16px' }} onChange={(e) => setBankFile(e.target.files?.[0] || null)} />
                <span style={styles.helpText}>
                  JSON format: <code style={{ color: '#c4a052', fontSize: 11 }}>{`[{"question":"...","difficulty":"easy|medium|hard","category":"..."}]`}</code>
                </span>
                <span style={styles.helpText}>No answers needed — candidates' responses will be AI-evaluated automatically.</span>
              </div>
              <button type="submit" disabled={creating} style={{ ...styles.primaryBtn, opacity: creating ? 0.5 : 1, width: '100%' }}>
                {creating ? 'Creating...' : 'Create Bank'}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <SkeletonCardGrid count={4} />
        ) : banks.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>🏦</p>
            <p style={{ color: '#6b6b70', fontSize: 14 }}>No question banks available. Create your first custom bank above.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {banks.map((b) => {
              const isExpanded = expandedBank?.id === b.id;
              const isLoading = expandLoading === b.id;
              return (
                <div key={b.id} style={styles.bankCard}>
                  <div style={{ cursor: 'pointer', padding: '20px 22px' }} onClick={() => toggleExpand(b.id)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e8e8eb', margin: 0 }}>{b.name}</h3>
                      <span style={{ color: '#6b6b70', fontSize: 18, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }}>▼</span>
                    </div>
                    <p style={{ color: '#86868b', fontSize: 12, margin: '0 0 6px', lineHeight: 1.5 }}>
                      {b.questionCount || '?'} questions — {b.easyCount || 0} Easy, {b.mediumCount || 0} Medium, {b.hardCount || 0} Hard
                    </p>
                    {b.category && <span style={{ fontSize: 11, color: '#c4a052', background: 'rgba(196,160,82,0.1)', padding: '2px 8px', borderRadius: 6 }}>{b.category}</span>}
                  </div>
                  {isLoading && <div style={{ padding: '12px 22px 20px', color: '#6b6b70', fontSize: 13 }}>Loading questions...</div>}
                  {isExpanded && expandedBank?.questions && (
                    <div style={styles.questionsPanel}>
                      <div style={{ marginBottom: 12, paddingTop: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#86868b', textTransform: 'uppercase' }}>{expandedBank.questions.length} Questions</span>
                      </div>
                      {expandedBank.questions.map((q, i) => (
                        <div key={q.id || i} style={styles.questionItem}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                            <div style={{ flex: 1 }}>
                              <span style={{ color: '#6b6b70', fontSize: 11, fontWeight: 700, marginRight: 8 }}>Q{i + 1}.</span>
                              <span style={{ color: '#e8e8eb', fontSize: 13, lineHeight: 1.6 }}>{q.text}</span>
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 700, color: diffColor(q.difficulty), background: diffColor(q.difficulty) + '18', padding: '2px 8px', borderRadius: 5, textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0 }}>
                              {q.difficulty}
                            </span>
                          </div>
                          {q.category && <p style={{ color: '#555558', fontSize: 11, margin: '4px 0 0 28px' }}>{q.category}{q.subcategory ? ' / ' + q.subcategory : ''}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
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
    backgroundImage: 'radial-gradient(circle at top right, rgba(196,160,82,0.06) 0%, transparent 60%)'
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
  topRow: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: 24,
    flexWrap: 'wrap',
    gap: 16
  },
  title: { 
    fontSize: 28, 
    fontWeight: 800, 
    margin: 0, 
    letterSpacing: '-0.5px' 
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
  },
  createCard: { 
    background: 'rgba(22, 22, 24, 0.6)', 
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(196,160,82,0.2)', 
    borderRadius: 16, 
    padding: '30px', 
    marginBottom: 10,
    boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
  },
  inputGroup: { 
    display: 'flex', 
    flexDirection: 'column',
    gap: 8
  },
  label: { 
    fontSize: 12, 
    fontWeight: 700, 
    color: '#a0a0a5', 
    textTransform: 'uppercase', 
    letterSpacing: 0.8 
  },
  input: { 
    padding: '14px 16px', 
    borderRadius: 10, 
    border: '1px solid rgba(255,255,255,0.1)', 
    fontSize: 14, 
    outline: 'none', 
    color: '#e8e8eb', 
    backgroundColor: 'rgba(0,0,0,0.3)',
    transition: 'border-color 0.2s',
  },
  helpText: { 
    marginTop: 6, 
    fontSize: 12, 
    color: '#86868b' 
  },
  emptyState: { 
    textAlign: 'center', 
    padding: '48px 20px', 
    background: 'rgba(22, 22, 24, 0.4)', 
    borderRadius: 16, 
    border: '1px dashed rgba(255,255,255,0.05)' 
  },
  bankCard: { 
    background: 'rgba(22, 22, 24, 0.6)', 
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.06)', 
    borderRadius: 16, 
    overflow: 'hidden', 
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  questionsPanel: { 
    padding: '0 24px 24px', 
    borderTop: '1px solid rgba(255,255,255,0.05)',
    background: 'rgba(0,0,0,0.2)'
  },
  questionItem: { 
    padding: '16px 0', 
    borderBottom: '1px solid rgba(255,255,255,0.03)' 
  },
};
