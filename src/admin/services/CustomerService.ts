import type { Customer, Order } from '@/types';
import { mockCustomers, mockOrders } from '@/admin/mock';
import env from '@/config/env';
import { apiClient } from '@/admin/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class CustomerService {
  static async getAll(): Promise<Customer[]> {
    if (env.IS_MOCK_MODE) { await delay(); return [...mockCustomers]; }
    const res = await apiClient.get<Customer[]>('/customers');
    return res.data;
  }

  static async getById(id: string): Promise<Customer | null> {
    if (env.IS_MOCK_MODE) { await delay(); return mockCustomers.find(c => c.id === id) ?? null; }
    const res = await apiClient.get<Customer>(`/customers/${id}`);
    return res.data;
  }

  static async getOrdersForCustomer(customerId: string): Promise<Order[]> {
    if (env.IS_MOCK_MODE) { await delay(); return mockOrders.filter(o => o.customer_id === customerId); }
    const res = await apiClient.get<Order[]>(`/customers/${customerId}/orders`);
    return res.data;
  }
}
