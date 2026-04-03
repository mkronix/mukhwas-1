export const Module = {
  PRODUCTS: "products",
  CATEGORIES: "categories",
  BUNDLES: "bundles",

  INVENTORY_FINISHED: "inventory_finished",
  INVENTORY_RAW: "inventory_raw",
  STOCK_MOVEMENTS: "stock_movements",
  INVENTORY_RESERVATIONS: "inventory_reservations",
  INVENTORY_VALUATION: "inventory_valuation",

  RECIPES: "recipes",
  PRODUCTION_ORDERS: "production_orders",
  RAW_MATERIALS: "raw_materials",

  SUPPLIERS: "suppliers",
  PURCHASE_ORDERS: "purchase_orders",
  PURCHASE_BILLS: "purchase_bills",
  PURCHASE_RETURNS: "purchase_returns",

  ORDERS: "orders",
  RETURNS: "returns",

  CUSTOMERS: "customers",
  LEADS: "leads",

  LEDGER_JOURNAL: "ledger_journal",
  LEDGER_SUPPLIER: "ledger_supplier",
  LEDGER_CUSTOMER: "ledger_customer",
  LEDGER_EXPENSES: "ledger_expenses",
  LEDGER_BANK: "ledger_bank",

  GST_CONFIG: "gst_config",
  GST_REPORTS: "gst_reports",

  POS_PRODUCT_BROWSER: "pos_product_browser",
  POS_CART: "pos_cart",
  POS_DISCOUNTS: "pos_discounts",
  POS_ORDER_LEVEL_DISCOUNT: "pos_order_level_discount",
  POS_MANUAL_PRICE_OVERRIDE: "pos_manual_price_override",
  POS_CUSTOMER_LOOKUP: "pos_customer_lookup",
  POS_PAYMENT: "pos_payment",
  POS_SPLIT_PAYMENT: "pos_split_payment",
  POS_TRANSACTION_COMPLETE: "pos_transaction_complete",
  POS_RECEIPT: "pos_receipt",
  POS_VOID: "pos_void",
  POS_REFUND: "pos_refund",
  POS_SESSION: "pos_session",
  POS_CASH_RECONCILIATION: "pos_cash_reconciliation",
  POS_REPORTS: "pos_reports",
  POS_BARCODE_SCANNER: "pos_barcode_scanner",
  POS_STOCK_ALERTS: "pos_stock_alerts",

  STAFF: "staff",
  ROLES: "roles",

  CONTENT_SLIDERS: "content_sliders",
  CONTENT_BANNERS: "content_banners",
  CONTENT_FEATURED: "content_featured",

  PAYMENTS_CONFIG: "payments_config",
  SYSTEM_CONFIG: "system_config",
  UNITS: "units",
  NOTIFICATION_TEMPLATES: "notification_templates",

  REPORTS_SALES: "reports_sales",
  REPORTS_INVENTORY: "reports_inventory",
  REPORTS_PRODUCTION: "reports_production",
  REPORTS_PROCUREMENT: "reports_procurement",
  REPORTS_FINANCIAL: "reports_financial",
  REPORTS_GST: "reports_gst",
  REPORTS_POS: "reports_pos",
  REPORTS_STAFF: "reports_staff",
} as const;

export type ModuleKey = (typeof Module)[keyof typeof Module];

export const Action = {
  READ: "read",
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  EXPORT: "export",
  IMPORT: "import",
  VIEW_REPORTS: "view_reports",

  ADJUST_STOCK: "adjust_stock",
  RESERVE_STOCK: "reserve_stock",
  RELEASE_RESERVATION: "release_reservation",
  VIEW_FIFO_LAYERS: "view_fifo_layers",

  START_PRODUCTION: "start_production",
  COMPLETE_PRODUCTION: "complete_production",
  CANCEL_PRODUCTION: "cancel_production",

  SEND_PURCHASE_ORDER: "send_purchase_order",
  RECEIVE_GOODS: "receive_goods",
  GENERATE_BILL: "generate_bill",
  RECORD_PAYMENT: "record_payment",
  APPROVE_RETURN: "approve_return",

  UPDATE_STATUS: "update_status",
  EDIT_ADDRESS: "edit_address",
  CANCEL_ORDER: "cancel_order",
  PROCESS_REFUND: "process_refund",

  POST_JOURNAL_ENTRY: "post_journal_entry",
  RECONCILE_BANK: "reconcile_bank",
  VIEW_LEDGER: "view_ledger",

  MANAGE_GST_CONFIG: "manage_gst_config",
  APPLY_GST_EXEMPTION: "apply_gst_exemption",
  VIEW_GSTR: "view_gstr",

  POS_LOGIN: "pos_login",
  POS_ADD_TO_CART: "pos_add_to_cart",
  POS_REMOVE_FROM_CART: "pos_remove_from_cart",
  POS_UPDATE_QUANTITY: "pos_update_quantity",
  POS_CLEAR_CART: "pos_clear_cart",
  POS_APPLY_LINE_DISCOUNT: "pos_apply_line_discount",
  POS_APPLY_ORDER_DISCOUNT: "pos_apply_order_discount",
  POS_OVERRIDE_PRICE: "pos_override_price",
  POS_ATTACH_CUSTOMER: "pos_attach_customer",
  POS_SELECT_PAYMENT_MODE: "pos_select_payment_mode",
  POS_PROCESS_CASH: "pos_process_cash",
  POS_PROCESS_CARD: "pos_process_card",
  POS_PROCESS_UPI: "pos_process_upi",
  POS_PROCESS_SPLIT: "pos_process_split",
  POS_CHARGE: "pos_charge",
  POS_VOID_TRANSACTION: "pos_void_transaction",
  POS_ISSUE_REFUND: "pos_issue_refund",
  POS_PRINT_RECEIPT: "pos_print_receipt",
  POS_DOWNLOAD_RECEIPT: "pos_download_receipt",
  POS_SCAN_BARCODE: "pos_scan_barcode",
  POS_CLOSE_SESSION: "pos_close_session",
  POS_VIEW_SESSION_SUMMARY: "pos_view_session_summary",
  POS_SUBMIT_RECONCILIATION: "pos_submit_reconciliation",
  POS_VIEW_REPORTS: "pos_view_reports",
  POS_EXPORT_REPORTS: "pos_export_reports",
  POS_VIEW_STOCK_ALERTS: "pos_view_stock_alerts",

  RESET_PIN: "reset_pin",
  MANAGE_PERMISSIONS: "manage_permissions",
  DEACTIVATE_STAFF: "deactivate_staff",

  MANAGE_PAYMENT_MODES: "manage_payment_modes",
  MANAGE_SYSTEM_CONFIG: "manage_system_config",
  MANAGE_UNITS: "manage_units",
  MANAGE_CONTENT: "manage_content",
  MANAGE_NOTIFICATIONS: "manage_notifications",

  PRINT_RECEIPT: "print_receipt",
  DOWNLOAD_RECEIPT: "download_receipt",
} as const;

