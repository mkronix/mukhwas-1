import { ThemeProvider } from "next-themes";
import { Provider as ReduxProvider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { adminStore } from "@/admin/store/adminStore";
import { posStore } from "@/pos/store/posStore";
import { storefrontStore } from "@/storefront/store/storefrontStore";

import { AdminAuthProvider } from "@/admin/auth/AdminAuthContext";
import { AdminProtectedRoute } from "@/admin/auth/AdminProtectedRoute";
import { POSAuthProvider } from "@/pos/auth/POSAuthContext";
import { POSProtectedRoute } from "@/pos/auth/POSProtectedRoute";
import { StorefrontAuthProvider } from "@/storefront/auth/StorefrontAuthContext";
import { StorefrontProtectedRoute } from "@/storefront/auth/StorefrontProtectedRoute";

import { AdminAuthLayout } from "@/admin/layouts/AdminAuthLayout";
import { AdminDashboardLayout } from "@/admin/layouts/AdminDashboardLayout";
import { POSAuthLayout } from "@/pos/layouts/POSAuthLayout";
import { POSDashboardLayout } from "@/pos/layouts/POSDashboardLayout";
import { StorefrontAccountLayout } from "@/storefront/layouts/StorefrontAccountLayout";
import { StorefrontLayout } from "@/storefront/layouts/StorefrontLayout";

import {
  AboutPage,
  AccountOrderDetail,
  AccountOrders,
  AccountOverview,
  AccountProfile,
  AccountReturns,
  AccountWishlist,
  ContactPage,
  PrivacyPolicy,
  StorefrontCart,
  StorefrontCheckout,
  StorefrontHome,
  StorefrontOrderConfirmation,
  StorefrontProductDetail,
  StorefrontStore,
  TermsPage,
} from "@/storefront/pages";

import { AdminForgotPassword, AdminLogin } from "@/admin/pages";

import { Action, type ModuleKey } from "@/constant/permissions";
import { POSLogin, POSTerminal } from "@/pos/pages";
import { sharedStaffDashboardRouteElements } from "@/shared/routes/staffSharedRoutes";
import { useAuthStore } from "@/store/auth.store";
import ScrollToTop from "./storefront/hooks/scroll-to-top";
import { POSAuthUIProvider } from "./pos/context/POSAuthUIContext";

function StorefrontSurface() {
  return (
    <ReduxProvider store={storefrontStore}>
      <ThemeProvider
        attribute="class"
        storageKey="sf_theme"
        defaultTheme="system"
      >
        <StorefrontAuthProvider>
          <ScrollToTop />
          <Routes>
            <Route element={<StorefrontLayout />}>
              <Route index element={<StorefrontHome />} />
              <Route path="store" element={<StorefrontStore />} />
              <Route path="store/:slug" element={<StorefrontProductDetail />} />
              <Route path="cart" element={<StorefrontCart />} />
              <Route
                path="checkout"
                element={
                  <StorefrontProtectedRoute requireVerified>
                    <StorefrontCheckout />
                  </StorefrontProtectedRoute>
                }
              />
              <Route
                path="order-confirmation"
                element={<StorefrontOrderConfirmation />}
              />
              <Route
                path="account"
                element={
                  <StorefrontProtectedRoute>
                    <StorefrontAccountLayout />
                  </StorefrontProtectedRoute>
                }
              >
                <Route index element={<AccountOverview />} />
                <Route path="orders" element={<AccountOrders />} />
                <Route path="orders/:id" element={<AccountOrderDetail />} />
                <Route path="wishlist" element={<AccountWishlist />} />
                <Route path="profile" element={<AccountProfile />} />
                <Route path="returns" element={<AccountReturns />} />
              </Route>
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="privacy-policy" element={<PrivacyPolicy />} />
              <Route path="terms" element={<TermsPage />} />
            </Route>
          </Routes>
        </StorefrontAuthProvider>
      </ThemeProvider>
    </ReduxProvider>
  );
}

function AdminAppRoutes() {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canReadModule = (module: ModuleKey) =>
    hasPermission(module, Action.READ);
  return (
    <Routes>
      <Route element={<AdminAuthLayout />}>
        <Route path="login" element={<AdminLogin />} />
        <Route path="forgot-password" element={<AdminForgotPassword />} />
      </Route>
      <Route
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout />
          </AdminProtectedRoute>
        }
      >
        {sharedStaffDashboardRouteElements(canReadModule, "/admin")}
      </Route>
    </Routes>
  );
}

function AdminSurface() {
  return (
    <ReduxProvider store={adminStore}>
      <ThemeProvider
        attribute="class"
        storageKey="adm_theme"
        defaultTheme="system"
      >
        <AdminAuthProvider>
          <AdminAppRoutes />
        </AdminAuthProvider>
      </ThemeProvider>
    </ReduxProvider>
  );
}

function POSAppRoutes() {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canReadModule = (module: ModuleKey) =>
    hasPermission(module, Action.READ);
  return (
    <Routes>
      <Route
        element={
          <POSAuthUIProvider>
            <POSAuthLayout />
          </POSAuthUIProvider>
        }
      >
        <Route path="login" element={<POSLogin />} />
      </Route>
      <Route
        element={
          <POSProtectedRoute>
            <POSDashboardLayout />
          </POSProtectedRoute>
        }
      >
        <Route path="terminal" element={<POSTerminal />} />
        {sharedStaffDashboardRouteElements(canReadModule, "/pos/terminal")}
      </Route>
    </Routes>
  );
}

function POSSurface() {
  return (
    <ReduxProvider store={posStore}>
      <ThemeProvider
        attribute="class"
        storageKey="pos_theme"
        defaultTheme="system"
      >
        <POSAuthProvider>
          <POSAppRoutes />
        </POSAuthProvider>
      </ThemeProvider>
    </ReduxProvider>
  );
}

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
      <p className="text-muted-foreground mb-6">Page not found</p>
      <a href="/" className="text-primary hover:underline">
        Go home
      </a>
    </div>
  </div>
);

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/admin/*" element={<AdminSurface />} />
      <Route path="/pos/*" element={<POSSurface />} />
      <Route path="/*" element={<StorefrontSurface />} />
    </Routes>
  </BrowserRouter>
);

export default App;
