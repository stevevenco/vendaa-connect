import { Organization, User, Transaction } from "@/types";

export interface OrganizationContextType {
  organizations: Organization[];
  selectedOrganization: Organization | null;
  switchOrganization: (organizationUuid:string) => void;
  isLoading: boolean;
  user: User | null;
  walletBalance: string | null;
  fetchWalletBalance: (organizationId: string) => void;
  isBalanceLoading: boolean;
  transactions: Transaction[];
  transactionsTotalPages: number;
  transactionsCount: number;
  fetchTransactions: (organizationId: string, page?: number, month?: string | null) => void;
  isTransactionsLoading: boolean;
  walletActivityTransactions: Transaction[];
  isWalletActivityTransactionsLoading: boolean;
  fetchWalletActivityTransactions: (organizationId: string, month: number) => void;
}

export interface OrganizationProviderProps {
  children: React.ReactNode;
}
