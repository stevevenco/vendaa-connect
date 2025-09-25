export interface UtilityVend {
  uuid: string;
  meter: string;
  transaction: string;
  amount: string;
  units: string | null;
  utility_cost: string;
  vend_reference: string;
  token: string[];
  token_details: {
    data: {
      data: {
        tokenDec: string;
        description: string;
      }[];
    };
  };
  status: string;
  initiated_by: string;
  organization: string;
  is_sandbox: boolean;
  token_type: string | null;
  meter_type: string | null;
  meter_number: string | null;
  created: string;
  last_updated: string;
}

export interface DashboardData {
  walletBalance: string;
  activeMeters: number;
  vendsToday: number;
  recentVends: UtilityVend[];
  utilityVendsOverview: any[];
  walletActivityTrend: any[];
}

export interface UseDashboardData {
  data: DashboardData;
  isLoading: boolean;
}
