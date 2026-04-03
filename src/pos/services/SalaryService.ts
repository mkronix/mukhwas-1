import env from '@/config/env';
import { apiClient } from '@/pos/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class SalaryService {
  static async calculateSalary(staffId: string, month: string, year: number) {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.post('/pos/salary/calculate', { staff_id: staffId, month, year });
    return res.data;
  }

  static async disburseSalary(data: Record<string, unknown>) {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.post('/pos/salary/disburse', data);
    return res.data;
  }

  static async getDisbursements() {
    if (env.IS_MOCK_MODE) { await delay(); return []; }
    const res = await apiClient.get('/pos/salary/disbursements');
    return res.data;
  }
}
