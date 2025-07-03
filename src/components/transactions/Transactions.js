import React, { useState } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, X, SlidersHorizontal, AlertCircle } from 'lucide-react';
import { formatCurrency, parseAmount } from '../../utils/currency';
import SUPPORTED_CURRENCIES from '../../utils/supportedCurrencies';
import Papa from 'papaparse';
import useTransactions from '../../hooks/useTransactions';
import useAccounts from '../../hooks/useAccounts';
import { addTransaction, deleteTransaction, addTransactionsBulk } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Transactions = () => {
  const { ProtectedRoute } = useAuth();
  const { transactions, loading, error, refetch } = useTransactions();
  const { accounts, loading: accountsLoading, error: accountsError } = useAccounts();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense',
    description: '',
    amount: '',
    currency: 'AED',
    category: '',
    tags: [],
    accountId: '',
  });
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkTab, setBulkTab] = useState('spreadsheet');
  const [bulkRows, setBulkRows] = useState([
    { type: 'expense', description: '', amount: '', currency: 'AED', category: '', tags: [], accountId: '' }
  ]);
  const [csvError, setCsvError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Get unique categories and tags from transactions
  const categories = [...new Set(transactions.map(t => t.category).filter(Boolean))];
  const tags = [...new Set(transactions.flatMap(t => t.tags || []).filter(Boolean))];

  // Form handlers
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleTagChange = (tag) => {
    setFormData((prev) => {
      if (prev.tags.includes(tag)) {
        return { ...prev, tags: prev.tags.filter(t => t !== tag) };
      } else {
        return { ...prev, tags: [...prev.tags, tag] };
      }
    });
  };

  // Filter handlers
  const handleCategoryFilter = (cat) => {
    setFilterCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };
  const handleTagFilter = (tag) => {
    setFilterTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };
  const clearFilters = () => {
    setFilterType('all');
    setFilterCategories([]);
    setFilterTags([]);
    setFilterAccount('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterAmountMin('');
    setFilterAmountMax('');
  };

  // Add Transaction
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      await addTransaction({ ...formData, amount: parseAmount(formData.amount) });
      setFormData({ type: 'expense', description: '', amount: '', currency: 'AED', category: '', tags: [], accountId: '' });
      setShowAddForm(false);
      refetch();
    } catch (err) {
      setSubmitError(err?.error || 'Failed to add transaction');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Delete Transaction
  const handleDelete = async (id) => {
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      await deleteTransaction(id);
      refetch();
    } catch (err) {
      setSubmitError(err?.error || 'Failed to delete transaction');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Bulk Add
  const handleBulkRowChange = (idx, field, value) => {
    setBulkRows(rows => rows.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };
  const addBulkRow = () => setBulkRows(rows => [...rows, { type: 'expense', description: '', amount: '', currency: 'AED', category: '', tags: [], accountId: '' }]);
  const removeBulkRow = (idx) => setBulkRows(rows => rows.filter((_, i) => i !== idx));
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);
    const validRows = bulkRows.filter(row => row.description && row.amount && row.accountId);
    if (validRows.length === 0) {
      setSubmitError('Please fill in at least one valid row (description, amount, account required)');
      setSubmitLoading(false);
      return;
    }
    try {
      await addTransactionsBulk(validRows.map(row => ({ ...row, amount: parseAmount(row.amount) })));
      setShowBulkModal(false);
      setBulkRows([{ type: 'expense', description: '', amount: '', currency: 'AED', category: '', tags: [], accountId: '' }]);
      refetch();
    } catch (err) {
      setSubmitError(err?.error || 'Failed to add transactions');
    } finally {
      setSubmitLoading(false);
    }
  };
  const handleCsvUpload = (e) => {
    setCsvError('');
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length) {
          setCsvError('CSV parsing error: ' + results.errors[0].message);
          return;
        }
        const rows = results.data.map(row => ({
          type: row.type || 'expense',
          description: row.description || '',
          amount: row.amount || '',
          currency: row.currency || 'AED',
          category: row.category || '',
          tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
          accountId: row.accountId || ''
        }));
        setBulkRows(rows);
        setBulkTab('spreadsheet');
      }
    });
  };

  // Filtering logic (can be improved to use API-side filtering)
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategories, setFilterCategories] = useState([]);
  const [filterTags, setFilterTags] = useState([]);
  const [filterAccount, setFilterAccount] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterAmountMin, setFilterAmountMin] = useState('');
  const [filterAmountMax, setFilterAmountMax] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filteredTransactions = transactions.filter(transaction => {
    if (filterType !== 'all' && transaction.type !== filterType) return false;
    if (search && !(`${transaction.description}`.toLowerCase().includes(search.toLowerCase()) || `${transaction.amount}`.includes(search))) return false;
    if (filterCategories.length > 0 && !filterCategories.includes(transaction.category)) return false;
    if (filterTags.length > 0 && (!transaction.tags || !filterTags.every(tag => transaction.tags.includes(tag)))) return false;
    if (filterAccount && transaction.accountId !== filterAccount) return false;
    if (filterDateFrom && new Date(transaction.createdAt) < new Date(filterDateFrom)) return false;
    if (filterDateTo && new Date(transaction.createdAt) > new Date(filterDateTo)) return false;
    if (filterAmountMin && parseFloat(transaction.amount) < parseFloat(filterAmountMin)) return false;
    if (filterAmountMax && parseFloat(transaction.amount) > parseFloat(filterAmountMax)) return false;
    return true;
  });

  if (loading || accountsLoading) return <div className="p-6">Loading...</div>;
  if (error || accountsError) return <div className="p-6 text-red-600">{error?.error || accountsError?.error || 'Failed to load data'}</div>;

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 font-dm-sans">Transactions</h1>
            <p className="text-gray-600">Manage your income and expenses</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 bg-primary text-white font-bold px-4 py-2 rounded hover:bg-primary-dark transition-colors duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>Add Transaction</span>
            </button>
            <button
              onClick={() => setShowBulkModal(true)}
              className="flex items-center space-x-2 bg-[#E8F6ED] text-[#19A24A] font-bold px-4 py-2 rounded hover:bg-[#d1efdf] transition-colors duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>Bulk Add</span>
            </button>
          </div>
        </div>

        {/* Search and Filters Accordion */}
        <div className="bg-white rounded shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-primary border border-gray-300 rounded hover:border-primary transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="text-sm">Filters</span>
                </button>
              </div>
            </div>
          </div>
          
          {filtersOpen && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                  <select
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="all">All</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Account</label>
                  <select
                    value={filterAccount}
                    onChange={e => setFilterAccount(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="">All Accounts</option>
                    {accounts.map(account => (
                      <option key={account._id} value={account._id}>{account.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date From</label>
                  <input
                    type="date"
                    value={filterDateFrom}
                    onChange={e => setFilterDateFrom(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date To</label>
                  <input
                    type="date"
                    value={filterDateTo}
                    onChange={e => setFilterDateTo(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Min Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={filterAmountMin}
                    onChange={e => setFilterAmountMin(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Max Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={filterAmountMax}
                    onChange={e => setFilterAmountMax(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleCategoryFilter(cat)}
                        className={`px-2 py-1 rounded text-xs border transition-colors ${filterCategories.includes(cat) ? 'bg-primary text-white border-primary' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-primary hover:text-white hover:border-primary'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagFilter(tag)}
                        className={`px-2 py-1 rounded text-xs border transition-colors ${filterTags.includes(tag) ? 'bg-primary text-white border-primary' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-primary hover:text-white hover:border-primary'}`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center space-x-1 text-xs text-gray-500 hover:text-primary px-2 py-1 border border-gray-200 rounded"
                  >
                    <X className="w-4 h-4" />
                    <span>Clear Filters</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add Transaction Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Add Transaction</h2>
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
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tags.length === 0 && <span className="text-gray-400 text-xs">No tags yet</span>}
                    {tags.map(tag => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => handleTagChange(tag)}
                        className={`px-2 py-1 rounded text-xs border transition-colors ${formData.tags.includes(tag) ? 'bg-primary text-white border-primary' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-primary hover:text-white hover:border-primary'}`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account
                  </label>
                  <select
                    name="accountId"
                    value={formData.accountId}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Select account</option>
                    {accounts.map(account => (
                      <option key={account._id} value={account._id}>
                        {account.name} - {formatCurrency(account.balance, account.currency)}
                      </option>
                    ))}
                  </select>
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

        {/* Bulk Add Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded p-8 w-full max-w-[90vw] max-h-[95vh] overflow-y-auto relative">
              <button className="absolute top-2 right-2 p-1 rounded hover:bg-gray-100" onClick={() => setShowBulkModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
              <h2 className="text-xl font-semibold mb-4">Bulk Add Transactions</h2>
              
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setBulkTab('spreadsheet')}
                  className={`px-4 py-2 rounded font-bold ${bulkTab === 'spreadsheet' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Spreadsheet
                </button>
                <button
                  onClick={() => setBulkTab('csv')}
                  className={`px-4 py-2 rounded font-bold ${bulkTab === 'csv' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  CSV Upload
                </button>
              </div>

              {bulkTab === 'csv' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV File</label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                  {csvError && <p className="text-red-600 text-sm mt-2">{csvError}</p>}
                  <p className="text-sm text-gray-500 mt-2">
                    CSV should have columns: type, description, amount, currency, category, tags, accountId
                  </p>
                </div>
              )}

              {bulkTab === 'spreadsheet' && (
                <form onSubmit={handleBulkSubmit}>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-2 py-1 text-xs">Type</th>
                          <th className="border border-gray-300 px-2 py-1 text-xs">Description</th>
                          <th className="border border-gray-300 px-2 py-1 text-xs">Amount</th>
                          <th className="border border-gray-300 px-2 py-1 text-xs">Currency</th>
                          <th className="border border-gray-300 px-2 py-1 text-xs">Category</th>
                          <th className="border border-gray-300 px-2 py-1 text-xs">Account</th>
                          <th className="border border-gray-300 px-2 py-1 text-xs">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkRows.map((row, idx) => (
                          <tr key={idx}>
                            <td className="border border-gray-300 px-2 py-1">
                              <select
                                value={row.type}
                                onChange={e => handleBulkRowChange(idx, 'type', e.target.value)}
                                className="w-full text-xs border-0 focus:ring-0"
                              >
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                              </select>
                            </td>
                            <td className="border border-gray-300 px-2 py-1">
                              <input
                                type="text"
                                value={row.description}
                                onChange={e => handleBulkRowChange(idx, 'description', e.target.value)}
                                className="w-full text-xs border-0 focus:ring-0"
                                placeholder="Description"
                              />
                            </td>
                            <td className="border border-gray-300 px-2 py-1">
                              <input
                                type="text"
                                value={row.amount}
                                onChange={e => handleBulkRowChange(idx, 'amount', e.target.value)}
                                className="w-full text-xs border-0 focus:ring-0"
                                placeholder="0.00"
                              />
                            </td>
                            <td className="border border-gray-300 px-2 py-1">
                              <select
                                value={row.currency}
                                onChange={e => handleBulkRowChange(idx, 'currency', e.target.value)}
                                className="w-full text-xs border-0 focus:ring-0"
                              >
                                {SUPPORTED_CURRENCIES.map(cur => (
                                  <option key={cur.code} value={cur.code}>{cur.code}</option>
                                ))}
                              </select>
                            </td>
                            <td className="border border-gray-300 px-2 py-1">
                              <input
                                type="text"
                                value={row.category}
                                onChange={e => handleBulkRowChange(idx, 'category', e.target.value)}
                                className="w-full text-xs border-0 focus:ring-0"
                                placeholder="Category"
                              />
                            </td>
                            <td className="border border-gray-300 px-2 py-1">
                              <select
                                value={row.accountId}
                                onChange={e => handleBulkRowChange(idx, 'accountId', e.target.value)}
                                className="w-full text-xs border-0 focus:ring-0"
                              >
                                <option value="">Select</option>
                                {accounts.map(account => (
                                  <option key={account._id} value={account._id}>{account.name}</option>
                                ))}
                              </select>
                            </td>
                            <td className="border border-gray-300 px-2 py-1">
                              <button
                                type="button"
                                onClick={() => removeBulkRow(idx)}
                                className="text-red-600 hover:text-red-800 text-xs"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex gap-2 mb-8 mt-2 justify-start">
                    <button type="button" onClick={addBulkRow} className="bg-[#E8F6ED] text-[#19A24A] font-bold px-3 py-1 rounded flex items-center hover:bg-[#d1efdf]">
                      <Plus className="w-4 h-4 mr-1" />Add Row
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="bg-primary text-white px-4 py-2 rounded font-bold" disabled={submitLoading}>Add All</button>
                    <button type="button" onClick={()=>setShowBulkModal(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded font-bold">Cancel</button>
                  </div>
                  {submitError && <div className="text-red-600 text-sm mt-2">{submitError}</div>}
                </form>
              )}
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-white rounded p-6 shadow-sm">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No transactions found. Add your first transaction to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
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
                        {transaction.category && ` • ${transaction.category}`}
                        {transaction.tags && transaction.tags.length > 0 && ` • ${transaction.tags.join(', ')}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
                    </div>
                    <button
                      onClick={() => handleDelete(transaction._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                      disabled={submitLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Transactions; 