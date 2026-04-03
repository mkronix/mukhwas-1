import { mockGSTConfig, mockGSTR1Data, mockGSTR2Data, mockITCSummary } from '@/admin/mock/gst';
import type { GSTReportRow, GSTConfigForm } from '@/types';
import type { GSTConfig } from '@/types';
import env from '@/config/env';
import { apiClient } from '@/admin/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class AdminGSTService {
  static async getConfig(): Promise<GSTConfig> {
    if (env.IS_MOCK_MODE) { await delay(); return { ...mockGSTConfig }; }
    const res = await apiClient.get<GSTConfig>('/gst/config');
    return res.data;
  }

  static async updateConfig(data: GSTConfigForm): Promise<GSTConfig> {
    if (env.IS_MOCK_MODE) {
      await delay();
      Object.assign(mockGSTConfig, { business_gstin: data.gstin, business_name: data.business_name, state_code: data.state_code, default_tax_type: data.default_tax_type, updated_at: new Date().toISOString() });
      return { ...mockGSTConfig };
    }
    const res = await apiClient.put<GSTConfig>('/gst/config', data);
    return res.data;
  }

  static async getGSTR1(month?: string): Promise<GSTReportRow[]> {
    if (env.IS_MOCK_MODE) { await delay(); if (month) return mockGSTR1Data.filter(r => r.date.startsWith(month)); return [...mockGSTR1Data]; }
    const res = await apiClient.get<GSTReportRow[]>('/gst/gstr1', month ? { month } : undefined);
    return res.data;
  }

  static async getGSTR2(month?: string): Promise<GSTReportRow[]> {
    if (env.IS_MOCK_MODE) { await delay(); if (month) return mockGSTR2Data.filter(r => r.date.startsWith(month)); return [...mockGSTR2Data]; }
    const res = await apiClient.get<GSTReportRow[]>('/gst/gstr2', month ? { month } : undefined);
    return res.data;
  }

  static async getITCSummary() {
    if (env.IS_MOCK_MODE) { await delay(); return { ...mockITCSummary }; }
    const res = await apiClient.get<typeof mockITCSummary>('/gst/itc-summary');
    return res.data;
  }
}
