import { useState, useEffect } from 'react';
import { getTransactions, getUtilityVends, getMeters } from '@/services/api';
import { useOrganizations } from './useOrganizations';
import { Transaction, Meter } from '@/types';
import { UtilityVend } from '@/types/dashboard';

export const useReportsData = () => {
  const { selectedOrganization } = useOrganizations();
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [engineeringTokens, setEngineeringTokens] = useState(0);
  const [managementTokens, setManagementTokens] = useState(0);
  const [creditTokens, setCreditTokens] = useState(0);
  const [creditGenerationTrend, setCreditGenerationTrend] = useState<UtilityVend[]>([]);
  const [utilityDistribution, setUtilityDistribution] = useState<{ electricity: number; water: number; gas: number }>({
    electricity: 0,
    water: 0,
    gas: 0,
  });
  const [recentCreditTransactions, setRecentCreditTransactions] = useState<UtilityVend[]>([]);
  const [engineeringTokensReport, setEngineeringTokensReport] = useState<UtilityVend[]>([]);
  const [managementTokensReport, setManagementTokensReport] = useState<UtilityVend[]>([]);
  const [engineeringTokensPage, setEngineeringTokensPage] = useState(1);
  const [managementTokensPage, setManagementTokensPage] = useState(1);
  const [engineeringTokensTotalPages, setEngineeringTokensTotalPages] = useState(1);
  const [managementTokensTotalPages, setManagementTokensTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!selectedOrganization) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const orgId = selectedOrganization.uuid;
        const currentMonth = (new Date().getMonth() + 1).toString();

        const [
          totalTransactionsResponse,
          engineeringTokensResponse,
          managementTokensResponse,
          creditTokensResponse,
          creditGenerationTrendResponse,
          electricityMetersResponse,
          waterMetersResponse,
          gasMetersResponse,
          recentCreditTransactionsResponse,
          engineeringTokensReportResponse,
          managementTokensReportResponse,
        ] = await Promise.all([
          getTransactions(orgId, 1, 1, undefined, true),
          getUtilityVends(orgId, undefined, undefined, 'mse', undefined, true, currentMonth),
          getUtilityVends(orgId, undefined, undefined, 'mgtk', undefined, true, currentMonth),
          getUtilityVends(orgId, undefined, undefined, 'credit', undefined, true, currentMonth),
          getUtilityVends(orgId, undefined, undefined, undefined, undefined, true),
          getMeters(orgId, 1, 1, 'electricity', true),
          getMeters(orgId, 1, 1, 'water', true),
          getMeters(orgId, 1, 1, 'gas', true),
          getUtilityVends(orgId, 1, 10, 'credit'),
          getUtilityVends(orgId, engineeringTokensPage, 10, 'mse'),
          getUtilityVends(orgId, managementTokensPage, 10, 'mgtk'),
        ]);

        setTotalTransactions(totalTransactionsResponse.count ?? 0);
        setEngineeringTokens(engineeringTokensResponse.count ?? 0);
        setManagementTokens(managementTokensResponse.count ?? 0);
        setCreditTokens(creditTokensResponse.count ?? 0);
        setCreditGenerationTrend(creditGenerationTrendResponse.results);
        setUtilityDistribution({
          electricity: electricityMetersResponse.count ?? 0,
          water: waterMetersResponse.count ?? 0,
          gas: gasMetersResponse.count ?? 0,
        });
        setRecentCreditTransactions(recentCreditTransactionsResponse.results);
        setEngineeringTokensReport(engineeringTokensReportResponse.results);
        setEngineeringTokensTotalPages(engineeringTokensReportResponse.total_pages);
        setManagementTokensReport(managementTokensReportResponse.results);
        setManagementTokensTotalPages(managementTokensReportResponse.total_pages);
      } catch (error) {
        console.error('Failed to fetch reports data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedOrganization]);

  return {
    totalTransactions,
    engineeringTokens,
    managementTokens,
    creditTokens,
    creditGenerationTrend,
    utilityDistribution,
    recentCreditTransactions,
    engineeringTokensReport,
    managementTokensReport,
    engineeringTokensPage,
    setEngineeringTokensPage,
    managementTokensPage,
    setManagementTokensPage,
    engineeringTokensTotalPages,
    managementTokensTotalPages,
    isLoading,
  };
};