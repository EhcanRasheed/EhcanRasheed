
// --- Copied styles from SubscriptionPlan page for visual consistency ---
const st = {
  grid: {
    display: 'flex',
    flexDirection: 'row',
    gap: 24,
    marginTop: 32,
    justifyContent: 'center',
    flexWrap: 'nowrap',
    overflowX: 'auto',
  },
  planCard: {
    background: '#161618', borderRadius: 16, padding: '36px 28px',
    border: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', position: 'relative',
    transition: 'all 0.3s ease',
  },
  planTitle: { fontSize: '1.4rem', fontWeight: 700, color: '#e8e8eb', marginBottom: 4, marginTop: 0 },
  price: { fontSize: '1.6rem', fontWeight: 800, color: '#c4a052', margin: '8px 0 20px' },
  featuresList: { display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28, flex: 1 },
  featureItem: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#86868b' },
  checkmark: { color: '#3faa72', fontWeight: 700, fontSize: 18 },
};

const TIERS = [
  {
    name: 'Basic',
    price: 'PKR 0',
    features: [
      '3 AI Mock Interviews / month',
      '3 Resume Analyses / month',
      '20 AI Chatbot Messages / month',
      'Basic Interview Results',
      'General Question Banks',
    ],
  },
  {
    name: 'Professional',
    price: 'PKR 1,500',
    features: [
      '15 AI Mock Interviews / month',
      '10 Resume Analyses / month',
      'Unlimited AI Chatbot',
      'Comprehensive Analytics',
      'Premium Question Banks',
    ],
  },
  {
    name: 'Elite',
    price: 'PKR 4,500',
    features: [
      'Unlimited AI Mock Interviews',
      'Unlimited Resume Analyses',
      'Priority AI Chatbot',
      'Advanced Analytics & Tracking',
      'Custom Tailored Question Banks',
    ],
  },
];

export default function Pricing() {
  return (
    <main style={{
      maxWidth: 900,
      margin: '48px auto',
      background: '#161618',
      borderRadius: 12,
      padding: '40px 32px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
      border: '1px solid rgba(255,255,255,0.08)',
      color: '#e8e8eb',
      fontFamily: 'Inter, sans-serif',
    }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, color: '#c4a052', letterSpacing: '-1px', textAlign: 'center' }}>Pricing</h1>
      <div style={{ color: '#86868b', fontSize: 16, marginBottom: 32, textAlign: 'center' }}>
        Choose the plan that fits your hiring needs. Simple, transparent pricing—no hidden fees.
      </div>
      <div style={st.grid}>
        {TIERS.map((tier) => (
          <div key={tier.name} className="glass-card" style={st.planCard}>
            <h3 style={st.planTitle}>{tier.name}</h3>
            <div style={st.price}>{tier.price}</div>
            <div style={st.featuresList}>
              {tier.features.map((f, i) => (
                <div key={i} style={st.featureItem}>
                  <span style={st.checkmark}>✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
