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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isVerified,
        user: user || null,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
