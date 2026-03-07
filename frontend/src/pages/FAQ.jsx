
import React, { useState } from 'react';

const faqs = [
  {
    q: 'How much does Hire-Craft cost?',
    a: (
      <>
        We offer a free Basic plan for everyone. The Professional plan is PKR 1,500/month, and the Elite plan is PKR 4,500/month. See our <a href="/pricing" style={{ color: '#c4a052' }}>Pricing</a> page for full details.
      </>
    ),
  },
  {
    q: 'Will my subscription be auto-renewed?',
    a: (
      <>
        No, subscriptions are <b>not auto-renewed</b>. You must manually renew your plan each month to continue using premium features. You can manage your plan from your account dashboard.
      </>
    ),
  },
  {
    q: 'What payment methods do you accept?',
    a: (
      <>
        We accept EasyPaisa, JazzCash, and direct bank transfer. For Elite plans, contact us for custom payment options.
      </>
    ),
  },
  {
    q: 'Is my data secure?',
    a: (
      <>
        Yes, we use industry-standard security practices to protect your data and privacy.
      </>
    ),
  },
  {
    q: 'Can I try Hire-Craft for free?',
    a: (
      <>
        Yes, our Basic plan is free for all users.
      </>
    ),
  },
  {
    q: 'How do I contact support?',
    a: (
      <>
        Email us at <a href="mailto:ai.interviewer05@gmail.com" style={{ color: '#c4a052' }}>ai.interviewer05@gmail.com</a> or use the info on our <a href="/contact" style={{ color: '#c4a052' }}>Contact</a> page.
      </>
    ),
  },
];

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
    marginBottom: 18,
    color: '#c4a052',
    letterSpacing: '-1px',
    textAlign: 'center',
  },
  accordion: {
    marginTop: 32,
  },
  item: {
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    padding: '18px 0',
    cursor: 'pointer',
  },
  question: {
    fontWeight: 700,
    color: '#c4a052',
    fontSize: 18,
    marginBottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    userSelect: 'none',
  },
  answer: {
    color: '#e8e8eb',
    fontSize: 16,
    marginTop: 12,
    lineHeight: 1.7,
    transition: 'max-height 0.3s',
  },
  chevron: {
    marginLeft: 12,
    fontSize: 18,
    color: '#86868b',
    transition: 'transform 0.2s',
  },
};

export default function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <main style={styles.container}>
      <h1 style={styles.title}>Frequently Asked Questions</h1>
      <div style={styles.accordion}>
        {faqs.map((faq, i) => (
          <div key={i} style={styles.item}>
            <div
              style={styles.question}
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
              tabIndex={0}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setOpen(open === i ? null : i)}
            >
              {faq.q}
              <span style={{ ...styles.chevron, transform: open === i ? 'rotate(90deg)' : 'rotate(0deg)' }}>&#9654;</span>
            </div>
            {open === i && (
              <div style={styles.answer}>{faq.a}</div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
