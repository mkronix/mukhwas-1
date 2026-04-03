import env from '@/config/env';
import { apiClient } from '@/pos/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class PurchaseOrderService {
  static async getPurchaseOrders() {
    if (env.IS_MOCK_MODE) { await delay(); return []; }
    const res = await apiClient.get('/pos/purchases/orders');
    return res.data;
  }

  static async createPurchaseOrder(data: Record<string, unknown>) {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.post('/pos/purchases/orders', data);
    return res.data;
  }

  static async updatePurchaseOrder(id: string, data: Record<string, unknown>) {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.put(`/pos/purchases/orders/${id}`, data);
    return res.data;
  }
}
