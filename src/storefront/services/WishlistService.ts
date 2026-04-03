import type { Wishlist } from '@/types';
import { wishlistMock } from '@/storefront/mock/wishlist';
import env from '@/config/env';
import { apiClient } from '@/storefront/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class WishlistService {
  static async getWishlist(): Promise<Wishlist[]> {
    if (env.IS_MOCK_MODE) { await delay(); return [...wishlistMock]; }
    const res = await apiClient.get<Wishlist[]>('/storefront/wishlist');
    return res.data;
  }

  static async addToWishlist(variantId: string): Promise<Wishlist> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const item: Wishlist = { id: `wl_${Date.now()}`, customer_id: 'cust_1', variant_id: variantId, added_at: new Date().toISOString() };
      wishlistMock.push(item);
      return item;
    }
    const res = await apiClient.post<Wishlist>('/storefront/wishlist', { variant_id: variantId });
    return res.data;
  }

  static async removeFromWishlist(id: string): Promise<void> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const idx = wishlistMock.findIndex(w => w.id === id);
      if (idx !== -1) wishlistMock.splice(idx, 1);
      return;
    }
    await apiClient.delete(`/storefront/wishlist/${id}`);
  }
}
