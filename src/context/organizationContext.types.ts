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
  fetchTransactions: (organizationId: string) => void;
  isTransactionsLoading: boolean;
}

export interface OrganizationProviderProps {
  children: React.ReactNode;
}
