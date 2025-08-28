import { useState, useEffect, useCallback } from "react";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem("access")
  );

  const checkAuth = useCallback(() => {
    const accessToken = localStorage.getItem("access");
    setIsAuthenticated(!!accessToken);
  }, []);

  useEffect(() => {
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, [checkAuth]);

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsAuthenticated(false);
    window.location.href = "/login";
  };

  const getAccessToken = () => {
    return localStorage.getItem("access");
  };

  const getRefreshToken = () => {
    return localStorage.getItem("refresh");
  };

  return {
    isAuthenticated,
    logout,
    getAccessToken,
    getRefreshToken,
  };
};