export type ActionKey = (typeof Action)[keyof typeof Action];

export interface Permission {
  module: ModuleKey;
  action: ActionKey;
}

export const MODULE_ALLOWED_ACTIONS: Record<ModuleKey, ActionKey[]> = {
  [Module.PRODUCTS]: [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE, Action.EXPORT, Action.IMPORT],
  [Module.CATEGORIES]: [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE],
  [Module.BUNDLES]: [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE],

  [Module.INVENTORY_FINISHED]: [Action.READ, Action.ADJUST_STOCK, Action.VIEW_FIFO_LAYERS, Action.EXPORT],
  [Module.INVENTORY_RAW]: [Action.READ, Action.ADJUST_STOCK, Action.VIEW_FIFO_LAYERS, Action.EXPORT],
  [Module.STOCK_MOVEMENTS]: [Action.READ, Action.EXPORT],
  [Module.INVENTORY_RESERVATIONS]: [Action.READ, Action.RESERVE_STOCK, Action.RELEASE_RESERVATION],
  [Module.INVENTORY_VALUATION]: [Action.READ, Action.VIEW_FIFO_LAYERS, Action.EXPORT],

  [Module.RECIPES]: [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE, Action.EXPORT],
  [Module.PRODUCTION_ORDERS]: [Action.READ, Action.CREATE, Action.START_PRODUCTION, Action.COMPLETE_PRODUCTION, Action.CANCEL_PRODUCTION, Action.EXPORT],
  [Module.RAW_MATERIALS]: [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE, Action.EXPORT, Action.IMPORT],

  [Module.SUPPLIERS]: [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE, Action.VIEW_LEDGER, Action.EXPORT],
  [Module.PURCHASE_ORDERS]: [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE, Action.SEND_PURCHASE_ORDER, Action.RECEIVE_GOODS, Action.GENERATE_BILL, Action.CANCEL_ORDER, Action.EXPORT],
  [Module.PURCHASE_BILLS]: [Action.READ, Action.CREATE, Action.UPDATE, Action.RECORD_PAYMENT, Action.DOWNLOAD_RECEIPT, Action.EXPORT],
  [Module.PURCHASE_RETURNS]: [Action.READ, Action.CREATE, Action.APPROVE_RETURN, Action.EXPORT],

  [Module.ORDERS]: [Action.READ, Action.CREATE, Action.UPDATE_STATUS, Action.EDIT_ADDRESS, Action.CANCEL_ORDER, Action.EXPORT, Action.DOWNLOAD_RECEIPT],
  [Module.RETURNS]: [Action.READ, Action.CREATE, Action.APPROVE_RETURN, Action.PROCESS_REFUND, Action.EXPORT],

  [Module.CUSTOMERS]: [Action.READ, Action.UPDATE, Action.DELETE, Action.VIEW_LEDGER, Action.EXPORT],
  [Module.LEADS]: [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE, Action.EXPORT],

  [Module.LEDGER_JOURNAL]: [Action.READ, Action.POST_JOURNAL_ENTRY, Action.EXPORT, Action.VIEW_REPORTS],
  [Module.LEDGER_SUPPLIER]: [Action.READ, Action.VIEW_LEDGER, Action.EXPORT],
  [Module.LEDGER_CUSTOMER]: [Action.READ, Action.VIEW_LEDGER, Action.EXPORT],
  [Module.LEDGER_EXPENSES]: [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE, Action.EXPORT],
  [Module.LEDGER_BANK]: [Action.READ, Action.IMPORT, Action.RECONCILE_BANK, Action.EXPORT],

  [Module.GST_CONFIG]: [Action.READ, Action.MANAGE_GST_CONFIG, Action.APPLY_GST_EXEMPTION],
  [Module.GST_REPORTS]: [Action.READ, Action.VIEW_GSTR, Action.EXPORT],

  [Module.POS_PRODUCT_BROWSER]: [Action.POS_LOGIN, Action.READ, Action.POS_SCAN_BARCODE],
  [Module.POS_CART]: [Action.POS_ADD_TO_CART, Action.POS_REMOVE_FROM_CART, Action.POS_UPDATE_QUANTITY, Action.POS_CLEAR_CART],
  [Module.POS_DISCOUNTS]: [Action.POS_APPLY_LINE_DISCOUNT],
  [Module.POS_ORDER_LEVEL_DISCOUNT]: [Action.POS_APPLY_ORDER_DISCOUNT],
  [Module.POS_MANUAL_PRICE_OVERRIDE]: [Action.POS_OVERRIDE_PRICE],
  [Module.POS_CUSTOMER_LOOKUP]: [Action.POS_ATTACH_CUSTOMER],
  [Module.POS_PAYMENT]: [Action.POS_SELECT_PAYMENT_MODE, Action.POS_PROCESS_CASH, Action.POS_PROCESS_CARD, Action.POS_PROCESS_UPI, Action.POS_CHARGE],
  [Module.POS_SPLIT_PAYMENT]: [Action.POS_PROCESS_SPLIT],
  [Module.POS_TRANSACTION_COMPLETE]: [Action.POS_CHARGE, Action.READ],
  [Module.POS_RECEIPT]: [Action.POS_PRINT_RECEIPT, Action.POS_DOWNLOAD_RECEIPT],
  [Module.POS_VOID]: [Action.POS_VOID_TRANSACTION],
  [Module.POS_REFUND]: [Action.POS_ISSUE_REFUND],
  [Module.POS_SESSION]: [Action.READ, Action.POS_CLOSE_SESSION, Action.POS_VIEW_SESSION_SUMMARY],
  [Module.POS_CASH_RECONCILIATION]: [Action.READ, Action.CREATE, Action.POS_SUBMIT_RECONCILIATION, Action.EXPORT],
  [Module.POS_REPORTS]: [Action.READ, Action.POS_VIEW_REPORTS, Action.POS_EXPORT_REPORTS],
  [Module.POS_BARCODE_SCANNER]: [Action.POS_SCAN_BARCODE],
  [Module.POS_STOCK_ALERTS]: [Action.READ, Action.POS_VIEW_STOCK_ALERTS],

  [Module.STAFF]: [Action.READ, Action.CREATE, Action.UPDATE, Action.DEACTIVATE_STAFF, Action.RESET_PIN, Action.EXPORT],
  [Module.ROLES]: [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE, Action.MANAGE_PERMISSIONS],

  [Module.CONTENT_SLIDERS]: [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE, Action.MANAGE_CONTENT],
  [Module.CONTENT_BANNERS]: [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE, Action.MANAGE_CONTENT],
  [Module.CONTENT_FEATURED]: [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE, Action.MANAGE_CONTENT],

  [Module.PAYMENTS_CONFIG]: [Action.READ, Action.UPDATE, Action.MANAGE_PAYMENT_MODES],
  [Module.SYSTEM_CONFIG]: [Action.READ, Action.UPDATE, Action.MANAGE_SYSTEM_CONFIG],
  [Module.UNITS]: [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE, Action.MANAGE_UNITS],
  [Module.NOTIFICATION_TEMPLATES]: [Action.READ, Action.UPDATE, Action.MANAGE_NOTIFICATIONS],

  [Module.REPORTS_SALES]: [Action.READ, Action.VIEW_REPORTS, Action.EXPORT],
  [Module.REPORTS_INVENTORY]: [Action.READ, Action.VIEW_REPORTS, Action.EXPORT],
  [Module.REPORTS_PRODUCTION]: [Action.READ, Action.VIEW_REPORTS, Action.EXPORT],
  [Module.REPORTS_PROCUREMENT]: [Action.READ, Action.VIEW_REPORTS, Action.EXPORT],
  [Module.REPORTS_FINANCIAL]: [Action.READ, Action.VIEW_REPORTS, Action.EXPORT],
  [Module.REPORTS_GST]: [Action.READ, Action.VIEW_REPORTS, Action.EXPORT],
  [Module.REPORTS_POS]: [Action.READ, Action.VIEW_REPORTS, Action.EXPORT],
  [Module.REPORTS_STAFF]: [Action.READ, Action.VIEW_REPORTS, Action.EXPORT],
};

