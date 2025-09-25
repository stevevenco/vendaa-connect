import { useState, useEffect } from 'react';
import { getWalletBalance, getTransactions } from '@/services/api';
import { useOrganizations } from './useOrganizations';
import { Transaction } from '@/types';

export const useWalletData = (month: string | null = null) => {
  const { selectedOrganization } = useOrganizations();
  const [walletBalance, setWalletBalance] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!selectedOrganization) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const orgId = selectedOrganization.uuid;

        const [
          walletBalanceResponse,
          transactionsResponse,
        ] = await Promise.all([
          getWalletBalance(orgId),
          getTransactions(orgId, page, 10, month),
        ]);

        setWalletBalance(walletBalanceResponse.available_balance);
        setTransactions(transactionsResponse.results);
        setTotalPages(transactionsResponse.total_pages);
      } catch (error) {
        console.error('Failed to fetch wallet data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedOrganization, month, page]);

  return {
    walletBalance,
    transactions,
    isLoading,
    page,
    setPage,
    totalPages,
  };
};