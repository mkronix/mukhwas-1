import env from '@/config/env';
import { apiClient } from '@/pos/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class SupplierService {
  static async getSuppliers() {
    if (env.IS_MOCK_MODE) { await delay(); return []; }
    const res = await apiClient.get('/pos/suppliers');
    return res.data;
  }

  static async createSupplier(data: Record<string, unknown>) {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.post('/pos/suppliers', data);
    return res.data;
  }

  static async updateSupplier(id: string, data: Record<string, unknown>) {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.put(`/pos/suppliers/${id}`, data);
    return res.data;
  }
}
