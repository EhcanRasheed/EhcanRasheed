import React from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#030303',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    position: 'relative',
    overflow: 'hidden',
  },

  auroraGlow: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'rgba(79, 70, 229, 0.15)',
    filter: 'blur(120px)',
    pointerEvents: 'none',
    top: '-200px',
    right: '-200px',
  },

  content: {
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '80px 60px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    maxWidth: '1100px', 
    width: '100%',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    position: 'relative',
    zIndex: 10,
  },

  logoBox: {
    width: 60,
    height: 60,
    background: '#ffffff',
    borderRadius: '12px',
    color: '#030303',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '24px',
    margin: '0 auto 32px',
  },

  title: {
    fontSize: '3.2rem',
    fontWeight: 800,
    color: '#ffffff',
    marginBottom: '20px',
    letterSpacing: '-0.02em',
  },

  brandHighlight: {
    color: '#ffffff',
  },

  subtitle: {
    fontSize: '16px',
    color: '#888888',
    marginBottom: '60px',
    lineHeight: '1.6',
    fontWeight: 400,
  },

  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '24px',
    margin: '40px 0',
  },

  feature: {
    padding: '28px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
  },

  hireEaseFeature: {
    padding: '28px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
  },

  featureTitle: {
    fontSize: '12px',
    color: '#ffffff',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '10px',
    display: 'block'
  },

  featureDesc: {
    fontSize: '13px',
    color: '#888888',
    lineHeight: '1.6',
    fontWeight: 400,
  },

  buttonContainer: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: '60px',
  },

  primaryButton: {
    padding: '14px 48px',
    fontSize: '14px',
    fontWeight: '700',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: '#ffffff',
    color: '#030303',
    letterSpacing: '-0.02em',
  },

  secondaryButton: {
    padding: '14px 48px',
    fontSize: '14px',
    fontWeight: '700',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: 'transparent',
    color: '#ffffff',
    letterSpacing: '-0.02em',
  },
};

export default function Welcome() {
  const navigate = useNavigate();
  const [hoveredBtn, setHoveredBtn] = React.useState(null);

  return (
    <div style={styles.container}>
      <div style={styles.auroraGlow}></div>
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
          <div 
            style={{
              ...styles.feature,
              ...(hoveredBtn === 'feature1' && {
                background: 'rgba(255, 255, 255, 0.04)',
                borderColor: 'rgba(255, 255, 255, 0.12)',
              })
            }}
            onMouseEnter={() => setHoveredBtn('feature1')}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            <span style={styles.featureTitle}>Resume Lab</span>
            <span style={styles.featureDesc}>
              Precision structural audits and keyword optimization to outperform automated ATS filters.
            </span>
          </div>

          {/* Module 2: Chatbot */}
          <div 
            style={{
              ...styles.feature,
              ...(hoveredBtn === 'feature2' && {
                background: 'rgba(255, 255, 255, 0.04)',
                borderColor: 'rgba(255, 255, 255, 0.12)',
              })
            }}
            onMouseEnter={() => setHoveredBtn('feature2')}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            <span style={styles.featureTitle}>Interview Chatbot</span>
            <span style={styles.featureDesc}>
              Interact with a focused AI assistant for general interview guidance and technical logic practice.
            </span>
          </div>

          {/* Module 3: Interviews */}
          <div 
            style={{
              ...styles.feature,
              ...(hoveredBtn === 'feature3' && {
                background: 'rgba(255, 255, 255, 0.04)',
                borderColor: 'rgba(255, 255, 255, 0.12)',
              })
            }}
            onMouseEnter={() => setHoveredBtn('feature3')}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            <span style={styles.featureTitle}>Formal Interviews</span>
            <span style={styles.featureDesc}>
              High-stakes, interactive AI environments designed to build authentic, role-specific confidence.
            </span>
          </div>

          {/* Module 4: Hire Ease */}
          <div 
            style={{
              ...styles.hireEaseFeature,
              ...(hoveredBtn === 'feature4' && {
                background: 'rgba(255, 255, 255, 0.06)',
                borderColor: 'rgba(255, 255, 255, 0.16)',
              })
            }}
            onMouseEnter={() => setHoveredBtn('feature4')}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            <span 
              style={{
                ...styles.featureTitle, 
                color: '#ffffff', 
                fontWeight: '900', 
                fontSize: '12px'
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
              background: hoveredBtn === 'login' ? '#f5f5f5' : '#ffffff',
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
              borderColor: hoveredBtn === 'register' ? 'rgba(255, 255, 255, 0.20)' : 'rgba(255, 255, 255, 0.12)',
              background: hoveredBtn === 'register' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
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
