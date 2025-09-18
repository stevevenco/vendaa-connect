export interface UtilityVend {
  meter: string;
  created: string;
  amount: string;
  vend_reference: string;
}

export interface DashboardData {
  activeMeters: number;
  vendsToday: number;
  recentVends: UtilityVend[];
  utilityVends: UtilityVend[];
  chartData: { month: string; amount: number }[];
}

export interface UseDashboardData {
  data: DashboardData;
  isLoading: boolean;
}
