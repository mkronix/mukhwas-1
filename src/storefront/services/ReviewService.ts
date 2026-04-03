import type { CustomerReview } from '@/types';
import { reviewsMock } from '@/storefront/mock/reviews';
import env from '@/config/env';
import { apiClient } from '@/storefront/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class StorefrontReviewService {
  static async getReviewsByProduct(productId: string): Promise<CustomerReview[]> {
    if (env.IS_MOCK_MODE) { await delay(); return reviewsMock.filter(r => r.product_id === productId); }
    const res = await apiClient.get<CustomerReview[]>(`/storefront/products/${productId}/reviews`);
    return res.data;
  }

  static async getAllReviews(): Promise<CustomerReview[]> {
    if (env.IS_MOCK_MODE) { await delay(); return [...reviewsMock]; }
    const res = await apiClient.get<CustomerReview[]>('/storefront/reviews');
    return res.data;
  }
}
