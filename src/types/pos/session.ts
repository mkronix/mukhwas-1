import type { PaymentMode } from '../shared/enums';

export interface POSSession {
    id: string;
    staff_id: string;
    start_time: string;
    end_time?: string;
    opening_balance_paisa: number;
    closing_balance_paisa?: number;
    actual_cash_paisa?: number;
    status: 'active' | 'closed';
}

export interface POSTransactionItem {
    id: string;
    pos_transaction_id: string;
    variant_id: string;
    product_name: string;
    variant_name: string;
    quantity: number;
    unit_price_paisa: number;
    tax_paisa: number;
    total_paisa: number;
}

export interface POSTransaction {
    id: string;
    session_id: string;
    staff_id: string;
    customer_id?: string;
    customer_name?: string;
    customer_phone?: string;
    total_paisa: number;
    discount_paisa: number;
    tax_paisa: number;
    payment_mode: PaymentMode;
    items: POSTransactionItem[];
    coupon_id?: string;
    invoice_id?: string;
    timestamp: string;
}

export interface POSClosingReport {
    id: string;
    session_id: string;
    staff_id: string;
    total_transactions: number;
    total_sales_paisa: number;
    cash_sales_paisa: number;
    cash_refunds_paisa: number;
    upi_sales_paisa: number;
    card_sales_paisa: number;
    expected_cash_paisa: number;
    actual_cash_paisa: number;
    variance_paisa: number;
    timestamp: string;
}