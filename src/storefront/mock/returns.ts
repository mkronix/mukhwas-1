import type { Return } from '@/types';

export const returnsMock: Return[] = [
  {
    id: 'ret_1', order_id: 'ord_1', customer_id: 'cust_1', status: 'approved', type: 'refund_only',
    items: [{ id: 'ri_1', return_id: 'ret_1', order_item_id: 'oi_2', variant_id: 'var_saunf_100', quantity: 1, reason: 'Product received with damaged packaging' }],
    reason: 'Damaged packaging on delivery', refund_amount_paisa: 30128,
    created_at: '2025-01-16T10:00:00Z', updated_at: '2025-01-18T14:00:00Z',
  },
  {
    id: 'ret_2', order_id: 'ord_1', customer_id: 'cust_1', status: 'requested', type: 'replacement',
    items: [{ id: 'ri_2', return_id: 'ret_2', order_item_id: 'oi_1', variant_id: 'var_pan_50', quantity: 1, reason: 'Received wrong flavour' }],
    reason: 'Received wrong flavour variant', refund_amount_paisa: 0,
    created_at: '2025-01-20T11:00:00Z', updated_at: '2025-01-20T11:00:00Z',
  },
];
