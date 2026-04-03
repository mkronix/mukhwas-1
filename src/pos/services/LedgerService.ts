import env from '@/config/env';
import { apiClient } from '@/pos/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class LedgerService {
  static async getAccounts() {
    if (env.IS_MOCK_MODE) { await delay(); return []; }
    const res = await apiClient.get('/pos/ledger/accounts');
    return res.data;
  }

  static async getJournalEntries() {
    if (env.IS_MOCK_MODE) { await delay(); return []; }
    const res = await apiClient.get('/pos/ledger/journal-entries');
    return res.data;
  }

  static async getSupplierLedger(supplierId: string) {
    if (env.IS_MOCK_MODE) { await delay(); return []; }
    const res = await apiClient.get(`/pos/ledger/supplier/${supplierId}`);
    return res.data;
  }

  static async getCustomerLedger(customerId: string) {
    if (env.IS_MOCK_MODE) { await delay(); return []; }
    const res = await apiClient.get(`/pos/ledger/customer/${customerId}`);
    return res.data;
  }
}
