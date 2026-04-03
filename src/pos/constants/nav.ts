import {
    LayoutDashboard, Receipt, RotateCcw, ShoppingCart, PackageX,
    Package, Boxes, ArrowLeftRight, BookOpen, Factory,
    Truck, Layers, Users, BarChart2, FileText,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Module, Action, type ModuleKey, type ActionKey } from '@/constant/permissions';

export interface POSNavItem {
    label: string;
    path: string;
    icon: LucideIcon;
    group: string;
    module?: ModuleKey;
    action?: ActionKey;
    devOnly?: boolean;
}

export const POS_NAV_ITEMS: POSNavItem[] = [
    {
        label: 'Terminal',
        path: '/pos',
        icon: LayoutDashboard,
        group: 'Overview',
        module: Module.POS_PRODUCT_BROWSER,
        action: Action.POS_LOGIN,
    },

    {
        label: 'Sales Invoices',
        path: '/pos/sales',
        icon: Receipt,
        group: 'Billing',
        module: Module.ORDERS,
        action: Action.READ,
    },
    {
        label: 'Sales Returns',
        path: '/pos/sales/returns',
        icon: RotateCcw,
        group: 'Billing',
        module: Module.RETURNS,
        action: Action.READ,
    },
    {
        label: 'Purchases',
        path: '/pos/purchases',
        icon: ShoppingCart,
        group: 'Billing',
        module: Module.PURCHASE_ORDERS,
        action: Action.READ,
    },
    {
        label: 'Purchase Returns',
        path: '/pos/purchases/returns',
        icon: PackageX,
        group: 'Billing',
        module: Module.PURCHASE_RETURNS,
        action: Action.READ,
    },

    {
        label: 'Finished Goods',
        path: '/pos/inventory/finished',
        icon: Package,
        group: 'Inventory',
        module: Module.INVENTORY_FINISHED,
        action: Action.READ,
    },
    {
        label: 'Raw Materials',
        path: '/pos/inventory/raw',
        icon: Boxes,
        group: 'Inventory',
        module: Module.INVENTORY_RAW,
        action: Action.READ,
    },
    {
        label: 'Movements',
        path: '/pos/inventory/movements',
        icon: ArrowLeftRight,
        group: 'Inventory',
        module: Module.STOCK_MOVEMENTS,
        action: Action.READ,
    },

    {
        label: 'Recipes',
        path: '/pos/recipes',
        icon: BookOpen,
        group: 'Manufacturing',
        module: Module.RECIPES,
        action: Action.READ,
    },
    {
        label: 'Production',
        path: '/pos/production',
        icon: Factory,
        group: 'Manufacturing',
        module: Module.PRODUCTION_ORDERS,
        action: Action.READ,
    },

    {
        label: 'Suppliers',
        path: '/pos/suppliers',
        icon: Truck,
        group: 'Procurement',
        module: Module.SUPPLIERS,
        action: Action.READ,
    },
    {
        label: 'Raw Materials',
        path: '/pos/raw-materials',
        icon: Layers,
        group: 'Procurement',
        module: Module.RAW_MATERIALS,
        action: Action.READ,
    },

    {
        label: 'Employees',
        path: '/pos/employees',
        icon: Users,
        group: 'Employees',
        module: Module.STAFF,
        action: Action.READ,
    },

    {
        label: 'Reports',
        path: '/pos/reports',
        icon: BarChart2,
        group: 'Reports',
        module: Module.POS_REPORTS,
        action: Action.POS_VIEW_REPORTS,
    },
    {
        label: 'Closing Report',
        path: '/pos/reports/closing',
        icon: FileText,
        group: 'Reports',
        module: Module.POS_CASH_RECONCILIATION,
        action: Action.POS_VIEW_SESSION_SUMMARY,
    },
];