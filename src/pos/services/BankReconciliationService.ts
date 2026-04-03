import env from '@/config/env';
import { apiClient } from '@/pos/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class BankReconciliationService {
  static async getBankTransactions() {
    if (env.IS_MOCK_MODE) { await delay(); return []; }
    const res = await apiClient.get('/pos/bank-transactions');
    return res.data;
  }

  static async importTransactions(data: Record<string, unknown>[]) {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.post('/pos/bank-transactions/import', data);
    return res.data;
  }

  static async reconcileTransaction(id: string, journalEntryId: string) {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.post(`/pos/bank-transactions/${id}/reconcile`, { journal_entry_id: journalEntryId });
    return res.data;
  }
}
