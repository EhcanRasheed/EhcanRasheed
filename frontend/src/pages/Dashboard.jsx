import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';

export default function Dashboard() {
  const { user } = useAuth();
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

      <footer style={styles.footer}>
        <div style={styles.footerGrid}>
          <div style={styles.footerBrandCol}>
            <div style={styles.footerLogoRow}>
              <div style={styles.logoBoxSmall}>HC</div>
              <span style={styles.footerBrandName}>HireCraft</span>
            </div>
            <p style={styles.footerDescription}>
              Crafting the future of recruitment through generative AI and data-driven insights.
            </p>
          </div>
          <div style={styles.footerNavCol}>
            <h4 style={styles.footerHeader}>Product</h4>
            <span style={styles.footerLink} onClick={() => navigate('/resume')}>Resume Lab</span>
            <span style={styles.footerLink} onClick={() => navigate('/chatbot')}>AI Chatbot</span>
            <span style={styles.footerLink} onClick={() => navigate('/interview')}>Mock Interviews</span>
          </div>
        </div>
        <div style={styles.copyrightSection}>
          <p>&copy; 2026 HireCraft AI. All rights reserved.</p>
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
    fontSize: '2rem',
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
  footer: {
    marginTop: '80px',
    paddingTop: '48px',
    borderTop: '1px solid rgba(255,255,255,0.07)',
  },
  footerGrid: { display: 'flex', justifyContent: 'space-between', marginBottom: '40px' },
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