/** Staff permission rows are scoped by `surface` in storage; module and action keys match Admin. */
export const PermissionSurface = {
  ADMIN: "admin",
  POS: "pos",
} as const;

export type PermissionSurfaceKey = (typeof PermissionSurface)[keyof typeof PermissionSurface];

export interface RolePermissionSet {
  roleId: string;
  roleName: string;
  isSystemRole: boolean;
  adminPermissions: Permission[];
  posPermissions: Permission[];
}

type LegacyRolePermissionSet = Omit<RolePermissionSet, "adminPermissions" | "posPermissions"> & {
  posAccess: boolean;
  permissions: Permission[];
};

function p(module: ModuleKey, actions: ActionKey[]): Permission[] {
  return actions.map((action) => ({ module, action }));
}

const ALL_PERMISSIONS: Permission[] = (Object.values(Module) as ModuleKey[]).flatMap(
  (module) => MODULE_ALLOWED_ACTIONS[module].map((action) => ({ module, action }))
);

const SYSTEM_ROLE_PERMISSIONS_LEGACY: Record<string, LegacyRolePermissionSet> = {
  developer: {
    roleId: "role_developer",
    roleName: "Developer",
    isSystemRole: true,
    posAccess: false,
    permissions: ALL_PERMISSIONS,
  },

  admin: {
    roleId: "role_admin",
    roleName: "Admin",
    isSystemRole: true,
    posAccess: true,
    permissions: ALL_PERMISSIONS,
  },

  manager: {
    roleId: "role_manager",
    roleName: "Manager",
    isSystemRole: false,
    posAccess: true,
    permissions: [
      ...p(Module.PRODUCTS, [Action.READ, Action.CREATE, Action.UPDATE, Action.EXPORT]),
      ...p(Module.CATEGORIES, [Action.READ, Action.CREATE, Action.UPDATE]),
      ...p(Module.BUNDLES, [Action.READ, Action.CREATE, Action.UPDATE]),

      ...p(Module.INVENTORY_FINISHED, [Action.READ, Action.ADJUST_STOCK, Action.VIEW_FIFO_LAYERS, Action.EXPORT]),
      ...p(Module.INVENTORY_RAW, [Action.READ, Action.ADJUST_STOCK, Action.VIEW_FIFO_LAYERS, Action.EXPORT]),
      ...p(Module.STOCK_MOVEMENTS, [Action.READ, Action.EXPORT]),
      ...p(Module.INVENTORY_RESERVATIONS, [Action.READ, Action.RESERVE_STOCK, Action.RELEASE_RESERVATION]),
      ...p(Module.INVENTORY_VALUATION, [Action.READ, Action.VIEW_FIFO_LAYERS, Action.EXPORT]),

      ...p(Module.RECIPES, [Action.READ, Action.CREATE, Action.UPDATE, Action.EXPORT]),
      ...p(Module.PRODUCTION_ORDERS, [Action.READ, Action.CREATE, Action.START_PRODUCTION, Action.COMPLETE_PRODUCTION, Action.CANCEL_PRODUCTION, Action.EXPORT]),
      ...p(Module.RAW_MATERIALS, [Action.READ, Action.CREATE, Action.UPDATE, Action.EXPORT]),

      ...p(Module.SUPPLIERS, [Action.READ, Action.CREATE, Action.UPDATE, Action.VIEW_LEDGER, Action.EXPORT]),
      ...p(Module.PURCHASE_ORDERS, [Action.READ, Action.CREATE, Action.UPDATE, Action.SEND_PURCHASE_ORDER, Action.RECEIVE_GOODS, Action.GENERATE_BILL, Action.EXPORT]),
      ...p(Module.PURCHASE_BILLS, [Action.READ, Action.CREATE, Action.RECORD_PAYMENT, Action.DOWNLOAD_RECEIPT, Action.EXPORT]),
      ...p(Module.PURCHASE_RETURNS, [Action.READ, Action.CREATE, Action.APPROVE_RETURN, Action.EXPORT]),

      ...p(Module.ORDERS, [Action.READ, Action.CREATE, Action.UPDATE_STATUS, Action.EDIT_ADDRESS, Action.CANCEL_ORDER, Action.EXPORT, Action.DOWNLOAD_RECEIPT]),
      ...p(Module.RETURNS, [Action.READ, Action.CREATE, Action.APPROVE_RETURN, Action.PROCESS_REFUND, Action.EXPORT]),

      ...p(Module.CUSTOMERS, [Action.READ, Action.UPDATE, Action.VIEW_LEDGER, Action.EXPORT]),
      ...p(Module.LEADS, [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE, Action.EXPORT]),

      ...p(Module.LEDGER_JOURNAL, [Action.READ, Action.POST_JOURNAL_ENTRY, Action.EXPORT, Action.VIEW_REPORTS]),
      ...p(Module.LEDGER_SUPPLIER, [Action.READ, Action.VIEW_LEDGER, Action.EXPORT]),
      ...p(Module.LEDGER_CUSTOMER, [Action.READ, Action.VIEW_LEDGER, Action.EXPORT]),
      ...p(Module.LEDGER_EXPENSES, [Action.READ, Action.CREATE, Action.UPDATE, Action.EXPORT]),
      ...p(Module.LEDGER_BANK, [Action.READ, Action.EXPORT]),

      ...p(Module.GST_CONFIG, [Action.READ]),
      ...p(Module.GST_REPORTS, [Action.READ, Action.VIEW_GSTR, Action.EXPORT]),

      ...p(Module.POS_PRODUCT_BROWSER, [Action.POS_LOGIN, Action.READ, Action.POS_SCAN_BARCODE]),
      ...p(Module.POS_CART, [Action.POS_ADD_TO_CART, Action.POS_REMOVE_FROM_CART, Action.POS_UPDATE_QUANTITY, Action.POS_CLEAR_CART]),
      ...p(Module.POS_DISCOUNTS, [Action.POS_APPLY_LINE_DISCOUNT]),
      ...p(Module.POS_ORDER_LEVEL_DISCOUNT, [Action.POS_APPLY_ORDER_DISCOUNT]),
      ...p(Module.POS_MANUAL_PRICE_OVERRIDE, [Action.POS_OVERRIDE_PRICE]),
      ...p(Module.POS_CUSTOMER_LOOKUP, [Action.POS_ATTACH_CUSTOMER]),
      ...p(Module.POS_PAYMENT, [Action.POS_SELECT_PAYMENT_MODE, Action.POS_PROCESS_CASH, Action.POS_PROCESS_CARD, Action.POS_PROCESS_UPI, Action.POS_CHARGE]),
      ...p(Module.POS_SPLIT_PAYMENT, [Action.POS_PROCESS_SPLIT]),
      ...p(Module.POS_TRANSACTION_COMPLETE, [Action.POS_CHARGE, Action.READ]),
      ...p(Module.POS_RECEIPT, [Action.POS_PRINT_RECEIPT, Action.POS_DOWNLOAD_RECEIPT]),
      ...p(Module.POS_VOID, [Action.POS_VOID_TRANSACTION]),
      ...p(Module.POS_REFUND, [Action.POS_ISSUE_REFUND]),
      ...p(Module.POS_SESSION, [Action.READ, Action.POS_CLOSE_SESSION, Action.POS_VIEW_SESSION_SUMMARY]),
      ...p(Module.POS_CASH_RECONCILIATION, [Action.READ, Action.CREATE, Action.POS_SUBMIT_RECONCILIATION, Action.EXPORT]),
      ...p(Module.POS_REPORTS, [Action.READ, Action.POS_VIEW_REPORTS, Action.POS_EXPORT_REPORTS]),
      ...p(Module.POS_BARCODE_SCANNER, [Action.POS_SCAN_BARCODE]),
      ...p(Module.POS_STOCK_ALERTS, [Action.READ, Action.POS_VIEW_STOCK_ALERTS]),

      ...p(Module.STAFF, [Action.READ, Action.CREATE, Action.UPDATE, Action.DEACTIVATE_STAFF, Action.RESET_PIN]),

      ...p(Module.CONTENT_SLIDERS, [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE, Action.MANAGE_CONTENT]),
      ...p(Module.CONTENT_BANNERS, [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE, Action.MANAGE_CONTENT]),
      ...p(Module.CONTENT_FEATURED, [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE, Action.MANAGE_CONTENT]),

      ...p(Module.PAYMENTS_CONFIG, [Action.READ]),
      ...p(Module.SYSTEM_CONFIG, [Action.READ]),
      ...p(Module.UNITS, [Action.READ, Action.CREATE, Action.UPDATE, Action.MANAGE_UNITS]),
      ...p(Module.NOTIFICATION_TEMPLATES, [Action.READ]),

      ...p(Module.REPORTS_SALES, [Action.READ, Action.VIEW_REPORTS, Action.EXPORT]),
      ...p(Module.REPORTS_INVENTORY, [Action.READ, Action.VIEW_REPORTS, Action.EXPORT]),
      ...p(Module.REPORTS_PRODUCTION, [Action.READ, Action.VIEW_REPORTS, Action.EXPORT]),
      ...p(Module.REPORTS_PROCUREMENT, [Action.READ, Action.VIEW_REPORTS, Action.EXPORT]),
      ...p(Module.REPORTS_FINANCIAL, [Action.READ, Action.VIEW_REPORTS, Action.EXPORT]),
      ...p(Module.REPORTS_GST, [Action.READ, Action.VIEW_REPORTS, Action.EXPORT]),
      ...p(Module.REPORTS_POS, [Action.READ, Action.VIEW_REPORTS, Action.EXPORT]),
      ...p(Module.REPORTS_STAFF, [Action.READ, Action.VIEW_REPORTS, Action.EXPORT]),
    ],
  },

  cashier: {
    roleId: "role_cashier",
    roleName: "Cashier",
    isSystemRole: false,
    posAccess: true,
    permissions: [
      // product browsing
      ...p(Module.PRODUCTS, [Action.READ]),
      ...p(Module.CATEGORIES, [Action.READ]),
      ...p(Module.BUNDLES, [Action.READ]),

      // inventory (only what nav needs)
      ...p(Module.INVENTORY_FINISHED, [Action.READ]),
      ...p(Module.INVENTORY_RAW, [Action.READ]),

      // billing (nav coverage)
      ...p(Module.ORDERS, [Action.READ, Action.CREATE, Action.UPDATE_STATUS, Action.DOWNLOAD_RECEIPT]),
      ...p(Module.RETURNS, [Action.READ, Action.CREATE]),
      ...p(Module.PURCHASE_ORDERS, [Action.READ]),
      ...p(Module.PURCHASE_RETURNS, [Action.READ]),

      // procurement
      ...p(Module.SUPPLIERS, [Action.READ]),
      ...p(Module.RAW_MATERIALS, [Action.READ]),

      // employees (read-only)
      ...p(Module.STAFF, [Action.READ]),

      // manufacturing (limited)
      ...p(Module.RECIPES, [Action.READ]),

      // customers/leads
      ...p(Module.CUSTOMERS, [Action.READ]),
      ...p(Module.LEADS, [Action.READ, Action.CREATE]),

      // POS core
      ...p(Module.POS_PRODUCT_BROWSER, [Action.POS_LOGIN, Action.READ]),
      ...p(Module.POS_CART, [
        Action.POS_ADD_TO_CART,
        Action.POS_REMOVE_FROM_CART,
        Action.POS_UPDATE_QUANTITY,
        Action.POS_CLEAR_CART,
      ]),
      ...p(Module.POS_DISCOUNTS, [Action.POS_APPLY_LINE_DISCOUNT]),
      ...p(Module.POS_CUSTOMER_LOOKUP, [Action.POS_ATTACH_CUSTOMER]),

      // payments
      ...p(Module.POS_PAYMENT, [
        Action.POS_SELECT_PAYMENT_MODE,
        Action.POS_PROCESS_CASH,
        Action.POS_PROCESS_CARD,
        Action.POS_PROCESS_UPI,
        Action.POS_CHARGE,
      ]),
      ...p(Module.POS_SPLIT_PAYMENT, [Action.POS_PROCESS_SPLIT]),

      // transaction + receipt
      ...p(Module.POS_TRANSACTION_COMPLETE, [Action.POS_CHARGE, Action.READ]),
      ...p(Module.POS_RECEIPT, [Action.POS_PRINT_RECEIPT, Action.POS_DOWNLOAD_RECEIPT]),

      // session + reports
      ...p(Module.POS_SESSION, [Action.READ, Action.POS_CLOSE_SESSION, Action.POS_VIEW_SESSION_SUMMARY]),
      ...p(Module.POS_CASH_RECONCILIATION, [Action.READ, Action.CREATE, Action.POS_SUBMIT_RECONCILIATION]),
      ...p(Module.POS_REPORTS, [Action.READ, Action.POS_VIEW_REPORTS]),

      // utilities
      ...p(Module.POS_BARCODE_SCANNER, [Action.POS_SCAN_BARCODE]),
      ...p(Module.POS_STOCK_ALERTS, [Action.READ, Action.POS_VIEW_STOCK_ALERTS]),
    ],
  },

  senior_cashier: {
    roleId: "role_senior_cashier",
    roleName: "Senior Cashier",
    isSystemRole: false,
    posAccess: true,
    permissions: [
      // product browsing
      ...p(Module.PRODUCTS, [Action.READ]),
      ...p(Module.CATEGORIES, [Action.READ]),
      ...p(Module.BUNDLES, [Action.READ]),

      // inventory (full nav coverage)
      ...p(Module.INVENTORY_FINISHED, [Action.READ]),
      ...p(Module.INVENTORY_RAW, [Action.READ]),
      ...p(Module.STOCK_MOVEMENTS, [Action.READ]),

      // billing
      ...p(Module.ORDERS, [Action.READ, Action.CREATE, Action.UPDATE_STATUS, Action.CANCEL_ORDER, Action.DOWNLOAD_RECEIPT]),
      ...p(Module.RETURNS, [Action.READ, Action.CREATE, Action.APPROVE_RETURN]),
      ...p(Module.PURCHASE_ORDERS, [Action.READ]),
      ...p(Module.PURCHASE_RETURNS, [Action.READ]),

      // procurement
      ...p(Module.SUPPLIERS, [Action.READ]),
      ...p(Module.RAW_MATERIALS, [Action.READ]),

      // employees
      ...p(Module.STAFF, [Action.READ]),

      // manufacturing
      ...p(Module.RECIPES, [Action.READ]),
      ...p(Module.PRODUCTION_ORDERS, [Action.READ]),

      // customers/leads
      ...p(Module.CUSTOMERS, [Action.READ, Action.UPDATE]),
      ...p(Module.LEADS, [Action.READ, Action.CREATE, Action.UPDATE]),

      // POS core
      ...p(Module.POS_PRODUCT_BROWSER, [Action.POS_LOGIN, Action.READ, Action.POS_SCAN_BARCODE]),
      ...p(Module.POS_CART, [
        Action.POS_ADD_TO_CART,
        Action.POS_REMOVE_FROM_CART,
        Action.POS_UPDATE_QUANTITY,
        Action.POS_CLEAR_CART,
      ]),
      ...p(Module.POS_DISCOUNTS, [Action.POS_APPLY_LINE_DISCOUNT]),
      ...p(Module.POS_ORDER_LEVEL_DISCOUNT, [Action.POS_APPLY_ORDER_DISCOUNT]),
      ...p(Module.POS_CUSTOMER_LOOKUP, [Action.POS_ATTACH_CUSTOMER]),

      // payments
      ...p(Module.POS_PAYMENT, [
        Action.POS_SELECT_PAYMENT_MODE,
        Action.POS_PROCESS_CASH,
        Action.POS_PROCESS_CARD,
        Action.POS_PROCESS_UPI,
        Action.POS_CHARGE,
      ]),
      ...p(Module.POS_SPLIT_PAYMENT, [Action.POS_PROCESS_SPLIT]),

      // transaction control
      ...p(Module.POS_TRANSACTION_COMPLETE, [Action.POS_CHARGE, Action.READ]),
      ...p(Module.POS_VOID, [Action.POS_VOID_TRANSACTION]),
      ...p(Module.POS_REFUND, [Action.POS_ISSUE_REFUND]),

      // receipt
      ...p(Module.POS_RECEIPT, [Action.POS_PRINT_RECEIPT, Action.POS_DOWNLOAD_RECEIPT]),

      // session + reports
      ...p(Module.POS_SESSION, [Action.READ, Action.POS_CLOSE_SESSION, Action.POS_VIEW_SESSION_SUMMARY]),
      ...p(Module.POS_CASH_RECONCILIATION, [
        Action.READ,
        Action.CREATE,
        Action.POS_SUBMIT_RECONCILIATION,
        Action.EXPORT,
      ]),
      ...p(Module.POS_REPORTS, [
        Action.READ,
        Action.POS_VIEW_REPORTS,
        Action.POS_EXPORT_REPORTS,
      ]),

      // utilities
      ...p(Module.POS_BARCODE_SCANNER, [Action.POS_SCAN_BARCODE]),
      ...p(Module.POS_STOCK_ALERTS, [Action.READ, Action.POS_VIEW_STOCK_ALERTS]),
    ],
  },

  warehouse_staff: {
    roleId: "role_warehouse_staff",
    roleName: "Warehouse Staff",
    isSystemRole: false,
    posAccess: false,
    permissions: [
      ...p(Module.PRODUCTS, [Action.READ]),
      ...p(Module.CATEGORIES, [Action.READ]),

      ...p(Module.INVENTORY_FINISHED, [Action.READ, Action.ADJUST_STOCK, Action.EXPORT]),
      ...p(Module.INVENTORY_RAW, [Action.READ, Action.ADJUST_STOCK, Action.EXPORT]),
      ...p(Module.STOCK_MOVEMENTS, [Action.READ, Action.EXPORT]),
      ...p(Module.INVENTORY_RESERVATIONS, [Action.READ, Action.RESERVE_STOCK, Action.RELEASE_RESERVATION]),

      ...p(Module.RECIPES, [Action.READ]),
      ...p(Module.PRODUCTION_ORDERS, [Action.READ, Action.START_PRODUCTION, Action.COMPLETE_PRODUCTION]),
      ...p(Module.RAW_MATERIALS, [Action.READ, Action.UPDATE]),

      ...p(Module.SUPPLIERS, [Action.READ]),
      ...p(Module.PURCHASE_ORDERS, [Action.READ, Action.RECEIVE_GOODS]),
      ...p(Module.PURCHASE_BILLS, [Action.READ]),
      ...p(Module.PURCHASE_RETURNS, [Action.READ, Action.CREATE]),

      ...p(Module.REPORTS_INVENTORY, [Action.READ, Action.VIEW_REPORTS]),
      ...p(Module.REPORTS_PRODUCTION, [Action.READ, Action.VIEW_REPORTS]),
    ],
  },

  accountant: {
    roleId: "role_accountant",
    roleName: "Accountant",
    isSystemRole: false,
    posAccess: false,
    permissions: [
      ...p(Module.PRODUCTS, [Action.READ]),

      ...p(Module.INVENTORY_FINISHED, [Action.READ, Action.VIEW_FIFO_LAYERS, Action.EXPORT]),
      ...p(Module.INVENTORY_RAW, [Action.READ, Action.VIEW_FIFO_LAYERS, Action.EXPORT]),
      ...p(Module.STOCK_MOVEMENTS, [Action.READ, Action.EXPORT]),
      ...p(Module.INVENTORY_VALUATION, [Action.READ, Action.VIEW_FIFO_LAYERS, Action.EXPORT]),

      ...p(Module.SUPPLIERS, [Action.READ, Action.VIEW_LEDGER, Action.EXPORT]),
      ...p(Module.PURCHASE_ORDERS, [Action.READ]),
      ...p(Module.PURCHASE_BILLS, [Action.READ, Action.CREATE, Action.RECORD_PAYMENT, Action.DOWNLOAD_RECEIPT, Action.EXPORT]),
      ...p(Module.PURCHASE_RETURNS, [Action.READ, Action.EXPORT]),

      ...p(Module.ORDERS, [Action.READ, Action.EXPORT]),
      ...p(Module.RETURNS, [Action.READ, Action.PROCESS_REFUND, Action.EXPORT]),

      ...p(Module.CUSTOMERS, [Action.READ, Action.VIEW_LEDGER, Action.EXPORT]),

      ...p(Module.LEDGER_JOURNAL, [Action.READ, Action.POST_JOURNAL_ENTRY, Action.EXPORT, Action.VIEW_REPORTS]),
      ...p(Module.LEDGER_SUPPLIER, [Action.READ, Action.VIEW_LEDGER, Action.EXPORT]),
      ...p(Module.LEDGER_CUSTOMER, [Action.READ, Action.VIEW_LEDGER, Action.EXPORT]),
      ...p(Module.LEDGER_EXPENSES, [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE, Action.EXPORT]),
      ...p(Module.LEDGER_BANK, [Action.READ, Action.IMPORT, Action.RECONCILE_BANK, Action.EXPORT]),

      ...p(Module.GST_CONFIG, [Action.READ, Action.MANAGE_GST_CONFIG, Action.APPLY_GST_EXEMPTION]),
      ...p(Module.GST_REPORTS, [Action.READ, Action.VIEW_GSTR, Action.EXPORT]),

      ...p(Module.POS_CASH_RECONCILIATION, [Action.READ, Action.EXPORT]),
      ...p(Module.POS_REPORTS, [Action.READ, Action.POS_VIEW_REPORTS, Action.POS_EXPORT_REPORTS]),

      ...p(Module.REPORTS_SALES, [Action.READ, Action.VIEW_REPORTS, Action.EXPORT]),
      ...p(Module.REPORTS_INVENTORY, [Action.READ, Action.VIEW_REPORTS, Action.EXPORT]),
      ...p(Module.REPORTS_PROCUREMENT, [Action.READ, Action.VIEW_REPORTS, Action.EXPORT]),
      ...p(Module.REPORTS_FINANCIAL, [Action.READ, Action.VIEW_REPORTS, Action.EXPORT]),
      ...p(Module.REPORTS_GST, [Action.READ, Action.VIEW_REPORTS, Action.EXPORT]),
      ...p(Module.REPORTS_POS, [Action.READ, Action.VIEW_REPORTS, Action.EXPORT]),
    ],
  },

  view_only: {
    roleId: "role_view_only",
    roleName: "View Only",
    isSystemRole: false,
    posAccess: false,
    permissions: (Object.values(Module) as ModuleKey[]).map((module) => ({
      module,
      action: Action.READ as ActionKey,
    })),
  },
};

