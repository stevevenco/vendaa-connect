import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";

const UnverifiedRoute = () => {
  const { isVerified, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isVerified) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default UnverifiedRoute;