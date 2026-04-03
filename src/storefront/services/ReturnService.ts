import type { Return } from '@/types';
import { returnsMock } from '@/storefront/mock/returns';
import env from '@/config/env';
import { apiClient } from '@/storefront/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class ReturnService {
  static async getReturns(): Promise<Return[]> {
    if (env.IS_MOCK_MODE) { await delay(); return [...returnsMock]; }
    const res = await apiClient.get<Return[]>('/storefront/returns');
    return res.data;
  }

  static async createReturn(data: Omit<Return, 'id' | 'created_at' | 'updated_at'>): Promise<Return> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const ret = { ...data, id: `ret_${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Return;
      returnsMock.push(ret);
      return ret;
    }
    const res = await apiClient.post<Return>('/storefront/returns', data);
    return res.data;
  }
}