export const SYSTEM_ROLE_PERMISSIONS: Record<string, RolePermissionSet> = Object.fromEntries(
  (Object.entries(SYSTEM_ROLE_PERMISSIONS_LEGACY) as [string, LegacyRolePermissionSet][]).map(([key, v]) => [
    key,
    {
      roleId: v.roleId,
      roleName: v.roleName,
      isSystemRole: v.isSystemRole,
      adminPermissions: v.permissions,
      posPermissions: v.posAccess ? v.permissions : [],
    },
  ])
) as Record<string, RolePermissionSet>;

export function hasPermission(
  permissions: Permission[],
  module: ModuleKey,
  action: ActionKey
): boolean {
  return permissions.some((perm) => perm.module === module && perm.action === action);
}

export function canRead(permissions: Permission[], module: ModuleKey): boolean {
  return hasPermission(permissions, module, Action.READ);
}

export function getReadableModules(permissions: Permission[]): ModuleKey[] {
  return (Object.values(Module) as ModuleKey[]).filter((module) =>
    canRead(permissions, module)
  );
}

export function getAllowedActions(
  permissions: Permission[],
  module: ModuleKey
): ActionKey[] {
  return permissions.filter((perm) => perm.module === module).map((perm) => perm.action);
}

export function validatePermissions(permissions: Permission[]): {
  valid: boolean;
  invalidEntries: Permission[];
} {
  const invalidEntries = permissions.filter((perm) => {
    const allowed = MODULE_ALLOWED_ACTIONS[perm.module];
    return !allowed || !allowed.includes(perm.action);
  });
  return { valid: invalidEntries.length === 0, invalidEntries };
}

