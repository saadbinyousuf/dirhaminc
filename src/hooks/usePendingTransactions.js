import { useState, useEffect, useCallback } from 'react';
import { getPendingTransactions } from '../services/api';

const usePendingTransactions = () => {
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPendingTransactions();
      setPendingTransactions(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  return { pendingTransactions, loading, error, refetch: fetchPending };
};

export default usePendingTransactions; 