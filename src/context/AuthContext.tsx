import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import { getMe } from "@/services/api";
import { User } from "@/types";

interface AuthContextType {
  isAuthenticated: boolean;
  isVerified: boolean;
  user: User | null;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    const accessToken = localStorage.getItem("access");
    if (accessToken) {
      try {
        const userData = await getMe();
        setUser(userData);
        setIsAuthenticated(true);
        setIsVerified(userData.is_verified);
      } catch (error) {
        // Token might be invalid/expired
        logout();
      }
    } else {
      setIsAuthenticated(false);
      setIsVerified(false);
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = (accessToken: string, refreshToken: string) => {
    localStorage.setItem("access", accessToken);
    localStorage.setItem("refresh", refreshToken);
    checkAuth();
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsAuthenticated(false);
    setIsVerified(false);
    setUser(null);
    // Redirect happens in the component to allow for more control
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isVerified,
        user,
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