export function mergePermissions(
  base: Permission[],
  overrides: Permission[]
): Permission[] {
  const map = new Map<string, Permission>();
  [...base, ...overrides].forEach((perm) => {
    map.set(`${perm.module}:${perm.action}`, perm);
  });
  return Array.from(map.values());
}

export function diffPermissions(
  previous: Permission[],
  next: Permission[]
): { added: Permission[]; removed: Permission[] } {
  const toKey = (perm: Permission) => `${perm.module}:${perm.action}`;
  const prevKeys = new Set(previous.map(toKey));
  const nextKeys = new Set(next.map(toKey));
  return {
    added: next.filter((perm) => !prevKeys.has(toKey(perm))),
    removed: previous.filter((perm) => !nextKeys.has(toKey(perm))),
  };
}

export type PermissionGuardFn = (
  staffPermissions: Permission[],
  isDeveloper: boolean
) => boolean;

export function requirePermission(
  module: ModuleKey,
  action: ActionKey
): PermissionGuardFn {
  return (staffPermissions, isDeveloper) => {
    if (isDeveloper) return true;
    return hasPermission(staffPermissions, module, action);
  };
}

export const MODULE_GROUPS: { label: string; modules: ModuleKey[] }[] = [
  {
    label: "Catalog",
    modules: [Module.PRODUCTS, Module.CATEGORIES, Module.BUNDLES],
  },
  {
    label: "Inventory",
    modules: [
      Module.INVENTORY_FINISHED,
      Module.INVENTORY_RAW,
      Module.STOCK_MOVEMENTS,
      Module.INVENTORY_RESERVATIONS,
      Module.INVENTORY_VALUATION,
    ],
  },
  {
    label: "Manufacturing",
    modules: [Module.RECIPES, Module.PRODUCTION_ORDERS, Module.RAW_MATERIALS],
  },
  {
    label: "Procurement",
    modules: [
      Module.SUPPLIERS,
      Module.PURCHASE_ORDERS,
      Module.PURCHASE_BILLS,
      Module.PURCHASE_RETURNS,
    ],
  },
  {
    label: "Sales",
    modules: [Module.ORDERS, Module.RETURNS],
  },
  {
    label: "CRM",
    modules: [Module.CUSTOMERS, Module.LEADS],
  },
  {
    label: "Finance",
    modules: [
      Module.LEDGER_JOURNAL,
      Module.LEDGER_SUPPLIER,
      Module.LEDGER_CUSTOMER,
      Module.LEDGER_EXPENSES,
      Module.LEDGER_BANK,
    ],
  },
  {
    label: "GST",
    modules: [Module.GST_CONFIG, Module.GST_REPORTS],
  },
  {
    label: "POS — Core",
    modules: [
      Module.POS_PRODUCT_BROWSER,
      Module.POS_CART,
      Module.POS_BARCODE_SCANNER,
      Module.POS_CUSTOMER_LOOKUP,
      Module.POS_STOCK_ALERTS,
    ],
  },
  {
    label: "POS — Discounts & Pricing",
    modules: [
      Module.POS_DISCOUNTS,
      Module.POS_ORDER_LEVEL_DISCOUNT,
      Module.POS_MANUAL_PRICE_OVERRIDE,
    ],
  },
  {
    label: "POS — Payments",
    modules: [
      Module.POS_PAYMENT,
      Module.POS_SPLIT_PAYMENT,
      Module.POS_TRANSACTION_COMPLETE,
      Module.POS_RECEIPT,
    ],
  },
  {
    label: "POS — Post-Sale",
    modules: [Module.POS_VOID, Module.POS_REFUND],
  },
  {
    label: "POS — Session & Reporting",
    modules: [
      Module.POS_SESSION,
      Module.POS_CASH_RECONCILIATION,
      Module.POS_REPORTS,
    ],
  },
  {
    label: "Identity & Access",
    modules: [Module.STAFF, Module.ROLES],
  },
  {
    label: "Content",
    modules: [
      Module.CONTENT_SLIDERS,
      Module.CONTENT_BANNERS,
      Module.CONTENT_FEATURED,
    ],
  },
  {
    label: "Configuration",
    modules: [
      Module.PAYMENTS_CONFIG,
      Module.SYSTEM_CONFIG,
      Module.UNITS,
      Module.NOTIFICATION_TEMPLATES,
    ],
  },
  {
    label: "Reports",
    modules: [
      Module.REPORTS_SALES,
      Module.REPORTS_INVENTORY,
      Module.REPORTS_PRODUCTION,
      Module.REPORTS_PROCUREMENT,
      Module.REPORTS_FINANCIAL,
      Module.REPORTS_GST,
      Module.REPORTS_POS,
      Module.REPORTS_STAFF,
    ],
  },
];

