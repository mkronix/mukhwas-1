import type { MovementType, PaymentStatus, ProductionStatus, PurchaseOrderStatus, PurchaseReturnStatus } from '../shared/enums';

export interface FinishedGoodRecord {
    id: string;
    product_id: string;
    product_name: string;
    variant_id: string;
    variant_name: string;
    sku: string;
    category_id: string;
    current_stock: number;
    unit: string;
    reorder_level: number;
    stock_value_paisa: number;
    inventory_mode: 'finished_goods' | 'recipe_realtime';
    last_movement_date: string;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface RawMaterialRecord {
    id: string;
    name: string;
    description: string;
    current_stock: number;
    unit: string;
    reorder_level: number;
    preferred_supplier_id: string;
    preferred_supplier_name: string;
    hsn_code: string;
    gst_slab: string;
    last_purchase_date: string;
    cost_per_unit_paisa: number;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
    linked_suppliers: { supplier_id: string; supplier_name: string; is_preferred: boolean }[];
}

export interface StockMovementRecord {
    id: string;
    timestamp: string;
    movement_type: MovementType;
    item_name: string;
    item_type: 'finished_good' | 'raw_material';
    quantity_change: number;
    stock_before: number;
    stock_after: number;
    unit: string;
    reference: string;
    reference_label: string;
    performed_by: string;
}

export interface SupplierRecord {
    id: string;
    name: string;
    contact_person: string;
    phone: string;
    email: string;
    address: string;
    gstin: string;
    pan: string;
    payment_terms: 'immediate' | 'net_15' | 'net_30' | 'net_45' | 'net_60';
    is_active: boolean;
    bank_name: string;
    account_number: string;
    ifsc_code: string;
    account_holder: string;
    outstanding_paisa: number;
    last_purchase_date: string;
    linked_materials_count: number;
    created_at: string;
}

export interface RecipeRecord {
    id: string;
    name: string;
    product_id: string;
    variant_id: string;
    variant_label: string;
    output_quantity: number;
    output_unit: string;
    ingredients: RecipeIngredientRecord[];
    version: number;
    status: 'active' | 'inactive';
    notes: string;
    created_by: string;
    updated_at: string;
    versions: RecipeVersionRecord[];
}

export interface RecipeIngredientRecord {
    id: string;
    raw_material_id: string;
    raw_material_name: string;
    quantity: number;
    unit: string;
    cost_per_unit_paisa: number;
}

export interface RecipeVersionRecord {
    version: number;
    changed_at: string;
    changed_by: string;
    diff_summary: string;
    ingredients: RecipeIngredientRecord[];
}

export interface ProductionOrderRecord {
    id: string;
    order_number: string;
    recipe_id: string;
    recipe_name: string;
    recipe_version: number;
    product_variant: string;
    planned_quantity: number;
    actual_quantity: number;
    unit: string;
    status: ProductionStatus;
    scheduled_date: string;
    started_at?: string;
    completed_at?: string;
    assigned_staff_id: string;
    assigned_staff_name: string;
    created_by: string;
    created_at: string;
    materials: ProductionMaterialRecord[];
    activity_log: ActivityLogEntry[];
}

export interface ProductionMaterialRecord {
    id: string;
    raw_material_id: string;
    raw_material_name: string;
    reserved_quantity: number;
    actual_used: number;
    unit: string;
    status: 'reserved' | 'consumed' | 'released';
}

export interface ActivityLogEntry {
    id: string;
    timestamp: string;
    action: string;
    performed_by: string;
}

export interface PurchaseOrderRecord {
    id: string;
    po_number: string;
    supplier_id: string;
    supplier_name: string;
    order_date: string;
    expected_delivery: string;
    items: POLineItem[];
    status: PurchaseOrderStatus;
    notes: string;
    subtotal_paisa: number;
    cgst_paisa: number;
    sgst_paisa: number;
    total_paisa: number;
    created_by: string;
}

export interface POLineItem {
    id: string;
    raw_material_id: string;
    raw_material_name: string;
    quantity: number;
    unit: string;
    unit_price_paisa: number;
    hsn_code: string;
    gst_slab: string;
    taxable_paisa: number;
    gst_amount_paisa: number;
    total_paisa: number;
}

export interface PurchaseBillRecord {
    id: string;
    bill_number: string;
    po_id: string;
    po_number: string;
    supplier_id: string;
    supplier_name: string;
    supplier_gstin: string;
    bill_date: string;
    due_date: string;
    items: POLineItem[];
    subtotal_paisa: number;
    cgst_paisa: number;
    sgst_paisa: number;
    total_paisa: number;
    payment_status: PaymentStatus;
    paid_amount_paisa: number;
    payments: BillPayment[];
}

export interface BillPayment {
    id: string;
    amount_paisa: number;
    date: string;
    mode: string;
    reference: string;
}

export interface PurchaseReturnRecord {
    id: string;
    return_id: string;
    bill_id: string;
    bill_number: string;
    supplier_id: string;
    supplier_name: string;
    return_date: string;
    items: { raw_material_name: string; quantity: number; unit: string; amount_paisa: number }[];
    total_paisa: number;
    reason: string;
    status: PurchaseReturnStatus;
}

export interface SalaryStructureRecord {
    id: string;
    staff_id: string;
    type: 'fixed_monthly' | 'daily_rate';
    amount_paisa: number;
    effective_from: string;
    set_by: string;
    created_at: string;
}

export interface StaffAdvanceRecord {
    id: string;
    staff_id: string;
    amount_paisa: number;
    outstanding_paisa: number;
    reason: string;
    date: string;
    given_by: string;
    created_at: string;
}

export interface SalaryRecord {
    id: string;
    staff_id: string;
    staff_name: string;
    period_start: string;
    period_end: string;
    days_worked: number;
    salary_type: 'fixed_monthly' | 'daily_rate';
    base_rate_paisa: number;
    earned_paisa: number;
    overtime_paisa: number;
    advance_deducted_paisa: number;
    net_payable_paisa: number;
    calculated_by: string;
    created_at: string;
}

export interface SystemUnit {
    id: string;
    name: string;
    abbreviation: string;
    type: 'Weight' | 'Volume' | 'Count';
    is_system: true;
}

export interface CustomUnit {
    id: string;
    name: string;
    abbreviation: string;
    type: 'Weight' | 'Volume' | 'Count' | 'Other';
    is_system: false;
    created_by: string;
    created_at: string;
    referenced: boolean;
}

export interface GSTReportRow {
    id: string;
    invoice_number: string;
    date: string;
    party_name: string;
    party_gstin?: string;
    hsn_code: string;
    gst_slab: string;
    taxable_paisa: number;
    cgst_paisa: number;
    sgst_paisa: number;
    igst_paisa: number;
    total_paisa: number;
    itc_eligible?: boolean;
}

export interface GSTConfigForm {
    is_registered: boolean;
    gstin: string;
    business_name: string;
    state: string;
    state_code: string;
    default_tax_type: 'intra_state' | 'inter_state';
    gst_on_sales: boolean;
    itc_tracking: boolean;
    rounding_precision: number;
    rounding_method: 'normal' | 'bankers';
}

export interface SupplierLedgerEntry {
    id: string;
    supplier_id: string;
    supplier_name: string;
    date: string;
    description: string;
    reference_type: string;
    reference_id: string;
    debit_paisa: number;
    credit_paisa: number;
    balance_paisa: number;
}

export interface CustomerLedgerEntry {
    id: string;
    customer_id: string;
    customer_name: string;
    date: string;
    description: string;
    reference_type: string;
    reference_id: string;
    debit_paisa: number;
    credit_paisa: number;
    balance_paisa: number;
}

export interface StoreSettings {
    brand_name: string;
    tagline: string;
    logo_url: string;
    favicon_url: string;
    contact_email: string;
    contact_phone: string;
    address: string;
    timezone: string;
}

export interface CommerceRules {
    cod_enabled: boolean;
    free_shipping_threshold_paisa: number;
    default_shipping_charge_paisa: number;
    tax_display_mode: 'inclusive' | 'exclusive';
    low_stock_threshold_pct: number;
    return_window_days: number;
}

export interface NotificationEvent {
    id: string;
    event_key: string;
    event_name: string;
    email_enabled: boolean;
    subject: string;
    body: string;
    variables: string[];
}

export interface POSSettingsData {
    receipt_header: string;
    receipt_footer: string;
    default_payment_mode: string;
    session_timeout_minutes: number;
    pin_lockout_attempts: number;
    lockout_duration_minutes: number;
    cash_drawer_prompt: boolean;
    payslip_format: 'standard' | 'detailed' | 'minimal';
    supplier_bill_format: 'standard' | 'detailed' | 'minimal';
    export_bill_format: 'standard' | 'detailed' | 'minimal';
}

export interface PaymentModeConfig {
    id: string;
    mode: string;
    label: string;
    description?: string;
    icon?: string;
    is_for_pos: boolean;
    is_for_storefront: boolean;
    is_active: boolean;
}

export interface DashboardStats {
    todayRevenue: number;
    revenueTrend: number;
    ordersToday: number;
    ordersTrend: number;
    lowStockCount: number;
    pendingOrders: number;
}

export interface RevenueDataPoint {
    date: string;
    revenue: number;
}

export interface CategoryRevenue {
    name: string;
    value: number;
}

export interface LowStockItem {
    productName: string;
    variantName: string;
    currentStock: number;
    reorderLevel: number;
    sku: string;
}

export interface ReportSummary {
    title: string;
    key: string;
    description: string;
    stats: { label: string; value: string }[];
}