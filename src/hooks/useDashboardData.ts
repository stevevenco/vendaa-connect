import { useState, useEffect } from 'react';
import { getMeters, getUtilityVends } from '@/services/api';
import { useOrganizations } from './useOrganizations';
import { DashboardData, UtilityVend } from '@/types/dashboard';
import { PaginatedResponse, Meter } from '@/types'; // Import PaginatedResponse and Meter if not already

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
        const [metersResponse, initialVendsResponse] = await Promise.all([
          getMeters(selectedOrganization.uuid, 1, 1),
          getUtilityVends(selectedOrganization.uuid, 1, 100), // Start with the first page
        ]);

        const activeMeters = metersResponse.count ?? 0;
        let utilityVends = initialVendsResponse.results;

        // If there are more pages, fetch them all
        if (initialVendsResponse.total_pages > 1) {
          const pagePromises = [];
          for (let i = 2; i <= initialVendsResponse.total_pages; i++) {
            pagePromises.push(getUtilityVends(selectedOrganization.uuid, i, 100));
          }
          const additionalPages = await Promise.all(pagePromises);
          utilityVends = utilityVends.concat(...additionalPages.map(p => p.results));
        }
        // const activeMeters = metersResponse.count ?? 0;

        const today = new Date().toISOString().split('T')[0];
        const vendsToday = utilityVends.filter(
          (vend) => vend.created.split('T')[0] === today
        ).length;

        const recentVends = utilityVends
          .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
          .slice(0, 5)
          .map((vend) => ({
            ...vend,
            token: vend.token.length > 0 ? vend.token[0] : '',
          }));

        const monthlyVends: { [key: string]: number } = {};
        utilityVends.forEach((vend) => {
          const month = new Date(vend.created).toLocaleString('default', { month: 'short' });
          const amount = parseFloat(vend.amount);
          if (!monthlyVends[month]) {
            monthlyVends[month] = 0;
          }
          monthlyVends[month] += amount;
        });

        const chartData = Object.keys(monthlyVends)
          .map((month) => ({
            month,
            amount: monthlyVends[month],
          }))
          .sort((a, b) => {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return months.indexOf(a.month) - months.indexOf(b.month);
          });

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