export const MODULE_LABELS: Record<ModuleKey, string> = {
  [Module.PRODUCTS]: "Products",
  [Module.CATEGORIES]: "Categories",
  [Module.BUNDLES]: "Bundles",
  [Module.INVENTORY_FINISHED]: "Finished Goods Inventory",
  [Module.INVENTORY_RAW]: "Raw Materials Inventory",
  [Module.STOCK_MOVEMENTS]: "Stock Movements",
  [Module.INVENTORY_RESERVATIONS]: "Inventory Reservations",
  [Module.INVENTORY_VALUATION]: "Inventory Valuation (FIFO)",
  [Module.RECIPES]: "Recipes",
  [Module.PRODUCTION_ORDERS]: "Production Orders",
  [Module.RAW_MATERIALS]: "Raw Materials Master",
  [Module.SUPPLIERS]: "Suppliers",
  [Module.PURCHASE_ORDERS]: "Purchase Orders",
  [Module.PURCHASE_BILLS]: "Purchase Bills",
  [Module.PURCHASE_RETURNS]: "Purchase Returns",
  [Module.ORDERS]: "Sales Orders",
  [Module.RETURNS]: "Returns & Refunds",
  [Module.CUSTOMERS]: "Customers",
  [Module.LEADS]: "Leads",
  [Module.LEDGER_JOURNAL]: "Journal Entries",
  [Module.LEDGER_SUPPLIER]: "Supplier Ledger",
  [Module.LEDGER_CUSTOMER]: "Customer Ledger",
  [Module.LEDGER_EXPENSES]: "Expense Tracking",
  [Module.LEDGER_BANK]: "Bank Reconciliation",
  [Module.GST_CONFIG]: "GST Configuration",
  [Module.GST_REPORTS]: "GST Reports",
  [Module.POS_PRODUCT_BROWSER]: "Product Browser",
  [Module.POS_CART]: "Cart Management",
  [Module.POS_DISCOUNTS]: "Line Discounts",
  [Module.POS_ORDER_LEVEL_DISCOUNT]: "Order-Level Discount",
  [Module.POS_MANUAL_PRICE_OVERRIDE]: "Manual Price Override",
  [Module.POS_CUSTOMER_LOOKUP]: "Customer Lookup",
  [Module.POS_PAYMENT]: "Payment Processing",
  [Module.POS_SPLIT_PAYMENT]: "Split Payment",
  [Module.POS_TRANSACTION_COMPLETE]: "Transaction Completion",
  [Module.POS_RECEIPT]: "Receipt",
  [Module.POS_VOID]: "Void Transaction",
  [Module.POS_REFUND]: "Issue Refund",
  [Module.POS_SESSION]: "Session Management",
  [Module.POS_CASH_RECONCILIATION]: "Cash Reconciliation",
  [Module.POS_REPORTS]: "POS Reports",
  [Module.POS_BARCODE_SCANNER]: "Barcode Scanner",
  [Module.POS_STOCK_ALERTS]: "Stock Alerts",
  [Module.STAFF]: "Staff Management",
  [Module.ROLES]: "Roles & Permissions",
  [Module.CONTENT_SLIDERS]: "Sliders",
  [Module.CONTENT_BANNERS]: "Banners",
  [Module.CONTENT_FEATURED]: "Featured Sections",
  [Module.PAYMENTS_CONFIG]: "Payment Modes",
  [Module.SYSTEM_CONFIG]: "System Configuration",
  [Module.UNITS]: "Units & Conversions",
  [Module.NOTIFICATION_TEMPLATES]: "Notification Templates",
  [Module.REPORTS_SALES]: "Sales Reports",
  [Module.REPORTS_INVENTORY]: "Inventory Reports",
  [Module.REPORTS_PRODUCTION]: "Production Reports",
  [Module.REPORTS_PROCUREMENT]: "Procurement Reports",
  [Module.REPORTS_FINANCIAL]: "Financial Reports",
  [Module.REPORTS_GST]: "GST Reports",
  [Module.REPORTS_POS]: "POS Reports",
  [Module.REPORTS_STAFF]: "Staff Reports",
};

