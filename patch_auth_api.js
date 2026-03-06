const fs = require('fs');

let s = fs.readFileSync('frontend/src/api/auth.js', 'utf8');

const apiAdditions = `
export const submitPaymentRequest = async (requestedTier, paymentMethod, screenshotBase64) => {
  const response = await authApi.post('/payments/submit', { requestedTier, paymentMethod, screenshotBase64 });
  return response.data;
};
`;

s += '\n' + apiAdditions;
fs.writeFileSync('frontend/src/api/auth.js', s, 'utf8');
console.log('done auth api');