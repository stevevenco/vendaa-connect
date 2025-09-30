import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OrganizationProvider } from "./context/OrganizationContext.tsx";
import { TopUpProvider } from "./context/TopUpProvider";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import WalletPage from "./pages/Wallet";
import MetersPage from "./pages/Meters";
import MeterDetailsPage from "./pages/MeterDetailsPage";
import VendingPage from "./pages/Vending";
import ReportsPage from "./pages/Reports";
import SettingsPage from "./pages/Settings";
import OrganizationPage from "./pages/Organization";
import DeveloperPage from "./pages/Developer";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import ForgotPasswordPage from "./pages/ForgotPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import VerifyOtpPage from "./pages/VerifyOtp";
import CreateOrganizationPage from "./pages/CreateOrganization";
import AcceptInvitePage from "./pages/AcceptInvite";
import ResetPasswordPage from "./pages/ResetPassword";
import VerifyAccountPage from "./pages/VerifyAccount";
import VerifyOrganization from "./pages/VerifyOrganization";
import VerificationFlowRoute from "./components/VerificationFlowRoute";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <TopUpProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route element={<VerificationFlowRoute />}>
            <Route path="/verify-account" element={<VerifyAccountPage />} />
          </Route>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/accept-invite/:token" element={<AcceptInvitePage />} />
          <Route
            element={
              <OrganizationProvider>
                <ProtectedRoute />
              </OrganizationProvider>
            }
          >
            <Route
              path="/create-organization"
              element={<CreateOrganizationPage />}
            />
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="wallet" element={<WalletPage />} />
              <Route path="meters" element={<MetersPage />} />
              <Route path="meters/:meterId" element={<MeterDetailsPage />} />
              <Route path="vending" element={<VendingPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="organization" element={<OrganizationPage />} />
              <Route path="developer" element={<DeveloperPage />} />
              <Route
                path="verify-organization"
                element={<VerifyOrganization />}
              />
            </Route>
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TopUpProvider>
  </TooltipProvider>
);

export default App;
