import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { SkeletonText, SkeletonLine } from '../components/Skeleton';
import { getPublicSessionInfo, joinSession } from '../api/hiring';

export default function CandidateEntry() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [resume, setResume] = useState(null);
  const [resumeName, setResumeName] = useState('');

  useEffect(() => {
    getPublicSessionInfo(sessionId)
      .then((data) => setSessionInfo(data))
      .catch((err) => {
        const msg = err.response?.data?.message || 'Session not found or unavailable';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB');
      return;
    }
    setResume(file);
    setResumeName(file.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) { toast.error('Name and email are required.'); return; }
    if (!resume) { toast.error('Please upload your resume (PDF).'); return; }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('email', email.trim());
      formData.append('resume', resume);

      const result = await joinSession(sessionId, formData);
      toast.success('Resume submitted! Starting interview...');
      // Navigate to the interview page with the candidateId
      setTimeout(() => {
        navigate(`/hire/${sessionId}/interview/${result.candidateId}`, { replace: true });
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join session');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}><SkeletonLine width="60%" height={20} style={{ marginBottom: 16 }} /><SkeletonText lines={3} /></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 48, marginBottom: 16 }}>🚫</p>
              <h2 style={{ color: '#e8e8eb', marginBottom: 8 }}>Session Unavailable</h2>
              <p style={{ color: '#6b6b70', fontSize: 14, lineHeight: 1.6 }}>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Session Info */}
        <div style={styles.headerCard}>
          <div style={styles.logo}>HC</div>
          <h1 style={styles.title}>{sessionInfo.title}</h1>
          {sessionInfo.companyName && (
            <p style={{ color: '#c4a052', fontSize: 14, fontWeight: 600, margin: '6px 0 0' }}>
              {sessionInfo.companyName}
            </p>
          )}
          {sessionInfo.jobDescription && (
            <p style={{ color: '#6b6b70', fontSize: 13, lineHeight: 1.6, margin: '12px 0 0', whiteSpace: 'pre-wrap' }}>{sessionInfo.jobDescription}</p>
          )}
          <div style={styles.infoRow}>
            <span style={styles.infoBadge}>📋 AI Interview</span>
            <span style={styles.infoBadge}>📄 Resume Required</span>
            <span style={styles.infoBadge}>⏱️ ~15 min</span>
          </div>
        </div>

        {/* Join Form */}
        <div style={styles.formCard}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px', color: '#e8e8eb' }}>Apply Here</h2>
          <p style={{ color: '#6b6b70', fontSize: 13, margin: '0 0 20px' }}>Fill in your details and upload your resume to begin the AI interview.</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name *</label>
              <input style={styles.input} placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address *</label>
              <input type="email" style={styles.input} placeholder="john@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Resume (PDF) *</label>
              <input type="file" accept=".pdf" onChange={handleFileChange} style={styles.fileInput} />
              {resumeName && <span style={{ fontSize: 12, color: '#2f8a5a', marginTop: 4 }}>✓ {resumeName}</span>}
              <span style={styles.helpText}>Upload your resume in PDF format (max 5MB)</span>
            </div>

            <button type="submit" disabled={submitting} style={{ ...styles.submitBtn, opacity: submitting ? 0.5 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
              {submitting ? 'Submitting...' : 'Start Interview →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: '#3a3a3f', fontSize: 11, marginTop: 32 }}>
          Powered by HireCraft · AI Interview Platform
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#0a0a0b', color: '#e8e8eb', fontFamily: "'Inter', sans-serif", display: 'flex', justifyContent: 'center' },
  container: { maxWidth: 520, width: '100%', padding: '40px 24px' },
  card: { background: '#161618', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '36px 28px' },

  headerCard: { background: '#161618', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '32px 28px', textAlign: 'center', marginBottom: 20 },
  logo: { width: 44, height: 44, background: '#c4a052', color: '#0a0a0b', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontWeight: 800, fontSize: 18 },
  title: { fontSize: 22, fontWeight: 900, margin: 0, letterSpacing: '-0.3px' },
  infoRow: { display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16 },
  infoBadge: { fontSize: 12, color: '#86868b', background: '#0a0a0b', padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' },

  formCard: { background: '#161618', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '28px 28px' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  inputGroup: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: 11, fontWeight: 700, color: '#86868b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', fontSize: 14, outline: 'none', color: '#e8e8eb', backgroundColor: '#1d1d20' },
  fileInput: { width: '100%', background: '#1d1d20', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', color: '#e8e8eb', fontSize: 13, cursor: 'pointer', boxSizing: 'border-box' },
  helpText: { marginTop: 6, fontSize: 11, color: '#555558' },
  submitBtn: { background: '#c4a052', color: '#0a0a0b', border: 'none', padding: '14px 24px', borderRadius: 12, fontWeight: 700, fontSize: 15, marginTop: 8, boxShadow: '0 2px 12px rgba(196,160,82,0.3)' },
};
