import { createContext } from "react";
import { OrganizationContextType } from "./organizationContext.types";

export const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined
);
