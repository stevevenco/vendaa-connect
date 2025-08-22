import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import WalletPage from "./pages/Wallet";
import MetersPage from "./pages/Meters";
import VendingPage from "./pages/Vending";
import ReportsPage from "./pages/Reports";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import ForgotPasswordPage from "./pages/ForgotPassword";

const queryClient = new QueryClient();

// TODO: Add authentication logic to redirect to dashboard if logged in
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="wallet" element={<WalletPage />} />
            <Route path="meters" element={<MetersPage />} />
            <Route path="vending" element={<VendingPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
