export interface UtilityVend {
  meter: string;
  created: string;
  amount: string;
  vend_reference: string;
}

export interface Meter {
  uuid: string;
  customer_name: string;
  meter_number: string;
  email: string;
  phone: string;
  address: string;
  sgc: string;
  tariff_index: string;
  key_revision_number: string;
  meter_type: string;
  added_by: string | null;
  organization: string;
  created: string;
  last_updated: string;
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
