import type { ReactElement } from "react";
import { Navigate, Route } from "react-router-dom";

import {
  AdminBankReconciliation,
  AdminCategories,
  AdminConfig,
  AdminContent,
  AdminCoupons,
  AdminCustomerLedger,
  AdminCustomers,
  AdminDashboard,
  AdminExpenses,
  AdminGST,
  AdminInventoryFinished,
  AdminInventoryMovements,
  AdminInventoryRaw,
  AdminJournal,
  AdminLeads,
  AdminOrderDetail,
  AdminOrders,
  AdminPayments,
  AdminProduction,
  AdminProducts,
  AdminPurchases,
  AdminRecipes,
  AdminReports,
  AdminReturns,
  AdminRoles,
  AdminSalary,
  AdminStaff,
  AdminSupplierLedger,
  AdminSuppliers,
  AdminUnits,
} from "@/admin/pages";
import { Module, type ModuleKey } from "@/constant/permissions";

export type SharedRouteEntry = {
  path: string;
  /** When set, staff must have READ on this module for the route to be registered. */
  module?: ModuleKey;
  element: ReactElement;
};

export const SHARED_ROUTES: SharedRouteEntry[] = [
  {
    path: "",
    element: <AdminDashboard />,
  },
  { path: "products", module: Module.PRODUCTS, element: <AdminProducts /> },
  { path: "categories", module: Module.CATEGORIES, element: <AdminCategories /> },
  {
    path: "inventory/finished",
    module: Module.INVENTORY_FINISHED,
    element: <AdminInventoryFinished />,
  },
  {
    path: "inventory/raw",
    module: Module.INVENTORY_RAW,
    element: <AdminInventoryRaw />,
  },
  {
    path: "inventory/movements",
    module: Module.STOCK_MOVEMENTS,
    element: <AdminInventoryMovements />,
  },
  { path: "units", module: Module.UNITS, element: <AdminUnits /> },
  { path: "recipes", module: Module.RECIPES, element: <AdminRecipes /> },
  {
    path: "production",
    module: Module.PRODUCTION_ORDERS,
    element: <AdminProduction />,
  },
  { path: "suppliers", module: Module.SUPPLIERS, element: <AdminSuppliers /> },
  {
    path: "purchases",
    module: Module.PURCHASE_ORDERS,
    element: <AdminPurchases />,
  },
  { path: "gst", module: Module.GST_CONFIG, element: <AdminGST /> },
  { path: "orders", module: Module.ORDERS, element: <AdminOrders /> },
  { path: "orders/:id", module: Module.ORDERS, element: <AdminOrderDetail /> },
  { path: "returns", module: Module.RETURNS, element: <AdminReturns /> },
  { path: "customers", module: Module.CUSTOMERS, element: <AdminCustomers /> },
  { path: "leads", module: Module.LEADS, element: <AdminLeads /> },
  {
    path: "coupons",
    module: Module.CONTENT_BANNERS,
    element: <AdminCoupons />,
  },
  {
    path: "content",
    module: Module.CONTENT_BANNERS,
    element: <AdminContent />,
  },
  {
    path: "payments",
    module: Module.PAYMENTS_CONFIG,
    element: <AdminPayments />,
  },
  {
    path: "ledger/journal",
    module: Module.LEDGER_JOURNAL,
    element: <AdminJournal />,
  },
  {
    path: "ledger/suppliers",
    module: Module.LEDGER_SUPPLIER,
    element: <AdminSupplierLedger />,
  },
  {
    path: "ledger/customers",
    module: Module.LEDGER_CUSTOMER,
    element: <AdminCustomerLedger />,
  },
  {
    path: "ledger/expenses",
    module: Module.LEDGER_EXPENSES,
    element: <AdminExpenses />,
  },
  {
    path: "ledger/bank",
    module: Module.LEDGER_BANK,
    element: <AdminBankReconciliation />,
  },
  { path: "salary", module: Module.STAFF, element: <AdminSalary /> },
  { path: "staff", module: Module.STAFF, element: <AdminStaff /> },
  { path: "roles", module: Module.ROLES, element: <AdminRoles /> },
  { path: "config", module: Module.SYSTEM_CONFIG, element: <AdminConfig /> },
  { path: "settings", module: Module.SYSTEM_CONFIG, element: <AdminConfig /> },
  {
    path: "reports",
    module: Module.REPORTS_SALES,
    element: <AdminReports />,
  },
];

function routeElement(
  canReadModule: (module: ModuleKey) => boolean,
  module: ModuleKey | undefined,
  element: ReactElement,
  fallbackPath: string,
): ReactElement {
  const allowed = module === undefined || canReadModule(module);
  return allowed ? element : <Navigate to={fallbackPath} replace />;
}

/**
 * Returns only `<Route>` elements (as an array). Use as direct children of a layout
 * `<Route>` — React Router v6 rejects a wrapper component that returns `<Fragment>`.
 */
export function sharedStaffDashboardRouteElements(
  canReadModule: (module: ModuleKey) => boolean,
  fallbackPath: string,
): ReactElement[] {
  const routes = SHARED_ROUTES.map((def) => {
    const el = routeElement(canReadModule, def.module, def.element, fallbackPath);
    if (def.path === "") {
      return <Route key="__index" index element={el} />;
    }
    return <Route key={def.path} path={def.path} element={el} />;
  });
  routes.push(
    <Route
      key="__catchall"
      path="*"
      element={<Navigate to={fallbackPath} replace />}
    />,
  );
  return routes;
}
