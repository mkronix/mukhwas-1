import type { CustomerAddress } from '@/types';

export const addressesMock: CustomerAddress[] = [
  { id: 'addr_1', customer_id: 'cust_1', type: 'home', line1: '42, Lakshmi Nagar', line2: 'Near Ganesh Temple', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', is_default: true },
  { id: 'addr_2', customer_id: 'cust_1', type: 'work', line1: 'Office 305, Prestige Tower', line2: 'BKC, Bandra East', city: 'Mumbai', state: 'Maharashtra', pincode: '400051', is_default: false },
  { id: 'addr_3', customer_id: 'cust_1', type: 'other', line1: '12, Sarojini Devi Road', city: 'Pune', state: 'Maharashtra', pincode: '411001', is_default: false },
];
