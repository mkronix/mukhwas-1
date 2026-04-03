import type { Lead } from '@/types';
import { mockLeads } from '@/admin/mock/leads';
import env from '@/config/env';
import { apiClient } from '@/admin/lib/apiClient';

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export class LeadService {
  static async getAll(): Promise<Lead[]> {
    if (env.IS_MOCK_MODE) { await delay(); return [...mockLeads]; }
    const res = await apiClient.get<Lead[]>('/leads');
    return res.data;
  }

  static async create(data: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const lead: Lead = { ...data, id: `lead_${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      mockLeads.push(lead);
      return lead;
    }
    const res = await apiClient.post<Lead>('/leads', data);
    return res.data;
  }

  static async update(id: string, data: Partial<Lead>): Promise<Lead> {
    if (env.IS_MOCK_MODE) {
      await delay();
      const idx = mockLeads.findIndex(l => l.id === id);
      if (idx === -1) throw new Error('Lead not found');
      mockLeads[idx] = { ...mockLeads[idx], ...data, updated_at: new Date().toISOString() };
      return mockLeads[idx];
    }
    const res = await apiClient.put<Lead>(`/leads/${id}`, data);
    return res.data;
  }

  static async delete(id: string): Promise<void> {
    if (env.IS_MOCK_MODE) { await delay(); const idx = mockLeads.findIndex(l => l.id === id); if (idx !== -1) mockLeads.splice(idx, 1); return; }
    await apiClient.delete(`/leads/${id}`);
  }
}
