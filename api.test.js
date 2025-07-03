const axios = require('axios');

const API_URL = 'http://localhost:5050/api';

const testUser = {
  name: 'Test User',
  email: 'testuser@example.com',
  password: 'TestPass123!'
};

const testAccount = {
  name: 'Test Account',
  type: 'checking',
  balance: 1000,
  currency: 'AED'
};

const testBudget = {
  name: 'Test Budget',
  category: 'Food',
  amount: 500,
  currency: 'AED',
  period: 'monthly'
};

const testTransaction = {
  type: 'expense',
  description: 'Test Transaction',
  amount: 50,
  currency: 'AED',
  category: 'Food',
  tags: ['test'],
  accountId: null // to be filled after account creation
};

const testNote = {
  content: 'Test note',
  priority: 'high',
  type: 'tip'
};

const testPending = {
  type: 'income',
  description: 'Pending Salary',
  amount: 2000,
  currency: 'AED',
  date: new Date().toISOString()
};

let jwt = '';
let created = {};

async function runTests() {
  try {
    // Register user
    console.log('Registering user...');
    await axios.post(`${API_URL}/auth/register`, testUser);
    console.log('✔ User registration: OK');
  } catch (err) {
    if (err.response && err.response.data && err.response.data.error && err.response.data.error.includes('exists')) {
      console.log('✔ User already exists, continuing...');
    } else {
      console.error('✖ User registration failed:', err.response?.data || err.message);
      return;
    }
  }

  try {
    // Login user
    console.log('Logging in...');
    const res = await axios.post(`${API_URL}/auth/login`, { email: testUser.email, password: testUser.password });
    jwt = res.data.token;
    console.log('✔ User login: OK');
  } catch (err) {
    console.error('✖ User login failed:', err.response?.data || err.message);
    return;
  }

  const auth = { headers: { Authorization: `Bearer ${jwt}` } };

  // Accounts CRUD
  try {
    console.log('Creating account...');
    const res = await axios.post(`${API_URL}/accounts`, testAccount, auth);
    created.account = res.data;
    testTransaction.accountId = res.data._id || res.data.id;
    console.log('✔ Account creation: OK');

    console.log('Getting accounts...');
    await axios.get(`${API_URL}/accounts`, auth);
    console.log('✔ Get accounts: OK');

    console.log('Updating account...');
    await axios.put(`${API_URL}/accounts/${created.account._id || created.account.id}`, { ...testAccount, balance: 2000 }, auth);
    console.log('✔ Update account: OK');

    // Don't delete yet, needed for transaction
  } catch (err) {
    console.error('✖ Account CRUD failed:', err.response?.data || err.message);
  }

  // Budgets CRUD
  try {
    console.log('Creating budget...');
    const res = await axios.post(`${API_URL}/budgets`, testBudget, auth);
    created.budget = res.data;
    console.log('✔ Budget creation: OK');

    console.log('Getting budgets...');
    await axios.get(`${API_URL}/budgets`, auth);
    console.log('✔ Get budgets: OK');

    console.log('Updating budget...');
    await axios.put(`${API_URL}/budgets/${created.budget._id || created.budget.id}`, { ...testBudget, amount: 600 }, auth);
    console.log('✔ Update budget: OK');

    console.log('Deleting budget...');
    await axios.delete(`${API_URL}/budgets/${created.budget._id || created.budget.id}`, auth);
    console.log('✔ Delete budget: OK');
  } catch (err) {
    console.error('✖ Budget CRUD failed:', err.response?.data || err.message);
  }

  // Transactions CRUD
  try {
    console.log('Creating transaction...');
    const res = await axios.post(`${API_URL}/transactions`, testTransaction, auth);
    created.transaction = res.data;
    console.log('✔ Transaction creation: OK');

    console.log('Getting transactions...');
    await axios.get(`${API_URL}/transactions`, auth);
    console.log('✔ Get transactions: OK');

    console.log('Updating transaction...');
    await axios.put(`${API_URL}/transactions/${created.transaction._id || created.transaction.id}`, { ...testTransaction, amount: 75 }, auth);
    console.log('✔ Update transaction: OK');

    console.log('Deleting transaction...');
    await axios.delete(`${API_URL}/transactions/${created.transaction._id || created.transaction.id}`, auth);
    console.log('✔ Delete transaction: OK');
  } catch (err) {
    console.error('✖ Transaction CRUD failed:', err.response?.data || err.message);
  }

  // Notes CRUD
  try {
    console.log('Creating note...');
    const res = await axios.post(`${API_URL}/notes`, testNote, auth);
    created.note = res.data;
    console.log('✔ Note creation: OK');

    console.log('Getting notes...');
    await axios.get(`${API_URL}/notes`, auth);
    console.log('✔ Get notes: OK');

    console.log('Deleting note...');
    await axios.delete(`${API_URL}/notes/${created.note._id || created.note.id}`, auth);
    console.log('✔ Delete note: OK');
  } catch (err) {
    console.error('✖ Note CRUD failed:', err.response?.data || err.message);
  }

  // Pending Transactions CRUD
  try {
    console.log('Creating pending transaction...');
    const res = await axios.post(`${API_URL}/pending`, testPending, auth);
    created.pending = res.data;
    console.log('✔ Pending transaction creation: OK');

    console.log('Getting pending transactions...');
    await axios.get(`${API_URL}/pending`, auth);
    console.log('✔ Get pending transactions: OK');

    console.log('Updating pending transaction...');
    await axios.put(`${API_URL}/pending/${created.pending._id || created.pending.id}`, { ...testPending, amount: 2500 }, auth);
    console.log('✔ Update pending transaction: OK');

    console.log('Deleting pending transaction...');
    await axios.delete(`${API_URL}/pending/${created.pending._id || created.pending.id}`, auth);
    console.log('✔ Delete pending transaction: OK');
  } catch (err) {
    console.error('✖ Pending transaction CRUD failed:', err.response?.data || err.message);
  }

  // Clean up: delete account
  try {
    if (created.account) {
      console.log('Deleting account...');
      await axios.delete(`${API_URL}/accounts/${created.account._id || created.account.id}`, auth);
      console.log('✔ Delete account: OK');
    }
  } catch (err) {
    console.error('✖ Account delete failed:', err.response?.data || err.message);
  }

  console.log('\nAll tests completed.');
}

runTests(); 