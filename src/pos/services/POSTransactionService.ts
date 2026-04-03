import env from '@/config/env';
import { apiClient } from '@/pos/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export interface POSTransaction {
  id: string;
  receipt_number: string;
  session_id: string;
  items: { variant_id: string; name: string; quantity: number; price_paisa: number; total_paisa: number }[];
  subtotal_paisa: number;
  discount_paisa: number;
  tax_paisa: number;
  total_paisa: number;
  payment_mode: 'cash' | 'upi' | 'card';
  customer_name?: string;
  created_at: string;
}

export class POSTransactionService {
  static async createTransaction(data: Record<string, unknown>): Promise<POSTransaction | null> {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.post<POSTransaction>('/pos/transactions', data);
    return res.data;
  }

  static async getTransactions(): Promise<POSTransaction[]> {
    if (env.IS_MOCK_MODE) { await delay(); return []; }
    const res = await apiClient.get<POSTransaction[]>('/pos/transactions');
    return res.data;
  }
}
