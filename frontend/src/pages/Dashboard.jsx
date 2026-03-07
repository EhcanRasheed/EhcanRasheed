import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';

function UsageMeter({ label, used, limit, onClick }) {
  const isUnlimited = limit === null;
  const pct = isUnlimited ? 0 : Math.min(100, (used / limit) * 100);
  const atLimit = !isUnlimited && used >= limit;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#c8c8cc' }}>{label}</span>
        <span style={{ fontSize: 12, color: atLimit ? '#e74c3c' : '#c4a052', fontWeight: 700 }}>
          {isUnlimited ? '∞ Unlimited' : `${used} / ${limit}`}
        </span>
      </div>
      {!isUnlimited && (
        <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: atLimit ? '#e74c3c' : pct > 75 ? '#e0a030' : '#c4a052', borderRadius: 3, transition: 'width 0.4s ease' }} />
        </div>
      )}
      {atLimit && (
        <span style={{ fontSize: 11, color: '#e74c3c', marginTop: 4, display: 'block', cursor: 'pointer', textDecoration: 'underline' }} onClick={onClick}>
          Limit reached — Upgrade plan
        </span>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user, usageLimits } = useAuth();
  const navigate = useNavigate();

  return (
    <AppLayout activePage="dashboard" sidebarMode="fixed">
      <header style={styles.topBar}>
        <div>
          <h1 style={styles.pageTitle}>
            Welcome, {user?.fullName || user?.email || 'Professional'}
          </h1>
          <p style={styles.subText}>
            Your AI-powered career command center.
          </p>
        </div>
      </header>

      <div style={styles.grid}>
        <div className="glass-card" style={styles.card} onClick={() => navigate('/resume')}>
          <h3 style={styles.cardTitle}>Resume Analysis</h3>
          <p style={styles.cardDesc}>
            Upload your document for deep-dive ATS keyword scanning and structural optimization.
          </p>
        </div>

        <div className="glass-card" style={styles.card} onClick={() => navigate('/chatbot')}>
          <h3 style={styles.cardTitle}>Chatbot</h3>
          <p style={styles.cardDesc}>
            Engage in casual practice with Crafty to refine your technical explanations and logic.
          </p>
        </div>

        <div className="glass-card" style={styles.card} onClick={() => navigate('/interview')}>
          <h3 style={styles.cardTitle}>Interview Preparation</h3>
          <p style={styles.cardDesc}>
            Participate in a formal AI-driven simulation for your target role and industry.
          </p>
        </div>

        <div className="glass-card" style={styles.enterpriseCard} onClick={() => navigate('/hiring-ease')}>
          <h3 style={styles.cardTitle}>Hiring Ease</h3>
          <p style={styles.cardDesc}>
            Mass interview tools for corporations using shared access links.
          </p>
          <button style={styles.maroonBtn}>Manage Enterprise</button>
        </div>
      </div>

      {/* Monthly Usage Meters */}
      {usageLimits && (
        <div className="glass-card" style={styles.usageCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#e8e8eb' }}>Monthly Usage</h3>
            <span style={{ fontSize: 12, color: '#6b6b70', background: 'rgba(196,160,82,0.12)', border: '1px solid rgba(196,160,82,0.2)', color: '#c4a052', padding: '3px 10px', borderRadius: 12, fontWeight: 600 }}>
              {(usageLimits.tier || 'basic').charAt(0).toUpperCase() + (usageLimits.tier || 'basic').slice(1)} Plan
            </span>
          </div>
          <UsageMeter label="AI Mock Interviews" used={usageLimits.usage.interviews.used} limit={usageLimits.usage.interviews.limit} onClick={() => navigate('/subscription')} />
          <UsageMeter label="Resume Analyses" used={usageLimits.usage.resumes.used} limit={usageLimits.usage.resumes.limit} onClick={() => navigate('/subscription')} />
          <UsageMeter label="Chatbot Messages" used={usageLimits.usage.chatbot.used} limit={usageLimits.usage.chatbot.limit} onClick={() => navigate('/subscription')} />
          <button style={styles.upgradeBtn} onClick={() => navigate('/subscription')}>Manage Plan</button>
        </div>
      )}

      <footer style={styles.footer}>
        <div style={styles.footerGrid}>
          <div style={styles.footerBrandCol}>
            <div style={styles.footerLogoRow}>
              <div style={styles.logoBoxSmall}>HC</div>
              <span style={styles.footerBrandName}>Hire-Craft</span>
            </div>
            <p style={styles.footerDescription}>
              Crafting the future of recruitment through generative AI and data-driven insights.
            </p>
          </div>
          <div style={styles.footerNavCol}>
            <h4 style={styles.footerHeader}>Product</h4>
            <span style={styles.footerLink} onClick={() => navigate('/resume')}>Resume Analysis</span>
            <span style={styles.footerLink} onClick={() => navigate('/chatbot')}>AI Chatbot</span>
            <span style={styles.footerLink} onClick={() => navigate('/interview')}>Mock Interviews</span>
          </div>
        </div>
        <div style={styles.copyrightSection}>
          <p>&copy; 2026 Hire-Craft AI. All rights reserved.</p>
        </div>
      </footer>
    </AppLayout>
  );
}

const styles = {
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '48px',
  },
  pageTitle: {
    fontSize: 'clamp(1.4rem, 4vw, 2rem)',
    fontWeight: 800,
    color: '#e8e8eb',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  subText: { color: '#6b6b70', fontSize: '14px', marginTop: '6px' },
  grid: {
    display: 'grid',
    gap: '20px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  },
  card: {
    background: '#161618',
    border: '1px solid rgba(255,255,255,0.07)',
    padding: '32px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
  },
  enterpriseCard: {
    background: '#161618',
    border: '1px solid rgba(255,255,255,0.07)',
    borderTop: '4px solid #c4a052',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
  },
  cardTitle: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#e8e8eb',
    marginBottom: '10px',
  },
  cardDesc: {
    color: '#6b6b70',
    fontSize: '14px',
    lineHeight: 1.65,
    marginBottom: '24px',
  },
  maroonBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: '12px',
    background: '#c4a052',
    border: 'none',
    color: '#0a0a0b',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  usageCard: {
    background: '#161618',
    border: '1px solid rgba(255,255,255,0.07)',
    padding: '28px 32px',
    borderRadius: '12px',
    marginTop: '24px',
  },
  upgradeBtn: {
    marginTop: 8,
    padding: '9px 20px',
    borderRadius: 10,
    background: 'rgba(196,160,82,0.12)',
    border: '1px solid rgba(196,160,82,0.3)',
    color: '#c4a052',
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
  },
  footer: {
    marginTop: '80px',
    paddingTop: '48px',
    borderTop: '1px solid rgba(255,255,255,0.07)',
  },
  footerGrid: { display: 'flex', flexWrap: 'wrap', gap: '32px', justifyContent: 'space-between', marginBottom: '40px' },
  footerBrandCol: { display: 'flex', flexDirection: 'column', gap: '12px' },
  footerLogoRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoBoxSmall: {
    width: 30, height: 30, background: '#c4a052', borderRadius: '8px',
    color: '#0a0a0b', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 800, fontSize: '11px',
  },
  footerBrandName: { fontWeight: 700, fontSize: '1rem', color: '#e8e8eb' },
  footerDescription: { color: '#555558', fontSize: '13px', lineHeight: 1.65, maxWidth: '300px' },
  footerNavCol: { display: 'flex', flexDirection: 'column', gap: '12px' },
  footerHeader: {
    fontSize: '11px', fontWeight: 700, color: '#555558', marginBottom: '8px',
    textTransform: 'uppercase', letterSpacing: '1px',
  },
  footerLink: { textDecoration: 'none', color: '#6b6b70', fontSize: '13px', cursor: 'pointer' },
  copyrightSection: {
    padding: '24px 0', borderTop: '1px solid rgba(255,255,255,0.05)',
    textAlign: 'center', color: '#3a3a3d', fontSize: '12px',
  },
};
