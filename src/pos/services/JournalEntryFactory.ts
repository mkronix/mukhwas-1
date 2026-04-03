import env from '@/config/env';
import { apiClient } from '@/pos/lib/apiClient';

export class JournalEntryFactory {
  static createSaleEntry(data: Record<string, unknown>) {
    if (!env.IS_MOCK_MODE) { apiClient.post('/pos/journal/sale', data); }
    return null;
  }

  static createPurchaseEntry(data: Record<string, unknown>) {
    if (!env.IS_MOCK_MODE) { apiClient.post('/pos/journal/purchase', data); }
    return null;
  }

  static createExpenseEntry(data: Record<string, unknown>) {
    if (!env.IS_MOCK_MODE) { apiClient.post('/pos/journal/expense', data); }
    return null;
  }

  static createSalaryEntry(data: Record<string, unknown>) {
    if (!env.IS_MOCK_MODE) { apiClient.post('/pos/journal/salary', data); }
    return null;
  }
}
