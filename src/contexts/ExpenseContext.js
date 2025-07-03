import React, { createContext, useContext, useState, useEffect } from 'react';

const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest/';

const ExpenseContext = createContext();

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};

export const ExpenseProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [notes, setNotes] = useState([]);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [exchangeRates, setExchangeRates] = useState(() => {
    const saved = localStorage.getItem('dirhaminc_exchange_rates');
    return saved ? JSON.parse(saved) : {};
  });
  const [baseCurrency, setBaseCurrency] = useState(() => localStorage.getItem('dirhaminc_base_currency') || 'AED');

  useEffect(() => {
    // Load data from localStorage
    const savedTransactions = localStorage.getItem('dirhaminc_transactions');
    const savedBudgets = localStorage.getItem('dirhaminc_budgets');
    const savedNotes = localStorage.getItem('dirhaminc_notes');
    const savedPending = localStorage.getItem('dirhaminc_pending');
    const savedCategories = localStorage.getItem('dirhaminc_categories');
    const savedTags = localStorage.getItem('dirhaminc_tags');

    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedBudgets) setBudgets(JSON.parse(savedBudgets));
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedPending) setPendingTransactions(JSON.parse(savedPending));
    if (savedCategories) setCategories(JSON.parse(savedCategories));
    else setCategories([
      'Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Healthcare', 'Utilities', 'Salary', 'Freelance', 'Investment', 'Other'
    ]);
    if (savedTags) setTags(JSON.parse(savedTags));
    else setTags([]);
  }, []);

  useEffect(() => {
    // Save data to localStorage whenever it changes
    localStorage.setItem('dirhaminc_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('dirhaminc_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('dirhaminc_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('dirhaminc_pending', JSON.stringify(pendingTransactions));
  }, [pendingTransactions]);

  useEffect(() => {
    localStorage.setItem('dirhaminc_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('dirhaminc_tags', JSON.stringify(tags));
  }, [tags]);

  // Fetch exchange rates when baseCurrency changes
  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch(`${EXCHANGE_API_URL}${baseCurrency}`);
        const data = await res.json();
        if (data && data.rates) {
          setExchangeRates(data.rates);
          localStorage.setItem('dirhaminc_exchange_rates', JSON.stringify(data.rates));
        }
      } catch (e) {
        // fallback: keep previous rates
      }
    }
    fetchRates();
  }, [baseCurrency]);

  // Keep baseCurrency in sync with localStorage (in case changed in settings)
  useEffect(() => {
    const stored = localStorage.getItem('dirhaminc_base_currency');
    if (stored && stored !== baseCurrency) setBaseCurrency(stored);
  }, []);

  // Utility to convert between currencies
  const convertAmount = (amount, fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) return amount;
    if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) return amount;
    // Convert from 'fromCurrency' to base, then to 'toCurrency'
    const amountInBase = amount / exchangeRates[fromCurrency];
    return amountInBase * exchangeRates[toCurrency];
  };

  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);

    // Update account balance if accountId is provided
    if (transaction.accountId) {
      const savedAccounts = localStorage.getItem('dirhaminc_accounts');
      if (savedAccounts) {
        const accounts = JSON.parse(savedAccounts);
        const updatedAccounts = accounts.map(account => {
          if (account.id === transaction.accountId) {
            const amount = parseFloat(transaction.amount);
            const newBalance = transaction.type === 'income' 
              ? account.balance + amount 
              : account.balance - amount;
            return { ...account, balance: newBalance };
          }
          return account;
        });
        localStorage.setItem('dirhaminc_accounts', JSON.stringify(updatedAccounts));
        window.dispatchEvent(new CustomEvent('accountsUpdated'));
      }
    }
  };

  const deleteTransaction = (id) => {
    const transactionToDelete = transactions.find(t => t.id === id);
    setTransactions(prev => prev.filter(t => t.id !== id));

    // Revert account balance if accountId is provided
    if (transactionToDelete && transactionToDelete.accountId) {
      const savedAccounts = localStorage.getItem('dirhaminc_accounts');
      if (savedAccounts) {
        const accounts = JSON.parse(savedAccounts);
        const updatedAccounts = accounts.map(account => {
          if (account.id === transactionToDelete.accountId) {
            const amount = parseFloat(transactionToDelete.amount);
            const newBalance = transactionToDelete.type === 'income' 
              ? account.balance - amount 
              : account.balance + amount;
            return { ...account, balance: newBalance };
          }
          return account;
        });
        localStorage.setItem('dirhaminc_accounts', JSON.stringify(updatedAccounts));
        window.dispatchEvent(new CustomEvent('accountsUpdated'));
      }
    }
  };

  const addBudget = (budget) => {
    const newBudget = {
      ...budget,
      id: Date.now().toString(),
      spent: 0,
    };
    setBudgets(prev => [...prev, newBudget]);
  };

  const updateBudget = (id, updates) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBudget = (id) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const addNote = (note) => {
    const newNote = {
      ...note,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const deleteNote = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const addPendingTransaction = (transaction) => {
    const newPending = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    setPendingTransactions(prev => [newPending, ...prev]);
  };

  const approvePendingTransaction = (id) => {
    const pending = pendingTransactions.find(t => t.id === id);
    if (pending) {
      addTransaction(pending);
      setPendingTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const deletePendingTransaction = (id) => {
    setPendingTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Calculate financial overview
  const getFinancialOverview = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const balance = income - expenses;
    
    return { income, expenses, balance };
  };

  // Category CRUD
  const addCategory = (category) => {
    setCategories(prev => [...prev, category]);
  };
  const editCategory = (oldCategory, newCategory) => {
    setCategories(prev => prev.map(cat => cat === oldCategory ? newCategory : cat));
  };
  const deleteCategory = (category) => {
    setCategories(prev => prev.filter(cat => cat !== category));
  };

  // Tag CRUD
  const addTag = (tag) => {
    setTags(prev => [...prev, tag]);
  };
  const editTag = (oldTag, newTag) => {
    setTags(prev => prev.map(t => t === oldTag ? newTag : t));
  };
  const deleteTag = (tag) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const addTransactionsBulk = (transactionsArray) => {
    const newTransactions = transactionsArray.map(transaction => ({
      ...transaction,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
    }));
    setTransactions(prev => [...newTransactions, ...prev]);

    // Update account balances for each transaction
    const savedAccounts = localStorage.getItem('dirhaminc_accounts');
    if (savedAccounts) {
      let accounts = JSON.parse(savedAccounts);
      newTransactions.forEach(transaction => {
        if (transaction.accountId) {
          accounts = accounts.map(account => {
            if (account.id === transaction.accountId) {
              const amount = parseFloat(transaction.amount);
              const newBalance = transaction.type === 'income'
                ? account.balance + amount
                : account.balance - amount;
              return { ...account, balance: newBalance };
            }
            return account;
          });
        }
      });
      localStorage.setItem('dirhaminc_accounts', JSON.stringify(accounts));
      window.dispatchEvent(new CustomEvent('accountsUpdated'));
    }
  };

  const value = {
    transactions,
    budgets,
    notes,
    pendingTransactions,
    addTransaction,
    addTransactionsBulk,
    deleteTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
    addNote,
    deleteNote,
    addPendingTransaction,
    approvePendingTransaction,
    deletePendingTransaction,
    getFinancialOverview,
    categories,
    addCategory,
    editCategory,
    deleteCategory,
    tags,
    addTag,
    editTag,
    deleteTag,
    exchangeRates,
    baseCurrency,
    setBaseCurrency,
    convertAmount,
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
}; 