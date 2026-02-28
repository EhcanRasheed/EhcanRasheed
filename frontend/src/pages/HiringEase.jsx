import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';

export default function HiringEase() {
  const navigate = useNavigate();

  return (
    <AppLayout activePage="hiring-ease">
      <div style={styles.hero}>
        <span style={styles.proBadge}>Enterprise • Pro</span>
        <h1 style={styles.heroTitle}>Hiring Ease</h1>
        <p style={styles.heroSub}>Streamline mass hiring with AI-powered bulk screening, shared interview links, and team dashboards.</p>
      </div>

      <div style={styles.featureGrid}>
        <div style={styles.featureCard}>
          <div style={styles.featureIcon}>🔗</div>
          <h3 style={styles.featureTitle}>Shareable Invite Links</h3>
          <p style={styles.featureDesc}>Send a single link to thousands of candidates. Each gets a unique AI-proctored interview session.</p>
        </div>
        <div style={styles.featureCard}>
          <div style={styles.featureIcon}>🤖</div>
          <h3 style={styles.featureTitle}>AI Auto-Screening</h3>
          <p style={styles.featureDesc}>Automatically rank and shortlist candidates based on answer quality, reducing manual review by 80%.</p>
        </div>
        <div style={styles.featureCard}>
          <div style={styles.featureIcon}>👥</div>
          <h3 style={styles.featureTitle}>Team Dashboard</h3>
          <p style={styles.featureDesc}>Collaborative hiring workspace for your entire HR team -- assign, review, and comment together.</p>
        </div>
        <div style={styles.featureCard}>
          <div style={styles.featureIcon}>📊</div>
          <h3 style={styles.featureTitle}>Hiring Analytics</h3>
          <p style={styles.featureDesc}>Deep insights into funnel performance, candidate quality scores, and time-to-hire metrics.</p>
        </div>
      </div>

      <div style={styles.ctaRow}>
        <button style={styles.maroonBtn} onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    </AppLayout>
  );
}

const styles = {
  hero: { textAlign: 'center', marginBottom: '48px' },
  proBadge: { display: 'inline-block', background: '#c4a052', color: '#0a0a0b', fontSize: '11px', fontWeight: 700, padding: '4px 14px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' },
  heroTitle: { fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, color: '#e8e8eb', margin: '0 0 12px', letterSpacing: '-0.5px' },
  heroSub: { color: '#6b6b70', fontSize: '15px', lineHeight: '1.7', maxWidth: '540px', margin: '0 auto' },
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' },
  featureCard: { background: '#161618', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '12px' },
  featureIcon: { fontSize: '28px', lineHeight: '1' },
  featureTitle: { fontSize: '15px', fontWeight: 700, color: '#e8e8eb', margin: 0 },
  featureDesc: { fontSize: '13px', color: '#6b6b70', lineHeight: '1.6', margin: 0 },
  ctaRow: { display: 'flex', justifyContent: 'center' },
  maroonBtn: { background: '#c4a052', color: '#0a0a0b', border: 'none', padding: '14px 36px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '15px', marginTop: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
};
