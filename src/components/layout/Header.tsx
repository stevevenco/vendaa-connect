import { Bell, LogOut, User, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useOrganization } from "@/context/useOrganization";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { switchDisplayState } from "@/services/api";
import { toast } from "sonner";
import { useState } from "react";
import { useHeadway } from "@/hooks/useHeadway";

// Truncate utility
const truncateText = (text: string, maxLength: number = 20) => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export function Header() {
  useHeadway(); // load Headway

  const { logout, user, checkAuth } = useAuth();
  const {
    organizations,
    selectedOrganization,
    switchOrganization,
    isLoading,
  } = useOrganization();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSwitchChange = async (checked: boolean) => {
    if (!selectedOrganization) return;
    setIsSubmitting(true);
    const new_state = checked ? "live" : "test";
    try {
      await switchDisplayState(new_state, selectedOrganization.uuid);
      toast.success(`Switched to ${new_state} mode`);
      checkAuth();
    } catch (error) {
      toast.error("Failed to switch mode");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="w-32 h-6 bg-gray-200 rounded-md animate-pulse" />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground truncate max-w-[150px] sm:max-w-[200px]">
                    {truncateText(
                      selectedOrganization?.name || "Select Organization"
                    )}
                  </h2>
                  <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {organizations.map((org) => (
                  <DropdownMenuItem
                    key={org.uuid}
                    onClick={() => switchOrganization(org.uuid)}
                  >
                    {org.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {selectedOrganization && !selectedOrganization.is_verified && (
            <Link to="/verify-organization">
              <Badge variant="destructive" className="text-xs">
                Test Mode
              </Badge>
            </Link>
          )}

          {selectedOrganization && selectedOrganization.is_verified && user && (
            <div className="flex items-center space-x-2">
              <Label
                htmlFor="display-state-switch"
                className={
                  user.display_state === "test"
                    ? "text-red-500"
                    : "text-green-500"
                }
              >
                {user.display_state === "test" ? "Test" : "Live"}
              </Label>
              <Switch
                id="display-state-switch"
                checked={user.display_state === "live"}
                onCheckedChange={handleSwitchChange}
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          onClick={() => {
            if ((window as any).HW_widget) {
              (window as any).HW_widget.open();
            }
          }}
        >
          <Bell className="h-4 w-4" />
          {/* Headway injects badge here */}
          <span id="headway-badge" className="absolute -top-1 -right-1"></span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {user?.first_name?.[0]} {user?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
