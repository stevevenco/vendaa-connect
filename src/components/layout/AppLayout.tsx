import { useContext } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";
import { OrganizationContext } from "@/context/OrganizationContext.ts";
import { OrganizationProvider } from "@/context/OrganizationContext.tsx";
import { TopUpModal } from "@/components/TopUpModal";

function AppLayoutContent() {
  const { selectedOrganization: activeOrganization } = useContext(OrganizationContext);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto p-6">
            <Outlet context={{ activeOrganization }} />
          </main>
        </div>
        <TopUpModal />
      </div>
    </SidebarProvider>
  );
}

export function AppLayout() {
  return (
    <OrganizationProvider>
      <AppLayoutContent />
    </OrganizationProvider>
  );
}