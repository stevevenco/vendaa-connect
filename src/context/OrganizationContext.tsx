import { useState, useEffect, useCallback } from "react";
import { Organization, Transaction, PaginatedResponse } from "@/types";
import { getWalletBalance, createWallet, ApiError, getTransactions } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { OrganizationContext } from "./organizationContext";
import { OrganizationProviderProps } from "./organizationContext.types";

export const OrganizationProvider = ({
  children,
}: OrganizationProviderProps) => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false);
  const [transactionsTotalPages, setTransactionsTotalPages] = useState(0);
  const [transactionsCount, setTransactionsCount] = useState(0);

  const fetchWalletBalance = useCallback(async (organizationId: string) => {
    setIsBalanceLoading(true);
    try {
      const balanceData = await getWalletBalance(organizationId);
      setWalletBalance(balanceData.available_balance);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        try {
          await createWallet(organizationId);
          const balanceData = await getWalletBalance(organizationId);
          setWalletBalance(balanceData.available_balance);
        } catch (creationError) {
          console.error("Failed to create or fetch wallet balance after creation attempt:", creationError);
          setWalletBalance(null);
        }
      } else {
        console.error("Failed to fetch wallet balance:", error);
        setWalletBalance(null);
      }
    } finally {
      setIsBalanceLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async (organizationId: string, page: number = 1) => {
    setIsTransactionsLoading(true);
    try {
      const transactionsData = await getTransactions(organizationId, page);
      setTransactions(transactionsData.results);
      setTransactionsTotalPages(transactionsData.total_pages);
      setTransactionsCount(transactionsData.count);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      setTransactions([]);
    } finally {
      setIsTransactionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthLoading) {
      return; // Wait for auth check to complete
    }
    setIsLoading(true);
    if (user && user.organizations && user.organizations.length > 0) {
      const orgs = user.organizations;
      setOrganizations(orgs);

      const savedOrgId = localStorage.getItem("selectedOrganizationId");
      const savedOrg = savedOrgId
        ? orgs.find((org) => org.uuid === savedOrgId)
        : null;

      if (savedOrg) {
        setSelectedOrganization(savedOrg);
        fetchWalletBalance(savedOrg.uuid);
        fetchTransactions(savedOrg.uuid);
      } else {
        setSelectedOrganization(orgs[0]);
        fetchWalletBalance(orgs[0].uuid);
        fetchTransactions(orgs[0].uuid);
        localStorage.setItem("selectedOrganizationId", orgs[0].uuid);
      }
    }
    setIsLoading(false);
  }, [user, isAuthLoading, fetchWalletBalance, fetchTransactions]);

  const switchOrganization = (organizationUuid: string) => {
    const organization = organizations.find(
      (org) => org.uuid === organizationUuid
    );
    if (organization) {
      setSelectedOrganization(organization);
      fetchWalletBalance(organization.uuid);
      fetchTransactions(organization.uuid);
      localStorage.setItem("selectedOrganizationId", organization.uuid);
    }
  };

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        selectedOrganization,
        switchOrganization,
        isLoading: isLoading || isAuthLoading,
        user,
        walletBalance,
        fetchWalletBalance,
        isBalanceLoading,
        transactions,
        transactionsTotalPages,
        transactionsCount,
        fetchTransactions,
        isTransactionsLoading,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};
