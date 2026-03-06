const fs = require('fs');

const code = `import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { getAvailableBanks, createSession } from '../api/hiring';

const CANDIDATE_LIMITS = [5, 20, 50, 100, 300, 500, 1000];
const DURATION_OPTIONS = [
  { value: 1, label: '1 Day' },
  { value: 3, label: '3 Days' },
  { value: 10, label: '10 Days' },
];

export default function CreateHiringSession() {
  const navigate = useNavigate();
  const toast = useToast();

  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    jobDescription: '',
    questionBankId: '',
    maxCandidates: 50,
    durationDays: 3,
  });

  useEffect(() => {
    getAvailableBanks()
      .then((data) => setBanks(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load question banks'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: name === 'maxCandidates' || name === 'durationDays' ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required.'); return; }

    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        jobDescription: form.jobDescription.trim() || undefined,
        bankId: form.questionBankId || undefined,
        maxCandidates: form.maxCandidates,
        durationDays: form.durationDays,
      };
      const session = await createSession(payload);
      toast.success('Session created!');
      navigate(\`/hiring-ease/session/\${session.id}\`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create session');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.headerRow}>
          <button style={styles.backBtn} onClick={() => navigate('/hiring-ease/dashboard')}>← Back to Dashboard</button>
        </div>

        <div style={styles.contentWrap}>
          <div style={styles.textSection}>
            <h1 style={styles.pageTitle}>Create New Session</h1>
            <p style={styles.pageSubtitle}>Configure a new interview session. Define the details, attach a question bank, and get a link you can share with candidates immediately.</p>
            
            <div style={styles.infoCard}>
              <div style={styles.infoIcon}>💡</div>
              <div>
                <h4 style={styles.infoTitle}>Expert Tip</h4>
                <p style={styles.infoText}>Custom question banks will tailor the AI's technical interview specifically to your company's role. If you don't select one, the AI will use a general mix of frontend engineering questions.</p>
              </div>
            </div>
          </div>

          <div style={styles.formSection}>
            <div style={styles.card}>
              <form onSubmit={handleSubmit} style={styles.form}>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Session Title *</label>
                  <input name="title" style={styles.input} placeholder="e.g. Frontend Engineer — Q2 Hiring" value={form.title} onChange={handleChange} required />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Job Description (Optional)</label>
                  <textarea name="jobDescription" style={{ ...styles.input, minHeight: 90, resize: 'vertical' }} placeholder="Detail the role, required skills, and expectations." value={form.jobDescription} onChange={handleChange} />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Question Bank</label>
                  {loading ? (
                    <p style={{ color: '#6b6b70', fontSize: 13 }}>Loading banks...</p>
                  ) : (
                    <select name="questionBankId" style={styles.input} value={form.questionBankId} onChange={handleChange}>
                      <option value="">— Default (Random General Tech Mix) —</option>
                      {banks.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.questionCount || b.questions?.length || '?'} questions){b.isCustom ? ' [Custom]' : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div style={styles.rowGrid}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Max Candidates</label>
                    <div style={styles.chipGroup}>
                      {CANDIDATE_LIMITS.map((n) => (
                        <button key={n} type="button" style={{ ...styles.chip, ...(form.maxCandidates === n ? styles.chipActive : {}) }} onClick={() => setForm(p => ({ ...p, maxCandidates: n }))}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={styles.rowGrid}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Session Duration</label>
                    <div style={styles.chipGroup}>
                      {DURATION_OPTIONS.map((d) => (
                        <button key={d.value} type="button" style={{ ...styles.chip, ...(form.durationDays === d.value ? styles.chipActive : {}) }} onClick={() => setForm(p => ({ ...p, durationDays: d.value }))}>
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={styles.summaryBox}>
                  <p style={{ margin: 0, fontSize: 13, color: '#e8e8eb', lineHeight: 1.5 }}>
                    Session limits: <strong style={{ color: '#c4a052' }}>{form.maxCandidates} candidates</strong>. 
                    Link expires in <strong style={{ color: '#c4a052' }}>{form.durationDays} day{form.durationDays > 1 ? 's' : ''}</strong>.
                  </p>
                </div>

                <div style={styles.actionRow}>
                  <button type="button" style={styles.secondaryBtn} onClick={() => navigate('/hiring-ease/dashboard')}>Cancel</button>
                  <button type="submit" disabled={submitting} style={{ ...styles.primaryBtn, opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? 'Creating...' : 'Launch Session'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>

      </div>
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
    backgroundImage: 'radial-gradient(ellipse at top right, rgba(196,160,82,0.06) 0%, transparent 60%)'
  },
  container: { 
    maxWidth: 1000, 
    margin: '0 auto',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: 10
  },
  backBtn: { 
    background: 'transparent', 
    border: '1px solid rgba(255,255,255,0.1)', 
    color: '#e8e8eb', 
    cursor: 'pointer', 
    fontSize: 13, 
    fontWeight: 500,
    padding: '8px 16px', 
    borderRadius: 8,
    transition: 'background 0.2s'
  },
  contentWrap: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.3fr',
    gap: '40px',
    alignItems: 'start'
  },
  textSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    position: 'sticky',
    top: '40px'
  },
  pageTitle: { 
    fontSize: 36, 
    fontWeight: 900, 
    margin: '0', 
    letterSpacing: '-1px',
    lineHeight: 1.1
  },
  pageSubtitle: { 
    color: '#86868b', 
    fontSize: 16, 
    margin: 0, 
    lineHeight: 1.6
  },
  infoCard: {
    background: 'rgba(196,160,82,0.05)',
    border: '1px solid rgba(196,160,82,0.15)',
    borderRadius: 12,
    padding: '20px',
    display: 'flex',
    gap: '16px',
    marginTop: '20px'
  },
  infoIcon: {
    fontSize: 24
  },
  infoTitle: {
    color: '#c4a052',
    margin: '0 0 6px 0',
    fontSize: 14,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  infoText: {
    color: '#a0a0a5',
    margin: 0,
    fontSize: 13,
    lineHeight: 1.5
  },

  formSection: {
    display: 'flex',
    flexDirection: 'column'
  },
  card: { 
    background: 'rgba(22, 22, 24, 0.6)', 
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.06)', 
    borderRadius: 16, 
    padding: '36px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.2)'
  },
  form: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: 24 
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
    borderRadius: 12, 
    border: '1px solid rgba(255,255,255,0.1)', 
    fontSize: 14, 
    outline: 'none', 
    color: '#e8e8eb', 
    backgroundColor: 'rgba(0,0,0,0.3)',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit'
  },
  
  rowGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    gap: 24
  },

  chipGroup: { 
    display: 'flex', 
    gap: 10, 
    flexWrap: 'wrap' 
  },
  chip: { 
    background: 'rgba(0,0,0,0.3)', 
    color: '#a0a0a5', 
    border: '1px solid rgba(255,255,255,0.08)', 
    padding: '10px 18px', 
    borderRadius: 10, 
    fontSize: 13, 
    fontWeight: 600, 
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  chipActive: { 
    background: 'rgba(196,160,82,0.15)', 
    color: '#c4a052', 
    border: '1px solid rgba(196,160,82,0.4)',
    boxShadow: '0 0 10px rgba(196,160,82,0.1)'
  },

  summaryBox: { 
    background: 'rgba(0,0,0,0.4)', 
    border: '1px dashed rgba(196,160,82,0.3)', 
    borderRadius: 12, 
    padding: '16px 20px',
    marginTop: 8
  },

  actionRow: {
    display: 'flex',
    gap: 14,
    marginTop: 10
  },
  primaryBtn: { 
    background: 'linear-gradient(135deg, #d4b062 0%, #c4a052 100%)', 
    color: '#0a0a0b', 
    border: 'none', 
    padding: '14px 24px', 
    borderRadius: 12, 
    fontWeight: 800, 
    fontSize: 15, 
    cursor: 'pointer', 
    flex: 2,
    boxShadow: '0 4px 15px rgba(196,160,82,0.2)',
    transition: 'transform 0.2s ease, box-shadow 0.2s',
  },
  secondaryBtn: { 
    background: 'transparent', 
    color: '#e8e8eb', 
    border: '1px solid rgba(255,255,255,0.1)', 
    padding: '14px 24px', 
    borderRadius: 12, 
    fontWeight: 600, 
    fontSize: 14, 
    cursor: 'pointer', 
    flex: 1,
    transition: 'background 0.2s'
  },
};
`;

fs.writeFileSync('C:/Users/Ehsan/Desktop/FYP/Ehsan/ehsan_interview/frontend/src/pages/CreateHiringSession.jsx', code);
console.log('patched session');
