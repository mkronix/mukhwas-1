import env from '@/config/env';
import { apiClient } from '@/pos/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class FIFOValuationService {
  static async getCostLayers(itemId: string) {
    if (env.IS_MOCK_MODE) { await delay(); return []; }
    const res = await apiClient.get(`/pos/valuation/${itemId}/layers`);
    return res.data;
  }

  static async calculateCOGS(variantId: string, quantity: number) {
    if (env.IS_MOCK_MODE) { await delay(); return 0; }
    const res = await apiClient.post<{ cogs: number }>('/pos/valuation/cogs', { variant_id: variantId, quantity });
    return res.data;
  }
}
