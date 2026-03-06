const fs = require('fs');
let s = fs.readFileSync('frontend/src/pages/SubscriptionPlan.jsx', 'utf8');

const fragment = `
        {/* Premium Payment Modal Overlay */}
        {showPaymentModal && (
          <div style={styles.modalOverlay}>
            <div className="glass-card" style={styles.modalContent}>
              <h2 style={{color: '#e8e8eb', marginBottom: '1rem'}}>
                Upgrade to {selectedPlan} <span style={{color: '#c4a052'}}>🚀</span>
              </h2>
              <p style={{color: '#86868b', marginBottom: '1.5rem', fontSize: '0.9rem'}}>
                To activate this tier, please transfer 
                <strong style={{color: '#c4a052'}}> Rs. {selectedPlan === 'Professional' ? '1500' : '2500'} </strong> 
                via your preferred method and upload the screenshot.
              </p>

              <div style={{marginBottom: '1rem'}}>
                <label style={{color: '#e8e8eb', fontSize: '0.9rem', marginBottom: '8px', display: 'block'}}>Method</label>
                <select 
                  style={styles.paymentSelect}
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="easypaisa">EasyPaisa</option>
                  <option value="jazzcash">JazzCash</option>
                  <option value="bank">Direct Bank Transfer</option>
                </select>
              </div>

              <div style={styles.accountCard}>
                {paymentMethod === 'easypaisa' && (
                  <>
                    <p style={{fontSize: '0.85rem', color: '#86868b'}}>EasyPaisa Account number:</p>
                    <p style={{fontSize: '1.1rem', color: '#e8e8eb', letterSpacing: '1px'}}>03XX - XXXXXXX</p>
                    <p style={{fontSize: '0.85rem', color: '#86868b', marginTop:'4px'}}>Title: AI Interview Prep (Pvt) Ltd.</p>
                  </>
                )}
                {paymentMethod === 'jazzcash' && (
                  <>
                    <p style={{fontSize: '0.85rem', color: '#86868b'}}>JazzCash Account number:</p>
                    <p style={{fontSize: '1.1rem', color: '#e8e8eb', letterSpacing: '1px'}}>03XX - XXXXXXX</p>
                    <p style={{fontSize: '0.85rem', color: '#86868b', marginTop:'4px'}}>Title: AI Interview Prep (Pvt) Ltd.</p>
                  </>
                )}
                {paymentMethod === 'bank' && (
                  <>
                    <p style={{fontSize: '0.85rem', color: '#86868b'}}>Meezan Bank Ltd.</p>
                    <p style={{fontSize: '1.1rem', color: '#e8e8eb'}}>IBAN: PK42 MEZN 0000 0000 0000 00</p>
                    <p style={{fontSize: '0.85rem', color: '#86868b', marginTop:'4px'}}>Title: AI Interview Prep (Pvt) Ltd.</p>
                  </>
                )}
              </div>

              <div style={{marginBottom: '2rem'}}>
                <label style={{display: 'block', color: '#e8e8eb', fontSize: '0.9rem', marginBottom: '8px'}}>Upload Screenshot</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setScreenshot(e.target.files[0])}
                  style={styles.fileInput}
                />
              </div>

              <div style={{display: 'flex', gap: '10px'}}>
                <button style={{...styles.btn, ...styles.btnOutline, flex: 1}} onClick={() => setShowPaymentModal(false)}>Cancel</button>
                <button className="hover-bg-gold" style={{...styles.btn, ...styles.btnPrimary, flex: 2}} onClick={handlePaymentSubmit} disabled={loadingTier !== null}>{loadingTier ? 'Processing...' : 'Submit Verification'}</button>
              </div>
            </div>
          </div>
        )}
      </AppLayout>
`;
s = s.replace('</AppLayout>', fragment);
let missingStyles = `
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    background: 'rgba(22, 22, 24, 0.95)',
    border: '1px solid rgba(196, 160, 82, 0.3)',
    boxShadow: '0 8px 32px rgba(196, 160, 82, 0.2)',
    padding: '30px',
    borderRadius: '24px',
    width: '90%',
    maxWidth: '450px'
  },
  paymentSelect: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#e8e8eb',
    fontSize: '1rem',
    outline: 'none',
    cursor: 'pointer'
  },
  accountCard: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    padding: '15px',
    marginBottom: '1.5rem',
    border: '1px dashed rgba(255,255,255,0.08)'
  },
  fileInput: {
    width: '100%',
    padding: '10px',
    color: '#86868b',
    background: 'rgba(255,255,255,0.02)',
    border: '1px dashed rgba(196, 160, 82, 0.4)',
    borderRadius: '8px',
    cursor: 'pointer'
  },`;
if (!s.includes('modalOverlay:')) {
  s = s.replace('const styles = {', 'const styles = {' + missingStyles);
}
fs.writeFileSync('frontend/src/pages/SubscriptionPlan.jsx', s, 'utf8');
console.log('Done!');