export const ACTION_LABELS: Record<ActionKey, string> = {
  [Action.READ]: "View",
  [Action.CREATE]: "Create",
  [Action.UPDATE]: "Edit",
  [Action.DELETE]: "Delete",
  [Action.EXPORT]: "Export",
  [Action.IMPORT]: "Import",
  [Action.VIEW_REPORTS]: "View Reports",
  [Action.ADJUST_STOCK]: "Adjust Stock",
  [Action.RESERVE_STOCK]: "Reserve Stock",
  [Action.RELEASE_RESERVATION]: "Release Reservation",
  [Action.VIEW_FIFO_LAYERS]: "View FIFO Layers",
  [Action.START_PRODUCTION]: "Start Production",
  [Action.COMPLETE_PRODUCTION]: "Complete Production",
  [Action.CANCEL_PRODUCTION]: "Cancel Production",
  [Action.SEND_PURCHASE_ORDER]: "Send PO",
  [Action.RECEIVE_GOODS]: "Receive Goods",
  [Action.GENERATE_BILL]: "Generate Bill",
  [Action.RECORD_PAYMENT]: "Record Payment",
  [Action.APPROVE_RETURN]: "Approve Return",
  [Action.UPDATE_STATUS]: "Update Status",
  [Action.EDIT_ADDRESS]: "Edit Address",
  [Action.CANCEL_ORDER]: "Cancel Order",
  [Action.PROCESS_REFUND]: "Process Refund",
  [Action.POST_JOURNAL_ENTRY]: "Post Journal Entry",
  [Action.RECONCILE_BANK]: "Reconcile",
  [Action.VIEW_LEDGER]: "View Ledger",
  [Action.MANAGE_GST_CONFIG]: "Manage GST Config",
  [Action.APPLY_GST_EXEMPTION]: "Apply GST Exemption",
  [Action.VIEW_GSTR]: "View GSTR",
  [Action.POS_LOGIN]: "Login to POS",
  [Action.POS_ADD_TO_CART]: "Add to Cart",
  [Action.POS_REMOVE_FROM_CART]: "Remove from Cart",
  [Action.POS_UPDATE_QUANTITY]: "Update Quantity",
  [Action.POS_CLEAR_CART]: "Clear Cart",
  [Action.POS_APPLY_LINE_DISCOUNT]: "Apply Line Discount",
  [Action.POS_APPLY_ORDER_DISCOUNT]: "Apply Order Discount",
  [Action.POS_OVERRIDE_PRICE]: "Override Price",
  [Action.POS_ATTACH_CUSTOMER]: "Attach Customer",
  [Action.POS_SELECT_PAYMENT_MODE]: "Select Payment Mode",
  [Action.POS_PROCESS_CASH]: "Process Cash",
  [Action.POS_PROCESS_CARD]: "Process Card",
  [Action.POS_PROCESS_UPI]: "Process UPI",
  [Action.POS_PROCESS_SPLIT]: "Process Split Payment",
  [Action.POS_CHARGE]: "Charge / Complete Sale",
  [Action.POS_VOID_TRANSACTION]: "Void Transaction",
  [Action.POS_ISSUE_REFUND]: "Issue Refund",
  [Action.POS_PRINT_RECEIPT]: "Print Receipt",
  [Action.POS_DOWNLOAD_RECEIPT]: "Download Receipt",
  [Action.POS_SCAN_BARCODE]: "Scan Barcode",
  [Action.POS_CLOSE_SESSION]: "Close Session",
  [Action.POS_VIEW_SESSION_SUMMARY]: "View Session Summary",
  [Action.POS_SUBMIT_RECONCILIATION]: "Submit Reconciliation",
  [Action.POS_VIEW_REPORTS]: "View POS Reports",
  [Action.POS_EXPORT_REPORTS]: "Export POS Reports",
  [Action.POS_VIEW_STOCK_ALERTS]: "View Stock Alerts",
  [Action.RESET_PIN]: "Reset PIN",
  [Action.MANAGE_PERMISSIONS]: "Manage Permissions",
  [Action.DEACTIVATE_STAFF]: "Deactivate Staff",
  [Action.MANAGE_PAYMENT_MODES]: "Manage Payment Modes",
  [Action.MANAGE_SYSTEM_CONFIG]: "Manage System Config",
  [Action.MANAGE_UNITS]: "Manage Units",
  [Action.MANAGE_CONTENT]: "Manage Content",
  [Action.MANAGE_NOTIFICATIONS]: "Manage Notifications",
  [Action.PRINT_RECEIPT]: "Print Receipt",
  [Action.DOWNLOAD_RECEIPT]: "Download Receipt",
};

export function buildModulePermissionMatrixItems(): {
  key: string;
  groupLabel: string;
  moduleLabel: string;
  description: string;
}[] {
  const items: {
    key: string;
    groupLabel: string;
    moduleLabel: string;
    description: string;
  }[] = [];
  for (const group of MODULE_GROUPS) {
    for (const mod of group.modules) {
      for (const action of MODULE_ALLOWED_ACTIONS[mod]) {
        items.push({
          key: `${mod}.${action}`,
          groupLabel: group.label,
          moduleLabel: MODULE_LABELS[mod],
          description: ACTION_LABELS[action],
        });
      }
    }
  }
  return items;
}
