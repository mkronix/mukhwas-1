import env from '@/config/env';
import { apiClient } from '@/pos/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class InvoiceService {
  static async getInvoices() {
    if (env.IS_MOCK_MODE) { await delay(); return []; }
    const res = await apiClient.get('/pos/invoices');
    return res.data;
  }

  static async getInvoice(id: string) {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.get(`/pos/invoices/${id}`);
    return res.data;
  }

  static async createInvoice(data: Record<string, unknown>) {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.post('/pos/invoices', data);
    return res.data;
  }
}
