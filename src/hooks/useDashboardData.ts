import { useState, useEffect } from 'react';
import { getMeters, getUtilityVends } from '@/services/api';
import { useOrganizations } from './useOrganizations';
import { DashboardData, UtilityVend } from '@/types/dashboard';

export const useDashboardData = () => {
  const { selectedOrganization } = useOrganizations();
  const [data, setData] = useState<DashboardData>({
    activeMeters: 0,
    vendsToday: 0,
    recentVends: [],
    utilityVends: [],
    chartData: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!selectedOrganization) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [meters, utilityVends] = await Promise.all([
          getMeters(selectedOrganization.uuid),
          getUtilityVends(selectedOrganization.uuid),
        ]);

        // Process active meters
        const activeMeters = meters.length;

        // Process vends today
        const today = new Date().toISOString().split('T')[0];
        const vendsToday = utilityVends.filter(
          (vend) => vend.created.split('T')[0] === today
        ).length;

        // Process recent vends
        const recentVends = [...utilityVends]
          .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
          .slice(0, 5);

        // Process chart data
        const monthlyVends: { [key: string]: number } = {};
        utilityVends.forEach((vend) => {
          const month = new Date(vend.created).toLocaleString('default', { month: 'short' });
          const amount = parseFloat(vend.amount);
          if (!monthlyVends[month]) {
            monthlyVends[month] = 0;
          }
          monthlyVends[month] += amount;
        });

        const chartData = Object.keys(monthlyVends).map((month) => ({
          month,
          amount: monthlyVends[month],
        }));

        setData({
          activeMeters,
          vendsToday,
          recentVends,
          utilityVends,
          chartData,
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
