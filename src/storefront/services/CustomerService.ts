import env from '@/config/env';
import { apiClient } from '@/storefront/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export interface StorefrontCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export class CustomerService {
  static async getCustomer(id: string): Promise<StorefrontCustomer | null> {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.get<StorefrontCustomer>(`/storefront/customers/${id}`);
    return res.data;
  }

  static async updateCustomer(id: string, data: Partial<StorefrontCustomer>): Promise<StorefrontCustomer | null> {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.put<StorefrontCustomer>(`/storefront/customers/${id}`, data);
    return res.data;
  }
}
