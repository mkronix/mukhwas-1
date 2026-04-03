import env from '@/config/env';
import { apiClient } from '@/storefront/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export interface CartItem {
  variant_id: string;
  product_id: string;
  name: string;
  variant_name: string;
  quantity: number;
  price_paisa: number;
  image_url?: string;
}

export interface Cart {
  items: CartItem[];
  total_paisa: number;
}

export class CartService {
  static async getCart(): Promise<Cart> {
    if (env.IS_MOCK_MODE) { await delay(); return { items: [], total_paisa: 0 }; }
    const res = await apiClient.get<Cart>('/storefront/cart');
    return res.data;
  }

  static async addItem(variantId: string, quantity: number): Promise<Cart> {
    if (env.IS_MOCK_MODE) { await delay(); return { items: [], total_paisa: 0 }; }
    const res = await apiClient.post<Cart>('/storefront/cart/items', { variant_id: variantId, quantity });
    return res.data;
  }

  static async removeItem(variantId: string): Promise<Cart> {
    if (env.IS_MOCK_MODE) { await delay(); return { items: [], total_paisa: 0 }; }
    const res = await apiClient.delete<Cart>(`/storefront/cart/items/${variantId}`);
    return res.data;
  }

  static async updateQuantity(variantId: string, quantity: number): Promise<Cart> {
    if (env.IS_MOCK_MODE) { await delay(); return { items: [], total_paisa: 0 }; }
    const res = await apiClient.patch<Cart>(`/storefront/cart/items/${variantId}`, { quantity });
    return res.data;
  }

  static async clearCart(): Promise<Cart> {
    if (env.IS_MOCK_MODE) { await delay(); return { items: [], total_paisa: 0 }; }
    const res = await apiClient.delete<Cart>('/storefront/cart');
    return res.data;
  }
}
