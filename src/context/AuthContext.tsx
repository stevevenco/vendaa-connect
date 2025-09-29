import { createContext, useContext, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe } from "@/services/api";
import { User } from "@/types";

interface AuthContextType {
  isAuthenticated: boolean;
  isVerified: boolean;
  user: User | null;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery<User | null>({
    queryKey: ["user"],
    queryFn: async () => {
      const accessToken = localStorage.getItem("access");
      if (accessToken) {
        try {
          return await getMe();
        } catch (error) {
          return null;
        }
      }
      return null;
    },
    retry: 1,
    refetchOnWindowFocus: true,
  });

  const isAuthenticated = !!user && !isError;
  const isVerified = user?.is_verified ?? false;

  const login = useCallback(
    async (accessToken: string, refreshToken: string) => {
      localStorage.setItem("access", accessToken);
      localStorage.setItem("refresh", refreshToken);
      await queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    [queryClient]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    queryClient.setQueryData(["user"], null);
    queryClient.invalidateQueries({ queryKey: ["user"] });
  }, [queryClient]);

  const checkAuth = useCallback(async () => {
    // Invalidate both user and organization queries to refresh all relevant data
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["user"] }),
      queryClient.invalidateQueries({ queryKey: ["organizations"] }),
      queryClient.invalidateQueries({ queryKey: ["selectedOrganization"] }),
    ]);
    // Force a page reload to ensure all components get the updated state
    window.location.reload();
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isVerified,
        user: user || null,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


