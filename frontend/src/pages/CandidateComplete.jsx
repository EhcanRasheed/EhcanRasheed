import React from 'react';
import { useParams } from 'react-router-dom';

export default function CandidateComplete() {
  const { sessionId } = useParams();

  return (
    <div style={styles.page}>
      <div style={styles.center}>
        <div style={styles.card}>
          <div style={styles.logo}>HC</div>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <h1 style={styles.title}>Interview Complete!</h1>
          <p style={styles.subtitle}>
            Thank you for completing your interview. Your responses have been submitted and will be evaluated by our AI system.
          </p>

          <div style={styles.infoBox}>
            <p style={{ margin: '0 0 8px', color: '#86868b', fontSize: 13 }}>What happens next?</p>
            <ul style={styles.list}>
              <li>Your answers and resume are being evaluated by AI</li>
              <li>The hiring manager will review your results</li>
              <li>You may be contacted for next steps</li>
            </ul>
          </div>

          <p style={styles.note}>
            You can safely close this page. No further action is needed.
          </p>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <a href="/" style={styles.link}>Visit Hire-Craft →</a>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#0a0a0b', color: '#e8e8eb', fontFamily: "'Inter', sans-serif" },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: 24 },
  card: { background: '#161618', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '48px 40px', maxWidth: 480, width: '100%', textAlign: 'center' },
  logo: { width: 48, height: 48, background: '#c4a052', color: '#0a0a0b', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontWeight: 800, fontSize: 20 },
  title: { fontSize: 24, fontWeight: 900, margin: '0 0 10px', letterSpacing: '-0.3px' },
  subtitle: { color: '#6b6b70', fontSize: 14, lineHeight: 1.7, margin: '0 0 24px' },
  infoBox: { background: '#0a0a0b', border: '1px solid rgba(196,160,82,0.2)', borderRadius: 12, padding: '16px 20px', textAlign: 'center' },
  list: { margin: 0, paddingLeft: 18, color: '#86868b', fontSize: 13, lineHeight: 2 },
  note: { color: '#555558', fontSize: 12, marginTop: 20 },
  link: { color: '#c4a052', fontSize: 14, fontWeight: 700, textDecoration: 'none' },
};
