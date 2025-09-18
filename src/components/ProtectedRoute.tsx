import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = () => {
  const { isAuthenticated, isVerified, isLoading } = useAuth();
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

  return <Outlet />;
};

export default ProtectedRoute;
