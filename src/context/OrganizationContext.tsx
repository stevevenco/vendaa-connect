import { useState, useEffect } from "react";
import { Organization, User } from "@/types";
import { getMe } from "@/services/api";
import { OrganizationContext } from "./organizationContext";
import { OrganizationProviderProps } from "./organizationContext.types";

export const OrganizationProvider = ({ children }: OrganizationProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const userData: User = await getMe();
        setUser(userData);
        if (userData.organizations && userData.organizations.length > 0) {
          setOrganizations(userData.organizations);
          setSelectedOrganization(userData.organizations[0]);
        }
      } catch (error) {
        console.error("Failed to fetch organizations", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const switchOrganization = (organizationUuid: string) => {
    const organization = organizations.find(
      (org) => org.uuid === organizationUuid
    );
    if (organization) {
      setSelectedOrganization(organization);
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
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};
