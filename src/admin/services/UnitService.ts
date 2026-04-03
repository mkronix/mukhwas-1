import type { UnitConversion } from '@/types';
import { mockSystemUnits, mockCustomUnits, mockUnitConversions } from '@/admin/mock/units';
import type { SystemUnit, CustomUnit } from '@/types';
import env from '@/config/env';
import { apiClient } from '@/admin/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class UnitService {
  static async getSystemUnits(): Promise<SystemUnit[]> {
    if (env.IS_MOCK_MODE) { await delay(); return [...mockSystemUnits]; }
    const res = await apiClient.get<SystemUnit[]>('/units/system');
    return res.data;
  }

  static async getCustomUnits(): Promise<CustomUnit[]> {
    if (env.IS_MOCK_MODE) { await delay(); return [...mockCustomUnits]; }
    const res = await apiClient.get<CustomUnit[]>('/units/custom');
    return res.data;
  }

  static async createCustomUnit(data: Omit<CustomUnit, 'id' | 'created_at' | 'is_system' | 'referenced'>): Promise<CustomUnit> {
    if (env.IS_MOCK_MODE) { await delay(); const unit: CustomUnit = { ...data, id: `cu_${Date.now()}`, is_system: false, referenced: false, created_at: new Date().toISOString() }; mockCustomUnits.push(unit); return unit; }
    const res = await apiClient.post<CustomUnit>('/units/custom', data);
    return res.data;
  }

  static async updateCustomUnit(id: string, data: Partial<CustomUnit>): Promise<CustomUnit> {
    if (env.IS_MOCK_MODE) { await delay(); const idx = mockCustomUnits.findIndex(u => u.id === id); if (idx === -1) throw new Error('Unit not found'); mockCustomUnits[idx] = { ...mockCustomUnits[idx], ...data }; return mockCustomUnits[idx]; }
    const res = await apiClient.put<CustomUnit>(`/units/custom/${id}`, data);
    return res.data;
  }

  static async deleteCustomUnit(id: string): Promise<void> {
    if (env.IS_MOCK_MODE) { await delay(); const unit = mockCustomUnits.find(u => u.id === id); if (unit?.referenced) throw new Error('Unit is in use'); const idx = mockCustomUnits.findIndex(u => u.id === id); if (idx !== -1) mockCustomUnits.splice(idx, 1); return; }
    await apiClient.delete(`/units/custom/${id}`);
  }

  static async getConversions(): Promise<UnitConversion[]> {
    if (env.IS_MOCK_MODE) { await delay(); return [...mockUnitConversions]; }
    const res = await apiClient.get<UnitConversion[]>('/units/conversions');
    return res.data;
  }

  static async createConversion(data: Omit<UnitConversion, 'id'>): Promise<UnitConversion> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const exists = mockUnitConversions.some(c => (c.from_unit === data.from_unit && c.to_unit === data.to_unit) || (c.from_unit === data.to_unit && c.to_unit === data.from_unit));
      if (exists) throw new Error('Conversion already exists');
      const conv: UnitConversion = { ...data, id: `uc_${Date.now()}` };
      mockUnitConversions.push(conv);
      return conv;
    }
    const res = await apiClient.post<UnitConversion>('/units/conversions', data);
    return res.data;
  }

  static async deleteConversion(id: string): Promise<void> {
    if (env.IS_MOCK_MODE) { await delay(); const idx = mockUnitConversions.findIndex(c => c.id === id); if (idx !== -1) mockUnitConversions.splice(idx, 1); return; }
    await apiClient.delete(`/units/conversions/${id}`);
  }
}
