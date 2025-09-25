import { useState, useEffect } from 'react';
import { getMeters, getUtilityVends, getWalletBalance, getTransactions } from '@/services/api';
import { useOrganizations } from './useOrganizations';
import { DashboardData } from '@/types/dashboard';

export const useDashboardData = () => {
  const { selectedOrganization } = useOrganizations();
  const [data, setData] = useState<DashboardData>({
    walletBalance: '',
    activeMeters: 0,
    vendsToday: 0,
    recentVends: [],
    utilityVendsOverview: [],
    walletActivityTrend: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!selectedOrganization) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const orgId = selectedOrganization.uuid;
        const today = new Date().toISOString().split('T')[0];

        const [
          walletBalance,
          metersResponse,
          vendsTodayResponse,
          utilityVendsOverviewResponse,
          recentVendsResponse,
          walletActivityTrendResponse,
        ] = await Promise.all([
          getWalletBalance(orgId),
          getMeters(orgId, 1, undefined, undefined, true), // Fetch all active meters
          getUtilityVends(orgId, undefined, undefined, undefined, today, undefined), // Vends for today
          getUtilityVends(orgId, undefined, undefined, undefined, undefined, true), // All utility vends for overview
          getUtilityVends(orgId, 1, 5), // Recent vends
          getTransactions(orgId, undefined, undefined, undefined, true), // All transactions for trend
        ]);

        setData({
          walletBalance: walletBalance.available_balance,
          activeMeters: metersResponse.count ?? 0,
          vendsToday: vendsTodayResponse.count ?? 0,
          recentVends: recentVendsResponse.results,
          utilityVendsOverview: utilityVendsOverviewResponse.results,
          walletActivityTrend: walletActivityTrendResponse.results,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedOrganization]);

  return { data, isLoading };
};