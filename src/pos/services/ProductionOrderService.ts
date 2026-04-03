import env from '@/config/env';
import { apiClient } from '@/pos/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class ProductionOrderService {
  static async getProductionOrders() {
    if (env.IS_MOCK_MODE) { await delay(); return []; }
    const res = await apiClient.get('/pos/production/orders');
    return res.data;
  }

  static async createProductionOrder(data: Record<string, unknown>) {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.post('/pos/production/orders', data);
    return res.data;
  }

  static async updateStatus(id: string, status: string) {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.patch(`/pos/production/orders/${id}/status`, { status });
    return res.data;
  }
}
