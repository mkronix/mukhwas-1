import type { Order } from '@/types';
import { mockOrders } from '@/admin/mock';
import env from '@/config/env';
import { apiClient } from '@/admin/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class OrderService {
  static async getAll(): Promise<Order[]> {
    if (env.IS_MOCK_MODE) { await delay(); return [...mockOrders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); }
    const res = await apiClient.get<Order[]>('/orders');
    return res.data;
  }

  static async getById(id: string): Promise<Order | null> {
    if (env.IS_MOCK_MODE) { await delay(); return mockOrders.find(o => o.id === id) ?? null; }
    const res = await apiClient.get<Order>(`/orders/${id}`);
    return res.data;
  }

  static async getByCustomer(customerId: string): Promise<Order[]> {
    if (env.IS_MOCK_MODE) { await delay(); return mockOrders.filter(o => o.customer_id === customerId); }
    const res = await apiClient.get<Order[]>(`/orders`, { customer_id: customerId });
    return res.data;
  }

  static async updateStatus(id: string, status: Order['status'], changedBy?: string, notes?: string): Promise<Order> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const idx = mockOrders.findIndex(o => o.id === id);
      if (idx === -1) throw new Error('Order not found');
      mockOrders[idx].status = status;
      mockOrders[idx].status_history.push({ id: `sh_${Date.now()}`, order_id: id, status, changed_by: changedBy, notes, timestamp: new Date().toISOString() });
      mockOrders[idx].updated_at = new Date().toISOString();
      return mockOrders[idx];
    }
    const res = await apiClient.patch<Order>(`/orders/${id}/status`, { status, changed_by: changedBy, notes });
    return res.data;
  }

  static async cancelOrder(id: string, reason: string): Promise<Order> {
    return this.updateStatus(id, 'cancelled', undefined, reason);
  }
}
