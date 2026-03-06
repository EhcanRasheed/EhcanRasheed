const fs = require('fs');

const path = 'frontend/src/pages/AdminDashboard.jsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('paymentCount')) {
  code = code.replace(
    /const \[bankCount, setBankCount\] = useState\(0\);/,
    `const [bankCount, setBankCount] = useState(0);\n  const [paymentCount, setPaymentCount] = useState(0);`
  );

  code = code.replace(
    /adminApi\.getAllBanks\(\)\.catch\(\(\) => \[\]\)/,
    `adminApi.getAllBanks().catch(() => []),\n      adminApi.getPayments().catch(() => [])`
  );

  code = code.replace(
    /\.then\(\(\[users, banks\]\) => \{/,
    `.then(([users, banks, payments]) => {`
  );

  code = code.replace(
    /setBankCount\(banks\.length\);/,
    `setBankCount(banks.length);\n      if(payments) setPaymentCount(payments.filter(p => p.status === 'PENDING').length);`
  );

  const cardHtml = `
        <div className="glass-card" style={s.card} onClick={() => navigate('/admin/payments')}>
          <div style={s.cardIcon}>💳</div>
          <h3 style={s.cardTitle}>Payment Requests</h3>
          <p style={s.cardDesc}>Review manual payment proofs and upgrade user tiers.</p>
          {loading ? (
            <div className="skeleton-text short" style={{ marginTop: 'auto', marginBottom: 0, height: '18px' }}></div>
          ) : (
            <span style={s.stat}>{paymentCount} pending requests</span>
          )}
        </div>
      </div>
    </AppLayout>`;

  code = code.replace(
    /<\/div>\s*<\/AppLayout>/,
    cardHtml
  );

  fs.writeFileSync(path, code);
  console.log('patched successfully');
}
