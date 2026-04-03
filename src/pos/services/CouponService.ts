import env from '@/config/env';
import { apiClient } from '@/pos/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class CouponService {
  static async getCoupons() {
    if (env.IS_MOCK_MODE) { await delay(); return []; }
    const res = await apiClient.get('/pos/coupons');
    return res.data;
  }

  static async validateCoupon(code: string) {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.post('/pos/coupons/validate', { code });
    return res.data;
  }

  static async redeemCoupon(code: string, transactionId: string) {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.post('/pos/coupons/redeem', { code, transaction_id: transactionId });
    return res.data;
  }
}
