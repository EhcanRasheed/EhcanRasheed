const fs = require('fs');

let s = fs.readFileSync('frontend/src/pages/SubscriptionPlan.jsx', 'utf8');

// Also inject the import
if (!s.includes('submitPaymentRequest')) {
  s = s.replace("import AppLayout from '../components/AppLayout';", "import AppLayout from '../components/AppLayout';\nimport { submitPaymentRequest } from '../api/auth';");
}

let handlePaymentSubmit = `
  const handlePaymentSubmit = async () => {
    if (!screenshot) {
      alert('Please upload a screenshot of your transaction.');
      return;
    }
    setLoadingTier(selectedPlan);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(screenshot);
      reader.onloadend = async () => {
        const base64data = reader.result;
        await submitPaymentRequest(selectedPlan, paymentMethod, base64data);
        alert(\`Payment screenshot for \${selectedPlan} submitted! Admin will verify soon.\`);
        setShowPaymentModal(false);
        setScreenshot(null);
        setLoadingTier(null);
      };
    } catch (error) {
      alert('Error submitting payment.');
      setLoadingTier(null);
    }
  };
`;

s = s.replace(/const handlePaymentSubmit = \(\) => \{[\s\S]*?\}, 2000\);\s*};\s*/, handlePaymentSubmit);

fs.writeFileSync('frontend/src/pages/SubscriptionPlan.jsx', s, 'utf8');
console.log('hooked');
