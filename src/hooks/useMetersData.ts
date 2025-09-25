import { useState, useEffect } from 'react';
import { getMeters } from '@/services/api';
import { useOrganizations } from './useOrganizations';
import { Meter } from '@/types';

export const useMetersData = () => {
  const { selectedOrganization } = useOrganizations();
  const [totalMeters, setTotalMeters] = useState(0);
  const [electricityMeters, setElectricityMeters] = useState(0);
  const [waterMeters, setWaterMeters] = useState(0);
  const [gasMeters, setGasMeters] = useState(0);
  const [meters, setMeters] = useState<Meter[]>([]);
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
          totalMetersResponse,
          electricityMetersResponse,
          waterMetersResponse,
          gasMetersResponse,
          metersResponse,
        ] = await Promise.all([
          getMeters(orgId, 1, 1, null, true),
          getMeters(orgId, 1, 1, 'electricity', true),
          getMeters(orgId, 1, 1, 'water', true),
          getMeters(orgId, 1, 1, 'gas', true),
          getMeters(orgId, page, 10),
        ]);

        setTotalMeters(totalMetersResponse.count ?? 0);
        setElectricityMeters(electricityMetersResponse.count ?? 0);
        setWaterMeters(waterMetersResponse.count ?? 0);
        setGasMeters(gasMetersResponse.count ?? 0);
        setMeters(metersResponse.results);
        setTotalPages(metersResponse.total_pages);
      } catch (error) {
        console.error('Failed to fetch meters data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedOrganization, page]);

  return {
    totalMeters,
    electricityMeters,
    waterMeters,
    gasMeters,
    meters,
    isLoading,
    page,
    setPage,
    totalPages,
  };
};