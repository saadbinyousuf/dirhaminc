import React, { useState } from 'react';
import { Plus, Trash2, Target, AlertCircle } from 'lucide-react';
import { formatCurrency, parseAmount } from '../../utils/currency';
import SUPPORTED_CURRENCIES from '../../utils/supportedCurrencies';
import useBudgets from '../../hooks/useBudgets';
import useTransactions from '../../hooks/useTransactions';
import { addBudget, deleteBudget } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Budgets = () => {
  const { ProtectedRoute } = useAuth();
  const { budgets, loading, error, refetch } = useBudgets();
  const { transactions, loading: transactionsLoading, error: transactionsError } = useTransactions();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    currency: 'AED',
    category: '',
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Get unique categories from transactions
  const categories = [...new Set(transactions.map(t => t.category).filter(Boolean))];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);
    
    if (!formData.name || !formData.amount) {
      setSubmitError('Please fill in all required fields');
      setSubmitLoading(false);
      return;
    }

    try {
      await addBudget({
        ...formData,
        amount: parseAmount(formData.amount),
      });
      setFormData({
        name: '',
        amount: '',
        currency: 'AED',
        category: '',
      });
      setShowAddForm(false);
      refetch();
    } catch (err) {
      setSubmitError(err?.error || 'Failed to add budget');
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

  const handleDelete = async (id) => {
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      await deleteBudget(id);
      refetch();
    } catch (err) {
      setSubmitError(err?.error || 'Failed to delete budget');
    } finally {
      setSubmitLoading(false);
    }
  };

  const calculateBudgetProgress = (budget) => {
    const categoryExpenses = transactions
      .filter(t => t.type === 'expense' && t.category === budget.category)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const budgetAmount = parseFloat(budget.amount);
    const progress = (categoryExpenses / budgetAmount) * 100;
    const remaining = budgetAmount - categoryExpenses;
    return {
      spent: categoryExpenses,
      remaining: Math.max(0, remaining),
      progress: Math.min(100, progress),
      isOverBudget: progress > 100,
    };
  };

  if (loading || transactionsLoading) return <div className="p-6">Loading...</div>;
  if (error || transactionsError) return <div className="p-6 text-red-600">{error?.error || transactionsError?.error || 'Failed to load data'}</div>;

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 font-dm-sans">Budgets</h1>
            <p className="text-gray-600">Track your spending against budgets</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-primary text-white font-bold px-4 py-2 rounded hover:bg-primary-dark transition-colors duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Add Budget</span>
          </button>
        </div>

        {/* Add Budget Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Add Budget</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Monthly Food Budget"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    {SUPPORTED_CURRENCIES.map(cur => (
                      <option key={cur.code} value={cur.code}>{cur.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white font-bold py-2 rounded hover:bg-primary-dark transition-colors duration-200"
                    disabled={submitLoading}
                  >
                    Add Budget
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

        {/* Budgets Grid */}
        {budgets.length === 0 ? (
          <div className="bg-white rounded p-12 text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No budgets yet</h3>
            <p className="text-gray-500 mb-6">Create your first budget to start tracking your spending</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-primary text-white font-bold px-6 py-2 rounded hover:bg-primary-dark transition-colors duration-200"
            >
              Create Budget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget) => {
              const { spent, remaining, progress, isOverBudget } = calculateBudgetProgress(budget);
              
              return (
                <div key={budget._id} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{budget.name}</h3>
                        <p className="text-sm text-gray-500">{budget.category}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(budget._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                      disabled={submitLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Budget</span>
                      <span className="font-semibold">{formatCurrency(budget.amount, budget.currency)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Spent</span>
                      <span className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                        {formatCurrency(spent, budget.currency)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Remaining</span>
                      <span className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(remaining, budget.currency)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Progress</span>
                        <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isOverBudget ? 'bg-red-500' : progress > 80 ? 'bg-yellow-500' : 'bg-primary'
                          }`}
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                    </div>

                    {isOverBudget && (
                      <div className="flex items-center space-x-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>Over budget by {formatCurrency(Math.abs(remaining), budget.currency)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default Budgets; 