import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TopUpProvider } from "./context/TopUpProvider";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import WalletPage from "./pages/Wallet";
import MetersPage from "./pages/Meters";
import VendingPage from "./pages/Vending";
import ReportsPage from "./pages/Reports";
import SettingsPage from "./pages/Settings";
import OrganizationPage from "./pages/Organization";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import ForgotPasswordPage from "./pages/ForgotPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import VerifyOtpPage from "./pages/VerifyOtp";
import AuthCallbackPage from "./pages/AuthCallback";
import CreateOrganizationPage from "./pages/CreateOrganization";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          <Route element={<ProtectedRoute />}>
            <Route path="/auth-callback" element={<AuthCallbackPage />} />
            <Route
              path="/create-organization"
              element={<CreateOrganizationPage />}
            />
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="wallet" element={<WalletPage />} />
              <Route path="meters" element={<MetersPage />} />
              <Route path="vending" element={<VendingPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="organization" element={<OrganizationPage />} />
            </Route>
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TopUpProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
