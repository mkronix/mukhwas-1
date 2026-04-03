import env from '@/config/env';
import { apiClient } from '@/pos/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class PurchaseReturnService {
  static async getPurchaseReturns() {
    if (env.IS_MOCK_MODE) { await delay(); return []; }
    const res = await apiClient.get('/pos/purchases/returns');
    return res.data;
  }

  static async createPurchaseReturn(data: Record<string, unknown>) {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.post('/pos/purchases/returns', data);
    return res.data;
  }
}
