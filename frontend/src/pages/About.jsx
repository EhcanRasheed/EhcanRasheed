import React from 'react';

const styles = {
  container: {
    maxWidth: 700,
    margin: '48px auto',
    background: '#161618',
    borderRadius: 12,
    padding: '40px 32px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#e8e8eb',
    fontFamily: 'Inter, sans-serif',
  },
  title: {
    fontSize: 32,
    fontWeight: 800,
    marginBottom: 12,
    color: '#c4a052',
    letterSpacing: '-1px',
    textAlign: 'center',
  },
  subtitle: {
    color: '#86868b',
    fontSize: 18,
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: 600,
  },
  sectionTitle: {
    color: '#c4a052',
    fontWeight: 700,
    fontSize: 20,
    marginTop: 32,
    marginBottom: 8,
  },
  list: {
    color: '#e8e8eb',
    fontSize: 16,
    marginLeft: 24,
    marginBottom: 0,
  },
};

export default function About() {
  return (
    <main style={styles.container}>
      <h1 style={styles.title}>About Hire-Craft</h1>
      <div style={styles.subtitle}>
        Making hiring seamless, efficient, and fair for everyone.
      </div>
      <div>
        <div style={styles.sectionTitle}>Our Mission</div>
        <p>
          To empower organizations with smart, automated interview solutions and help candidates showcase their true potential.
        </p>
        <div style={styles.sectionTitle}>Our Story</div>
        <p>
          Founded by a team passionate about technology and talent, Hire-Craft was built to solve real-world hiring challenges. We believe in transparency, innovation, and putting people first.
        </p>
        <div style={styles.sectionTitle}>Why Choose Us?</div>
        <ul style={styles.list}>
          <li>Automated, unbiased interview sessions</li>
          <li>Easy-to-use dashboards for hiring managers</li>
          <li>Secure and privacy-focused platform</li>
        </ul>
      </div>
    </main>
  );
}
