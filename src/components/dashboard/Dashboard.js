import React from 'react';
import { TrendingUp, TrendingDown, Wallet, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import useTransactions from '../../hooks/useTransactions';
import useAccounts from '../../hooks/useAccounts';
import { useAuth } from '../../contexts/AuthContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

const COLORS = ['#17A349', '#FF6384', '#FFCE56', '#36A2EB', '#4DD97A', '#128336', '#6B7280'];

const Dashboard = () => {
  const { ProtectedRoute } = useAuth();
  const { transactions, loading: transactionsLoading, error: transactionsError } = useTransactions();
  const { accounts, loading: accountsLoading, error: accountsError } = useAccounts();

  // Calculate financial overview
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const balance = income - expenses;

  // Prepare data for charts
  // 1. Line chart: income/expenses by date
  const dailyData = {};
  transactions.forEach(t => {
    const date = new Date(t.createdAt).toLocaleDateString();
    if (!dailyData[date]) dailyData[date] = { date, income: 0, expense: 0 };
    if (t.type === 'income') dailyData[date].income += parseFloat(t.amount);
    if (t.type === 'expense') dailyData[date].expense += parseFloat(t.amount);
  });
  const lineChartData = Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));

  // 2. Pie chart: expense by category
  const categoryTotals = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    const amt = parseFloat(t.amount);
    if (!categoryTotals[t.category]) categoryTotals[t.category] = 0;
    categoryTotals[t.category] += amt;
  });
  const pieChartData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));

  // 3. Bar chart: account balances
  const barChartData = accounts.map(acc => ({ name: acc.name, balance: parseFloat(acc.balance) }));

  const recentTransactions = transactions.slice(0, 5);

  if (transactionsLoading || accountsLoading) return <div className="p-6">Loading...</div>;
  if (transactionsError || accountsError) return <div className="p-6 text-red-600">{transactionsError?.error || accountsError?.error || 'Failed to load data'}</div>;

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 font-dm-sans">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your financial overview.</p>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Balance Card */}
          <div className="bg-white p-6 border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(balance, 'AED')}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded">
                <Wallet className="w-6 h-6 text-[#17A349]" />
              </div>
            </div>
          </div>

          {/* Income Card */}
          <div className="bg-white p-6 border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(income, 'AED')}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Expenses Card */}
          <div className="bg-white p-6 border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(expenses, 'AED')}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Graphs Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Line Chart: Income/Expense Over Time */}
          <div className="bg-white p-4 border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Income & Expenses Over Time</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={v => formatCurrency(v, 'AED')} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#17A349" strokeWidth={2} dot={false} name="Income" />
                <Line type="monotone" dataKey="expense" stroke="#FF6384" strokeWidth={2} dot={false} name="Expense" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Pie Chart: Expenses by Category */}
          <div className="bg-white p-4 border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Expenses by Category</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={v => formatCurrency(v, 'AED')} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Bar Chart: Account Balances */}
          <div className="bg-white p-4 border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Account Balances</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={v => formatCurrency(v, 'AED')} />
                <Legend />
                <Bar dataKey="balance" fill="#17A349" name="Balance" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          </div>
          <div className="p-6">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No transactions yet. Add your first transaction to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction._id} className="flex items-center justify-between p-4 bg-gray-50 rounded">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard; 