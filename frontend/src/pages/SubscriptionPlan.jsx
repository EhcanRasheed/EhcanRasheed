import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import { SkeletonCardGrid } from '../components/Skeleton';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function authHeader() {
  const t = localStorage.getItem('accessToken');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

const methodMeta = {
  easypaisa: { label: 'EasyPaisa', badge: 'EP' },
  jazzcash:  { label: 'JazzCash', badge: 'JC' },
  bank:      { label: 'Direct Bank Transfer', badge: 'BT' },
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
      'General Question Banks'
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
      'Premium Question Banks'
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
      'Custom Tailored Question Banks'
    ],
  },
];

export default function SubscriptionPlan() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [currentTier, setCurrentTier] = useState('basic');
  const [pendingStatus, setPendingStatus] = useState(null); // null | 'PENDING' | 'APPROVED' | 'REJECTED'
  const [pendingTier, setPendingTier] = useState(null);
  const [loading, setLoading] = useState(true);

  // Payment form state
  const [showPayForm, setShowPayForm] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('easypaisa');
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/payments/my-status`, { headers: authHeader() });
      const data = res.data;
      let tier = data.approvedTier || user?.tier || 'basic';
      if (tier.toLowerCase() === 'free') tier = 'basic';
      setCurrentTier(tier);
      if (data.pending) {
        setPendingStatus(data.pending.status);
        setPendingTier(data.pending.requestedTier);
      } else {
        setPendingStatus(null);
        setPendingTier(null);
      }
    } catch {
      let tier = user?.tier || 'basic';
      if (tier.toLowerCase() === 'free') tier = 'basic';
      setCurrentTier(tier);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeClick = (tier) => {
    setSelectedTier(tier);
    setShowPayForm(true);
    setSubmitMsg('');
    setScreenshot(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setScreenshot(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmitPayment = async () => {
    if (!screenshot) { setSubmitMsg('Please upload a payment screenshot.'); return; }
    setSubmitting(true);
    setSubmitMsg('');
    try {
      await axios.post(`${API}/payments/submit`, {
        requestedTier: selectedTier,
        paymentMethod,
        screenshotBase64: screenshot,
      }, { headers: { ...authHeader(), 'Content-Type': 'application/json' } });
      setSubmitMsg('Payment submitted! Waiting for admin approval.');
      setShowPayForm(false);
      loadStatus();
    } catch (err) {
      setSubmitMsg(err.response?.data?.message || 'Failed to submit payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const tierIndex = (name) => TIERS.findIndex((t) => t.name.toLowerCase() === name?.toLowerCase());

  return (
    <AppLayout activePage="subscription">
      <header style={st.topBar}>
        <div>
          <h1 style={st.pageTitle}>Subscription Plan</h1>
          <p style={st.subText}>
            {loading ? 'Loading your plan...' : `Your current tier: ${currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}`}
          </p>
        </div>
      </header>

      {/* Pending request banner */}
      {pendingStatus === 'PENDING' && (
        <div style={st.pendingBanner}>
          ⏳ You have a <strong>{pendingTier}</strong> upgrade request under review.
          The admin will approve or reject it shortly.
        </div>
      )}
      {pendingStatus === 'REJECTED' && (
        <div style={{...st.pendingBanner, background: 'rgba(231,76,60,0.12)', borderColor: 'rgba(231,76,60,0.3)', color: '#e74c3c'}}>
          ✗ Your last upgrade request for <strong>{pendingTier}</strong> was rejected. You can submit a new one below.
        </div>
      )}

      {/* Tier cards */}
      {loading ? (
        <SkeletonCardGrid count={3} columns="repeat(auto-fit,minmax(260px,1fr))" />
      ) : (
      <div style={st.grid}>
        {TIERS.map((tier) => {
          const isCurrent = tier.name.toLowerCase() === currentTier?.toLowerCase();
          const isLower = tierIndex(tier.name) <= tierIndex(currentTier);
          return (
            <div key={tier.name} className="glass-card" style={{...st.planCard, ...(isCurrent ? st.planCardActive : {})}}>
              {isCurrent && <div style={st.badge}>Current Plan</div>}
              <h3 style={st.planTitle}>{tier.name}</h3>
              <p style={st.price}>{tier.price}<span style={st.priceUnit}>/month</span></p>
              <div style={st.featuresList}>
                {tier.features.map((f, i) => (
                  <div key={i} style={st.featureItem}>
                    <span style={st.checkmark}>✓</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              {!isCurrent && !isLower && pendingStatus !== 'PENDING' && (
                <button style={st.upgradeBtn} onClick={() => handleUpgradeClick(tier.name)}>
                  Upgrade to {tier.name}
                </button>
              )}
              {isCurrent && (
                <button style={st.currentBtn} disabled>Active</button>
              )}
              {!isCurrent && isLower && (
                <button style={st.disabledBtn} disabled>—</button>
              )}
            </div>
          );
        })}
      </div>
      )}

      {/* Payment submission form modal */}
      {showPayForm && (
        <div style={st.overlay} onClick={() => setShowPayForm(false)}>
          <div style={st.modal} onClick={(e) => e.stopPropagation()}>
            <button style={st.closeBtn} onClick={() => setShowPayForm(false)} aria-label="Close">&times;</button>
            <h2 style={st.modalTitle}>Upgrade to {selectedTier}</h2>
            <p style={st.modalDesc}>
              Select a payment method, transfer the amount, then upload a screenshot of the receipt.
            </p>

            {/* Payment Method Selector */}
            <div style={{ marginBottom: 16, position: 'relative' }}>
              <label style={st.label}>Payment Method</label>
              <div style={st.customSelect} onClick={() => setShowMethodDropdown(v => !v)}>
                <span style={{ color: '#c4a052', fontWeight: 600 }}>{methodMeta[paymentMethod].label}</span>
                <span style={{ color: '#86868b', fontSize: 11 }}>{showMethodDropdown ? '▲' : '▼'}</span>
              </div>
              {showMethodDropdown && (
                <div style={st.dropdownList}>
                  {Object.entries(methodMeta).map(([key, m]) => (
                    <div key={key} style={{ ...st.dropdownOption, background: paymentMethod === key ? 'rgba(255,255,255,0.06)' : 'transparent' }}
                      onClick={() => { setPaymentMethod(key); setShowMethodDropdown(false); }}>
                      <span style={{ color: '#c4a052', fontWeight: 700, fontSize: 13 }}>{m.badge}</span>
                      <span style={{ color: '#e8e8eb', fontWeight: 600 }}>{m.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Account Details Card */}
            <div style={st.accountCard}>
              {paymentMethod === 'easypaisa' && (
                <>
                  <p style={{ fontSize: 12, color: '#86868b', marginBottom: 4 }}>Send to EasyPaisa number:</p>
                  <p style={{ fontSize: 18, color: '#c4a052', fontWeight: 700, letterSpacing: 2, fontFamily: 'monospace' }}>0300 - 1234567</p>
                  <p style={{ fontSize: 12, color: '#86868b', marginTop: 6 }}>Account Title: <strong style={{ color: '#e8e8eb' }}>Hire-Craft (Pvt) Ltd.</strong></p>
                </>
              )}
              {paymentMethod === 'jazzcash' && (
                <>
                  <p style={{ fontSize: 12, color: '#86868b', marginBottom: 4 }}>Send to JazzCash number:</p>
                  <p style={{ fontSize: 18, color: '#c4a052', fontWeight: 700, letterSpacing: 2, fontFamily: 'monospace' }}>0321 - 7654321</p>
                  <p style={{ fontSize: 12, color: '#86868b', marginTop: 6 }}>Account Title: <strong style={{ color: '#e8e8eb' }}>Hire-Craft (Pvt) Ltd.</strong></p>
                </>
              )}
              {paymentMethod === 'bank' && (
                <>
                  <p style={{ fontSize: 12, color: '#86868b', marginBottom: 4 }}>Meezan Bank Ltd.</p>
                  <p style={{ fontSize: 15, color: '#c4a052', fontWeight: 700, letterSpacing: 1, fontFamily: 'monospace' }}>IBAN: PK42 MEZN 0001 1234 5678 9101</p>
                  <p style={{ fontSize: 12, color: '#86868b', marginTop: 6 }}>Account Title: <strong style={{ color: '#e8e8eb' }}>Hire-Craft (Pvt) Ltd.</strong></p>
                </>
              )}
            </div>

            <label style={st.label}>Upload Payment Screenshot</label>
            <div
              style={st.dropZone}
              onClick={() => fileRef.current?.click()}
            >
              {screenshot ? (
                <img src={screenshot} alt="Preview" style={st.previewImg} />
              ) : (
                <span style={{color: '#6b6b70'}}>Click to upload screenshot (PNG / JPG)</span>
              )}
              <input type="file" accept="image/*" ref={fileRef} style={{display:'none'}} onChange={handleFileChange} />
            </div>

            {submitMsg && <p style={{color: submitMsg.includes('Failed') || submitMsg.includes('Please') ? '#e74c3c' : '#2ecc71', fontSize: 13, margin: '12px 0 0'}}>{submitMsg}</p>}

            <div style={st.modalActions}>
              <button style={st.cancelBtn} onClick={() => setShowPayForm(false)}>Cancel</button>
              <button style={st.submitBtn} disabled={submitting} onClick={handleSubmitPayment}>
                {submitting ? 'Submitting...' : 'Submit Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {submitMsg && !showPayForm && (
        <p style={{textAlign:'center', marginTop: 24, color: '#2ecc71', fontSize: 14}}>{submitMsg}</p>
      )}
    </AppLayout>
  );
}

const st = {
  topBar: { display: 'flex', justifyContent: 'space-between', marginBottom: 32 },
  pageTitle: { fontSize: '2rem', fontWeight: 800, color: '#e8e8eb', margin: 0, letterSpacing: '-0.5px' },
  subText: { color: '#6b6b70', fontSize: 14, marginTop: 6 },
  pendingBanner: {
    background: 'rgba(196,160,82,0.12)', border: '1px solid rgba(196,160,82,0.3)',
    borderRadius: 12, padding: '14px 20px', color: '#c4a052', fontSize: 14,
    marginBottom: 28, lineHeight: 1.6,
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 },
  planCard: {
    background: '#161618', borderRadius: 16, padding: '36px 28px',
    border: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', position: 'relative',
    transition: 'all 0.3s ease',
  },
  planCardActive: { 
    border: '2px solid rgba(196,160,82,0.9)', 
    boxShadow: '0 0 25px rgba(196,160,82,0.4), inset 0 0 15px rgba(196,160,82,0.1)',
    transform: 'translateY(-4px)'
  },
  badge: { fontSize: 10, background: '#c4a052', color: '#0a0a0b', padding: '2px 8px', borderRadius: 12, fontWeight: 700, display: 'inline-block', position: 'absolute', top: 16, right: 16 },
  planTitle: { fontSize: '1.4rem', fontWeight: 700, color: '#e8e8eb', marginBottom: 4, marginTop: 0 },
  price: { fontSize: '1.6rem', fontWeight: 800, color: '#c4a052', margin: '8px 0 20px' },
  priceUnit: { fontSize: 13, fontWeight: 400, color: '#6b6b70' },
  featuresList: { display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28, flex: 1 },
  featureItem: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#86868b' },
  checkmark: { color: '#3faa72', fontWeight: 700, fontSize: 18 },
  upgradeBtn: {
    width: '100%', padding: 14, borderRadius: 12, background: '#c4a052', border: 'none',
    color: '#0a0a0b', fontWeight: 700, cursor: 'pointer', fontSize: 15,
  },
  currentBtn: {
    width: '100%', padding: 14, borderRadius: 12, background: 'rgba(196,160,82,0.15)',
    border: '1px solid rgba(196,160,82,0.3)', color: '#c4a052', fontWeight: 700, fontSize: 15, cursor: 'default',
  },
  disabledBtn: {
    width: '100%', padding: 14, borderRadius: 12, background: 'transparent',
    border: '1px solid rgba(255,255,255,0.05)', color: '#3a3a3c', fontWeight: 600, fontSize: 15, cursor: 'default',
  },
  /* Modal */
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 9999,
  },
  modal: {
    background: '#1c1c1e', borderRadius: 18, padding: '36px 32px', width: '100%',
    maxWidth: 480, border: '1px solid rgba(255,255,255,0.08)', maxHeight: '90vh', overflowY: 'auto',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute', top: 14, right: 14, background: 'transparent', border: 'none',
    color: '#6b6b70', fontSize: 26, cursor: 'pointer', lineHeight: 1, padding: '4px 8px',
    borderRadius: 8, transition: 'color 0.15s',
  },
  modalTitle: { fontSize: '1.3rem', fontWeight: 700, color: '#e8e8eb', margin: '0 0 8px' },
  modalDesc: { color: '#6b6b70', fontSize: 13, lineHeight: 1.6, marginBottom: 20 },
  label: { display: 'block', color: '#86868b', fontSize: 11, fontWeight: 700, marginBottom: 6, marginTop: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  customSelect: { background: '#1d1d20', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  dropdownList: { position: 'absolute', top: '100%', left: 0, right: 0, background: '#1d1d20', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden', zIndex: 10, marginTop: 4 },
  dropdownOption: { padding: '12px 16px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  accountCard: { background: '#0a0a0b', border: '1px solid rgba(196,160,82,0.25)', borderRadius: 10, padding: '16px 20px', marginBottom: 20, textAlign: 'center' },
  dropZone: {
    width: '100%', height: 160, borderRadius: 10, border: '2px dashed rgba(255,255,255,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
    background: '#0a0a0b', overflow: 'hidden', marginTop: 4,
  },
  previewImg: { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' },
  modalActions: { display: 'flex', gap: 12, marginTop: 24 },
  cancelBtn: {
    flex: 1, padding: 12, borderRadius: 10, background: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)', color: '#86868b', fontWeight: 600, cursor: 'pointer', fontSize: 14,
  },
  submitBtn: {
    flex: 1, padding: 12, borderRadius: 10, background: '#c4a052', border: 'none',
    color: '#0a0a0b', fontWeight: 700, cursor: 'pointer', fontSize: 14,
  },
};
