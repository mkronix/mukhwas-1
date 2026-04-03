import env from '@/config/env';
import { apiClient } from '@/storefront/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export interface CouponValidation {
  valid: boolean;
  code: string;
  discount_type: 'percent' | 'flat';
  discount_value: number;
  message?: string;
}

export class CouponService {
  static async validateCoupon(code: string): Promise<CouponValidation | null> {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.post<CouponValidation>('/storefront/coupons/validate', { code });
    return res.data;
  }

  static async applyCoupon(code: string, orderId: string): Promise<CouponValidation | null> {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.post<CouponValidation>(`/storefront/orders/${orderId}/coupon`, { code });
    return res.data;
  }
}
