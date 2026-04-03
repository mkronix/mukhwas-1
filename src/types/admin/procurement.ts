import { PurchaseReturnStatus } from '..';
import type { Unit, GSTSlab, PaymentStatus, PurchaseOrderStatus } from '../shared/enums';

export interface RawMaterial {
    id: string;
    name: string;
    unit: Unit;
    current_stock: number;
    min_stock_level: number;
    cost_per_unit_paisa: number;
    gst_slab: GSTSlab;
    hsn_code: string;
    created_at: string;
}

export interface Supplier {
    id: string;
    name: string;
    email?: string;
    phone: string;
    gstin?: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    pincode: string;
    outstanding_balance_paisa: number;
    created_at: string;
}

export interface SupplierRawMaterial {
    id: string;
    supplier_id: string;
    raw_material_id: string;
    unit_price_paisa: number;
    lead_time_days: number;
}

export interface PurchaseOrder {
    id: string;
    supplier_id: string;
    status: PurchaseOrderStatus;
    items: PurchaseOrderItem[];
    notes?: string;
    expected_delivery_date?: string;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface PurchaseOrderItem {
    id: string;
    purchase_order_id: string;
    raw_material_id: string;
    quantity: number;
    unit: Unit;
    unit_price_paisa: number;
    received_quantity: number;
}

export interface PurchaseBill {
    id: string;
    purchase_order_id?: string;
    supplier_id: string;
    document_type: 'tax_invoice' | 'bill_of_supply';
    bill_number: string;
    subtotal_paisa: number;
    cgst_paisa: number;
    sgst_paisa: number;
    igst_paisa: number;
    total_paisa: number;
    payment_status: PaymentStatus;
    paid_amount_paisa: number;
    bill_date: string;
    due_date?: string;
    created_at: string;
}

export interface PurchaseReturn {
    id: string;
    purchase_bill_id: string;
    supplier_id: string;
    status: PurchaseReturnStatus;
    items: PurchaseReturnItem[];
    credit_note_number?: string;
    total_paisa: number;
    reason: string;
    created_at: string;
}

export interface PurchaseReturnItem {
    id: string;
    purchase_return_id: string;
    raw_material_id: string;
    quantity: number;
    unit: Unit;
    unit_price_paisa: number;
}