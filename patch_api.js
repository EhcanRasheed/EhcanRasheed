const fs = require('fs');

let s = fs.readFileSync('frontend/src/api/admin.js', 'utf8');

const apiAdditions = `
export const getPayments = async () => {
    const response = await api.get('/admin/payments');
    return response.data;
};

export const approvePayment = async (id) => {
    const response = await api.patch('/admin/payments/' + id + '/approve');
    return response.data;
};

export const rejectPayment = async (id) => {
    const response = await api.patch('/admin/payments/' + id + '/reject');
    return response.data;
};
`;

s += '\n' + apiAdditions;
fs.writeFileSync('frontend/src/api/admin.js', s, 'utf8');
console.log('done api');
