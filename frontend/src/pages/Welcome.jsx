import React from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100vw',
    background: '#0a0a0b',
    padding: '20px',
    fontFamily: "'Inter', sans-serif",
    boxSizing: 'border-box',
  },
  content: {
    textAlign: 'center',
    backgroundColor: '#161618',
    borderRadius: '10px',
    padding: '64px 48px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    maxWidth: '1000px',
    width: '100%',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  logoBox: {
    width: 64,
    height: 64,
    background: '#c4a052',
    borderRadius: '12px',
    color: '#0a0a0b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '24px',
    margin: '0 auto 28px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  title: {
    fontSize: '44px',
    fontWeight: 800,
    color: '#e8e8eb',
    marginBottom: '16px',
    letterSpacing: '-1.5px',
  },
  brandHighlight: {
    background: '#c4a052',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: '17px',
    color: '#6b6b70',
    marginBottom: '40px',
    lineHeight: '1.65',
    fontWeight: 500,
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    margin: '32px 0',
  },
  feature: {
    padding: '24px',
    borderRadius: '10px',
    background: '#1d1d20',
    border: '1px solid rgba(255,255,255,0.07)',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease',
  },
  hireEaseFeature: {
    padding: '24px',
    borderRadius: '10px',
    background: 'rgba(196,160,82,0.06)',
    border: '2px solid rgba(196,160,82,0.2)',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  featureTitle: {
    fontSize: '12px',
    color: '#86868b',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '8px',
    display: 'block'
  },
  featureDesc: {
    fontSize: '13px',
    color: '#6b6b70',
    lineHeight: '1.6'
  },
  buttonContainer: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: '44px',
  },
  primaryButton: {
    padding: '16px 48px',
    fontSize: '16px',
    fontWeight: '700',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: '#c4a052',
    color: '#0a0a0b',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  secondaryButton: {
    padding: '16px 48px',
    fontSize: '16px',
    fontWeight: '700',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: 'rgba(255,255,255,0.05)',
    color: '#86868b',
  },
};

export default function Welcome() {
  const navigate = useNavigate();
  const [hoveredBtn, setHoveredBtn] = React.useState(null);

  return (
    <div className="workspace" style={styles.container}>
      <div className="glass-card" style={styles.content}>
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
                color: '#d4b062',
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
              background: hoveredBtn === 'login' ? '#b89545' : '#c4a052',
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
              borderColor: hoveredBtn === 'register' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
              background: hoveredBtn === 'register' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
              color: hoveredBtn === 'register' ? '#e8e8eb' : '#86868b',
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