import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { hiringSubmitPayment, hiringGetPaymentStatus } from '../api/hiringAuth';
import { useToast } from '../context/ToastContext';
import { SkeletonText } from '../components/Skeleton';

const methodMeta = {
  easypaisa: { label: 'EasyPaisa', badge: 'EP' },
  jazzcash:  { label: 'JazzCash', badge: 'JC' },
  bank:      { label: 'Direct Bank Transfer', badge: 'BT' },
};

export default function HiringPayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const email = location.state?.email || '';
  const userId = location.state?.userId || '';

  const [paymentMethod, setPaymentMethod] = useState('easypaisa');
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingStatus, setExistingStatus] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Try to check existing payment status (if user already has a token)
  useEffect(() => {
    if (!userId) { setCheckingStatus(false); return; }
    hiringGetPaymentStatus(userId)
      .then((data) => {
        if (data?.hasPending) setExistingStatus('PENDING');
        else if (data?.isApproved) setExistingStatus('APPROVED');
      })
      .catch(() => {})
      .finally(() => setCheckingStatus(false));
  }, [userId]);

  const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setScreenshot(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!screenshot) { toast.error('Please upload a screenshot of your payment.'); return; }
    setSubmitting(true);
    try {
      const base64 = await readFileAsBase64(screenshot);
      await hiringSubmitPayment(userId, paymentMethod, base64);
      setSubmitted(true);
      toast.success('Payment proof submitted! Waiting for admin approval.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingStatus) {
    return (
      <div style={styles.container}>
        <div style={styles.card}><SkeletonText lines={3} /></div>
      </div>
    );
  }

  if (existingStatus === 'APPROVED') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{ color: '#e8e8eb', marginBottom: 8 }}>Account Already Approved!</h2>
            <p style={{ color: '#6b6b70', fontSize: 14, lineHeight: 1.6 }}>Your Hiring Ease account is active. You can start using the platform.</p>
            <button style={styles.primaryBtn} onClick={() => navigate('/hiring-ease/login')}>Go to Login</button>
          </div>
        </div>
      </div>
    );
  }

  if (existingStatus === 'PENDING' || submitted) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <h2 style={{ color: '#e8e8eb', marginBottom: 8 }}>Payment Under Review</h2>
            <p style={{ color: '#6b6b70', fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>
              Your payment screenshot has been submitted and is pending admin approval.
            </p>
            <p style={{ color: '#6b6b70', fontSize: 13 }}>
              You will receive an email once your account is activated. This usually takes <strong style={{ color: '#c4a052' }}>less than 24 hours</strong>.
            </p>
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
              <button style={styles.primaryBtn} onClick={() => navigate('/hiring-ease/login')}>Try Logging In</button>
              <Link to="/hiring-ease" style={{ color: '#6b6b70', fontSize: 13, textDecoration: 'underline' }}>← Back to Hiring Ease</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={styles.logo}>HC</div>
          <h2 style={{ color: '#e8e8eb', fontSize: 22, fontWeight: 800, margin: '0 0 6px' }}>Activate Hiring Ease</h2>
          <p style={{ color: '#6b6b70', fontSize: 13 }}>One-time activation fee</p>
          <div style={styles.priceBox}>
            <span style={{ fontSize: 12, color: '#6b6b70', textTransform: 'uppercase', letterSpacing: 1 }}>Amount</span>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#c4a052' }}>PKR 10,000</span>
          </div>
        </div>

        {email && (
          <p style={{ color: '#86868b', fontSize: 12, textAlign: 'center', marginBottom: 16 }}>
            Account: <strong style={{ color: '#e8e8eb' }}>{email}</strong>
          </p>
        )}

        {/* Payment Method Selector */}
        <div style={{ marginBottom: 16, position: 'relative' }}>
          <label style={styles.label}>Payment Method</label>
          <div style={styles.customSelect} onClick={() => setShowMethodDropdown(v => !v)}>
            <span style={{ color: '#c4a052', fontWeight: 600 }}>{methodMeta[paymentMethod].label}</span>
            <span style={{ color: '#86868b', fontSize: 11 }}>{showMethodDropdown ? '▲' : '▼'}</span>
          </div>
          {showMethodDropdown && (
            <div style={styles.dropdownList}>
              {Object.entries(methodMeta).map(([key, m]) => (
                <div key={key} style={{ ...styles.dropdownOption, background: paymentMethod === key ? 'rgba(255,255,255,0.06)' : 'transparent' }}
                  onClick={() => { setPaymentMethod(key); setShowMethodDropdown(false); }}>
                  <span style={{ color: '#c4a052', fontWeight: 700, fontSize: 13 }}>{m.badge}</span>
                  <span style={{ color: '#e8e8eb', fontWeight: 600 }}>{m.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account Details */}
        <div style={styles.accountCard}>
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

        {/* Screenshot Upload */}
        <div style={{ marginBottom: screenshotPreview ? 12 : 24 }}>
          <label style={{ ...styles.label, marginBottom: 8 }}>Upload Payment Screenshot</label>
          <input type="file" accept="image/*" onChange={handleScreenshotChange} style={styles.fileInput} />
        </div>

        {screenshotPreview && (
          <div style={{ marginBottom: 20, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(196,160,82,0.3)', maxHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0b' }}>
            <img src={screenshotPreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 160, objectFit: 'contain' }} />
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button style={styles.secondaryBtn} onClick={() => navigate('/hiring-ease')} disabled={submitting}>Cancel</button>
          <button style={{ ...styles.primaryBtn, flex: 2, opacity: submitting ? 0.5 : 1 }} onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Payment Proof'}
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/hiring-ease/login" style={{ color: '#6b6b70', fontSize: 13, textDecoration: 'underline' }}>Already paid? Login here</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100vw', background: '#0a0a0b', padding: 20, fontFamily: "'Inter', sans-serif", boxSizing: 'border-box' },
  card: { background: '#161618', padding: '36px 32px', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', width: '100%', maxWidth: 460, border: '1px solid rgba(255,255,255,0.08)' },
  logo: { width: 44, height: 44, background: '#c4a052', color: '#0a0a0b', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontWeight: 800, fontSize: 18 },
  priceBox: { display: 'inline-flex', flexDirection: 'column', background: '#0a0a0b', border: '1px solid rgba(196,160,82,0.3)', borderRadius: 12, padding: '12px 28px', gap: 4, marginTop: 12 },
  label: { display: 'block', fontSize: 11, fontWeight: 700, color: '#86868b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  customSelect: { background: '#1d1d20', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  dropdownList: { position: 'absolute', top: '100%', left: 0, right: 0, background: '#1d1d20', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden', zIndex: 10, marginTop: 4 },
  dropdownOption: { padding: '12px 16px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  accountCard: { background: '#0a0a0b', border: '1px solid rgba(196,160,82,0.25)', borderRadius: 10, padding: '16px 20px', marginBottom: 20, textAlign: 'center' },
  fileInput: { width: '100%', background: '#1d1d20', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', color: '#e8e8eb', fontSize: 13, cursor: 'pointer', boxSizing: 'border-box' },
  primaryBtn: { background: '#c4a052', color: '#0a0a0b', border: 'none', padding: '14px 24px', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer', flex: 1 },
  secondaryBtn: { background: 'transparent', color: '#6b6b70', border: '1px solid rgba(255,255,255,0.1)', padding: '14px 20px', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer', flex: 1 },
};
