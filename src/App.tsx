import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SettingsSheet } from "@/components/SettingsSheet";
import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from "@/store/hooks";

// Pages
import LoginPage from "@/pages/auth/LoginPage";
import SignUpPage from "@/pages/auth/SignUpPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import DashboardPage from "@/pages/DashboardPage";
import UsersPage from "@/pages/UsersPage";
import SettingsPage from "@/pages/SettingsPage";
import ProfilePage from "@/pages/ProfilePage";
import CategoriesPage from "@/pages/CategoriesPage";
import ProductsPage from "@/pages/ProductsPage";
import CustomersPage from "@/pages/CustomersPage";
import BillingPage from "@/pages/BillingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const token = localStorage.getItem('auth_token');
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={isAuthenticated && token ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/signup"
        element={isAuthenticated && token ? <Navigate to="/dashboard" replace /> : <SignUpPage />}
      />
      <Route
        path="/forgot-password"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />}
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <CategoriesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <CustomersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing"
        element={
          <ProtectedRoute>
            <BillingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <ProductsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, token, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Sync token to localStorage for axios access if redux-persist restored it
    if (isAuthenticated && token) {
      localStorage.setItem('auth_token', token);
      if (user) {
        localStorage.setItem('auth_user', JSON.stringify(user));
      }
    } else if (!isAuthenticated) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  }, [isAuthenticated, token, user]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
            {isAuthenticated && <SettingsSheet />}
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
