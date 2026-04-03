import type { ReturnStatus, ReturnType } from '../shared/enums';

export interface Return {
    id: string;
    order_id: string;
    customer_id: string;
    status: ReturnStatus;
    type: ReturnType;
    items: ReturnItem[];
    reason: string;
    refund_amount_paisa: number;
    created_at: string;
    updated_at: string;
}

export interface ReturnItem {
    id: string;
    return_id: string;
    order_item_id: string;
    variant_id: string;
    quantity: number;
    reason: string;
}