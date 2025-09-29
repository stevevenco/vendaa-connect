interface TokenDetailData {
  ea?: number;
  ti?: number;
  drn?: string;
  krn?: number;
  pan?: string;
  sgc?: number;
  tct?: number;
  tid?: number;
  idSm?: string;
  vkKcv?: string;
  subclass?: number;
  tokenDec: string;
  tokenHex?: string;
  newConfig?: any;
  tokenClass?: number;
  description: string;
  stsUnitName?: string;
  scaledAmount?: string;
  isReservedTid?: boolean;
  scaledUnitName?: string;
  transferAmount?: number;
}

interface TokenDetails {
  data: {
    data: TokenDetailData[];
    error?: any;
    msg_id?: string;
    status?: string;
    message?: string;
  };
  status: string;
  message: string;
}

export interface UtilityVend {
  uuid: string;
  meter: string;
  transaction: string;
  amount: string;
  units: string | null;
  utility_cost: string;
  vend_reference: string;
  token: string[];
  token_details: TokenDetails;
  status: string;
  initiated_by: string;
  organization: string;
  is_sandbox: boolean;
  token_type: string | null;
  token_class: string | null;
  token_sub_class: string | null;
  meter_type: string | null;
  meter_number: string | null;
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
