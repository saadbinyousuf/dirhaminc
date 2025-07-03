import React, { useState } from 'react';
import { Plus, Check, X, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, parseAmount } from '../../utils/currency';
import usePendingTransactions from '../../hooks/usePendingTransactions';
import useTransactions from '../../hooks/useTransactions';
import { addPendingTransaction, approvePendingTransaction, deletePendingTransaction } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Forecasting = () => {
  const { user, loading: authLoading, ProtectedRoute } = useAuth();
  const { pendingTransactions, loading: pendingLoading, error: pendingError, refetch: refetchPending } = usePendingTransactions();
  const { transactions, loading: transactionsLoading, error: transactionsError } = useTransactions();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense',
    description: '',
    amount: '',
    category: '',
    expectedDate: '',
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Calculate current balance from transactions
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const balance = income - expenses;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);
    
    if (!formData.description || !formData.amount || !formData.expectedDate) {
      setSubmitError('Please fill in all required fields');
      setSubmitLoading(false);
      return;
    }

    try {
      await addPendingTransaction({
        ...formData,
        amount: parseAmount(formData.amount),
      });
      setFormData({
        type: 'expense',
        description: '',
        amount: '',
        category: '',
        expectedDate: '',
      });
      setShowAddForm(false);
      refetchPending();
    } catch (err) {
      setSubmitError(err?.error || 'Failed to add pending transaction');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleApprove = async (id) => {
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      await approvePendingTransaction(id);
      refetchPending();
    } catch (err) {
      setSubmitError(err?.error || 'Failed to approve transaction');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      await deletePendingTransaction(id);
      refetchPending();
    } catch (err) {
      setSubmitError(err?.error || 'Failed to delete pending transaction');
    } finally {
      setSubmitLoading(false);
    }
  };

  const calculateForecast = () => {
    const pendingIncome = pendingTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const pendingExpenses = pendingTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const projectedBalance = balance + pendingIncome - pendingExpenses;
    
    return {
      pendingIncome,
      pendingExpenses,
      projectedBalance,
      netPending: pendingIncome - pendingExpenses,
    };
  };

  const { pendingIncome, pendingExpenses, projectedBalance } = calculateForecast();

  if (pendingLoading || transactionsLoading || authLoading) return <div className="p-6">Loading...</div>;
  if (pendingError || transactionsError) return <div className="p-6 text-red-600">{pendingError?.error || transactionsError?.error || 'Failed to load data'}</div>;

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 font-dm-sans">Financial Forecasting</h1>
            <p className="text-gray-600">Plan and track future transactions</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-primary text-white font-bold px-4 py-2 rounded hover:bg-primary-dark transition-colors duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Add Pending Transaction</span>
          </button>
        </div>

        {/* Forecast Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Balance</p>
                <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(balance, 'AED')}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <TrendingUp className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Income</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(pendingIncome, 'AED')}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(pendingExpenses, 'AED')}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Projected Balance</p>
                <p className={`text-2xl font-bold ${projectedBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(projectedBalance, 'AED')}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Add Pending Transaction Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Add Pending Transaction</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="expense"
                        checked={formData.type === 'expense'}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span className="text-red-600">Expense</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="income"
                        checked={formData.type === 'income'}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span className="text-green-600">Income</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter description"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <input
                    type="text"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter category"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Date
                  </label>
                  <input
                    type="date"
                    name="expectedDate"
                    value={formData.expectedDate}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white font-bold py-2 rounded hover:bg-primary-dark transition-colors duration-200"
                    disabled={submitLoading}
                  >
                    Add Transaction
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 rounded hover:bg-gray-300 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
                {submitError && <div className="text-red-600 text-sm mt-2">{submitError}</div>}
              </form>
            </div>
          </div>
        )}

        {/* Pending Transactions List */}
        <div className="bg-white rounded shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Pending Transactions</h2>
          </div>
          <div className="p-6">
            {pendingTransactions.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No pending transactions yet. Add your first pending transaction to start forecasting!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTransactions.map((transaction) => (
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
                          Expected: {new Date(transaction.expectedDate).toLocaleDateString()}
                          {transaction.category && ` • ${transaction.category}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, 'AED')}
                      </div>
                      <button
                        onClick={() => handleApprove(transaction._id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors duration-200"
                        disabled={submitLoading}
                        title="Approve"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                        disabled={submitLoading}
                        title="Delete"
                      >
                        <X className="w-4 h-4" />
                      </button>
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

export default Forecasting; 