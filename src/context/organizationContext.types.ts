import { Organization, User } from "@/types";

export interface OrganizationContextType {
  organizations: Organization[];
  selectedOrganization: Organization | null;
  switchOrganization: (organizationUuid: string) => void;
  isLoading: boolean;
  user: User | null;
}

export interface OrganizationProviderProps {
  children: React.ReactNode;
}
