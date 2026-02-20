import React from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#eef2f6',
    padding: '20px',
    fontFamily: "'Inter', sans-serif",
  },
  content: {
    textAlign: 'center',
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '60px 40px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)',
    maxWidth: '1000px', 
    width: '100%',
    border: '1px solid #e2e8f0',
  },
  logoBox: {
    width: 60,
    height: 60,
    background: '#0f172a',
    borderRadius: '16px',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '24px',
    margin: '0 auto 24px',
    boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.2)',
  },
  title: {
    fontSize: '42px',
    fontWeight: 800,
    color: '#0f172a',
    marginBottom: '15px',
    letterSpacing: '-1px',
  },
  brandHighlight: {
    color: '#800000',
  },
  subtitle: {
    fontSize: '18px',
    color: '#475569',
    marginBottom: '40px',
    lineHeight: '1.6',
    fontWeight: 500,
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    margin: '30px 0',
  },
  feature: {
    padding: '24px',
    borderRadius: '16px',
    background: '#f8fafc',
    border: '1px solid #f1f5f9',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease',
  },
  hireEaseFeature: {
    padding: '24px',
    borderRadius: '16px',
    background: '#fff',
    border: '2px solid #800000',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 15px -3px rgba(128, 0, 0, 0.1)',
  },
  featureTitle: {
    fontSize: '13px',
    color: '#0f172a',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
    display: 'block'
  },
  featureDesc: {
    fontSize: '13px',
    color: '#64748b',
    lineHeight: '1.5'
  },
  buttonContainer: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: '40px',
  },
  primaryButton: {
    padding: '16px 48px',
    fontSize: '16px',
    fontWeight: '700',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: '#800000',
    color: '#fff',
  },
  secondaryButton: {
    padding: '16px 48px',
    fontSize: '16px',
    fontWeight: '700',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: '#fff',
    color: '#0f172a',
  },
};

export default function Welcome() {
  const navigate = useNavigate();
  const [hoveredBtn, setHoveredBtn] = React.useState(null);

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.logoBox}>HC</div>
        
        <h1 style={styles.title}>
          Master Your Career with <span style={styles.brandHighlight}>HireCraft</span>
        </h1>
        
        <p style={styles.subtitle}>
          The unified AI ecosystem for elite candidates and modern enterprises.
        </p>

        <div style={styles.featuresGrid}>
          {/* Module 1: Resume Analysis */}
          <div style={styles.feature}>
            <span style={styles.featureTitle}>Resume Lab</span>
            <span style={styles.featureDesc}>
              Precision structural audits and keyword optimization to outperform automated ATS filters.
            </span>
          </div>

          {/* Module 2: Chatbot */}
          <div style={styles.feature}>
            <span style={styles.featureTitle}>Interview Chatbot</span>
            <span style={styles.featureDesc}>
              Interact with a focused AI assistant for general interview guidance and technical logic practice.
            </span>
          </div>

          {/* Module 3: Interviews */}
          <div style={styles.feature}>
            <span style={styles.featureTitle}>Formal Interviews</span>
            <span style={styles.featureDesc}>
              High-stakes, interactive AI environments designed to build authentic, role-specific confidence.
            </span>
          </div>

          {/* Module 4: Hire Ease */}
          <div style={styles.hireEaseFeature}>
            <span 
              style={{
                ...styles.featureTitle, 
                color: '#800000', 
                fontWeight: '900', 
                fontSize: '14px'
              }}
            >
              Hire Ease
            </span>
            <span style={styles.featureDesc}>
              Mass-scale candidate screening for organizations, delivering high-tier talent through AI-led efficiency.
            </span>
          </div>
        </div>

        <div style={styles.buttonContainer}>
          <button
            style={{
              ...styles.primaryButton,
              background: hoveredBtn === 'login' ? '#600000' : '#800000',
              transform: hoveredBtn === 'login' ? 'translateY(-2px)' : 'none'
            }}
            onMouseEnter={() => setHoveredBtn('login')}
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={() => navigate('/login')}
          >
            Sign In
          </button>
          
          <button
            style={{
              ...styles.secondaryButton,
              borderColor: hoveredBtn === 'register' ? '#0f172a' : '#e2e8f0',
              background: hoveredBtn === 'register' ? '#f8fafc' : '#fff',
              transform: hoveredBtn === 'register' ? 'translateY(-2px)' : 'none'
            }}
            onMouseEnter={() => setHoveredBtn('register')}
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={() => navigate('/register')}
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}