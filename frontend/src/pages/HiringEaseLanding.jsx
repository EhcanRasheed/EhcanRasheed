import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HiringEaseLanding() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>HC</div>
          <span style={styles.brand}>Hire-Craft <span style={{ color: '#c4a052' }}>Hiring Ease</span></span>
        </div>

        {/* Hero */}
        <div style={styles.hero}>
          <span style={styles.badge}>Enterprise Hiring Platform</span>
          <h1 style={styles.heroTitle}>Hire Smarter, Faster, Easier</h1>
          <p style={styles.heroSub}>
            Create AI-powered interview sessions, share a single link with hundreds of candidates,
            and let our system auto-screen resumes and evaluate interviews — all in one place.
          </p>
          <div style={styles.priceBox}>
            <span style={styles.priceLabel}>One-time Activation</span>
            <span style={styles.priceAmount}>PKR 10,000</span>
          </div>
        </div>

        {/* Features */}
        <div style={styles.featureGrid}>
          {[
            { icon: '🔗', title: 'Shareable Interview Links', desc: 'Generate a single link. Share it on LinkedIn, job boards, or WhatsApp. Candidates click and start their AI interview instantly.' },
            { icon: '📄', title: 'Auto Resume Analysis', desc: 'Every candidate uploads their resume which is automatically analyzed by AI with an ATS score, strengths, and gaps.' },
            { icon: '🤖', title: 'AI Interview Evaluation', desc: 'Each candidate is evaluated on their answers with per-question scoring, correct answers, and detailed feedback.' },
            { icon: '📊', title: 'Dashboard & Analytics', desc: 'Track candidate completion rates, average scores, and view detailed analysis reports for every applicant.' },
            { icon: '🏦', title: 'Custom Question Banks', desc: 'Use our pre-built banks or create your own custom questions with difficulty tagging (Easy/Medium/Hard).' },
            { icon: '⏱️', title: 'Session Controls', desc: 'Set candidate limits (5 to 1000) and time limits (1, 3, or 10 days). Sessions auto-expire when limits are reached.' },
          ].map((f, i) => (
            <div key={i} style={styles.featureCard}>
              <div style={styles.featureIcon}>{f.icon}</div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>How It Works</h2>
          <div style={styles.stepsGrid}>
            {[
              { num: '1', title: 'Sign Up & Pay', desc: 'Create your Hiring Ease account and pay the activation fee via screenshot.' },
              { num: '2', title: 'Get Approved', desc: 'Admin reviews and approves your account within 24 hours.' },
              { num: '3', title: 'Create a Session', desc: 'Select a question bank, set limits, and generate your shareable link.' },
              { num: '4', title: 'Share & Screen', desc: 'Share the link. Candidates apply, get screened, and you view all results on your dashboard.' },
            ].map((s, i) => (
              <div key={i} style={styles.stepCard}>
                <div style={styles.stepNum}>{s.num}</div>
                <h4 style={styles.stepTitle}>{s.title}</h4>
                <p style={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={styles.ctaSection}>
          <button style={styles.primaryBtn} onClick={() => navigate('/hiring-ease/register')}>
            Sign Up for Hiring Ease
          </button>
          <button style={styles.secondaryBtn} onClick={() => navigate('/hiring-ease/login')}>
            Already have an account? Login
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button style={styles.linkBtn} onClick={() => navigate('/dashboard')}>
            ← Back to Main Dashboard
          </button>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p>© 2026 Hire-Craft. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#0a0a0b', color: '#e8e8eb', fontFamily: "'Inter', -apple-system, system-ui, sans-serif", padding: '40px 24px' },
  container: { maxWidth: 1100, width: '100%', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 },
  logo: { width: 40, height: 40, borderRadius: 10, background: '#c4a052', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, color: '#0a0a0b' },
  brand: { fontSize: 20, fontWeight: 700, color: '#e8e8eb' },

  hero: { textAlign: 'center', marginBottom: 56 },
  badge: { display: 'inline-block', background: 'rgba(196,160,82,0.15)', color: '#c4a052', fontSize: 11, fontWeight: 700, padding: '5px 16px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  heroTitle: { fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, margin: '0 0 16px', letterSpacing: '-0.5px' },
  heroSub: { color: '#6b6b70', fontSize: 16, lineHeight: 1.7, maxWidth: 600, margin: '0 auto 24px' },
  priceBox: { display: 'inline-flex', flexDirection: 'column', background: '#161618', border: '1px solid rgba(196,160,82,0.3)', borderRadius: 12, padding: '16px 32px', gap: 4 },
  priceLabel: { fontSize: 12, color: '#6b6b70', textTransform: 'uppercase', letterSpacing: 1 },
  priceAmount: { fontSize: 28, fontWeight: 900, color: '#c4a052' },

  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 56 },
  featureCard: { background: '#161618', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 10 },
  featureIcon: { fontSize: 28 },
  featureTitle: { fontSize: 15, fontWeight: 700, color: '#e8e8eb', margin: 0 },
  featureDesc: { fontSize: 13, color: '#6b6b70', lineHeight: 1.6, margin: 0 },

  section: { marginBottom: 56 },
  sectionTitle: { fontSize: 22, fontWeight: 800, textAlign: 'center', marginBottom: 28, color: '#e8e8eb' },
  stepsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 },
  stepCard: { background: '#161618', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '24px 20px', textAlign: 'center' },
  stepNum: { width: 36, height: 36, borderRadius: '50%', background: '#c4a052', color: '#0a0a0b', fontWeight: 900, fontSize: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  stepTitle: { fontSize: 14, fontWeight: 700, color: '#e8e8eb', margin: '0 0 8px' },
  stepDesc: { fontSize: 13, color: '#6b6b70', lineHeight: 1.5, margin: 0 },

  ctaSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 20 },
  primaryBtn: { background: '#c4a052', color: '#0a0a0b', border: 'none', padding: '16px 48px', borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 12px rgba(196,160,82,0.3)' },
  secondaryBtn: { background: 'transparent', color: '#c4a052', border: '1px solid rgba(196,160,82,0.3)', padding: '12px 36px', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer' },
  linkBtn: { background: 'none', border: 'none', color: '#6b6b70', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' },

  footer: { textAlign: 'center', marginTop: 64, padding: '20px 0', borderTop: '1px solid rgba(255,255,255,0.06)', color: '#3a3a3f', fontSize: 12 },
};
