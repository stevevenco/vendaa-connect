import { useState, useEffect, useCallback } from "react";
import { Organization, User } from "@/types";
import { getMe, getWalletBalance, createWallet } from "@/services/api";
import { OrganizationContext } from "./organizationContext";
import { OrganizationProviderProps } from "./organizationContext.types";

export const OrganizationProvider = ({
  children,
}: OrganizationProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<string | null>(null);

  const fetchWalletBalance = useCallback(async (organizationId: string) => {
    try {
      const balanceData = await getWalletBalance(organizationId);
      setWalletBalance(balanceData.balance);
    } catch (error: any) {
      if (error.message.includes("404")) {
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
          setSelectedOrganization(orgs[0]);
          fetchWalletBalance(orgs[0].uuid);
        }
      } catch (error) {
        console.error("Failed to fetch organizations", error);
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
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};
