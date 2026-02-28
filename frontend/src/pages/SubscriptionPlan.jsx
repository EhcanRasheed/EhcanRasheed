import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';

export default function SubscriptionPlan() {
  const navigate = useNavigate();

  return (
    <AppLayout activePage="subscription">
      <header style={styles.topBar}>
        <div>
          <h1 style={styles.pageTitle}>Subscription Plan</h1>
          <p style={styles.subText}>Manage your subscription and billing</p>
        </div>
      </header>

      <div className="glass-card" style={styles.planCard}>
        <div style={styles.badge}>Active</div>
        <h3 style={styles.planTitle}>Professional Tier</h3>
        <p style={styles.planDesc}>
          You currently have full access to the AI Resume Lab and Interview Chatbot.
        </p>

        <div style={styles.featuresList}>
          <div style={styles.featureItem}>
            <span style={styles.checkmark}>✓</span>
            <span>Resume Analysis & ATS Optimization</span>
          </div>
          <div style={styles.featureItem}>
            <span style={styles.checkmark}>✓</span>
            <span>AI Interview Chatbot</span>
          </div>
          <div style={styles.featureItem}>
            <span style={styles.checkmark}>✓</span>
            <span>Interview Preparation Tools</span>
          </div>
          <div style={styles.featureItem}>
            <span style={styles.checkmark}>✓</span>
            <span>Priority Support</span>
          </div>
        </div>

        <button style={styles.maroonBtn} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    </AppLayout>
  );
}

const styles = {
  topBar: { display: 'flex', justifyContent: 'space-between', marginBottom: '32px' },
  pageTitle: { fontSize: '2rem', fontWeight: 800, color: '#e8e8eb', margin: 0, letterSpacing: '-0.5px' },
  subText: { color: '#6b6b70', fontSize: '14px', marginTop: '6px' },
  planCard: { background: '#161618', borderRadius: '12px', padding: '40px', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 2px 12px rgba(0,0,0,0.4)', maxWidth: '600px' },
  badge: { fontSize: '10px', background: '#c4a052', color: '#0a0a0b', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, display: 'inline-block' },
  planTitle: { fontSize: '1.5rem', fontWeight: 700, color: '#e8e8eb', marginBottom: '16px', marginTop: '12px' },
  planDesc: { color: '#6b6b70', fontSize: '14px', lineHeight: '1.65', marginBottom: '32px' },
  featuresList: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' },
  featureItem: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#86868b' },
  checkmark: { color: '#3faa72', fontWeight: 700, fontSize: '18px' },
  maroonBtn: { width: '100%', padding: '14px', borderRadius: '12px', background: '#c4a052', border: 'none', color: '#0a0a0b', fontWeight: 700, cursor: 'pointer', fontSize: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
};
