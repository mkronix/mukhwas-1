import type { Order, Customer, CustomerReview } from '@/types';

export const mockCustomers: Customer[] = [
  {
    id: 'cust_1', name: 'Meera Joshi', email: 'meera@example.com', phone: '9111111111',
    is_verified: true, addresses: [
      { id: 'addr_1', customer_id: 'cust_1', type: 'home', line1: '42 MG Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', is_default: true },
    ], created_at: '2024-01-20T00:00:00Z', updated_at: '2024-06-01T00:00:00Z',
  },
  {
    id: 'cust_2', name: 'Vikram Singh', email: 'vikram@example.com', phone: '9222222222',
    is_verified: true, addresses: [
      { id: 'addr_2', customer_id: 'cust_2', type: 'work', line1: '15 Brigade Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001', is_default: true },
    ], created_at: '2024-02-10T00:00:00Z', updated_at: '2024-06-01T00:00:00Z',
  },
  {
    id: 'cust_3', name: 'Neha Agarwal', email: 'neha@example.com', phone: '9333333333',
    is_verified: false, addresses: [
      { id: 'addr_3', customer_id: 'cust_3', type: 'home', line1: '8 Civil Lines', city: 'Jaipur', state: 'Rajasthan', pincode: '302001', is_default: true },
    ], created_at: '2024-03-05T00:00:00Z', updated_at: '2024-06-01T00:00:00Z',
  },
  {
    id: 'cust_4', name: 'Arjun Reddy', email: 'arjun@example.com', phone: '9444444444',
    is_verified: true, addresses: [
      { id: 'addr_4', customer_id: 'cust_4', type: 'home', line1: '23 Banjara Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500034', is_default: true },
    ], created_at: '2024-03-20T00:00:00Z', updated_at: '2024-06-01T00:00:00Z',
  },
  {
    id: 'cust_5', name: 'Kavita Nair', email: 'kavita@example.com', phone: '9555555555',
    is_verified: true, addresses: [
      { id: 'addr_5', customer_id: 'cust_5', type: 'home', line1: '5 Marine Drive', city: 'Kochi', state: 'Kerala', pincode: '682001', is_default: true },
    ], created_at: '2024-04-01T00:00:00Z', updated_at: '2024-06-01T00:00:00Z',
  },
];

