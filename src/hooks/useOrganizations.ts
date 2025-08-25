import { useContext } from "react";
import { OrganizationContext } from "@/context/organizationContext";
import { OrganizationContextType } from "@/context/organizationContext.types";

export const useOrganizations = (): OrganizationContextType => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error(
      "useOrganizations must be used within an OrganizationProvider"
    );
  }
  return context;
};
