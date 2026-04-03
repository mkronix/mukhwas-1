import type { InvoiceDocumentType, SalesReturnDocumentType, PaymentMode, PaymentSurface, PaymentStatus, GSTSlab, CouponDiscountType, CouponSurface } from './enums';

export interface SalesInvoice {
    id: string;
    order_id?: string;
    pos_transaction_id?: string;
    document_type: InvoiceDocumentType;
    invoice_number: string;
    customer_name: string;
    customer_gstin?: string;
    customer_phone?: string;
    items: SalesInvoiceItem[];
    subtotal_paisa: number;
    discount_paisa: number;
    cgst_paisa: number;
    sgst_paisa: number;
    igst_paisa: number;
    total_paisa: number;
    payment_mode: PaymentMode;
    created_by: string;
    timestamp: string;
}

export interface SalesInvoiceItem {
    id: string;
    invoice_id: string;
    variant_id: string;
    product_name: string;
    variant_name: string;
    hsn_code: string;
    quantity: number;
    unit_price_paisa: number;
    gst_slab: GSTSlab;
    tax_paisa: number;
    total_paisa: number;
}

export interface SalesReturn {
    id: string;
    invoice_id: string;
    document_type: SalesReturnDocumentType;
    return_number: string;
    items: SalesReturnItem[];
    reason: string;
    subtotal_paisa: number;
    cgst_paisa: number;
    sgst_paisa: number;
    igst_paisa: number;
    total_paisa: number;
    created_by: string;
    timestamp: string;
}

export interface SalesReturnItem {
    id: string;
    sales_return_id: string;
    invoice_item_id: string;
    variant_id: string;
    quantity: number;
    unit_price_paisa: number;
    tax_paisa: number;
    total_paisa: number;
}

export interface Payment {
    id: string;
    order_id?: string;
    pos_transaction_id?: string;
    amount_paisa: number;
    mode: PaymentMode;
    surface: PaymentSurface;
    reference_id?: string;
    status: PaymentStatus;
    gateway_response?: string;
    created_at: string;
}

export interface PaymentWebhookEvent {
    id: string;
    gateway: string;
    event_type: string;
    payload: string;
    processed: boolean;
    created_at: string;
}

export interface Coupon {
    id: string;
    code: string;
    description?: string;
    discount_type: CouponDiscountType;
    value: number;
    min_order_paisa: number;
    max_discount_paisa?: number;
    surface: CouponSurface;
    usage_limit?: number;
    used_count: number;
    expiry_date: string;
    is_active: boolean;
    created_at: string;
}

export interface CouponRedemption {
    id: string;
    coupon_id: string;
    order_id?: string;
    pos_transaction_id?: string;
    customer_id?: string;
    discount_applied_paisa: number;
    redeemed_at: string;
}