import env from '@/config/env';
import { apiClient } from '@/pos/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class BundleStockService {
  static async checkBundleAvailability(bundleId: string) {
    if (env.IS_MOCK_MODE) { await delay(); return { available: true, quantity: 0 }; }
    const res = await apiClient.get<{ available: boolean; quantity: number }>(`/pos/bundles/${bundleId}/availability`);
    return res.data;
  }

  static async reserveBundleStock(bundleId: string, quantity: number) {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.post(`/pos/bundles/${bundleId}/reserve`, { quantity });
    return res.data;
  }
}
