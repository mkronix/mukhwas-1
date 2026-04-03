import env from '@/config/env';
import { apiClient } from '@/pos/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class InventoryTransactionEngine {
  static async recordMovement(data: Record<string, unknown>) {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.post('/pos/inventory/movements', data);
    return res.data;
  }

  static async getMovements() {
    if (env.IS_MOCK_MODE) { await delay(); return []; }
    const res = await apiClient.get('/pos/inventory/movements');
    return res.data;
  }

  static async adjustStock(variantId: string, quantity: number, reason: string) {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.post(`/pos/inventory/${variantId}/adjust`, { quantity, reason });
    return res.data;
  }
}
