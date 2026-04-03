import env from '@/config/env';
import { apiClient } from '@/storefront/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export interface StorefrontOrder {
  id: string;
  order_number: string;
  status: string;
  total_paisa: number;
  created_at: string;
}

export class OrderService {
  static async getOrders(): Promise<StorefrontOrder[]> {
    if (env.IS_MOCK_MODE) { await delay(); return []; }
    const res = await apiClient.get<StorefrontOrder[]>('/storefront/orders');
    return res.data;
  }

  static async getOrder(id: string): Promise<StorefrontOrder | null> {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.get<StorefrontOrder>(`/storefront/orders/${id}`);
    return res.data;
  }

  static async createOrder(data: Record<string, unknown>): Promise<StorefrontOrder | null> {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.post<StorefrontOrder>('/storefront/orders', data);
    return res.data;
  }
}
