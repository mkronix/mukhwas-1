import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  FileImage,
  Settings,
  BarChart3,
  User,
  Shield,
  BookOpen,
  Wallet,
  Building2,
  CreditCard,
  IndianRupee,
  MessageSquare,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Action, type ActionKey, Module, type ModuleKey } from "@/constant/permissions";
import type { StaffBasePath } from "@/staff/StaffSurfaceContext";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  module?: ModuleKey;
  action?: ActionKey;
  group: string;
  devOnly?: boolean;
}

export interface Notification {
  id: string;
  type: "warning" | "order";
  message: string;
  time: string;
  orderId?: string;
}

export function buildStaffNavItems(basePath: StaffBasePath): NavItem[] {
  const terminal: NavItem | null =
    basePath === "/pos"
      ? {
          to: `${basePath}/terminal`,
          label: "Terminal",
          icon: LayoutDashboard,
          module: Module.POS_PRODUCT_BROWSER,
          action: Action.READ,
          group: "Overview",
        }
      : null;

  return [
    { to: basePath, label: "Dashboard", icon: LayoutDashboard, end: true, group: "Overview" },
    ...(terminal ? [terminal] : []),

    {
      to: `${basePath}/products`,
      label: "Products",
      icon: Package,
      module: Module.PRODUCTS,
      action: Action.READ,
      group: "Catalog",
    },
    {
      to: `${basePath}/categories`,
      label: "Categories",
      icon: FolderTree,
      module: Module.CATEGORIES,
      action: Action.READ,
      group: "Catalog",
    },

    {
      to: `${basePath}/inventory/finished`,
      label: "Finished Goods",
      icon: Package,
      module: Module.INVENTORY_FINISHED,
      action: Action.READ,
      group: "Inventory",
    },
    {
      to: `${basePath}/inventory/raw`,
      label: "Raw Materials",
      icon: Package,
      module: Module.INVENTORY_RAW,
      action: Action.READ,
      group: "Inventory",
    },
    {
      to: `${basePath}/inventory/movements`,
      label: "Movements",
      icon: BarChart3,
      module: Module.STOCK_MOVEMENTS,
      action: Action.READ,
      group: "Inventory",
    },
    {
      to: `${basePath}/units`,
      label: "Units",
      icon: Settings,
      module: Module.UNITS,
      action: Action.READ,
      group: "Inventory",
    },
    {
      to: `${basePath}/recipes`,
      label: "Recipes",
      icon: FolderTree,
      module: Module.RECIPES,
      action: Action.READ,
      group: "Inventory",
    },

    {
      to: `${basePath}/production`,
      label: "Production",
      icon: Package,
      module: Module.PRODUCTION_ORDERS,
      action: Action.READ,
      group: "Manufacturing",
    },

    {
      to: `${basePath}/suppliers`,
      label: "Suppliers",
      icon: Users,
      module: Module.SUPPLIERS,
      action: Action.READ,
      group: "Procurement",
    },
    {
      to: `${basePath}/purchases`,
      label: "Purchases",
      icon: ShoppingCart,
      module: Module.PURCHASE_ORDERS,
      action: Action.READ,
      group: "Procurement",
    },

    {
      to: `${basePath}/orders`,
      label: "Orders",
      icon: ShoppingCart,
      module: Module.ORDERS,
      action: Action.READ,
      group: "Sales",
    },
    {
      to: `${basePath}/customers`,
      label: "Customers",
      icon: Users,
      module: Module.CUSTOMERS,
      action: Action.READ,
      group: "Sales",
    },
    {
      to: `${basePath}/leads`,
      label: "Leads",
      icon: MessageSquare,
      module: Module.LEADS,
      action: Action.READ,
      group: "Sales",
    },

    {
      to: `${basePath}/content`,
      label: "Content",
      icon: FileImage,
      module: Module.CONTENT_BANNERS,
      action: Action.READ,
      group: "Content",
    },

    {
      to: `${basePath}/ledger/journal`,
      label: "Journal",
      icon: BookOpen,
      module: Module.LEDGER_JOURNAL,
      action: Action.READ,
      group: "Accounting",
    },
    {
      to: `${basePath}/ledger/suppliers`,
      label: "Supplier Ledger",
      icon: Building2,
      module: Module.LEDGER_SUPPLIER,
      action: Action.READ,
      group: "Accounting",
    },
    {
      to: `${basePath}/ledger/customers`,
      label: "Customer Ledger",
      icon: Wallet,
      module: Module.LEDGER_CUSTOMER,
      action: Action.READ,
      group: "Accounting",
    },
    {
      to: `${basePath}/ledger/expenses`,
      label: "Expenses",
      icon: CreditCard,
      module: Module.LEDGER_EXPENSES,
      action: Action.READ,
      group: "Accounting",
    },
    {
      to: `${basePath}/ledger/bank`,
      label: "Bank Recon.",
      icon: Building2,
      module: Module.LEDGER_BANK,
      action: Action.READ,
      group: "Accounting",
    },
    {
      to: `${basePath}/salary`,
      label: "Salary",
      icon: IndianRupee,
      module: Module.STAFF,
      action: Action.READ,
      group: "Accounting",
    },

    {
      to: `${basePath}/gst`,
      label: "GST",
      icon: BarChart3,
      module: Module.GST_CONFIG,
      action: Action.READ,
      group: "System",
    },
    {
      to: `${basePath}/staff`,
      label: "Staff",
      icon: User,
      module: Module.STAFF,
      action: Action.READ,
      group: "System",
    },
    {
      to: `${basePath}/roles`,
      label: "Roles",
      icon: Shield,
      module: Module.ROLES,
      action: Action.READ,
      group: "System",
    },
    {
      to: `${basePath}/settings`,
      label: "Settings",
      icon: Settings,
      module: Module.SYSTEM_CONFIG,
      action: Action.READ,
      group: "System",
    },
    {
      to: `${basePath}/reports`,
      label: "Reports",
      icon: BarChart3,
      module: Module.REPORTS_SALES,
      action: Action.READ,
      group: "System",
    },
  ];
}

export const NAV_ITEMS: NavItem[] = buildStaffNavItems("/admin");

export const NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "warning",
    message: "Meetha Paan Mukhwas (100g) is low on stock",
    time: "2 hours ago",
  },
  {
    id: "2",
    type: "order",
    message: "New order #MKW-1004 received",
    time: "3 hours ago",
    orderId: "ord_4",
  },
  {
    id: "3",
    type: "warning",
    message: "Calcutta Paan Masala is out of stock",
    time: "5 hours ago",
  },
];
