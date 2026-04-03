import type { Order } from '@/types';

export const ordersMock: Order[] = [
  {
    id: 'ord_1', order_number: 'MKW-2025-001', customer_id: 'cust_1', status: 'delivered',
    subtotal_paisa: 69800, tax_paisa: 8376, discount_paisa: 0, shipping_paisa: 0, total_paisa: 78176,
    items: [
      { id: 'oi_1', order_id: 'ord_1', variant_id: 'var_pan_50', product_name: 'Pan Mukhwas', variant_name: '50g', quantity: 2, unit_price_paisa: 19900, tax_paisa: 4776, total_paisa: 44576 },
      { id: 'oi_2', order_id: 'ord_1', variant_id: 'var_saunf_100', product_name: 'Meetha Saunf', variant_name: '100g', quantity: 1, unit_price_paisa: 26900, tax_paisa: 3228, total_paisa: 30128 },
    ],
    shipping_address: { id: 'addr_1', customer_id: 'cust_1', type: 'home', line1: '42, Lakshmi Nagar', line2: 'Near Ganesh Temple', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', is_default: true },
    payment_status: 'paid', payment_mode: 'upi', coupon_id: undefined,
    status_history: [
      { id: 'sh_1', order_id: 'ord_1', status: 'placed', timestamp: '2025-01-10T10:00:00Z' },
      { id: 'sh_2', order_id: 'ord_1', status: 'confirmed', timestamp: '2025-01-10T10:30:00Z' },
      { id: 'sh_3', order_id: 'ord_1', status: 'packed', timestamp: '2025-01-11T09:00:00Z' },
      { id: 'sh_4', order_id: 'ord_1', status: 'shipped', timestamp: '2025-01-12T08:00:00Z' },
      { id: 'sh_5', order_id: 'ord_1', status: 'delivered', timestamp: '2025-01-14T14:00:00Z' },
    ],
    created_at: '2025-01-10T10:00:00Z', updated_at: '2025-01-14T14:00:00Z',
  },
  {
    id: 'ord_2', order_number: 'MKW-2025-002', customer_id: 'cust_1', status: 'shipped',
    subtotal_paisa: 89900, tax_paisa: 10788, discount_paisa: 5000, shipping_paisa: 0, total_paisa: 95688,
    items: [
      { id: 'oi_3', order_id: 'ord_2', variant_id: 'var_elaichi_100', product_name: 'Elaichi Mix', variant_name: '100g', quantity: 2, unit_price_paisa: 44900, tax_paisa: 10788, total_paisa: 100588 },
    ],
    shipping_address: { id: 'addr_2', customer_id: 'cust_1', type: 'work', line1: 'Office 305, Prestige Tower', line2: 'BKC, Bandra East', city: 'Mumbai', state: 'Maharashtra', pincode: '400051', is_default: false },
    payment_status: 'paid', payment_mode: 'card',
    status_history: [
      { id: 'sh_6', order_id: 'ord_2', status: 'placed', timestamp: '2025-02-01T15:00:00Z' },
      { id: 'sh_7', order_id: 'ord_2', status: 'confirmed', timestamp: '2025-02-01T15:45:00Z' },
      { id: 'sh_8', order_id: 'ord_2', status: 'packed', timestamp: '2025-02-02T10:00:00Z' },
      { id: 'sh_9', order_id: 'ord_2', status: 'shipped', timestamp: '2025-02-03T08:00:00Z' },
    ],
    created_at: '2025-02-01T15:00:00Z', updated_at: '2025-02-03T08:00:00Z',
  },
  {
    id: 'ord_3', order_number: 'MKW-2025-003', customer_id: 'cust_1', status: 'confirmed',
    subtotal_paisa: 149900, tax_paisa: 17988, discount_paisa: 0, shipping_paisa: 4900, total_paisa: 172788,
    items: [
      { id: 'oi_4', order_id: 'ord_3', variant_id: 'var_festival_std', product_name: 'Festival Gift Box', variant_name: 'Standard', quantity: 1, unit_price_paisa: 99900, tax_paisa: 11988, total_paisa: 111888 },
      { id: 'oi_5', order_id: 'ord_3', variant_id: 'var_rajwadi_50', product_name: 'Rajwadi Mukhwas', variant_name: '50g', quantity: 1, unit_price_paisa: 29900, tax_paisa: 3588, total_paisa: 33488 },
    ],
    shipping_address: { id: 'addr_1', customer_id: 'cust_1', type: 'home', line1: '42, Lakshmi Nagar', line2: 'Near Ganesh Temple', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', is_default: true },
    payment_status: 'paid', payment_mode: 'net_banking',
    status_history: [
      { id: 'sh_10', order_id: 'ord_3', status: 'placed', timestamp: '2025-03-01T12:00:00Z' },
      { id: 'sh_11', order_id: 'ord_3', status: 'confirmed', timestamp: '2025-03-01T12:30:00Z' },
    ],
    created_at: '2025-03-01T12:00:00Z', updated_at: '2025-03-01T12:30:00Z',
  },
  {
    id: 'ord_4', order_number: 'MKW-2025-004', customer_id: 'cust_1', status: 'cancelled',
    subtotal_paisa: 34900, tax_paisa: 4188, discount_paisa: 0, shipping_paisa: 4900, total_paisa: 43988,
    items: [
      { id: 'oi_6', order_id: 'ord_4', variant_id: 'var_rose_50', product_name: 'Rose Gulkand Mix', variant_name: '50g', quantity: 1, unit_price_paisa: 34900, tax_paisa: 4188, total_paisa: 39088 },
    ],
    shipping_address: { id: 'addr_1', customer_id: 'cust_1', type: 'home', line1: '42, Lakshmi Nagar', line2: 'Near Ganesh Temple', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', is_default: true },
    payment_status: 'refunded', payment_mode: 'upi',
    status_history: [
      { id: 'sh_12', order_id: 'ord_4', status: 'placed', timestamp: '2025-02-15T09:00:00Z' },
      { id: 'sh_13', order_id: 'ord_4', status: 'cancelled', notes: 'Customer requested cancellation', timestamp: '2025-02-15T10:30:00Z' },
    ],
    created_at: '2025-02-15T09:00:00Z', updated_at: '2025-02-15T10:30:00Z',
  },
  {
    id: 'ord_5', order_number: 'MKW-2025-005', customer_id: 'cust_1', status: 'placed',
    subtotal_paisa: 22900, tax_paisa: 2748, discount_paisa: 0, shipping_paisa: 4900, total_paisa: 30548,
    items: [
      { id: 'oi_7', order_id: 'ord_5', variant_id: 'var_banarasi_50', product_name: 'Banarasi Pan', variant_name: '50g', quantity: 1, unit_price_paisa: 22900, tax_paisa: 2748, total_paisa: 25648 },
    ],
    shipping_address: { id: 'addr_3', customer_id: 'cust_1', type: 'other', line1: '12, Sarojini Devi Road', city: 'Pune', state: 'Maharashtra', pincode: '411001', is_default: false },
    payment_status: 'pending', payment_mode: 'cash',
    status_history: [
      { id: 'sh_14', order_id: 'ord_5', status: 'placed', timestamp: '2025-03-18T18:00:00Z' },
    ],
    created_at: '2025-03-18T18:00:00Z', updated_at: '2025-03-18T18:00:00Z',
  },
];
