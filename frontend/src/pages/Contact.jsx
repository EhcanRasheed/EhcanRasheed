import React from 'react';

const styles = {
  container: {
    maxWidth: 520,
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
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: '24px 0',
    fontSize: 16,
    textAlign: 'center',
  },
  link: {
    color: '#c4a052',
    textDecoration: 'none',
    wordBreak: 'break-all',
  },
  form: {
    marginTop: 32,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  label: {
    fontWeight: 600,
    marginBottom: 4,
    color: '#e8e8eb',
  },
  input: {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #23232a',
    background: '#23232a',
    color: '#e8e8eb',
    fontSize: 15,
    marginBottom: 8,
  },
  textarea: {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #23232a',
    background: '#23232a',
    color: '#e8e8eb',
    fontSize: 15,
    minHeight: 80,
    marginBottom: 8,
  },
  button: {
    background: '#c4a052',
    color: '#0a0a0b',
    fontWeight: 700,
    border: 'none',
    borderRadius: 8,
    padding: '12px 0',
    fontSize: 16,
    cursor: 'not-allowed',
    marginTop: 8,
    opacity: 0.7,
  },
};

export default function Contact() {
  return (
    <main style={styles.container}>
      <h1 style={styles.title}>Contact Us</h1>
      <div style={styles.subtitle}>
        Have questions, feedback, or need support? Reach out to the Hire-Craft team!
      </div>
      <ul style={styles.list}>
        <li>
          <strong>Email:</strong> <a href="mailto:ai.interviewer05@gmail.com" style={styles.link}>ai.interviewer05@gmail.com</a>
        </li>
        <li>
          <strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/chaudhary-ehsan-rasheed-26800030b/" style={styles.link} target="_blank" rel="noopener noreferrer">Chaudhary Ehsan Rasheed</a>
        </li>
      </ul>
    </main>
  );
}