export const mockOrders: Order[] = [
  {
    id: 'ord_1', order_number: 'MKW-1001', customer_id: 'cust_1', status: 'delivered',
    subtotal_paisa: 56000, tax_paisa: 2800, discount_paisa: 0, shipping_paisa: 5000, total_paisa: 63800,
    items: [
      { id: 'oi_1', order_id: 'ord_1', variant_id: 'v_1b', product_name: 'Saunf Mukhwas', variant_name: '250g', quantity: 2, unit_price_paisa: 28000, tax_paisa: 1400, total_paisa: 57400 },
    ],
    shipping_address: { id: 'addr_1', customer_id: 'cust_1', type: 'home', line1: '42 MG Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', is_default: true },
    payment_status: 'paid', payment_mode: 'upi', coupon_id: undefined,
    status_history: [
      { id: 'sh_1', order_id: 'ord_1', status: 'placed', timestamp: '2024-05-01T10:00:00Z' },
      { id: 'sh_2', order_id: 'ord_1', status: 'confirmed', timestamp: '2024-05-01T10:30:00Z' },
      { id: 'sh_3', order_id: 'ord_1', status: 'packed', timestamp: '2024-05-02T09:00:00Z' },
      { id: 'sh_4', order_id: 'ord_1', status: 'shipped', timestamp: '2024-05-02T14:00:00Z' },
      { id: 'sh_5', order_id: 'ord_1', status: 'delivered', timestamp: '2024-05-05T11:00:00Z' },
    ],
    created_at: '2024-05-01T10:00:00Z', updated_at: '2024-05-05T11:00:00Z',
  },
  {
    id: 'ord_2', order_number: 'MKW-1002', customer_id: 'cust_2', status: 'shipped',
    subtotal_paisa: 45000, tax_paisa: 5400, discount_paisa: 5000, shipping_paisa: 0, total_paisa: 45400,
    items: [
      { id: 'oi_2', order_id: 'ord_2', variant_id: 'v_4a', product_name: 'Kesar Badam Mix', variant_name: '100g', quantity: 1, unit_price_paisa: 45000, tax_paisa: 5400, total_paisa: 50400 },
    ],
    shipping_address: { id: 'addr_2', customer_id: 'cust_2', type: 'work', line1: '15 Brigade Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001', is_default: true },
    payment_status: 'paid', payment_mode: 'card',
    status_history: [
      { id: 'sh_6', order_id: 'ord_2', status: 'placed', timestamp: '2024-05-10T09:00:00Z' },
      { id: 'sh_7', order_id: 'ord_2', status: 'confirmed', timestamp: '2024-05-10T09:30:00Z' },
      { id: 'sh_8', order_id: 'ord_2', status: 'packed', timestamp: '2024-05-11T10:00:00Z' },
      { id: 'sh_9', order_id: 'ord_2', status: 'shipped', timestamp: '2024-05-11T15:00:00Z' },
    ],
    created_at: '2024-05-10T09:00:00Z', updated_at: '2024-05-11T15:00:00Z',
  },
  {
    id: 'ord_3', order_number: 'MKW-1003', customer_id: 'cust_3', status: 'confirmed',
    subtotal_paisa: 36000, tax_paisa: 1800, discount_paisa: 0, shipping_paisa: 5000, total_paisa: 42800,
    items: [
      { id: 'oi_3', order_id: 'ord_3', variant_id: 'v_3a', product_name: 'Meetha Paan Mukhwas', variant_name: '100g', quantity: 2, unit_price_paisa: 18000, tax_paisa: 900, total_paisa: 36900 },
    ],
    shipping_address: { id: 'addr_3', customer_id: 'cust_3', type: 'home', line1: '8 Civil Lines', city: 'Jaipur', state: 'Rajasthan', pincode: '302001', is_default: true },
    payment_status: 'paid', payment_mode: 'net_banking',
    status_history: [
      { id: 'sh_10', order_id: 'ord_3', status: 'placed', timestamp: '2024-05-15T11:00:00Z' },
      { id: 'sh_11', order_id: 'ord_3', status: 'confirmed', timestamp: '2024-05-15T11:30:00Z' },
    ],
    created_at: '2024-05-15T11:00:00Z', updated_at: '2024-05-15T11:30:00Z',
  },
  {
    id: 'ord_4', order_number: 'MKW-1004', customer_id: 'cust_4', status: 'placed',
    subtotal_paisa: 99900, tax_paisa: 11988, discount_paisa: 10000, shipping_paisa: 0, total_paisa: 101888,
    items: [
      { id: 'oi_4', order_id: 'ord_4', variant_id: 'v_9a', product_name: 'Festival Gift Box', variant_name: 'Standard', quantity: 1, unit_price_paisa: 99900, tax_paisa: 11988, total_paisa: 111888 },
    ],
    shipping_address: { id: 'addr_4', customer_id: 'cust_4', type: 'home', line1: '23 Banjara Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500034', is_default: true },
    payment_status: 'pending', payment_mode: 'upi',
    status_history: [
      { id: 'sh_12', order_id: 'ord_4', status: 'placed', timestamp: '2024-05-20T14:00:00Z' },
    ],
    created_at: '2024-05-20T14:00:00Z', updated_at: '2024-05-20T14:00:00Z',
  },
  {
    id: 'ord_5', order_number: 'MKW-1005', customer_id: 'cust_5', status: 'cancelled',
    subtotal_paisa: 28000, tax_paisa: 1400, discount_paisa: 0, shipping_paisa: 5000, total_paisa: 34400,
    items: [
      { id: 'oi_5', order_id: 'ord_5', variant_id: 'v_1b', product_name: 'Saunf Mukhwas', variant_name: '250g', quantity: 1, unit_price_paisa: 28000, tax_paisa: 1400, total_paisa: 29400 },
    ],
    shipping_address: { id: 'addr_5', customer_id: 'cust_5', type: 'home', line1: '5 Marine Drive', city: 'Kochi', state: 'Kerala', pincode: '682001', is_default: true },
    payment_status: 'refunded', payment_mode: 'upi',
    status_history: [
      { id: 'sh_13', order_id: 'ord_5', status: 'placed', timestamp: '2024-04-25T08:00:00Z' },
      { id: 'sh_14', order_id: 'ord_5', status: 'cancelled', notes: 'Customer requested cancellation', timestamp: '2024-04-25T09:00:00Z' },
    ],
    created_at: '2024-04-25T08:00:00Z', updated_at: '2024-04-25T09:00:00Z',
  },
  {
    id: 'ord_6', order_number: 'MKW-1006', customer_id: 'cust_1', status: 'packed',
    subtotal_paisa: 22000, tax_paisa: 1100, discount_paisa: 0, shipping_paisa: 5000, total_paisa: 28100,
    items: [
      { id: 'oi_6', order_id: 'ord_6', variant_id: 'v_7a', product_name: 'Rose Petal Mukhwas', variant_name: '100g', quantity: 1, unit_price_paisa: 22000, tax_paisa: 1100, total_paisa: 23100 },
    ],
    shipping_address: { id: 'addr_1', customer_id: 'cust_1', type: 'home', line1: '42 MG Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', is_default: true },
    payment_status: 'paid', payment_mode: 'upi',
    status_history: [
      { id: 'sh_15', order_id: 'ord_6', status: 'placed', timestamp: '2024-05-22T10:00:00Z' },
      { id: 'sh_16', order_id: 'ord_6', status: 'confirmed', timestamp: '2024-05-22T10:15:00Z' },
      { id: 'sh_17', order_id: 'ord_6', status: 'packed', timestamp: '2024-05-23T09:00:00Z' },
    ],
    created_at: '2024-05-22T10:00:00Z', updated_at: '2024-05-23T09:00:00Z',
  },
];

