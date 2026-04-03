import type { OrderStatus, PaymentStatus, PaymentMode } from './enums';
import type { CustomerAddress } from './customer';

export interface Order {
    id: string;
    order_number: string;
    customer_id: string;
    status: OrderStatus;
    subtotal_paisa: number;
    tax_paisa: number;
    discount_paisa: number;
    shipping_paisa: number;
    total_paisa: number;
    items: OrderItem[];
    shipping_address: CustomerAddress;
    payment_status: PaymentStatus;
    payment_mode?: PaymentMode;
    coupon_id?: string;
    notes?: string;
    status_history: OrderStatusHistory[];
    created_at: string;
    updated_at: string;
}

export interface OrderItem {
    id: string;
    order_id: string;
    variant_id: string;
    product_name: string;
    variant_name: string;
    quantity: number;
    unit_price_paisa: number;
    tax_paisa: number;
    total_paisa: number;
}

export interface OrderStatusHistory {
    id: string;
    order_id: string;
    status: OrderStatus;
    changed_by?: string;
    notes?: string;
    timestamp: string;
}