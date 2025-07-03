import React, { useState } from 'react';
import { 
  CreditCard, 
  Building2, 
  Wallet, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Banknote,
  PiggyBank,
  TrendingUp
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import SUPPORTED_CURRENCIES from '../../utils/supportedCurrencies';
import useAccounts from '../../hooks/useAccounts';
import { addAccount, updateAccount, deleteAccount } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Accounts = () => {
  const { loading: authLoading, ProtectedRoute } = useAuth();
  const { accounts, loading, error, refetch } = useAccounts();
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank',
    balance: '',
    currency: 'AED',
    accountNumber: '',
    institution: '',
    description: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const accountTypes = [
    { id: 'bank', label: 'Bank Account', icon: Building2, color: 'bg-blue-500' },
    { id: 'credit', label: 'Credit Card', icon: CreditCard, color: 'bg-purple-500' },
    { id: 'cash', label: 'Cash', icon: Banknote, color: 'bg-green-500' },
    { id: 'savings', label: 'Savings', icon: PiggyBank, color: 'bg-yellow-500' },
    { id: 'investment', label: 'Investment', icon: TrendingUp, color: 'bg-indigo-500' },
    { id: 'other', label: 'Other', icon: Wallet, color: 'bg-gray-500' }
  ];

  const getAccountTypeInfo = (type) => {
    return accountTypes.find(t => t.id === type) || accountTypes[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);
    
    try {
      if (editingAccount) {
        // Update existing account
        await updateAccount(editingAccount._id, {
          ...formData,
          balance: parseFloat(formData.balance)
        });
        setEditingAccount(null);
      } else {
        // Add new account
        await addAccount({
          ...formData,
          balance: parseFloat(formData.balance)
        });
      }
      resetForm();
      refetch();
    } catch (err) {
      setSubmitError(err?.error || 'Failed to save account');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance.toString(),
      currency: account.currency || 'AED',
      accountNumber: account.accountNumber || '',
      institution: account.institution || '',
      description: account.description || ''
    });
    setIsAddingAccount(true);
  };

  const handleDelete = async (accountId) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      setSubmitLoading(true);
      setSubmitError(null);
      try {
        await deleteAccount(accountId);
        refetch();
      } catch (err) {
        setSubmitError(err?.error || 'Failed to delete account');
      } finally {
        setSubmitLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'bank',
      balance: '',
      currency: 'AED',
      accountNumber: '',
      institution: '',
      description: ''
    });
    setIsAddingAccount(false);
    setEditingAccount(null);
    setSubmitError(null);
  };

  const totalBalance = accounts.reduce((sum, account) => sum + parseFloat(account.balance), 0);

  if (loading || authLoading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error?.error || 'Failed to load accounts'}</div>;

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 font-dm-sans">My Accounts</h1>
            <p className="text-gray-600">Manage your bank accounts and financial assets</p>
          </div>
          {!isAddingAccount && (
            <button
              onClick={() => setIsAddingAccount(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Add Account</span>
            </button>
          )}
        </div>

        {/* Total Balance Card */}
        <div className="bg-white p-6 border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-600">Total Balance</h2>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalBalance, 'AED')}</p>
            </div>
            <div className="p-3 bg-green-50 rounded">
              <Wallet className="w-6 h-6 text-[#17A349]" />
            </div>
          </div>
        </div>

        {/* Add/Edit Account Form */}
        {isAddingAccount && (
          <div className="bg-white rounded shadow-sm">
            <div className="p-6 border-b border-[#EFEFF2]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingAccount ? 'Edit Account' : 'Add New Account'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Emirates NBD Checking"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {accountTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={e => setFormData({...formData, currency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {SUPPORTED_CURRENCIES.map(cur => (
                      <option key={cur.code} value={cur.code}>{cur.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Balance
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) => setFormData({...formData, balance: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="****1234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Institution
                  </label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({...formData, institution: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Emirates NBD"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Additional notes about this account"
                    rows="3"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors font-bold"
                  disabled={submitLoading}
                >
                  <Save className="w-4 h-4" />
                  <span>{editingAccount ? 'Update Account' : 'Add Account'}</span>
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
              {submitError && <div className="text-red-600 text-sm mt-2">{submitError}</div>}
            </form>
          </div>
        )}

        {/* Accounts List */}
        {accounts.length === 0 ? (
          <div className="bg-white rounded p-12 text-center">
            <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No accounts yet</h3>
            <p className="text-gray-500 mb-6">Add your first account to start tracking your finances</p>
            <button
              onClick={() => setIsAddingAccount(true)}
              className="bg-primary text-white font-bold px-6 py-2 rounded hover:bg-primary-dark transition-colors duration-200"
            >
              Add First Account
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {accounts.map((account) => {
              const typeInfo = getAccountTypeInfo(account.type);
              const Icon = typeInfo.icon;
              
              return (
                <div key={account._id} className="bg-white rounded shadow-sm">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 ${typeInfo.color} rounded-full flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
                          <p className="text-sm text-gray-600">
                            {account.institution && `${account.institution} • `}
                            {account.accountNumber && `${account.accountNumber} • `}
                            {typeInfo.label}
                          </p>
                          {account.description && (
                            <p className="text-sm text-gray-500 mt-1">{account.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(account.balance, account.currency)}
                        </p>
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => handleEdit(account)}
                            className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded transition-colors"
                            disabled={submitLoading}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(account._id)}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            disabled={submitLoading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
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

export default Accounts; 