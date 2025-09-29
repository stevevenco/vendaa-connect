// import { useAuth } from "@/context/AuthContext";
import { useAuth } from "@/hooks/useAuth";

import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = () => {
  const { isAuthenticated, isVerified, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Thinking...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isVerified) {
    // Redirect to a dedicated verification page
    return <Navigate to="/verify-account" replace />;
  }

  // If the user is verified but has no organizations,
  // and is not already on the create-organization page
  if (
    user &&
    user.organizations.length === 0 &&
    location.pathname !== "/create-organization"
  ) {
    return <Navigate to="/create-organization" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
