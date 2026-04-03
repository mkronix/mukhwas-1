import env from '@/config/env';
import { apiClient } from '@/pos/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export interface POSSession {
  id: string;
  staff_id: string;
  staff_name: string;
  opening_balance: number;
  closing_balance?: number;
  actual_cash?: number;
  variance?: number;
  status: 'active' | 'closed';
  started_at: string;
  closed_at?: string;
  transactions_count: number;
  total_sales: number;
}

export class POSSessionService {
  static async startSession(staffId: string, openingBalance: number): Promise<POSSession> {
    if (env.IS_MOCK_MODE) {
      await delay();
      return { id: `session_${Date.now()}`, staff_id: staffId, staff_name: 'Staff', opening_balance: openingBalance, status: 'active', started_at: new Date().toISOString(), transactions_count: 0, total_sales: 0 };
    }
    const res = await apiClient.post<POSSession>('/pos/sessions', { staff_id: staffId, opening_balance: openingBalance });
    return res.data;
  }

  static async closeSession(sessionId: string, actualCash: number): Promise<POSSession> {
    if (env.IS_MOCK_MODE) {
      await delay();
      return { id: sessionId, staff_id: '', staff_name: 'Staff', opening_balance: 0, closing_balance: actualCash, actual_cash: actualCash, variance: 0, status: 'closed', started_at: '', closed_at: new Date().toISOString(), transactions_count: 0, total_sales: 0 };
    }
    const res = await apiClient.post<POSSession>(`/pos/sessions/${sessionId}/close`, { actual_cash: actualCash });
    return res.data;
  }

  static async getActiveSession(): Promise<POSSession | null> {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.get<POSSession | null>('/pos/sessions/active');
    return res.data;
  }
}