export const mockReviews: CustomerReview[] = [
  { id: 'rev_1', customer_id: 'cust_1', product_id: 'prod_1', rating: 5, title: 'Best saunf ever!', body: 'Amazing quality, perfectly roasted. My family loves it after every meal.', is_approved: true, created_at: '2024-05-10T00:00:00Z' },
  { id: 'rev_2', customer_id: 'cust_2', product_id: 'prod_4', rating: 4, title: 'Premium quality', body: 'The saffron flavor is subtle and elegant. Slightly pricey but worth it for gifting.', is_approved: true, created_at: '2024-05-15T00:00:00Z' },
  { id: 'rev_3', customer_id: 'cust_3', product_id: 'prod_3', rating: 3, title: 'Good but too sweet', body: 'Nice paan flavor but the sweetness level is a bit much for my taste.', is_approved: false, created_at: '2024-05-18T00:00:00Z' },
  { id: 'rev_4', customer_id: 'cust_4', product_id: 'prod_9', rating: 5, title: 'Perfect gift!', body: 'Ordered for Diwali gifting. Beautiful packaging and amazing variety. Everyone loved it!', is_approved: true, created_at: '2024-05-20T00:00:00Z' },
  { id: 'rev_5', customer_id: 'cust_5', product_id: 'prod_10', rating: 4, title: 'Nostalgic taste', body: 'Reminds me of the ones we used to get in school canteen. Great tangy flavor.', is_approved: true, created_at: '2024-05-22T00:00:00Z' },
  { id: 'rev_6', customer_id: 'cust_1', product_id: 'prod_7', rating: 5, title: 'Elegant and fragrant', body: 'The rose petal infusion is so aromatic. Love serving this to guests.', is_approved: false, created_at: '2024-05-25T00:00:00Z' },
  { id: 'rev_7', customer_id: 'cust_2', product_id: 'prod_5', rating: 4, title: 'Festive favorite', body: 'Til gul mukhwas is perfect for Sankranti celebrations. Authentic taste.', is_approved: true, created_at: '2024-05-28T00:00:00Z' },
  { id: 'rev_8', customer_id: 'cust_4', product_id: 'prod_6', rating: 5, title: 'Loaded with dry fruits', body: 'So many almonds and cashews! Feels like eating a luxurious snack, not just mukhwas.', is_approved: true, created_at: '2024-06-01T00:00:00Z' },
];
