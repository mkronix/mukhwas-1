import env from '@/config/env';
import { apiClient } from '@/pos/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class GSTService {
  static async getGSTConfig() {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.get('/pos/gst/config');
    return res.data;
  }

  static async getGSTR1Summary(month: string, year: number) {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.get('/pos/gst/gstr1', { month, year });
    return res.data;
  }

  static async getGSTR2Summary(month: string, year: number) {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.get('/pos/gst/gstr2', { month, year });
    return res.data;
  }

  static async getITCSummary() {
    if (env.IS_MOCK_MODE) { await delay(); return null; }
    const res = await apiClient.get('/pos/gst/itc-summary');
    return res.data;
  }
}
