import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const VerificationFlowRoute = () => {
  const { isAuthenticated, isVerified, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after they
    // log in.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isVerified) {
    // If the user is already verified, don't show the verification page.
    // Redirect them to the main dashboard.
    return <Navigate to="/" replace />;
  }

  // If the user is authenticated but not verified, allow them to see the page
  return <Outlet />;
};

export default VerificationFlowRoute;