import { useState, useEffect, useCallback } from "react";
import { Organization, User } from "@/types";
import { getMe, getWalletBalance, createWallet, ApiError } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { OrganizationContext } from "./organizationContext";
import { OrganizationProviderProps } from "./organizationContext.types";

export const OrganizationProvider = ({
  children,
}: OrganizationProviderProps) => {
  const { logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);

  const fetchWalletBalance = useCallback(async (organizationId: string) => {
    setIsBalanceLoading(true);
    try {
      const balanceData = await getWalletBalance(organizationId);
      setWalletBalance(balanceData.balance);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        try {
          await createWallet(organizationId);
          const balanceData = await getWalletBalance(organizationId);
          setWalletBalance(balanceData.balance);
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

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const userData: User = await getMe();
        setUser(userData);
        if (userData.organizations && userData.organizations.length > 0) {
          const orgs = userData.organizations;
          setOrganizations(orgs);
          
          const savedOrgId = localStorage.getItem('selectedOrganizationId');
          const savedOrg = savedOrgId ? orgs.find(org => org.uuid === savedOrgId) : null;

          if (savedOrg) {
            setSelectedOrganization(savedOrg);
            fetchWalletBalance(savedOrg.uuid);
          } else {
            setSelectedOrganization(orgs[0]);
            fetchWalletBalance(orgs[0].uuid);
            localStorage.setItem('selectedOrganizationId', orgs[0].uuid);
          }
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          logout();
        } else {
          console.error("Failed to fetch organizations", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [fetchWalletBalance]);

  const switchOrganization = (organizationUuid: string) => {
    const organization = organizations.find(
      (org) => org.uuid === organizationUuid
    );
    if (organization) {
      setSelectedOrganization(organization);
      fetchWalletBalance(organization.uuid);
      localStorage.setItem('selectedOrganizationId', organization.uuid);
    }
  };

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        selectedOrganization,
        switchOrganization,
        isLoading,
        user,
        walletBalance,
        fetchWalletBalance,
        isBalanceLoading,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};
